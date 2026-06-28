import { pgGenerate } from "drizzle-dbml-generator";
import * as schema from "../src/schema/index";

pgGenerate({ schema, out: "./schema.dbml" });
