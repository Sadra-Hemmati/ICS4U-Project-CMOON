import { Task, Tag } from './types';
import { stringToColor } from './utils';
import { add } from 'date-fns';

const createTag = (name: string): Tag => ({
    id: name.toLowerCase().replace(/\s/g, '-'),
    name,
    color: stringToColor(name),
});

export const initialTags: Tag[] = [
    createTag('Project Phoenix'),
    createTag('Q3 Marketing'),
    createTag('Website Redesign'),
    createTag('Personal'),
];

const now = new Date();

export const initialTasks: Task[] = [
    {
        id: '1',
        name: 'Design new landing page mockups',
        dueDate: add(now, { days: 5 }),
        urgency: 'high',
        requiredHours: 10,
        tags: ['website-redesign', 'project-phoenix'],
        completed: false,
    },
    {
        id: '2',
        name: 'Develop API for user authentication',
        dueDate: add(now, { days: 8 }),
        urgency: 'high',
        requiredHours: 16,
        tags: ['project-phoenix'],
        completed: false,
    },
    {
        id: '3',
        name: 'Plan social media campaign',
        dueDate: add(now, { days: 12 }),
        urgency: 'medium',
        requiredHours: 8,
        tags: ['q3-marketing'],
        completed: false,
    },
    {
        id: '4',
        name: 'Write blog post on new features',
        dueDate: add(now, { days: 7 }),
        urgency: 'low',
        requiredHours: 4,
        tags: ['q3-marketing'],
        completed: true,
    },
    {
        id: '5',
        name: 'Book dentist appointment',
        dueDate: add(now, { days: 3 }),
        urgency: 'medium',
        requiredHours: 1,
        tags: ['personal'],
        completed: false,
    },
    {
        id: '6',
        name: 'Finalize presentation slides for board meeting',
        dueDate: add(now, { days: 2 }),
        urgency: 'high',
        requiredHours: 5,
        tags: ['project-phoenix'],
        completed: false,
    }
];
