// Shared OpenAPI document builder, consumed by both the live `/docs` route (main.ts) and the
// static-export script (openapi-export.ts) so the served spec and the committed artifact can't drift.
import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function createOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("Moon IT API")
    .setDescription("Moon IT admin platform API")
    .setVersion("0.0.0")
    // The API authenticates via the Better Auth session cookie (issued by `/api/auth/sign-in/email`).
    // Declaring it here surfaces the scheme in Swagger; `@ApiCookieAuth()` marks protected routes.
    .addCookieAuth("better-auth.session_token", {
      type: "apiKey",
      in: "cookie",
      name: "better-auth.session_token",
    })
    .build();
  return SwaggerModule.createDocument(app, config);
}
