# CodeCritic — API Design Doc

All endpoints are prefixed with the backend base URL (e.g. `http://localhost:4000` locally).
Authentication is handled via Clerk; "Auth required" endpoints expect a valid Clerk session
bearer token, verified server-side by `clerkMiddleware()`.

All input is validated server-side, independent of frontend behavior, since mentors test
endpoints directly.

---

## Auth / User Sync

### `POST /users/sync`
- **Auth required:** Yes
- **Description:** Called once per session after Clerk login. Verifies the bearer token,
  fetches the Clerk profile, and creates/updates the matching local `User` record.
- **Body:** none (identity comes from the verified token)
- **Response:** `200` — the synced `User` record. `401` — missing/invalid token.

### `GET /users/:username`
- **Auth required:** No
- **Description:** Public profile view.
- **Response:** `200` — `{ username, bio, techStack, githubLink, karma, reviewsGivenCount, reviewsReceivedCount }`.
  `404` — user not found.

### `PATCH /users/me`
- **Auth required:** Yes
- **Description:** Update the logged-in user's own profile. Cannot edit another user's data,
  and cannot directly modify `karma`.
- **Body:** partial `{ bio?, techStack?, githubLink? }`
- **Response:** `200` — updated `User`. `401` — not authenticated. `400` — invalid fields.

---

## Submissions

### `GET /submissions`
- **Auth required:** No
- **Description:** Public feed, recency-sorted (newest first) by default.
- **Query params:** `?tech=react` (filter by tag), `?search=term` (title/description search)
- **Response:** `200` — array of `Submission` (with criteria count, review count, status).

### `GET /submissions/feed`
- **Auth required:** Yes
- **Description:** Same underlying data as `GET /submissions`, but reordered for the logged-in
  user — matching techStack surfaces first, plus at least one additional ranking signal
  (Feature 01, e.g. recency weighting or review-history weighting).
- **Response:** `200` — reordered array of `Submission`.

### `GET /submissions/:id`
- **Auth required:** No
- **Description:** Full submission detail: title, description, githubUrl, techTags, status,
  its `ReviewCriteria`, and its `Review`s (each with reviewer info and per-criterion ratings).
- **Response:** `200` — full `Submission` object. `404` — not found.

### `POST /submissions`
- **Auth required:** Yes
- **Description:** Create a new submission with 1–5 custom review criteria.
- **Body:** `{ title, description, githubUrl, techTags: string[], criteria: [{ label }, ...] }`
  (1 to 5 criteria entries required)
- **Response:** `201` — created `Submission` with its `ReviewCriteria`. `400` — invalid body
  (e.g. 0 or >5 criteria, missing required fields). `401` — not authenticated.

---

## Reviews

### `POST /submissions/:id/reviews`
- **Auth required:** Yes
- **Description:** Submit a review on someone else's submission.
- **Body:** `{ strengths, improvements, resourceLinks?: string[], ratings: [{ criteriaId, rating }, ...] }`
  — `ratings` must cover every `ReviewCriteria` defined on that submission.
- **Validation (server-side):**
  - Reviewer must not equal the submission's owner (`userId`)
  - `ratings` array must include exactly one entry per criterion on the submission, no more, no less
  - Each `rating` must be an integer between 1 and 10
- **Side effects on success:** reviewer's `karma += 2`; submission `status` → `Reviewed` if this
  is its first review.
- **Response:** `201` — created `Review` with its `CriteriaRating`s. `400` — validation failure
  (missing ratings, out-of-range rating, etc.). `401` — not authenticated. `403` — reviewing own
  submission. `404` — submission not found.

### `GET /submissions/:id/reviews`
- **Auth required:** No
- **Description:** List all reviews on a submission, each with reviewer info, written feedback,
  and per-criterion ratings.
- **Response:** `200` — array of `Review`.

### `GET /users/:username/reviews-given`
- **Auth required:** No
- **Description:** Reviews this user has written on other people's submissions.
- **Response:** `200` — array of `Review`.

### `GET /users/:username/reviews-received`
- **Auth required:** No
- **Description:** Reviews received across all of this user's own submissions.
- **Response:** `200` — array of `Review`.

---

## Review Criteria

### `GET /submissions/:id/criteria`
- **Auth required:** No
- **Description:** List the `ReviewCriteria` defined on a submission — used to build the review
  form (so the frontend knows what to render rating inputs for).
- **Response:** `200` — array of `{ id, label, order }`.

---

## Cross-cutting rules (enforced server-side, not just UI)

- A user cannot edit another user's profile or content.
- A user cannot review their own submission.
- Karma only changes via a successful `POST /submissions/:id/reviews` — never directly editable.
- Ratings must be integers 1–10.
- A submission's criteria count must be between 1 and 5 at creation.
- `status` transitions `Pending` → `Reviewed` automatically on first review; not manually settable.
