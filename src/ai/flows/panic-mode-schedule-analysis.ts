'use server';

/**
 * @fileOverview Analyzes the user's schedule and suggests a plan to complete as many tasks as possible on time when the user is feeling overwhelmed.
 *
 * - panicModeScheduleAnalysis - A function that handles the schedule analysis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { isAfter, isBefore, startOfToday, endOfToday, endOfWeek } from 'date-fns';
import {
    PanicModeScheduleAnalysisInputSchema,
    PanicModeScheduleAnalysisInput,
    PanicModeScheduleAnalysisOutput,
    ActionPlanStepSchema,
} from '@/ai/schemas/panic-mode-schemas';

export type {
    PanicModeScheduleAnalysisInput,
    PanicModeScheduleAnalysisOutput,
} from '@/ai/schemas/panic-mode-schemas';


export async function panicModeScheduleAnalysis(
  input: PanicModeScheduleAnalysisInput
): Promise<PanicModeScheduleAnalysisOutput> {
  const today = startOfToday();

  if (input.tasks.length === 0) {
    return {
      summary: { totalTasks: 0, totalWorkHours: 0, highPriorityHours: 0, overdueTasks: 0, dueToday: 0, dueThisWeek: 0 },
      actionPlan: [{ title: 'All Clear!', description: "You have no pending tasks. Great job!", tasks: [] }]
    };
  }

  const summary = input.tasks.reduce((acc, task) => {
    const dueDate = new Date(task.dueDate);
    acc.totalTasks += 1;
    acc.totalWorkHours += task.requiredHours || 0;
    if (task.urgency === 'high') {
      acc.highPriorityHours += task.requiredHours || 0;
    }
    if (isBefore(dueDate, today)) {
        acc.overdueTasks += 1;
    }
    if (isAfter(dueDate, today) && isBefore(dueDate, endOfToday())) {
        acc.dueToday += 1;
    }
    if (isAfter(dueDate, today) && isBefore(dueDate, endOfWeek(today))) {
        acc.dueThisWeek += 1;
    }
    return acc;
  }, {
    totalTasks: 0,
    totalWorkHours: 0,
    highPriorityHours: 0,
    overdueTasks: 0,
    dueToday: 0,
    dueThisWeek: 0,
  });

  const { output } = await panicModeScheduleAnalysisFlow(input);

  if (!output) {
    // This is a fallback in case the AI model fails to return a structured response.
    return {
      summary,
      actionPlan: [{ title: 'Analysis Error', description: "I couldn't generate a clear plan right now. Try focusing on your most urgent tasks.", tasks: [] }]
    };
  }

  return {
    summary,
    actionPlan: output.actionPlan,
  };
}

const prompt = ai.definePrompt({
  name: 'panicModeScheduleAnalysisPrompt',
  input: {schema: PanicModeScheduleAnalysisInputSchema},
  output: {schema: z.object({ actionPlan: z.array(ActionPlanStepSchema) })},
  prompt: `You are a personal assistant specializing in time management and task prioritization. 
  Your goal is to help a user who is feeling overwhelmed by creating a clear, actionable plan.
  The output MUST be a JSON object with a single key "actionPlan".

  The "actionPlan" should be an array of steps. Common steps are:
  1. "Immediate Action Required": This MUST contain any tasks that are overdue.
  2. "Today's Focus": This MUST contain tasks due today.
  3. "Future Tasks": If there are no overdue tasks or tasks due today, create this step and include other important tasks.

  For each step, provide a clear title and description. The 'tasks' array should list the tasks for that step, including their ID, name, required hours, and priority.
  
  Prioritize tasks based on due date and urgency. Be realistic and focus on what's most critical. If no tasks fit into a category (e.g., no overdue tasks), do not create that step. You MUST always return at least one step in the action plan.

  Here is the list of tasks:
  {{#each tasks}}
  - ID: {{id}}, Name: {{name}}, Due Date: {{dueDate}}, Urgency: {{urgency}}, Required Hours: {{requiredHours}}
  {{/each}}

  Generate the JSON output now.
  `,
});

const panicModeScheduleAnalysisFlow = ai.defineFlow(
  {
    name: 'panicModeScheduleAnalysisFlow',
    inputSchema: PanicModeScheduleAnalysisInputSchema,
    outputSchema: z.object({ actionPlan: z.array(ActionPlanStepSchema) }),
  },
  async input => {
    const {output} = await prompt(input);
    return output;
  }
);
