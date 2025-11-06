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
import { AlertTriangle, Loader2, BarChart, Clock, Zap, AlertCircle, Calendar, ListChecks, Lightbulb, Target } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { panicModeScheduleAnalysis, PanicModeScheduleAnalysisOutput } from '@/ai/flows/panic-mode-schedule-analysis';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function PanicButton() {
  const { tasks } = useApp();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<PanicModeScheduleAnalysisOutput | null>(null);

  const handlePanic = async () => {
    setIsLoading(true);
    setPlan(null);
    setIsOpen(true);
    try {
      const nonCompletedTasks = tasks
        .filter(task => !task.completed)
        .map(task => ({
          id: task.id,
          name: task.name,
          dueDate: task.dueDate.toISOString(),
          urgency: task.urgency,
          requiredHours: task.requiredHours,
          tags: task.tags,
        }));

      if (nonCompletedTasks.length === 0) {
        // This is a simplified plan for when there are no tasks
        setPlan({
            summary: { totalTasks: 0, totalWorkHours: 0, highPriorityHours: 0, overdueTasks: 0, dueToday: 0, dueThisWeek: 0 },
            actionPlan: [{ title: 'All Clear!', description: "You have no pending tasks. Great job!", tasks: [] }]
        });
        setIsLoading(false);
        return;
      }
      
      const result = await panicModeScheduleAnalysis({ tasks: nonCompletedTasks });
      setPlan(result);
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

  const SummaryItem = ({ icon: Icon, label, value, variant }: { icon: React.ElementType, label: string, value: string | number, variant?: 'destructive' | 'default' }) => (
    <li className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`} />
            <span className="text-sm">{label}</span>
        </div>
        <span className={`text-sm font-semibold ${variant === 'destructive' ? 'text-destructive' : 'text-foreground'}`}>{value}</span>
    </li>
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" onClick={handlePanic}>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Panic Mode
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive"/>
            Panic Mode Activated
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isLoading
              ? "Our AI is analyzing your schedule to create the best plan for you. Hang tight!"
              : "Here's a strategic plan to tackle your tasks and get back on track."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : plan && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><BarChart/> Current Situation</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ul className='space-y-3'>
                            <SummaryItem icon={ListChecks} label="Total Tasks" value={plan.summary.totalTasks} />
                            <SummaryItem icon={Clock} label="Total Work Hours" value={`${plan.summary.totalWorkHours}h`} />
                            <SummaryItem icon={Zap} label="High-Priority Hours" value={`${plan.summary.highPriorityHours}h`} />
                            <SummaryItem icon={AlertCircle} label="Overdue Tasks" value={plan.summary.overdueTasks} variant={plan.summary.overdueTasks > 0 ? 'destructive' : 'default'} />
                            <SummaryItem icon={Calendar} label="Due Today" value={plan.summary.dueToday} />
                            <SummaryItem icon={Calendar} label="Due This Week" value={plan.summary.dueThisWeek} />
                        </ul>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Target /> Recommended Action Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {plan.actionPlan.map((step, index) => (
                           <div key={index} className="space-y-2">
                               <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="text-primary h-4 w-4" /> {index + 1}. {step.title}</h3>
                               <p className="text-sm text-muted-foreground ml-6">{step.description}</p>
                               <ul className="space-y-2 ml-6">
                                   {step.tasks.map(task => (
                                       <li key={task.id} className="text-sm bg-muted/50 p-2 rounded-md border-l-4 border-primary">
                                            <p className='font-medium'>{task.name}</p>
                                            <div className='flex items-center gap-2 text-muted-foreground text-xs'>
                                               {task.requiredHours && <span>{task.requiredHours}h</span>}
                                               {task.requiredHours && task.priority && <span>&bull;</span>}
                                               {task.priority && <Badge variant="secondary">{task.priority} priority</Badge>}
                                            </div>
                                       </li>
                                   ))}
                               </ul>
                           </div>
                       ))}
                    </CardContent>
                </Card>
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
