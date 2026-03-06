import { z } from 'zod';
import { insertAccountSchema } from './schema';
import type { Account, AccountDetailsResponse } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  accounts: {
    list: {
      method: 'GET' as const,
      path: '/api/accounts' as const,
      responses: {
        200: z.array(z.any()), // Array of Account objects
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/accounts/:id' as const,
      responses: {
        200: z.any(), // AccountDetailsResponse
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/accounts' as const,
      input: z.object({ companyName: z.string() }),
      responses: {
        201: z.any(), // Account
        400: errorSchemas.validation,
      },
    },
    processDemo: {
      method: 'POST' as const,
      path: '/api/accounts/:id/process-demo' as const,
      input: z.object({ transcript: z.string() }),
      responses: {
        200: z.object({ success: z.boolean(), message: z.string() }),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    processOnboarding: {
      method: 'POST' as const,
      path: '/api/accounts/:id/process-onboarding' as const,
      input: z.object({ transcript: z.string() }),
      responses: {
        200: z.object({ success: z.boolean(), message: z.string() }),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
