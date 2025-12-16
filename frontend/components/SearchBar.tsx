import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'ابحث...',
  className = '',
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={14} />
            </button>
          )}
          <button
            type="submit"
            className="text-[#2873ec] hover:text-[#4a8fff] transition-colors"
          >
            <FaSearch size={16} />
          </button>
        </div>
      </div>
    </form>
  );
};
