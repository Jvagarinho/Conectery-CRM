"use client";

import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const user = useQuery(api.users.getCurrentUser);

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold">
          Bem-vindo{user ? `, ${user.name}` : ""}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
            {user.role === "admin" ? "Administrador" : "Comercial"}
          </Badge>
        )}
        <UserButton />
      </div>
    </header>
  );
}
