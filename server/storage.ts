import { db } from "./db";
import {
  accounts, transcripts, memos, agentConfigs, changelogs,
  type Account, type Transcript, type Memo, type AgentConfig, type Changelog,
  type CreateAccountRequest, type AccountDetailsResponse
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: CreateAccountRequest): Promise<Account>;
  updateAccountStatus(id: number, status: string): Promise<Account>;
  getAccountDetails(id: number): Promise<AccountDetailsResponse | undefined>;
  
  createTranscript(transcript: Omit<Transcript, "id" | "createdAt">): Promise<Transcript>;
  createMemo(memo: Omit<Memo, "id" | "createdAt">): Promise<Memo>;
  createAgentConfig(config: Omit<AgentConfig, "id" | "createdAt">): Promise<AgentConfig>;
  createChangelog(changelog: Omit<Changelog, "id" | "createdAt">): Promise<Changelog>;
}

export class DatabaseStorage implements IStorage {
  async getAccounts(): Promise<Account[]> {
    return await db.select().from(accounts).orderBy(desc(accounts.createdAt));
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async createAccount(account: CreateAccountRequest): Promise<Account> {
    const [newAccount] = await db.insert(accounts).values({ ...account, status: "new" }).returning();
    return newAccount;
  }

  async updateAccountStatus(id: number, status: string): Promise<Account> {
    const [updated] = await db.update(accounts).set({ status }).where(eq(accounts.id, id)).returning();
    return updated;
  }

  async getAccountDetails(id: number): Promise<AccountDetailsResponse | undefined> {
    const account = await this.getAccount(id);
    if (!account) return undefined;

    const t = await db.select().from(transcripts).where(eq(transcripts.accountId, id)).orderBy(transcripts.createdAt);
    const m = await db.select().from(memos).where(eq(memos.accountId, id)).orderBy(memos.version);
    const c = await db.select().from(agentConfigs).where(eq(agentConfigs.accountId, id)).orderBy(agentConfigs.version);
    const cl = await db.select().from(changelogs).where(eq(changelogs.accountId, id)).orderBy(changelogs.createdAt);

    return {
      account,
      transcripts: t,
      memos: m,
      configs: c,
      changelogs: cl
    };
  }

  async createTranscript(transcript: Omit<Transcript, "id" | "createdAt">): Promise<Transcript> {
    const [t] = await db.insert(transcripts).values(transcript).returning();
    return t;
  }

  async createMemo(memo: Omit<Memo, "id" | "createdAt">): Promise<Memo> {
    const [m] = await db.insert(memos).values(memo).returning();
    return m;
  }

  async createAgentConfig(config: Omit<AgentConfig, "id" | "createdAt">): Promise<AgentConfig> {
    const [c] = await db.insert(agentConfigs).values(config).returning();
    return c;
  }

  async createChangelog(changelog: Omit<Changelog, "id" | "createdAt">): Promise<Changelog> {
    const [c] = await db.insert(changelogs).values(changelog).returning();
    return c;
  }
}

export const storage = new DatabaseStorage();
