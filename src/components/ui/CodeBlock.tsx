import { Check, Copy } from 'lucide-react';
import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const highlightJson = (json: string) => {
  if (!json) return '';

  // Basic regex to identify keys and strings
  const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

  return json.replace(regex, (match) => {
    let className = 'text-purple-600 dark:text-purple-400'; // number
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        className = 'text-blue-600 dark:text-blue-400'; // key
      } else {
        className = 'text-green-600 dark:text-green-400'; // string
      }
    } else if (/true|false/.test(match)) {
      className = 'text-orange-600 dark:text-orange-400'; // boolean
    } else if (/null/.test(match)) {
      className = 'text-red-600 dark:text-red-400'; // null
    }
    // Critical: Escape the content before wrapping it
    return `<span class="${className}">${escapeHtml(match)}</span>`;
  });
};

export function CodeBlock({ code, language = 'json' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const highlightedCode = language === 'json' ? highlightJson(code) : escapeHtml(code);

  return (
    <div className="relative group rounded-md overflow-hidden bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
      <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-1.5 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-slate-500 dark:text-slate-400 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
        {language === 'json' ? (
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </div>
  );
}
