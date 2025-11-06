'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { panicModeScheduleAnalysis } from '@/ai/flows/panic-mode-schedule-analysis';
import { useToast } from '@/hooks/use-toast';

export function PanicButton() {
  const { tasks } = useApp();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  const handlePanic = async () => {
    setIsLoading(true);
    setPlan(null);
    try {
      const nonCompletedTasks = tasks
        .filter(task => !task.completed)
        .map(task => ({
          name: task.name,
          dueDate: task.dueDate.toISOString(),
          urgency: task.urgency,
          requiredHoursOfWork: task.requiredHours,
          tags: task.tags,
        }));

      if (nonCompletedTasks.length === 0) {
        setPlan("You have no pending tasks. Great job!");
        setIsLoading(false);
        return;
      }
      
      const result = await panicModeScheduleAnalysis({ tasks: nonCompletedTasks });
      setPlan(result.plan);
    } catch (error) {
      console.error('Panic mode analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate a plan. Please try again.',
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" onClick={handlePanic}>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Panic Mode
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Your Panic Mode Plan</AlertDialogTitle>
          <AlertDialogDescription>
            {isLoading
              ? "Our AI is analyzing your schedule to create the best plan for you. Hang tight!"
              : "Here's a strategic plan to tackle your tasks and get back on track."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="text-sm text-foreground whitespace-pre-wrap font-mono bg-card p-4 rounded-md">
                {plan}
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setIsOpen(false)}>
            Got it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
