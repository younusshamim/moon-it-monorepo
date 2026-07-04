"use server";

// Server Action for email/password sign-in. Authorization and credential handling are server-side
// (INFRASTRUCTURE.md §6, §9). Validation uses the shared LoginSchema.
//
// NOTE: The Better Auth server config lives in @moonit/auth and lands in a later session. Until then
// this action validates input and returns a typed result; the actual session-issuing call is stubbed
// so the flow is honest rather than pretending to authenticate.
import { LoginSchema } from "@/app/(auth)/login/schema";

export interface LoginResult {
  ok: boolean;
  message?: string;
}

export async function signInWithEmail(input: unknown): Promise<LoginResult> {
  const parsed = LoginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please check your email and password." };
  }

  // TODO(@moonit/auth): call Better Auth's email sign-in, set the session cookie, then the form
  // redirects to `redirectTo`. Wired up when the auth package's server config lands.
  return { ok: false, message: "Sign-in isn't wired up yet — pending @moonit/auth." };
}
