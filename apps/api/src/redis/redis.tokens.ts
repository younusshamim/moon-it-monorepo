// DI token kept separate from the provider module so consumers (jobs, health indicators) can depend
// on the token without importing the ioredis client graph. See INFRASTRUCTURE.md §6.

/** Injection token for the shared ioredis connection. */
export const REDIS = "REDIS";
