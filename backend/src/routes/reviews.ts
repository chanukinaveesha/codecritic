import { getAuth } from "@clerk/express";
import { Router } from "express";
import z from "zod";
import { prisma } from "../lib/prisma";
 
export const reviewRouter = Router();
 
const idParamSchema = z.coerce.number().int().positive();
 
const createReviewSchema = z.object({
  strengths: z.string().min(1),
  improvements: z.string().min(1),
  resourceLinks: z.array(z.string().url()).default([]),
  ratings: z
    .array(
      z.object({
        criteriaId: z.number().int().positive(),
        rating: z.number().int().min(1).max(10),
      })
    )
    .min(1),
});

reviewRouter.post("/:id/reviews", async (req, res) => {
  const parsedId = idParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    return res.status(400).json({ error: "Invalid submission id" });
  }
 
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
 
  const reviewer = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!reviewer) {
    return res.status(401).json({ error: "User not synced. Call /users/sync first." });
  }
 
  const parsedBody = createReviewSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: parsedBody.error.flatten() });
  }
 
  const submission = await prisma.submission.findUnique({
    where: { id: parsedId.data },
    include: { criteria: true },
  });
 
  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  if (submission.userId === reviewer.id) {
    return res.status(403).json({ error: "You can't review your own submission" });
  }

  const alreadyReviewed = await prisma.review.findFirst({
    where: {
      submissionId: submission.id,
      reviewerId: reviewer.id,
    },
  });
 
  if (alreadyReviewed) {
    return res.status(409).json({ error: "You already reviewed this submission" });
  }

  const { ratings } = parsedBody.data;
 
  if (ratings.length !== submission.criteria.length) {
    return res.status(400).json({ error: "You need to rate every criteria" });
  }
 
  for (let i = 0; i < submission.criteria.length; i++) {
    const criterion = submission.criteria[i];
    let found = false;
    for (let j = 0; j < ratings.length; j++) {
      if (ratings[j].criteriaId === criterion.id) {
        found = true;
        break;
      }
    }
    if (!found) {
      return res.status(400).json({ error: "Missing a rating for one of the criteria" });
    }
  }

  const newReview = await prisma.review.create({
    data: {
      submissionId: submission.id,
      reviewerId: reviewer.id,
      strengths: parsedBody.data.strengths,
      improvements: parsedBody.data.improvements,
      resourceLinks: parsedBody.data.resourceLinks,
      ratings: {
        create: ratings.map((r) => ({
          criteriaId: r.criteriaId,
          rating: r.rating,
        })),
      },
    },
    include: {
      ratings: true,
      reviewer: { select: { id: true, username: true, karma: true } },
    },
  });

  await prisma.user.update({
    where: { id: reviewer.id },
    data: { karma: { increment: 2 } },
  });

  await prisma.submission.update({
    where: { id: submission.id },
    data: { status: "Reviewed" },
  });
 
  return res.status(201).json(newReview);
});

reviewRouter.get("/:id/reviews", async (req, res) => {
  const parsedId = idParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    return res.status(400).json({ error: "Invalid submission id" });
  }
 
  const submission = await prisma.submission.findUnique({ where: { id: parsedId.data } });
  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }
 
  const reviews = await prisma.review.findMany({
    where: { submissionId: parsedId.data },
    orderBy: { createdAt: "desc" },
    include: {
      reviewer: { select: { id: true, username: true, karma: true } },
      ratings: true,
    },
  });
 
  res.status(200).json(reviews);
});

reviewRouter.get("/:id/criteria", async (req, res) => {
  const parsedId = idParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    return res.status(400).json({ error: "Invalid submission id" });
  }
 
  const submission = await prisma.submission.findUnique({ where: { id: parsedId.data } });
  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }
 
  const criteria = await prisma.reviewCriteria.findMany({
    where: { submissionId: parsedId.data },
    orderBy: { order: "asc" },
  });
 
  res.status(200).json(criteria);
});
 