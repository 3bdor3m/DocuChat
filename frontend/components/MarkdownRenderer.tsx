import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string): string => {
    let html = text;

    // Code blocks ```code```
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-black/30 p-3 rounded-lg my-2 overflow-x-auto"><code>$1</code></pre>');

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-black/30 px-2 py-1 rounded text-[#4a8fff]">$1</code>');

    // Bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

    // Italic *text*
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>');

    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#2873ec] hover:text-[#4a8fff] underline">$1</a>');

    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  return (
    <div
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};
