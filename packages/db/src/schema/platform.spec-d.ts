import type { AuditLog, Notification } from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import { expectTypeOf } from "vitest";
import type { auditLogs, notifications } from "./platform.js";

expectTypeOf<InferSelectModel<typeof notifications>>().toEqualTypeOf<Notification>();
expectTypeOf<InferSelectModel<typeof auditLogs>>().toEqualTypeOf<AuditLog>();
