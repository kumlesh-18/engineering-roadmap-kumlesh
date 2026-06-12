'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Send, Bot, User, Sparkles, Loader2, MessageSquare, X } from 'lucide-react';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  nodeId?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function ChatInterface({ nodeId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [useRag, setUseRag] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const createSession = trpc.chat.createSession.useMutation({
    onSuccess: (data) => setSessionId(data.id),
  });

  const sendMessage = trpc.chat.sendMessage.useMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      if (!sessionId) {
        await createSession.mutateAsync({ nodeId, title: currentInput.slice(0, 50) });
      }

      if (sessionId) {
        const result = await sendMessage.mutateAsync({
          sessionId,
          content: currentInput,
          useRag,
        });
      }
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setInput('');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Tutor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="rag-toggle" className="text-sm cursor-pointer flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              RAG
            </Label>
            <Switch
              id="rag-toggle"
              checked={useRag}
              onCheckedChange={setUseRag}
              aria-label="Use RAG for context"
            />
            <Button variant="ghost" size="icon" onClick={handleNewChat} title="New chat">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
          <div className="space-y-4 pb-4">
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Start a conversation</p>
                <p className="text-sm mt-1">Ask me anything about this topic</p>
              </div>
            )}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <MessageBubble message={{ id: 'loading', role: 'assistant', content: '', timestamp: new Date(), isStreaming: true }} />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="mt-4 border-t pt-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend(e))}
            />
            <Button type="submit" disabled={!input.trim() || isLoading} size="lg">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : '')}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-2',
        isUser
          ? 'bg-primary text-primary-foreground rounded-tr-none'
          : 'bg-muted rounded-tl-none'
      )}>
        {message.content ? (
          <MarkdownContent content={message.content} />
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
        <div className={cn('text-xs mt-1 opacity-60', isUser ? 'text-right' : '')}>
          {formatRelativeTime(message.timestamp)}
        </div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}