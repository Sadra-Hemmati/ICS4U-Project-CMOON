'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a user's request
 * and determining the appropriate action to take, such as deleting, creating,
 * or updating tasks, or providing a simple text response.
 *
 * It includes:
 * - `analyzeTaskRequest`: The main function that orchestrates the analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  ActionPlanSchema,
  AnalysisResponse,
  AnalysisResponseSchema,
  AnalyzeRequestInputSchema,
} from '@/ai/schemas/task-analyzer-schemas';

export type {
  ActionPlan,
  AnalysisResponse,
} from '@/ai/schemas/task-analyzer-schemas';

export async function analyzeTaskRequest(
  input: z.infer<typeof AnalyzeRequestInputSchema>
): Promise<AnalysisResponse> {
  const messageId = Date.now().toString() + 'p';
  const result = await analyzeTaskRequestFlow({ ...input, messageId });
  if (result.type === 'action') {
    result.messageId = messageId;
  }
  return result;
}

const analysisPrompt = ai.definePrompt({
  name: 'analyzeTaskRequestPrompt',
  input: { schema: AnalyzeRequestInputSchema.extend({ messageId: z.string() }) },
  output: { schema: AnalysisResponseSchema },
  prompt: `You are an intelligent task management assistant. Your primary job is to analyze a user's request and determine the correct course of action, creating a detailed plan for execution.

You have three choices for the 'type' field in your output:

1.  **'action'**: Use this when the user explicitly asks to perform an operation on their tasks. Your job is to form a clear, step-by-step plan.
    - **Actions Supported**: 'create', 'update', 'delete'.
    - For **'create'** actions, parse the user's request to define a new task. You must infer the 'name', 'dueDate', 'urgency', and 'tags'. Today's date is {{currentDate}}. If a due date is relative (e.g., "tomorrow") or does not specify a year, calculate the absolute date based on the current year.
    - For **'update'** actions, identify the task(s) to be updated by name or other criteria. Determine which fields to change (e.g., 'dueDate', 'urgency', 'tags', 'completed'). If a user says "mark as done" or "complete", you should set the 'completed' field to 'true'. If they ask to mark as "not done" or "uncomplete", set it to 'false'. Include only the changed fields in the 'updates' object. To add or remove tags, use the 'tags' field with the final list of tags for the task.
    - For **'delete'** actions, identify the task(s) to be deleted based on the user's criteria (e.g., by name, tag, or completion status like "delete all done tasks").
    - You MUST generate a \`confirmationMessage\` that clearly explains what you are about to do. For example: "I will create a new task: 'Write report due tomorrow'. Does that sound right?" or "I will mark the task 'Buy groceries' as completed. Is that correct?".
    - You MUST populate the \`operations\` array with the specific steps of your plan.

2.  **'parse'**: Use this only when the user provides a block of text that is clearly a list of tasks to be added, without any other conversational text. The next step in the application will be to parse this text.

3.  **'response'**: Use this for all other cases. If the user is asking a question, having a simple conversation, or if the request is ambiguous, generate a helpful text response. Do not try to perform an action if you are not confident.

Here is the user's request and current data:

**User Request:**
"{{{request}}}"

**Current Date:**
"{{currentDate}}"

**Current Tasks:**
{{#if tasks.length}}
{{#each tasks}}
- ID: {{id}}, Name: {{{name}}}, DueDate: {{dueDate}}, Urgency: {{urgency}}, Completed: {{completed}}, Tags: [{{#each tags}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}]
{{/each}}
{{else}}
(No tasks)
{{/if}}

**Available Tags:**
{{#if tags.length}}
{{#each tags}}
- ID: {{id}}, Name: {{{name}}}
{{/each}}
{{else}}
(No tags)
{{/if}}

Analyze the request and provide the appropriate JSON output based on the schemas. Set the messageId to "{{messageId}}".`,
});

const analyzeTaskRequestFlow = ai.defineFlow(
  {
    name: 'analyzeTaskRequestFlow',
    inputSchema: AnalyzeRequestInputSchema.extend({ messageId: z.string() }),
    outputSchema: AnalysisResponseSchema,
  },
  async (input) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const { output } = await analysisPrompt({ ...input, currentDate });
    return output!;
  }
);
