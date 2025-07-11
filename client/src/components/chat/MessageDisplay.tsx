import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import MessageActions from './MessageActions';

interface MessageDisplayProps {
  message: {
    id: number;
    role: string;
    content: string;
    createdAt: string;
  };
}

export default function MessageDisplay({ message }: MessageDisplayProps) {
  const isUser = message.role === 'user';
  const isHtml = message.content.includes('<h1>') || message.content.includes('<h2>') || message.content.includes('<h3>') || message.content.includes('<h4>') || message.content.includes('<ul>') || message.content.includes('<ol>');

  const formatContent = (content: string) => {
    if (isHtml) {
      return { __html: content };
    }
    return null;
  };

  return (
    <div className={`group mb-4 ${isUser ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[90%]'}`}>
      <div className={`rounded-lg p-4 ${
        isUser 
          ? 'bg-indigo-600 text-white' 
          : 'bg-slate-700 text-slate-100'
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div>
            {isHtml ? (
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={formatContent(message.content)}
                style={{
                  '--tw-prose-headings': '#ffffff',
                  '--tw-prose-body': '#e2e8f0',
                  '--tw-prose-bold': '#ffffff',
                  '--tw-prose-bullets': '#94a3b8',
                  '--tw-prose-counters': '#94a3b8',
                } as React.CSSProperties}
              />
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
            
            {!isUser && (
              <MessageActions content={message.content} isHtml={isHtml} />
            )}
          </div>
        )}
      </div>
      
      <div className={`text-xs text-slate-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
        {new Date(message.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
}