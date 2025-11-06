'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/hooks/use-app';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  dueDate: z.date({ required_error: 'Due date is required' }),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  requiredHours: z.coerce.number().optional(),
  tags: z.array(z.string()).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  defaultDate?: Date;
}

export function TaskFormSheet({
  open,
  onOpenChange,
  task,
  defaultDate,
}: TaskFormSheetProps) {
  const { addTask, updateTask, deleteTask, findOrCreateTags, getTagById } = useApp();
  const [tagInput, setTagInput] = useState('');

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      requiredHours: undefined,
      tags: [],
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        name: task.name,
        dueDate: task.dueDate,
        urgency: task.urgency,
        requiredHours: task.requiredHours,
        tags: task.tags.map(id => getTagById(id)?.name).filter(Boolean) as string[] || [],
      });
    } else {
      form.reset({
        name: '',
        dueDate: defaultDate || new Date(),
        urgency: 'medium',
        requiredHours: undefined,
        tags: [],
      });
    }
  }, [task, open, form, getTagById, defaultDate]);
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim() !== '') {
            e.preventDefault();
            const currentTags = form.getValues('tags') || [];
            if (!currentTags.includes(tagInput.trim())) {
                form.setValue('tags', [...currentTags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = form.getValues('tags') || [];
        form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
    };

  function onSubmit(data: TaskFormValues) {
    const tagIds = findOrCreateTags(data.tags || []);
    const taskData = { ...data, tags: tagIds };
    
    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }
    onOpenChange(false);
  }

  const handleDelete = () => {
    if (task) {
        deleteTask(task.id);
        onOpenChange(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{task ? 'Edit Task' : 'Add Task'}</SheetTitle>
          <SheetDescription>
            {task
              ? "Update the details of your task."
              : "Fill out the form to add a new task to your list."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Finish project proposal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="requiredHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Hours (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tags (optional)</FormLabel>
                        <FormControl>
                            <div className="flex flex-col gap-2">
                                <Input
                                    placeholder="Type a tag and press Enter"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagInputKeyDown}
                                />
                                <div className="flex flex-wrap gap-1">
                                    {field.value?.map(tag => (
                                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="rounded-full hover:bg-muted-foreground/20"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <SheetFooter className='pt-4'>
                {task && (
                    <Button type="button" variant="destructive" onClick={handleDelete} className="mr-auto">
                        Delete Task
                    </Button>
                )}
                <SheetClose asChild>
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                </SheetClose>
                <Button type="submit">
                    {task ? 'Save Changes' : 'Add Task'}
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
