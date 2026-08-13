import { getAuth } from "@clerk/express";
import { Router } from "express";
import z from "zod";
import { prisma } from "../lib/prisma";

export const submissionRouter = Router();

const createSubmissionSchema = z.object({
    title: z.string().min(1).max(200),
  description: z.string().min(1),
  githubUrl: z.string().url(),
  techTags: z.array(z.string().trim().toLowerCase()).default([]),
  criteria: z
    .array(z.object({ label: z.string().min(1) }))
    .min(1)
    .max(5),
}
);

submissionRouter.post("/", async (req, res) => {
    const {userId} = getAuth(req);
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });
    if(!user){
        return res.status(401).json({ error: "User not synced. Call /users/sync first." })
    }

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const parsedData = createSubmissionSchema.safeParse(req.body);

    if (!parsedData.success) {
        return res.status(400).json({ error: parsedData.error.flatten() });
    }

    const submission = await prisma.submission.create({
        data: {
            userId: user.id,
            title: parsedData.data.title,
            description: parsedData.data.description,
            githubUrl: parsedData.data.githubUrl,
            techTags: parsedData.data.techTags,
            criteria: {
                create: parsedData.data.criteria.map((c, index) => ({
                    label: c.label,
                    order: index,
                })),
            },
        },
        include: {
            criteria: true,
        },
    });

    return res.status(201).json(submission);
});

const feedQuerySchema = z.object({
    tech: z.string().trim().toLowerCase().min(1).optional(),
    search: z.string().trim().min(1).optional(),
})

submissionRouter.get("/", async (req, res) => {
    const parsedQuery = feedQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
        return res.status(400).json({ error: parsedQuery.error.flatten() });
    }
    
    const { tech, search } = parsedQuery.data;

    const submissions = await prisma.submission.findMany({
        where:{
            ...(tech ? { techTags: { has: tech } } : {}),
            ...(search ? { OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ] } : {}),
        },
        orderBy: { createdAt: "desc" },
        include:{
            user: { select: { id: true, username: true } },
            _count:{select:{criteria:true, reviews:true}},
        }
    });
    res.status(200).json(submissions);
});

const idParamSchema = z.coerce.number().int().positive();

submissionRouter.get("/:id", async (req, res) => {
    const parsedId = idParamSchema.safeParse(req.params.id);

    if (!parsedId.success) {
        return res.status(400).json({ error: parsedId.error.flatten() });
    }

    const submission = await prisma.submission.findUnique({
        where: { id: parsedId.data },
        include: {
            user: { select: { id: true, username: true } },
            criteria:{orderBy:{order:"asc"}},
            reviews: {
                orderBy: { createdAt: "desc" },
                include:{
                    reviewer:{select:{id:true, username:true, karma:true}},
                    ratings:true,
                }
            },
        },
    });

    if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
    }

    res.status(200).json(submission);
});