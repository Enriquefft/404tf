import { pgSchema } from "drizzle-orm/pg-core";
import { getSchemaName } from "./schema-name";

export const schema = pgSchema(getSchemaName());
