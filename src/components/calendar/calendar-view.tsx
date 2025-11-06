'use client';

import { useState, useEffect } from 'react';
import { DayPicker, DayProps } from 'react-day-picker';
import { isSameDay, isSameMonth } from 'date-fns';
import { useApp } from '@/hooks/use-app';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TaskFormSheet } from '../tasks/task-form-sheet';
import { Skeleton } from '../ui/skeleton';

function DayContent(props: DayProps) {
    const { tasks } = useApp();
    const tasksForDay = tasks.filter(task => isSameDay(task.dueDate, props.date));
    const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
    
    const isCurrentMonth = isSameMonth(props.date, props.displayMonth);

    return (
        <div className={cn("relative flex flex-col h-full w-full p-1", !isCurrentMonth && "opacity-50")}>
            <p className='text-xs self-start'>{props.date.getDate()}</p>
            <div className='flex-1 overflow-y-auto space-y-1 mt-1'>
                {tasksForDay.map(task => (
                    <div 
                        key={task.id}
                        onClick={(e) => { e.stopPropagation(); setTaskToEdit(task); }}
                        className={cn(
                            "text-xs rounded-sm px-1 truncate cursor-pointer hover:opacity-80",
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

export function CalendarView() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setSelectedDate(new Date());
    }, []);


    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        setIsFormOpen(true);
    };

    if (!isClient) {
        return <Skeleton className="w-full h-[700px]" />;
    }

    return (
        <>
            <style>{`
                .rdp-day {
                    height: 120px;
                    width: 120px;
                    transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    border-radius: var(--radius);
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
                .rdp-table {
                    border-collapse: separate;
                    border-spacing: 4px;
                }
                .rdp-day, .rdp-head_cell {
                    border: 1px solid hsl(var(--border));
                    vertical-align: top;
                }
                .rdp-head_cell {
                    text-align: center;
                    height: 40px;
                    vertical-align: middle;
                    border-radius: var(--radius);
                }
            `}</style>
            <DayPicker
                className="w-full"
                classNames={{
                    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full',
                    month: 'space-y-4 w-full',
                    table: 'w-full border-collapse',
                    row: 'w-full',
                    caption_label: "text-lg font-medium",
                    day: "animate-in fade-in-0",
                }}
                components={{
                    DayContent,
                    day: (dayProps) => {
                        const dayIndex = dayProps.date.getDate() + dayProps.date.getMonth() * 31;
                        return (
                           <div style={{ animationDelay: `${dayIndex * 10}ms`, animationFillMode: 'both' }}>
                              <DayPicker.defaultProps.components!.day {...dayProps} />
                           </div>
                        )
                   },
                }}
                showOutsideDays
                onDayClick={handleDayClick}
            />
            <TaskFormSheet 
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                defaultDate={selectedDate}
            />
        </>
    );
}
