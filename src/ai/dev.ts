import { config } from 'dotenv';
config();

import '@/ai/flows/chatbot-task-advice.ts';
import '@/ai/flows/chatbot-task-parser.ts';
import '@/ai/flows/panic-mode-schedule-analysis.ts';
import '@/ai/flows/chatbot-task-analyzer.ts';
import '@/ai/schemas/panic-mode-schemas.ts';
