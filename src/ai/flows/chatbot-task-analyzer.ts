'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a user's request
 * and determining the appropriate action to take, such as deleting tasks, parsing
 * a list of tasks, or providing a simple text response.
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
  TaskSchema,
  TagSchema,
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
  prompt: `You are an intelligent task management assistant. Your primary job is to analyze a user's request and determine the correct course of action.

You have three choices for the action type:

1.  **action**: Use this when the user explicitly asks to perform an operation on their tasks, like deleting, updating, or creating. Your job is to form a clear plan.
    - For 'delete' actions, you MUST identify the tasks to be deleted based on the user's criteria (e.g., by tag).
    - You MUST generate a \`confirmationMessage\` that clearly explains what you are about to do and which tasks will be affected. For example: "I will delete 3 tasks with the 'personal' tag: 'Book dentist appointment', 'Call mom', and 'Buy groceries'. Do you want to proceed?".
    - You MUST populate the \`tasks\` array with the full details of the tasks that will be deleted.

2.  **parse**: Use this when the user provides a block of text that looks like a list of tasks to be added to their list. The text doesn't explicitly say "add these tasks", but the format implies it. The next step in the application will be to parse this text.

3.  **response**: Use this for all other cases. If the user is asking a question, having a simple conversation, or if the request is ambiguous, generate a helpful text response. Do not try to perform an action if you are not confident.

Here is the user's request and current data:

**User Request:**
"{{{request}}}"

**Current Tasks:**
{{#if tasks.length}}
{{#each tasks}}
- ID: {{id}}, Name: {{{name}}}, Tags: [{{#each tags}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}]
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
    const { output } = await analysisPrompt(input);
    return output!;
  }
);
