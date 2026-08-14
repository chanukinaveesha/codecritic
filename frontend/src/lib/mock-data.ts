import type { SubmissionDetail, SubmissionSummary } from "./types";

export const mockSubmissions: SubmissionSummary[] = [
  {
    id: 1,
    userId: 1,
    user: { id: 1, username: "kavindu_dev" },
    title: "TinyRouter — a 2kb client-side router",
    description:
      "A dependency-free router for vanilla JS SPAs. Looking for feedback on the API design and edge-case handling for nested routes.",
    githubUrl: "https://github.com/kavindu/tinyrouter",
    techTags: ["javascript", "routing"],
    status: "Reviewed",
    createdAt: "2026-08-12T09:15:00.000Z",
    _count: { criteria: 3, reviews: 2 },
  },
  {
    id: 2,
    userId: 2,
    user: { id: 2, username: "sew_codes" },
    title: "Expense tracker API",
    description:
      "REST API for a personal finance tracker, built with FastAPI + Postgres. First real backend project — brutal feedback welcome.",
    githubUrl: "https://github.com/sew/expense-api",
    techTags: ["python", "fastapi", "postgres"],
    status: "Pending",
    createdAt: "2026-08-13T14:30:00.000Z",
    _count: { criteria: 4, reviews: 0 },
  },
  {
    id: 3,
    userId: 3,
    user: { id: 3, username: "nadeeshaK" },
    title: "React drag-and-drop kanban board",
    description:
      "Trello-style board built with React + dnd-kit. Would love thoughts on the state management approach.",
    githubUrl: "https://github.com/nadeesha/kanban",
    techTags: ["react", "typescript"],
    status: "Reviewed",
    createdAt: "2026-08-11T18:00:00.000Z",
    _count: { criteria: 2, reviews: 1 },
  },
];

export const mockSubmissionDetails: Record<number, SubmissionDetail> = {
  1: {
    id: 1,
    userId: 1,
    user: { id: 1, username: "kavindu_dev" },
    title: "TinyRouter — a 2kb client-side router",
    description:
      "A dependency-free router for vanilla JS SPAs. Looking for feedback on the API design and edge-case handling for nested routes.",
    githubUrl: "https://github.com/kavindu/tinyrouter",
    techTags: ["javascript", "routing"],
    status: "Reviewed",
    createdAt: "2026-08-12T09:15:00.000Z",
    criteria: [
      { id: 1, submissionId: 1, label: "API design", order: 0 },
      { id: 2, submissionId: 1, label: "Edge-case handling", order: 1 },
      { id: 3, submissionId: 1, label: "Code readability", order: 2 },
    ],
    reviews: [
      {
        id: 1,
        submissionId: 1,
        reviewerId: 4,
        strengths: "Clean API surface, good use of the History API abstraction.",
        improvements: "Nested route matching breaks on trailing slashes — worth a regression test.",
        resourceLinks: ["https://github.com/reach/router"],
        createdAt: "2026-08-12T15:00:00.000Z",
        reviewer: { id: 4, username: "devReviewer99", karma: 142 },
        ratings: [
          { id: 1, reviewId: 1, criteriaId: 1, rating: 8 },
          { id: 2, reviewId: 1, criteriaId: 2, rating: 6 },
          { id: 3, reviewId: 1, criteriaId: 3, rating: 9 },
        ],
      },
      {
        id: 2,
        submissionId: 1,
        reviewerId: 5,
        strengths: "Zero dependencies is impressive for this feature set.",
        improvements: "Could use more inline comments around the matcher regex.",
        resourceLinks: [],
        createdAt: "2026-08-13T10:00:00.000Z",
        reviewer: { id: 5, username: "priya_builds", karma: 87 },
        ratings: [
          { id: 4, reviewId: 2, criteriaId: 1, rating: 7 },
          { id: 5, reviewId: 2, criteriaId: 2, rating: 7 },
          { id: 6, reviewId: 2, criteriaId: 3, rating: 8 },
        ],
      },
    ],
  },
};