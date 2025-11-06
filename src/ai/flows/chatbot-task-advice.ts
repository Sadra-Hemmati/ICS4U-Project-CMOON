'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing task organization and planning advice.
 *
 * It includes:
 * - `getTaskAdvice`: A function that takes a list of tasks and returns advice on how to organize and plan them.
 * - `TaskAdviceInput`: The input type for the `getTaskAdvice` function.
 * - `TaskAdviceOutput`: The output type for the `getTaskAdvice` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  name: z.string().describe('The name of the task.'),
  dueDate: z.string().optional().describe('The due date of the task (ISO format).'),
  urgency: z.string().optional().describe('The urgency level of the task (e.g., high, medium, low).'),
  requiredHours: z.number().optional().describe('The estimated number of hours required to complete the task.'),
  tags: z.array(z.string()).optional().describe('Tags associated with the task.'),
});

const TaskAdviceInputSchema = z.object({
  tasks: z.array(TaskSchema).describe('A list of tasks to be organized and planned.'),
});

export type TaskAdviceInput = z.infer<typeof TaskAdviceInputSchema>;

const TaskAdviceOutputSchema = z.object({
  advice: z.string().describe('Advice on how to organize and plan the tasks, formatted with markdown.'),
});

export type TaskAdviceOutput = z.infer<typeof TaskAdviceOutputSchema>;

export async function getTaskAdvice(input: TaskAdviceInput): Promise<TaskAdviceOutput> {
  return taskAdviceFlow(input);
}

const taskAdvicePrompt = ai.definePrompt({
  name: 'taskAdvicePrompt',
  input: {schema: TaskAdviceInputSchema},
  output: {schema: TaskAdviceOutputSchema},
  prompt: `You are a task management expert. Analyze the following list of tasks and provide a clear, actionable plan. 

Your response MUST be formatted using Markdown. Use headings, bullet points, and bold text to make the advice easy to read and follow.

Start with a summary, then provide a step-by-step plan. For example:

### Quick Summary
You have X tasks to complete. Let's focus on the most urgent ones first.

### Action Plan
*   **Today's Focus:**
    *   Task A (High Urgency)
    *   Task B (Due Soon)
*   **Up Next:**
    *   Task C

Tasks:
{{#each tasks}}
- Name: {{{name}}}
  Due Date: {{{dueDate}}}
  Urgency: {{{urgency}}}
  Required Hours: {{{requiredHours}}}
  Tags: {{#each tags}}{{{this}}}{{#if @last}}{{else}}, {{/if}}{{/each}}
{{/each}}
`,
});

const taskAdviceFlow = ai.defineFlow(
  {
    name: 'taskAdviceFlow',
    inputSchema: TaskAdviceInputSchema,
    outputSchema: TaskAdviceOutputSchema,
  },
  async input => {
    const {output} = await taskAdvicePrompt(input);
    return output!;
  }
);
