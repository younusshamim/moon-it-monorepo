// The role contract, shared by the NestJS guard and the Next.js proxy (middleware) so the two
// never disagree (INFRASTRUCTURE.md §9). Keys mirror the canonical `roles.key` values authored in
// `@moonit/schema` (iam). The full RBAC wiring (Better Auth config, permission checks) lands in a
// later session — this file is only the shared enum + helpers the edges need today.

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  BRANCH_ADMIN: "branch_admin",
  STAFF: "staff",
  INSTRUCTOR: "instructor",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES = Object.values(ROLES) as Role[];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLE_VALUES as string[]).includes(value);
}
