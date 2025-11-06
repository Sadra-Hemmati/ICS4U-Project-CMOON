export type Urgency = "low" | "medium" | "high";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  name: string;
  dueDate: Date;
  urgency?: Urgency;
  requiredHours?: number;
  tags: string[]; // array of tag ids
  completed: boolean;
}
