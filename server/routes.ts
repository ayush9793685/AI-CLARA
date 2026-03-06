import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Simulated LLM extraction logic (Rule-based to remain zero-cost)
function extractDemoMemo(transcript: string) {
  // Simple rule-based extraction for demonstration
  return {
    company_name: "Extracted Company from Demo",
    business_hours: "9 AM - 5 PM",
    services_supported: ["Standard Services"],
    emergency_definition: ["Fire", "Leak"],
    call_transfer_rules: "Transfer to main line, if fail after 30s say we will call back",
    notes: "Memo generated from demo call via rule-based extraction"
  };
}

function generateDemoAgentSpec(memo: any) {
  return {
    agent_name: `${memo.company_name || 'Agent'} - Demo v1`,
    system_prompt: "You are Clara, a helpful virtual assistant. Greet the caller, ask their purpose, collect name and number, and attempt to transfer. Do not mention function calls.",
    voice_style: "professional and warm",
    version: 1,
    variables: {
      business_hours: memo.business_hours,
      emergency_definition: memo.emergency_definition
    }
  };
}

function extractOnboardingMemo(transcript: string, oldMemo: any) {
  return {
    ...oldMemo,
    company_name: oldMemo.company_name || "Company",
    business_hours: "8 AM - 6 PM EST", // Overridden by onboarding
    emergency_routing_rules: "Call Dispatch at 555-0199",
    integration_constraints: "Never create sprinkler jobs in ServiceTrade",
    notes: "Memo updated based on onboarding clarifications"
  };
}

function generateOnboardingAgentSpec(memo: any) {
  return {
    agent_name: `${memo.company_name || 'Agent'} - Production v2`,
    system_prompt: "You are Clara, a helpful virtual assistant. Greet the caller, ask their purpose. If emergency, collect address and transfer immediately to Dispatch. Do not mention function calls.",
    voice_style: "professional and warm",
    version: 2,
    variables: {
      business_hours: memo.business_hours,
      emergency_routing: memo.emergency_routing_rules,
      integration_constraints: memo.integration_constraints
    }
  };
}

function computeDiff(oldObj: any, newObj: any) {
  const changes = [];
  const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  
  for (const key of keys) {
    const fromStr = JSON.stringify(oldObj[key]);
    const toStr = JSON.stringify(newObj[key]);
    if (fromStr !== toStr) {
      changes.push({
        field: key,
        from: oldObj[key] === undefined ? null : oldObj[key],
        to: newObj[key] === undefined ? null : newObj[key]
      });
    }
  }
  return changes;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.accounts.list.path, async (req, res) => {
    const accounts = await storage.getAccounts();
    res.json(accounts);
  });

  app.get(api.accounts.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const details = await storage.getAccountDetails(id);
    if (!details) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json(details);
  });

  app.post(api.accounts.create.path, async (req, res) => {
    try {
      const input = api.accounts.create.input.parse(req.body);
      const account = await storage.createAccount(input);
      res.status(201).json(account);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.accounts.processDemo.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.accounts.processDemo.input.parse(req.body);
      
      const account = await storage.getAccount(id);
      if (!account) return res.status(404).json({ message: "Account not found" });
      if (account.status !== "new") return res.status(400).json({ message: "Account already processed demo" });

      // Save Demo Transcript
      await storage.createTranscript({ accountId: id, stage: "demo", content: input.transcript });
      
      // Extraction & Generation (v1)
      const memoData = extractDemoMemo(input.transcript);
      await storage.createMemo({ accountId: id, version: 1, data: memoData });
      
      const agentData = generateDemoAgentSpec(memoData);
      await storage.createAgentConfig({ accountId: id, version: 1, data: agentData });
      
      // Update Account Status
      await storage.updateAccountStatus(id, "demo_processed");

      res.status(200).json({ success: true, message: "Demo processed successfully" });
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.accounts.processOnboarding.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.accounts.processOnboarding.input.parse(req.body);
      
      const details = await storage.getAccountDetails(id);
      if (!details) return res.status(404).json({ message: "Account not found" });
      if (details.account.status !== "demo_processed") {
        return res.status(400).json({ message: "Account must have demo processed first" });
      }

      // Save Onboarding Transcript
      await storage.createTranscript({ accountId: id, stage: "onboarding", content: input.transcript });
      
      // Get old memo to diff against
      const oldMemo = details.memos.find(m => m.version === 1);
      const oldMemoData = oldMemo?.data || {};

      // Update & Regenerate (v2)
      const newMemoData = extractOnboardingMemo(input.transcript, oldMemoData);
      await storage.createMemo({ accountId: id, version: 2, data: newMemoData });
      
      const newAgentData = generateOnboardingAgentSpec(newMemoData);
      await storage.createAgentConfig({ accountId: id, version: 2, data: newAgentData });
      
      // Generate Changelog
      const diff = computeDiff(oldMemoData, newMemoData);
      await storage.createChangelog({ accountId: id, fromVersion: 1, toVersion: 2, changes: diff });

      // Update Account Status
      await storage.updateAccountStatus(id, "onboarding_processed");

      res.status(200).json({ success: true, message: "Onboarding processed successfully" });
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed Database with initial demo accounts
  async function seedDatabase() {
    const existing = await storage.getAccounts();
    if (existing.length === 0) {
      await storage.createAccount({ companyName: "Acme Fire Protection" });
      await storage.createAccount({ companyName: "Global HVAC Services" });
    }
  }
  
  seedDatabase().catch(console.error);

  return httpServer;
}
