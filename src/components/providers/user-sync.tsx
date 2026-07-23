"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";

export function UserSync() {
  const { isSignedIn, isLoaded } = useAuth();
  const ensureUser = useMutation(api.users.ensureUser);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      ensureUser().catch(console.error);
    }
  }, [isLoaded, isSignedIn, ensureUser]);

  return null;
}
