import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useAccounts() {
  return useQuery({
    queryKey: [api.accounts.list.path],
    queryFn: async () => {
      const res = await fetch(api.accounts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch accounts");
      return api.accounts.list.responses[200].parse(await res.json());
    },
  });
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: [api.accounts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.accounts.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch account details");
      return api.accounts.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.accounts.create.input>) => {
      const res = await fetch(api.accounts.create.path, {
        method: api.accounts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create account");
      }
      return api.accounts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
    },
  });
}

export function useProcessDemo(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { transcript: string }) => {
      const url = buildUrl(api.accounts.processDemo.path, { id });
      const res = await fetch(url, {
        method: api.accounts.processDemo.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to process demo call");
      }
      return api.accounts.processDemo.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.accounts.get.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
    },
  });
}

export function useProcessOnboarding(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { transcript: string }) => {
      const url = buildUrl(api.accounts.processOnboarding.path, { id });
      const res = await fetch(url, {
        method: api.accounts.processOnboarding.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to process onboarding call");
      }
      return api.accounts.processOnboarding.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.accounts.get.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
    },
  });
}
