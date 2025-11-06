'use server';

/**
 * @fileOverview Analyzes the user's schedule and suggests a plan to complete as many tasks as possible on time when the user is feeling overwhelmed.
 *
 * - panicModeScheduleAnalysis - A function that handles the schedule analysis process.
 * - PanicModeScheduleAnalysisInput - The input type for the panicModeScheduleAnalysis function, which is a list of tasks.
 * - PanicModeScheduleAnalysisOutput - The return type for the panicModeScheduleAnalysis function, which provides a plan to complete as many tasks as possible.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  name: z.string().describe('The name of the task.'),
  dueDate: z.string().describe('The due date of the task in ISO format.'),
  urgency: z.enum(['high', 'medium', 'low']).optional().describe('The urgency level of the task. Can be high, medium, or low.'),
  requiredHoursOfWork: z.number().optional().describe('The estimated required hours of work to complete the task.'),
  tags: z.array(z.string()).optional().describe('Tags or categories associated with the task.'),
});

const PanicModeScheduleAnalysisInputSchema = z.object({
  tasks: z.array(TaskSchema).describe('A list of tasks to analyze.'),
});
export type PanicModeScheduleAnalysisInput = z.infer<
  typeof PanicModeScheduleAnalysisInputSchema
>;

const PanicModeScheduleAnalysisOutputSchema = z.object({
  plan: z
    .string()
    .describe(
      'A detailed plan to complete as many tasks as possible on time, considering due dates, urgency levels, and required hours of work.'
    ),
});
export type PanicModeScheduleAnalysisOutput = z.infer<
  typeof PanicModeScheduleAnalysisOutputSchema
>;

export async function panicModeScheduleAnalysis(
  input: PanicModeScheduleAnalysisInput
): Promise<PanicModeScheduleAnalysisOutput> {
  return panicModeScheduleAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'panicModeScheduleAnalysisPrompt',
  input: {schema: PanicModeScheduleAnalysisInputSchema},
  output: {schema: PanicModeScheduleAnalysisOutputSchema},
  prompt: `You are a personal assistant specializing in time management and task prioritization. Given a list of tasks with their due dates, urgency levels, and required hours of work, you will generate a plan to complete as many tasks as possible on time.

  Consider the urgency, due date, and estimated required hours of work for each task to create the most efficient plan. Prioritize tasks with higher urgency and earlier due dates, but also consider the time required for each task to avoid overcommitment.
  The plan should be realistic and actionable, providing a step-by-step guide for the user to follow.

  Tasks:
  {{#each tasks}}
  - Name: {{name}}
    Due Date: {{dueDate}}
    Urgency: {{urgency}}
    Required Hours: {{requiredHoursOfWork}}
    Tags: {{tags}}
  {{/each}}

  Based on the information above, provide a detailed plan to complete as many tasks as possible on time:
  `,
});

const panicModeScheduleAnalysisFlow = ai.defineFlow(
  {
    name: 'panicModeScheduleAnalysisFlow',
    inputSchema: PanicModeScheduleAnalysisInputSchema,
    outputSchema: PanicModeScheduleAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
