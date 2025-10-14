import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { STATE_LIST } from "../../const/STATE_LIST";

export const workflows = sqliteTable("workflows", {
  workflowId: integer("workflow_id").primaryKey({ autoIncrement: true }),
  currentState: text("current_state", { enum: STATE_LIST }).notNull(),
  contextData: text("context_data", { mode: "json" }),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  nextStepId: integer("next_step_id"),
});
