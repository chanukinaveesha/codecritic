"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export function SyncUser() {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const syncedForUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || syncedForUserId.current === userId) {
      return;
    }
    syncedForUserId.current = userId;

    (async () => {
      const token = await getToken();
      await fetch(`${BACKEND_URL}/users/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {
        syncedForUserId.current = null;
      });
    })();
  }, [isLoaded, isSignedIn, userId, getToken]);

  return null;
}
