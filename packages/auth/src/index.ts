// @moonit/auth — the Better Auth server config (`createAuth` + super-admin bootstrap), the role enum
// (super_admin / branch_admin / staff / instructor), and the session-cookie contract shared by the
// NestJS guard and the Next.js proxy (middleware) so the two never disagree. See INFRASTRUCTURE.md §9.
// The request handler + NestJS guard mount on top of `createAuth` in a later phase.
export { bootstrapSuperAdmin } from "./bootstrap.js";
export * from "./config.js";
export * from "./roles.js";
export * from "./session.js";
