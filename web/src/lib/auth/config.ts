import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    error?: "RefreshTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    error?: "RefreshTokenError";
  }
}

// Internal URL for server-to-server calls (inside Docker: http://keycloak:8080/realms/exochat)
// Falls back to the public issuer URL for local dev (where localhost works fine)
const keycloakInternalIssuer =
  process.env.AUTH_KEYCLOAK_INTERNAL_ISSUER ?? process.env.AUTH_KEYCLOAK_ISSUER;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const url = `${keycloakInternalIssuer}/protocol/openid-connect/token`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_KEYCLOAK_ID!,
      client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
  });

  const refreshedTokens = await response.json();

  if (!response.ok) {
    return { ...token, error: "RefreshTokenError" };
  }

  return {
    ...token,
    accessToken: refreshedTokens.access_token,
    refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
  };
}

export const authConfig: NextAuthConfig = {
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET,
      // Public issuer URL — used for browser redirects (authorization endpoint)
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
      // Internal URL for OIDC discovery (server-side, inside Docker)
      wellKnown: `${keycloakInternalIssuer}/.well-known/openid-configuration`,
      // Override server-side endpoints to use internal Docker URL
      token: `${keycloakInternalIssuer}/protocol/openid-connect/token`,
      userinfo: `${keycloakInternalIssuer}/protocol/openid-connect/userinfo`,
      checks: ["state"],
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token!,
          refreshToken: account.refresh_token!,
          expiresAt: account.expires_at!,
        };
      }

      if (Date.now() < token.expiresAt * 1000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (token.error) {
        session.error = token.error;
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
