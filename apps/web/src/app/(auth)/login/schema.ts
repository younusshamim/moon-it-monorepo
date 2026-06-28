import { z } from "zod";

// Login is an auth-flow input, not a domain entity, so its schema lives with the route. Shared with
// both the client form (RHF resolver) and the Server Action, so a form that compiles can't submit a
// shape the action rejects (INFRASTRUCTURE.md §4).
export const LoginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type LoginInput = z.infer<typeof LoginSchema>;
