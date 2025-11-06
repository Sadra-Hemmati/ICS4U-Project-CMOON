'use server';

/**
 * @fileOverview This file defines a Genkit flow for parsing a list of tasks from a chatbot input.
 *
 * It includes:
 * - `parseTaskList`: Function to parse task list from a text using Genkit flow.
 * - `TaskListInput`: Input type definition for the parseTaskList function.
 * - `TaskListOutput`: Output type definition for the parseTaskList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskListInputSchema = z.object({
  taskListText: z
    .string()
    .describe('A text containing a list of tasks, each with a name, due date, urgency, required hours, and tags.'),
});
export type TaskListInput = z.infer<typeof TaskListInputSchema>;

const TaskSchema = z.object({
  name: z.string().describe('The name of the task.'),
  dueDate: z.string().describe('The due date of the task (e.g., YYYY-MM-DD).'),
  urgency: z.string().optional().describe('The urgency level of the task (e.g., high, medium, low).'),
  requiredHours: z.number().optional().describe('The estimated hours required to complete the task.'),
  tags: z.array(z.string()).optional().describe('A list of tags associated with the task.'),
});

const TaskListOutputSchema = z.array(TaskSchema).describe('A list of parsed tasks.');
export type TaskListOutput = z.infer<typeof TaskListOutputSchema>;

export async function parseTaskList(input: TaskListInput): Promise<TaskListOutput> {
  return parseTaskListFlow(input);
}

const taskListPrompt = ai.definePrompt({
  name: 'taskListPrompt',
  input: {schema: TaskListInputSchema},
  output: {schema: TaskListOutputSchema},
  prompt: `You are a task parsing AI.  Your job is to take a block of text from the user and parse it into a JSON array of tasks.

  Each task should have the following fields:
  - name: string (required)
  - dueDate: string (YYYY-MM-DD) (required)
  - urgency: string (optional, one of: high, medium, low)
  - requiredHours: number (optional)
  - tags: array of strings (optional)

  Here is the text to parse:
  {{taskListText}}
  `,
});

const parseTaskListFlow = ai.defineFlow(
  {
    name: 'parseTaskListFlow',
    inputSchema: TaskListInputSchema,
    outputSchema: TaskListOutputSchema,
  },
  async input => {
    const {output} = await taskListPrompt(input);
    return output!;
  }
);
