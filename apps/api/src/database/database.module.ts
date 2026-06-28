// Provides the Drizzle client as a DI provider, built from validated env (INFRASTRUCTURE.md §6).
// The postgres.js handle is kept internally so the connection is closed on graceful shutdown.

import { createDbClient, type Database } from "@moonit/db";
import { Global, Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import { ENV, type Env } from "../config/config.module.js";
import { DRIZZLE } from "./database.tokens.js";

/** Internal token for the `{ db, client }` pair, used only for shutdown. */
const DB_CONNECTION = "DB_CONNECTION";

type DbConnection = ReturnType<typeof createDbClient>;

@Global()
@Module({
  providers: [
    {
      provide: DB_CONNECTION,
      inject: [ENV],
      useFactory: (env: Env): DbConnection => createDbClient(env.DATABASE_URL),
    },
    {
      provide: DRIZZLE,
      inject: [DB_CONNECTION],
      useFactory: (connection: DbConnection): Database => connection.db,
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DB_CONNECTION) private readonly connection: DbConnection) {}

  async onApplicationShutdown(): Promise<void> {
    await this.connection.client.end();
  }
}
