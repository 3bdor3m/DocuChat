import React, { useState } from 'react';
import { FaDownload, FaSpinner } from 'react-icons/fa';
import { Message } from '../types/chat';

interface ExportButtonProps {
  chatTitle: string;
  messages: Message[];
  format?: 'txt' | 'json';
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  chatTitle,
  messages,
  format = 'txt',
  className = '',
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToTxt = () => {
    let content = `${chatTitle}\n`;
    content += `تاريخ التصدير: ${new Date().toLocaleString('ar-EG')}\n`;
    content += `عدد الرسائل: ${messages.length}\n`;
    content += '\n' + '='.repeat(50) + '\n\n';

    messages.forEach((msg, index) => {
      const sender = msg.type === 'user' ? 'أنت' : 'المساعد';
      const time = msg.timestamp.toLocaleTimeString('ar-EG');
      content += `[${sender}] - ${time}\n`;
      content += `${msg.content}\n\n`;

      if (msg.sources && msg.sources.length > 0) {
        content += 'المصادر:\n';
        msg.sources.forEach((source) => {
          content += `  - ${source.file} (صفحة ${source.page})\n`;
        });
        content += '\n';
      }

      content += '-'.repeat(50) + '\n\n';
    });

    return content;
  };

  const exportToJson = () => {
    const data = {
      title: chatTitle,
      exportDate: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map((msg) => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        sources: msg.sources || [],
      })),
    };

    return JSON.stringify(data, null, 2);
  };

  const handleExport = () => {
    setIsExporting(true);

    try {
      const content = format === 'txt' ? exportToTxt() : exportToJson();
      const blob = new Blob([content], {
        type: format === 'txt' ? 'text/plain;charset=utf-8' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chatTitle.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_${
        new Date().toISOString().split('T')[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('فشل تصدير المحادثة');
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || messages.length === 0}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2873ec]/10 hover:bg-[#2873ec]/20 border border-[#2873ec]/30 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={`تصدير كـ ${format.toUpperCase()}`}
    >
      {isExporting ? (
        <FaSpinner className="animate-spin" size={14} />
      ) : (
        <FaDownload size={14} />
      )}
      <span className="text-sm">تصدير ({format.toUpperCase()})</span>
    </button>
  );
};
