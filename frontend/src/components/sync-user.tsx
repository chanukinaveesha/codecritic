"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
  throw new Error(
    "NEXT_PUBLIC_BACKEND_URL is not set. Set it in your environment (e.g. .env.local) to the backend API's base URL."
  );
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function SyncUser() {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    (async () => {
      const token = await getToken();
      await fetch(`${BACKEND_URL}/users/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    })().catch(() => {});
  }, [isLoaded, isSignedIn, userId, getToken]);

  return null;
}
