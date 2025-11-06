import { TasksBoard } from '@/components/tasks/tasks-board';

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <TasksBoard />
    </div>
  );
}
