// @moonit/schema — the single Zod contract. Domain entities are defined once here; TS types,
// OpenAPI docs, RHF resolvers, and runtime validation all derive from these schemas.
// Zero runtime dependencies beyond Zod (no Drizzle, no Nest, no React). See INFRASTRUCTURE.md §4.
//
// For each table the module exports a canonical entity schema (the full select row), plus
// `New*` (create) and `Update*` (partial) derivations, and the inferred TS types.

export * from "./affiliation/schema.js"; // affiliation bodies, exam fees/events, registrations
export * from "./assessment/schema.js"; // exams, grades, certificates
export * from "./auth/session.js"; // the /v1/me principal: identity + roles + permissions + branch scope
export * from "./catalog/schema.js"; // courses, curriculum, per-branch offerings
export * from "./crm/schema.js"; // leads, lead activity
export * from "./enrollment/schema.js"; // enrollments, attendance
export * from "./finance/schema.js"; // invoices, installments, payments, discounts, refunds
export * from "./hr/schema.js"; // employees, instructors
export * from "./iam/rbac.js"; // permission catalog + per-role grant map (shared by seed + guard)
export * from "./iam/schema.js"; // users, roles, permissions, branch-scoped assignment
// Bounded contexts (DATABASE_DOMAIN.md §1).
export * from "./organization/schema.js"; // branches, rooms, departments
export * from "./people/schema.js"; // students
export * from "./platform/schema.js"; // notifications, audit log
export * from "./scheduling/schema.js"; // batches, schedules, sessions, instructor assignment
// Shared column primitives (re-used by packages/db column definitions).
export * from "./shared/columns.js";
// Shared pagination contract: list-query input + `{ data, page, pageSize, total }` response envelope.
export * from "./shared/pagination.js";
