// DI token kept separate from the provider module so consumers (repositories, health indicators)
// can depend on the token without importing the Drizzle/postgres client graph. See INFRASTRUCTURE.md §6.

/** Injection token for the Drizzle client (`Database` from @moonit/db). */
export const DRIZZLE = "DRIZZLE";
