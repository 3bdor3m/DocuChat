import React, { useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-lg transition-all duration-200 ${
        copied
          ? 'bg-green-500/20 text-green-400'
          : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
      } ${className}`}
      title={copied ? 'تم النسخ!' : 'نسخ'}
    >
      {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
    </button>
  );
};
