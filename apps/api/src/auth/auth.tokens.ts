// DI token for the configured Better Auth instance (`Auth` from @moonit/auth). Kept in its own file
// so consumers depend on the token without importing the auth provider graph. See INFRASTRUCTURE.md §9.

/** Injection token for the Better Auth instance built by AuthModule. Inject with `@Inject(AUTH)`. */
export const AUTH = "AUTH";
