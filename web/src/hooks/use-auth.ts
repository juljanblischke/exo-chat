"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    accessToken: session?.accessToken ?? null,
    signIn: () => signIn("keycloak"),
    signOut: () => signOut({ redirectTo: "/login" }),
  };
}

export function useRequireAuth() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  return useSession();
}
