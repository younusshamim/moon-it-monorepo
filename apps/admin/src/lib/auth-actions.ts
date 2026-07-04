"use server";

// Auth Server Actions shared by the shell. Session handling is server-side (INFRASTRUCTURE.md §9).
// NOTE: The actual Better Auth calls land with the @moonit/auth server config in a later session.

export async function signOut(): Promise<void> {
  // TODO(@moonit/auth): call Better Auth `signOut` and delete the session cookie, then the caller
  // navigates to /login (the proxy will keep them there).
}
