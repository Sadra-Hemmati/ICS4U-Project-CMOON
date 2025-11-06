'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Loader2, Send, Sparkles, User, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/hooks/use-app';
import { parseTaskList, TaskListOutput } from '@/ai/flows/chatbot-task-parser';
import { getTaskAdvice } from '@/ai/flows/chatbot-task-advice';
import { analyzeTaskRequest, ActionPlan } from '@/ai/flows/chatbot-task-analyzer';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actionPlan?: ActionPlan;
};

export function ChatView() {
  const { tasks, tags, addTasks, findOrCreateTags, deleteTasks } = useApp();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Welcome to the TaskZen chatbot! You can ask me to perform actions like 'delete all tasks with the personal tag', paste a list of tasks to add them, or ask for advice." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // @ts-ignore
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    try {
      const allTags = tags.map(t => ({id: t.id, name: t.name}));
      const allTasks = tasks.map(t => ({
        id: t.id,
        name: t.name,
        tags: t.tags.map(tagId => allTags.find(t => t.id === tagId)?.name).filter((t): t is string => !!t)
      }));

      const result = await analyzeTaskRequest({ request: currentInput, tasks: allTasks, tags: allTags });
      
      if (result.type === 'action') {
        const assistantMessage: Message = {
            id: result.messageId,
            role: 'assistant',
            content: result.confirmationMessage,
            actionPlan: result
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (result.type === 'parse') {
        handleParseTasks(currentInput);
      } else {
         const assistantMessage: Message = { id: Date.now().toString() + 'a', role: 'assistant', content: result.textResponse };
         setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Chatbot request failed:', error);
      const assistantMessage: Message = { id: Date.now().toString() + 'e', role: 'assistant', content: "Sorry, I had trouble understanding that. Please try again." };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExecuteAction = (plan: ActionPlan) => {
    if (plan.action === 'delete') {
      const taskIdsToDelete = plan.tasks.map(t => t.id);
      deleteTasks(taskIdsToDelete);

      const assistantMessage: Message = {
        id: Date.now().toString() + 'a',
        role: 'assistant',
        content: `I've deleted ${taskIdsToDelete.length} tasks as you requested.`,
      };
      setMessages(prev => [...prev, assistantMessage]);

      toast({
        title: 'Tasks Deleted',
        description: `Successfully deleted ${taskIdsToDelete.length} tasks.`,
      });
    }
    // Remove the action plan from the message so the confirmation buttons disappear
    setMessages(prev => prev.map(m => m.id === plan.messageId ? { ...m, actionPlan: undefined } : m));
  };
  
  const handleCancelAction = (messageId: string) => {
    const assistantMessage: Message = {
        id: Date.now().toString() + 'a',
        role: 'assistant',
        content: `OK, I've cancelled the operation.`,
    };
    setMessages(prev => [...prev, assistantMessage]);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, actionPlan: undefined } : m));
  }


  const handleParseTasks = async (textToParse: string) => {
    try {
      const parsedTasks: TaskListOutput = await parseTaskList({ taskListText: textToParse });

      if (parsedTasks && parsedTasks.length > 0) {
        const newTasks = parsedTasks.map(task => ({
          ...task,
          dueDate: new Date(task.dueDate),
          tags: findOrCreateTags(task.tags || []),
        }));
        addTasks(newTasks);
        const assistantMessage: Message = { id: Date.now().toString() + 'a', role: 'assistant', content: `Successfully parsed and added ${parsedTasks.length} tasks to your list!` };
        setMessages(prev => [...prev, assistantMessage]);
        toast({ title: 'Tasks Added', description: `Added ${parsedTasks.length} new tasks.` });
      } else {
        throw new Error('No tasks were parsed.');
      }
    } catch (error) {
      console.error('Task parsing failed:', error);
      const assistantMessage: Message = { id: Date.now().toString() + 'e', role: 'assistant', content: "Sorry, I couldn't parse any tasks from that text. Please try formatting it clearly, for example: 'Design mockups due 2024-12-25, 8 hours, tag: design'." };
      setMessages(prev => [...prev, assistantMessage]);
    }
  };

  const handleGetAdvice = async () => {
    setIsLoading(true);
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: 'Give me advice on my tasks.' };
    setMessages(prev => [...prev, userMessage]);

    try {
      const nonCompletedTasks = tasks
        .filter(task => !task.completed)
        .map(task => ({
          name: task.name,
          dueDate: task.dueDate.toISOString(),
          urgency: task.urgency,
          requiredHours: task.requiredHours,
          tags: task.tags,
        }));
      
      if (nonCompletedTasks.length === 0) {
         const assistantMessage: Message = { id: Date.now().toString() + 'a', role: 'assistant', content: "You have no pending tasks, so you're all clear! Keep up the great work." };
         setMessages(prev => [...prev, assistantMessage]);
         setIsLoading(false);
         return;
      }

      const result = await getTaskAdvice({ tasks: nonCompletedTasks });
      const assistantMessage: Message = { id: Date.now().toString() + 'a', role: 'assistant', content: result.advice };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Getting advice failed:', error);
      const assistantMessage: Message = { id: Date.now().toString() + 'e', role: 'assistant', content: "Sorry, I couldn't generate advice right now. Please try again later." };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
        <div className="space-y-4 pr-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Bot size={20} />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Card className={cn('max-w-xl', message.role === 'user' ? 'bg-secondary' : 'bg-card')}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </CardContent>
                </Card>
                {message.actionPlan && (
                  <Card className='max-w-xl'>
                    <CardContent className='p-3'>
                        <p className='text-sm font-semibold mb-2'>Do you want to proceed with this action?</p>
                        <div className='flex justify-end gap-2'>
                            <Button size="sm" variant="outline" onClick={() => handleCancelAction(message.id)}>
                                <X className='mr-2 h-4 w-4' /> Cancel
                            </Button>
                            <Button size="sm" onClick={() => handleExecuteAction(message.actionPlan!)}>
                                <Check className='mr-2 h-4 w-4' /> Confirm
                            </Button>
                        </div>
                    </CardContent>
                  </Card>
                )}
              </div>
               {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                  <User size={20} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4 justify-start">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Bot size={20} />
                </div>
                 <Card className='max-w-xl bg-card'>
                    <CardContent className='p-3'>
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </CardContent>
                </Card>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your task list, or ask for advice..."
          className="pr-24 min-h-[60px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={isLoading}
        />
        <div className="absolute top-1/2 right-3 -translate-y-1/2 flex gap-2">
            <Button type="submit" size="icon" onClick={handleSubmit} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
            </Button>
        </div>
      </div>
       <div className='flex justify-between items-center mt-2'>
         <p className='text-xs text-muted-foreground'>
            You can also ask for advice or perform actions. Try "delete all tasks with personal tag".
          </p>
        <Button onClick={handleGetAdvice} disabled={isLoading}>
            <Sparkles className="mr-2 h-4 w-4" />
            Get Task Advice
        </Button>
      </div>
    </div>
  );
}
