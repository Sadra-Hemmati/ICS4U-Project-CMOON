/**
 * @fileOverview This file defines the Zod schemas and TypeScript types
 * for the chatbot task analyzer flow. It is kept separate from the flow
 * itself to avoid issues with 'use server' exports.
 */

import { z } from 'genkit';

// Input schema for the main analysis flow
export const AnalyzeRequestInputSchema = z.object({
  request: z.string().describe("The user's raw text request."),
  tasks: z.array(z.object({
    id: z.string(),
    name: z.string(),
    dueDate: z.string(),
    urgency: z.string().optional(),
    tags: z.array(z.string()),
    completed: z.boolean(),
  })).describe('The current list of tasks.'),
  tags: z.array(z.object({
    id: z.string(),
    name: z.string()
  })).describe('The available tags.'),
});


// Schemas for operations within an action plan
const CreateOperationSchema = z.object({
  type: z.string().describe("Must be 'create'"),
  tasks: z.array(z.object({
    name: z.string(),
    dueDate: z.string().optional(),
    urgency: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })),
});

const UpdateOperationSchema = z.object({
  type: z.string().describe("Must be 'update'"),
  tasks: z.array(z.object({
    id: z.string(),
    updates: z.object({
      name: z.string().optional(),
      dueDate: z.string().optional(),
      urgency: z.string().optional(),
      tags: z.array(z.string()).optional(),
      completed: z.boolean().optional(),
    }),
  })),
});

const DeleteOperationSchema = z.object({
  type: z.string().describe("Must be 'delete'"),
  tasks: z.array(z.object({ id: z.string(), name: z.string() })),
});

const OperationSchema = z.union([
  CreateOperationSchema,
  UpdateOperationSchema,
  DeleteOperationSchema,
]);


// Schemas for the top-level response from the analyzer
export const ActionPlanSchema = z.object({
  messageId: z.string().describe('The ID of the message that this plan is associated with.'),
  type: z.string().describe("Must be the string 'action'."),
  operations: z.array(OperationSchema).describe('The sequence of operations to perform.'),
  confirmationMessage: z
    .string()
    .describe(
      'A user-friendly message explaining what the action will do and asking for confirmation.'
    ),
});
export type ActionPlan = z.infer<typeof ActionPlanSchema>;

const ParsePlanSchema = z.object({
  type: z.string().describe("Must be the string 'parse'."),
  reasoning: z
    .string()
    .describe('Explanation of why the model chose to parse the text.'),
});

const TextResponseSchema = z.object({
  type: z.string().describe("Must be the string 'response'."),
  textResponse: z
    .string()
    .describe('A simple text response when no specific action is needed.'),
});

export const AnalysisResponseSchema = z.union([
  ActionPlanSchema,
  ParsePlanSchema,
  TextResponseSchema,
]);
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
