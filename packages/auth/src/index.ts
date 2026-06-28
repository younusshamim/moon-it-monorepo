// @moonit/auth — Better Auth config, the role enum (super_admin / branch_admin / staff / instructor),
// and guards shared by the NestJS guard and the Next.js proxy (middleware) so the two never disagree.
// See INFRASTRUCTURE.md §9. The Better Auth server config lands in a later session; what ships now is
// the shared role + session-cookie contract the auth edges already depend on.
export * from "./roles.js";
export * from "./session.js";
