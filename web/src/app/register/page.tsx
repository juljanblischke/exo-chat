"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/chat");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  function handleRegister() {
    const redirectUri = encodeURIComponent(
      window.location.origin + "/api/auth/callback/keycloak"
    );
    const keycloakUrl =
      process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? "http://localhost:8080";
    window.location.href = `${keycloakUrl}/realms/exochat/protocol/openid-connect/registrations?client_id=exochat-web&response_type=code&scope=openid&redirect_uri=${redirectUri}`;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Register for ExoChat to start chatting
          </p>
        </div>
        <Button className="w-full" onClick={handleRegister}>
          Register with Keycloak
        </Button>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="underline hover:text-foreground">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
