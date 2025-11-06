/**
 * @fileOverview This file defines the Zod schemas and TypeScript types
 * for the chatbot task analyzer flow. It is kept separate from the flow
 * itself to avoid issues with 'use server' exports.
 */

import { z } from 'genkit';

export const TaskSchema = z.object({
  id: z.string().describe('The unique identifier of the task.'),
  name: z.string().describe('The name of the task.'),
  tags: z
    .array(z.string())
    .describe('A list of tag names associated with the task.'),
});

export const TagSchema = z.object({
  id: z.string().describe('The unique ID of the tag.'),
  name: z.string().describe('The name of the tag.'),
});

export const AnalyzeRequestInputSchema = z.object({
  request: z.string().describe("The user's raw text request."),
  tasks: z.array(TaskSchema).describe('The current list of tasks.'),
  tags: z.array(TagSchema).describe('The available tags.'),
});

export const ActionPlanSchema = z.object({
  messageId: z
    .string()
    .describe('The ID of the message that this plan is associated with.'),
  type: z.string().describe("Must be the string 'action'."),
  action: z
    .string()
    .describe("The type of action to perform. Currently, only 'delete' is supported."),
  tasks: z
    .array(TaskSchema)
    .describe('The tasks that will be affected by the action.'),
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
