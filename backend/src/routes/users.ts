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
