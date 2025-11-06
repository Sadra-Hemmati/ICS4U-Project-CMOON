
'use client';

import { useState, useEffect } from 'react';
import { DayPicker, DayProps, CaptionProps, useNavigation, DayContentProps } from 'react-day-picker';
import { isSameDay, isSameMonth, format } from 'date-fns';
import { useApp } from '@/hooks/use-app';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TaskFormSheet } from '../tasks/task-form-sheet';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function DayContent(props: DayContentProps) {
    const { tasks } = useApp();
    const tasksForDay = tasks.filter(task => isSameDay(task.dueDate, props.date));
    const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
    
    return (
        <div className="relative h-full w-full flex flex-col">
            <div className="flex justify-center p-1">
                <p className='text-xs text-muted-foreground'>{props.date.getDate()}</p>
            </div>
            <div className='flex-1 overflow-y-auto space-y-1 p-1 pt-0'>
                {tasksForDay.map(task => (
                    <div 
                        key={task.id}
                        onClick={(e) => { e.stopPropagation(); setTaskToEdit(task); }}
                        className={cn(
                            "text-sm rounded-sm px-1 cursor-pointer hover:opacity-80 line-clamp-2",
                            task.completed ? 'line-through bg-green-900/50' : 'bg-primary/20'
                        )}
                    >
                       {task.name}
                    </div>
                ))}
            </div>
             <TaskFormSheet
                open={!!taskToEdit}
                onOpenChange={(isOpen) => !isOpen && setTaskToEdit(undefined)}
                task={taskToEdit}
              />
        </div>
    )
}

function CustomCaption(props: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  return (
    <div className="flex items-center justify-between p-2">
       <h2 className="text-xl font-bold text-foreground">
        {format(props.displayMonth, 'MMMM yyyy')}
      </h2>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={!previousMonth}
          onClick={() => previousMonth && goToMonth(previousMonth)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={!nextMonth}
          onClick={() => nextMonth && goToMonth(nextMonth)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


export function CalendarView() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        setIsClient(true);
        setAnimationKey(prev => prev + 1);
    }, []);

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        setIsFormOpen(true);
    };
    
    if (!isClient) {
        return <Skeleton className="w-full h-full" />;
    }

    return (
        <>
            <style>{`
                .rdp {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                }
                .rdp-months {
                    height: 100%;
                    width: 100%;
                }
                .rdp-month {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .rdp-table {
                    flex-grow: 1;
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 4px;
                }
                 .rdp-tbody {
                    height: 100%;
                }
                .rdp-row {
                    height: calc(100% / 6); /* Adjust based on number of weeks shown */
                    width: 100%;
                }
                .rdp-day {
                    height: 100%;
                    width: 100%;
                    transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    border-radius: var(--radius);
                    padding: 0;
                }
                .rdp-day_outside {
                    opacity: 0.5;
                }
                .day-animated {
                    animation: fadeIn 0.5s ease-out forwards;
                    opacity: 0;
                }
                @keyframes fadeIn {
                    to {
                        opacity: 1;
                    }
                }
                .rdp-day:hover {
                    background-color: hsl(var(--accent) / 0.5);
                }
                .rdp-day, .rdp-head_cell {
                    border: 1px solid hsl(var(--border));
                    vertical-align: top;
                    border-radius: var(--radius);
                }
                .rdp-head_cell {
                    text-align: center;
                    height: 40px;
                    vertical-align: middle;
                }
                 .rdp-caption_label {
                    font-size: 1.5rem; /* Increased font size */
                    font-weight: 600;
                }
                .rdp-caption {
                    margin-bottom: 1rem; /* Increased margin */
                    padding: 0 0.5rem;
                }
            `}</style>
            <DayPicker
                key={animationKey}
                components={{ 
                    DayContent, 
                    Caption: CustomCaption,
                }}
                showOutsideDays
                onDayClick={handleDayClick}
                className="w-full h-full flex flex-col"
                classNames={{
                    months: 'flex flex-col flex-1 w-full h-full',
                    month: 'flex flex-col flex-1 w-full h-full',
                    table: 'w-full h-full table-fixed border-collapse border-spacing-1',
                    row: 'w-full',
                    day: 'day-animated',
                }}
            />

            <TaskFormSheet 
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                defaultDate={selectedDate}
            />
        </>
    );
}
