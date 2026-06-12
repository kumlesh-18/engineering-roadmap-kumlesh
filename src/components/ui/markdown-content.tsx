'use client';

import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertCircle, CheckCircle, Info, Lightbulb, BookOpen,
  Terminal, Copy, Check, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

const components = {
  h1: ({ children }: any) => <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-2xl font-semibold mt-6 mb-3 text-foreground">{children}</h2>,
  h3: ({ children }: any ) => <h3 className="text-xl font-medium mt-4 mb-2 text-foreground">{children}</h3>,
  p: ({ children }: any) => <p className="my-4 leading-relaxed text-muted-foreground">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc list-inside my-4 space-y-2 text-muted-foreground">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside my-4 space-y-2 text-muted-foreground">{children}</ol>,
  li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }: any) => (
    <a href={href} className="text-primary underline underline-offset-2 hover:text-primary/80 flex items-center gap-1" target="_blank" rel="noopener noreferrer">
      {children} <ExternalLink className="h-3.5 w-3.5" />
    </a>
  ),
  code: ({ children }: any) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>,
  pre: ({ children }: any) => {
    const code = React.isValidElement(children) ? children.props.children : children;
    const language = React.isValidElement(children) ? children.props.className?.replace('language-', '') : 'text';
    return (
      <div className="relative group my-4 rounded-lg overflow-hidden bg-muted border">
        <div className="flex items-center justify-between p-2 border-b bg-muted/50">
          <span className="text-xs text-muted-foreground font-mono">{language}</span>
          <CopyCodeButton code={code} />
        </div>
        <ScrollArea className="max-h-96">
          <pre className="p-4 overflow-x-auto"><code className="text-sm font-mono text-foreground">{code}</code></pre>
        </ScrollArea>
      </div>
    );
  },
  blockquote: ({ children }: any) => (
    <Alert className="border-l-4 border-primary my-4">
      <AlertTitle className="flex items-center gap-2"><Info className="h-4 w-4" />Note</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  ),
  img: ({ src, alt, title }: any) => (
    <div className="my-6 rounded-lg overflow-hidden border bg-muted/50">
      <Image src={src} alt={alt ?? ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
      {(alt || title) && <p className="px-4 py-2 text-sm text-muted-foreground text-center">{alt || title}</p>}
    </div>
  ),
  table: ({ children }: any) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }: any) => <th className="border border-border px-4 py-2 text-left font-semibold bg-muted">{children}</th>,
  td: ({ children }: any) => <td className="border border-border px-4 py-2">{children}</td>,
  tr: ({ children }: any) => <tr>{children}</tr>,
  thead: ({ children }: any) => <thead>{children}</thead>,
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
};

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 p-0"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      aria-label="Copy code"
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

function Callout({ type, title, children }: { type: 'note' | 'tip' | 'warning' | 'danger'; title?: string; children: React.ReactNode }) {
  const configs = {
    note: { icon: Info, color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20', title: title ?? 'Note' },
    tip: { icon: Lightbulb, color: 'border-green-500 bg-green-50 dark:bg-green-900/20', title: title ?? 'Tip' },
    warning: { icon: AlertCircle, color: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20', title: title ?? 'Warning' },
    danger: { icon: AlertCircle, color: 'border-red-500 bg-red-50 dark:bg-red-900/20', title: title ?? 'Danger' },
  };
  const config = configs[type];
  const Icon = config.icon;
  return (
    <Alert className={cn('border-l-4 my-4', config.color)}>
      <AlertTitle className="flex items-center gap-2"><Icon className="h-4 w-4" />{config.title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

export function MarkdownContent({ content }: { content: string }) {
  return (
    <MDXRemote
      source={content}
      components={{
        ...components,
        Callout,
        Tabs,
        TabsList,
        TabsTrigger,
        TabsContent,
        Card,
        CardContent,
        Button,
        Alert,
        AlertTitle,
        AlertDescription,
      }}
    />
  );
}