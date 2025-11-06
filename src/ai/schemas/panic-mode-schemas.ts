/**
 * @fileOverview This file defines the Zod schemas and TypeScript types
 * for the panic mode schedule analysis flow. It is kept separate from the flow
 * itself to avoid issues with 'use server' exports.
 */

import { z } from 'genkit';

const TaskSchema = z.object({
  id: z.string(),
  name: z.string().describe('The name of the task.'),
  dueDate: z.string().describe('The due date of the task in ISO format.'),
  urgency: z.enum(['high', 'medium', 'low']).optional().describe('The urgency level of the task. Can be high, medium, or low.'),
  requiredHours: z.number().optional().describe('The estimated required hours of work to complete the task.'),
  tags: z.array(z.string()).optional().describe('Tags or categories associated with the task.'),
});

export const PanicModeScheduleAnalysisInputSchema = z.object({
  tasks: z.array(TaskSchema).describe('A list of tasks to analyze.'),
});
export type PanicModeScheduleAnalysisInput = z.infer<
  typeof PanicModeScheduleAnalysisInputSchema
>;

const RecommendedTaskSchema = z.object({
    id: z.string(),
    name: z.string(),
    requiredHours: z.number().optional(),
    priority: z.string().optional(),
});

export const ActionPlanStepSchema = z.object({
    title: z.string(),
    description: z.string(),
    tasks: z.array(RecommendedTaskSchema),
});

export const PanicModeScheduleAnalysisOutputSchema = z.object({
    summary: z.object({
        totalTasks: z.number(),
        totalWorkHours: z.number(),
        highPriorityHours: z.number(),
        overdueTasks: z.number(),
        dueToday: z.number(),
        dueThisWeek: z.number(),
    }),
    actionPlan: z.array(ActionPlanStepSchema),
});
export type PanicModeScheduleAnalysisOutput = z.infer<
  typeof PanicModeScheduleAnalysisOutputSchema
>;
