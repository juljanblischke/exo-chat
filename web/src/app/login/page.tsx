"use client";

import { Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/chat";

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome to ExoChat</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <Button
          className="w-full"
          onClick={() => signIn("keycloak", { redirectTo: callbackUrl })}
        >
          Sign in with Keycloak
        </Button>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="/register" className="underline hover:text-foreground">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
