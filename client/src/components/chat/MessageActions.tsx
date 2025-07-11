import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MessageActionsProps {
  content: string;
  isHtml?: boolean;
}

export default function MessageActions({ content, isHtml = false }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      // Convert HTML to formatted text for copying
      let textToCopy = content;
      
      if (isHtml) {
        // Convert HTML structure to readable text
        textToCopy = content
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
          .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
          .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
          .replace(/<ul[^>]*>/gi, '\n')
          .replace(/<\/ul>/gi, '\n')
          .replace(/<ol[^>]*>/gi, '\n')
          .replace(/<\/ol>/gi, '\n')
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
          .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
          .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
          .replace(/<[^>]*>/g, '')
          .replace(/\n\s*\n\s*\n/g, '\n\n')
          .trim();
      }
      
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied with proper formatting",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const copyAsHtml = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "HTML copied",
        description: "Raw HTML has been copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy HTML:', error);
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        size="sm"
        variant="ghost"
        onClick={copyToClipboard}
        className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
      >
        {copied ? (
          <Check className="h-3 w-3 mr-1" />
        ) : (
          <Copy className="h-3 w-3 mr-1" />
        )}
        Copy
      </Button>
      
      {isHtml && (
        <Button
          size="sm"
          variant="ghost"
          onClick={copyAsHtml}
          className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <Code className="h-3 w-3 mr-1" />
          Copy HTML
        </Button>
      )}
    </div>
  );
}