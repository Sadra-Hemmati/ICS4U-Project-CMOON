'use client';

import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { Task, Tag, Urgency, ChatMessage } from '@/lib/types';
import { initialTasks, initialTags } from '@/lib/data';
import { stringToColor } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export interface AppContextType {
  tasks: Task[];
  tags: Tag[];
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  addTasks: (tasks: Omit<Task, 'id' | 'completed'>[]) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: string) => void;
  deleteTasks: (ids: string[]) => void;
  toggleTaskCompletion: (id: string) => void;
  getTagById: (id: string) => Tag | undefined;
  findOrCreateTags: (tagNames: string[]) => string[];
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: "Welcome to the TaskZen chatbot! You can ask me to perform actions like 'delete all tasks with the personal tag', paste a list of tasks to add them, or ask for advice." }
  ]);

  const getTagById = useCallback((id: string) => tags.find(t => t.id === id), [tags]);

  const findOrCreateTags = useCallback((tagNames: string[]): string[] => {
    const tagIds: string[] = [];
    const newTags: Tag[] = [];

    tagNames.forEach(name => {
      const sanitizedName = name.trim();
      if (!sanitizedName) return;

      const id = sanitizedName.toLowerCase().replace(/\s/g, '-');
      let existingTag = tags.find(t => t.id === id);
      if (!existingTag) {
        existingTag = newTags.find(t => t.id === id);
      }
      
      if (existingTag) {
        tagIds.push(existingTag.id);
      } else {
        const newTag: Tag = {
          id,
          name: sanitizedName,
          color: stringToColor(sanitizedName),
        };
        newTags.push(newTag);
        tagIds.push(id);
      }
    });

    if (newTags.length > 0) {
      setTags(prevTags => [...prevTags, ...newTags]);
    }

    return tagIds;
  }, [tags]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'completed'>) => {
    setTasks(prev => [...prev, { ...task, id: uuidv4(), completed: false }]);
  }, []);
  
  const addTasks = useCallback((newTasks: Omit<Task, 'id' | 'completed'>[]) => {
    const tasksToAdd = newTasks.map(task => ({ ...task, id: uuidv4(), completed: false }));
    setTasks(prev => [...prev, ...tasksToAdd]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const deleteTasks = useCallback((ids: string[]) => {
    setTasks(prev => prev.filter(t => !ids.includes(t.id)));
  }, []);

  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  const value = {
    tasks,
    tags,
    messages,
    setMessages,
    addTask,
    addTasks,
    updateTask,
    deleteTask,
    deleteTasks,
    toggleTaskCompletion,
    getTagById,
    findOrCreateTags,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
