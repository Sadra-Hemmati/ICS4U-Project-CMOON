
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
        <div className="relative h-full w-full flex flex-col p-1">
            <div className="flex justify-center">
                <p className='text-xs text-muted-foreground'>{props.date.getDate()}</p>
            </div>
            <div className='flex-1 overflow-y-auto space-y-1 pt-1'>
                {tasksForDay.map(task => (
                    <div 
                        key={task.id}
                        onClick={(e) => { e.stopPropagation(); setTaskToEdit(task); }}
                        className={cn(
                            "text-xs rounded-sm px-1 cursor-pointer hover:opacity-80 line-clamp-2",
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
        <div className='w-full h-full flex flex-col flex-1'>
            <style>{`
                .rdp {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    height: 100%;
                    margin: 0;
                }
                .rdp-month {
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                    width: 100%;
                    height: 100%;
                }
                .rdp-table {
                    flex-grow: 1;
                    display: table;
                    width: 100%;
                    height: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                    border-spacing: 0;
                }
                .rdp-tbody {
                    display: table-row-group;
                    height: 100%;
                }
                .rdp-row {
                    display: table-row;
                    width: 100%;
                    height: calc(100% / 6); /* Evenly divide height */
                }
                .rdp-cell {
                    display: table-cell;
                    padding: 0;
                    margin: 0;
                    vertical-align: top;
                    border: 1px solid hsl(var(--border));
                    border-radius: var(--radius);
                }
                .rdp-day {
                    height: 100%;
                    width: 100%;
                    padding: 0;
                    margin: 0;
                    border-radius: var(--radius);
                    transition: background-color 0.2s ease-in-out;
                }
                .rdp-day_outside {
                    opacity: 0.5;
                }
                 .rdp-day:hover {
                    background-color: hsl(var(--accent) / 0.5);
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
                .rdp-head_row {
                    display: table-row;
                }
                .rdp-head_cell {
                    display: table-cell;
                    text-align: center;
                    height: 40px;
                    line-height: 40px;
                    border: 1px solid hsl(var(--border));
                    border-radius: var(--radius);
                }
                .rdp-caption_label {
                    font-size: 1.5rem;
                    font-weight: 600;
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
                className="w-full flex flex-col flex-1"
                classNames={{
                    day: 'day-animated',
                }}
            />

            <TaskFormSheet 
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                defaultDate={selectedDate}
            />
        </div>
    );
}

