import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Links
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 hover:underline break-all font-medium transition-colors"
              {...props}
            >
              {children}
            </a>
          ),
          // Paragraphs
          p: ({ children, ...props }) => (
            <p className="mb-3 last:mb-0 leading-relaxed" {...props}>
              {children}
            </p>
          ),
          // Strong/Bold text
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-foreground" {...props}>
              {children}
            </strong>
          ),
          // Headings
          h1: ({ children, ...props }) => (
            <h1 className="text-xl font-bold mb-4 mt-6 first:mt-0 text-foreground" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-lg font-bold mb-3 mt-5 first:mt-0 text-foreground" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-base font-semibold mb-2 mt-4 first:mt-0 text-foreground" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-sm font-semibold mb-2 mt-3 first:mt-0 text-foreground" {...props}>
              {children}
            </h4>
          ),
          // Lists
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 pl-2" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 pl-2" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-relaxed" {...props}>
              {children}
            </li>
          ),
          // Code blocks
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code 
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code 
                className="block bg-muted p-3 rounded-md text-sm font-mono overflow-x-auto text-foreground"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Pre (code blocks)
          pre: ({ children, ...props }) => (
            <pre className="bg-muted p-3 rounded-md text-sm font-mono overflow-x-auto mb-3" {...props}>
              {children}
            </pre>
          ),
          // Blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-2 mb-3 bg-muted/50 rounded-r-md italic text-muted-foreground" {...props}>
              {children}
            </blockquote>
          ),
          // Tables
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto mb-3">
              <table className="w-full border-collapse border border-border rounded-md" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-border px-3 py-2 bg-muted font-semibold text-left" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border px-3 py-2" {...props}>
              {children}
            </td>
          ),
          // Horizontal rules
          hr: ({ ...props }) => (
            <hr className="border-border my-4" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
