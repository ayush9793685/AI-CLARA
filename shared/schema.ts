import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  status: text("status").notNull().default("new"), // 'new', 'demo_processed', 'onboarding_processed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  stage: text("stage").notNull(), // 'demo' or 'onboarding'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const memos = pgTable("memos", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  version: integer("version").notNull(), // 1 for demo, 2 for onboarding
  data: jsonb("data").notNull(), // Contains structured account memo
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentConfigs = pgTable("agent_configs", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  version: integer("version").notNull(),
  data: jsonb("data").notNull(), // Contains Retell agent spec
  createdAt: timestamp("created_at").defaultNow(),
});

export const changelogs = pgTable("changelogs", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  fromVersion: integer("from_version").notNull(),
  toVersion: integer("to_version").notNull(),
  changes: jsonb("changes").notNull(), // Array of diffs/changes
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true, status: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Account = typeof accounts.$inferSelect;
export type Transcript = typeof transcripts.$inferSelect;
export type Memo = typeof memos.$inferSelect;
export type AgentConfig = typeof agentConfigs.$inferSelect;
export type Changelog = typeof changelogs.$inferSelect;

export type CreateAccountRequest = z.infer<typeof insertAccountSchema>;

export type AccountDetailsResponse = {
  account: Account;
  transcripts: Transcript[];
  memos: Memo[];
  configs: AgentConfig[];
  changelogs: Changelog[];
};
