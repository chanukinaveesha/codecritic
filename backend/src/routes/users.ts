import { Router } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";

export const usersRouter = Router();

usersRouter.post("/sync", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const clerkUser = await clerkClient.users.getUser(userId);

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  const username =
    clerkUser.username ??
    primaryEmail?.split("@")[0] ??
    `user_${clerkUser.id.slice(-8)}`;

  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: { username },
    create: { clerkId: clerkUser.id, username },
  });

  res.status(200).json(user);
});

usersRouter.get("/:username", async (req, res) => {
  const { username } = req.params;

  const user = await prisma.user.findUnique({
    where: { username },
    select:{ 
      username: true, 
      bio: true,
      techStack: true,
      githubLink: true,
      karma: true,
      createdAt: true,
      submissions: {select: {id: true}},
      reviews: {select: {id: true}},
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(200).json({
    username: user.username,
    bio: user.bio,
    techStack: user.techStack,
    githubLink: user.githubLink,
    karma: user.karma,
    createdAt: user.createdAt,
    submissionsCount: user.submissions.length,
    reviewsGivenCount: user.reviews.length,

  });
});