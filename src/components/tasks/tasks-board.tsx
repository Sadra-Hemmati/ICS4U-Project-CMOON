'use client';

import { useMemo, useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { Task } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { getUrgencyVariant } from '@/lib/utils';
import { TaskFormSheet } from './task-form-sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ArrowUpDown, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';

type SortKey = 'dueDate' | 'urgency' | 'requiredHours' | 'name';
type SortDirection = 'asc' | 'desc';

const urgencyValue = { low: 1, medium: 2, high: 3 };

export function TasksBoard() {
  const { tasks, tags, getTagById, toggleTaskCompletion } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    if (selectedTags.length > 0) {
      filtered = tasks.filter(task =>
        selectedTags.every(tagId => task.tags.includes(tagId))
      );
    }
    
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'dueDate':
          comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'urgency':
          comparison = (urgencyValue[a.urgency!] || 0) - (urgencyValue[b.urgency!] || 0);
          break;
        case 'requiredHours':
            comparison = (a.requiredHours || 0) - (b.requiredHours || 0);
            break;
        case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [tasks, sortKey, sortDirection, selectedTags]);
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setSortKey(key);
        setSortDirection('asc');
    }
  }

  const SortableHeader = ({ tkey, label }: { tkey: SortKey; label: string }) => (
    <TableHead>
        <Button variant="ghost" onClick={() => handleSort(tkey)}>
            {label}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    </TableHead>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-between">
                       Filter by tags
                       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <div className="p-2 space-y-1">
                        {tags.map(tag => (
                            <div key={tag.id} className="flex items-center gap-2">
                                <Checkbox
                                    id={`tag-${tag.id}`}
                                    checked={selectedTags.includes(tag.id)}
                                    onCheckedChange={(checked) => {
                                        setSelectedTags(prev => 
                                            checked ? [...prev, tag.id] : prev.filter(id => id !== tag.id)
                                        )
                                    }}
                                />
                                <label htmlFor={`tag-${tag.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    <Badge style={{ backgroundColor: tag.color }}>{tag.name}</Badge>
                                </label>
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Done</TableHead>
              <SortableHeader tkey="name" label="Task" />
              <SortableHeader tkey="urgency" label="Urgency" />
              <SortableHeader tkey="dueDate" label="Due Date" />
              <TableHead>Tags</TableHead>
              <SortableHeader tkey="requiredHours" label="Hours" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTasks.map((task, index) => (
              <TableRow
                key={task.id}
                onClick={() => setTaskToEdit(task)}
                className="cursor-pointer animate-in fade-in-0"
                style={{ animationDelay: `${index * 25}ms`, animationFillMode: 'both' }}
                data-state={task.completed ? 'completed' : ''}
              >
                <TableCell>
                  <Checkbox
                    checked={task.completed}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => toggleTaskCompletion(task.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>
                  {task.urgency && (
                    <Badge variant={getUrgencyVariant(task.urgency)}>
                      {task.urgency}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{format(task.dueDate, 'PPP')}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tagId) => {
                      const tag = getTagById(tagId);
                      return tag ? (
                        <Badge key={tag.id} style={{ backgroundColor: tag.color, color: '#000' }}>
                          {tag.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-right">{task.requiredHours}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TaskFormSheet
        open={isFormOpen || !!taskToEdit}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsFormOpen(false);
            setTaskToEdit(undefined);
          }
        }}
        task={taskToEdit}
      />
    </>
  );
}
