import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { ExportButton } from './ExportButton';

const ChatSidebar: React.FC = () => {
  const { chats, activeChatId, selectChat, deleteChat, renameChat } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === chatId ? null : chatId);
  };

  const startRenaming = (e: React.MouseEvent, chat: { id: string, title: string }) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
    setMenuOpenId(null);
  };

  const saveRename = async () => {
    if (editingChatId && editTitle.trim()) {
      await renameChat(editingChatId, editTitle.trim());
      setEditingChatId(null);
      setEditTitle('');
    }
  };

  const cancelRename = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveRename();
    } else if (e.key === 'Escape') {
      cancelRename();
    }
  };

  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingChatId]);

  return (
    <div className="w-80 bg-gray-950 border-l border-[#2873ec]/20 h-full flex flex-col">
      {/* Header with New Chat Button */}
      <div className="p-4 border-b border-[#2873ec]/20">
        <button
          onClick={() => selectChat(null)}
          className="w-full flex items-center justify-center space-x-2 bg-[#2873ec] hover:bg-[#4a8fff] text-white py-2.5 px-4 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(40,115,236,0.3)] hover:shadow-[0_0_25px_rgba(74,143,255,0.5)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>محادثة جديدة</span>
        </button>

        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="بحث في المحادثات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-[#2873ec]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2873ec] focus:border-transparent text-sm text-gray-200 placeholder-gray-500 text-right"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filteredChats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">لا توجد محادثات</p>
            <p className="text-xs mt-1">ابدأ محادثة جديدة</p>
          </div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={`group relative flex items-center p-3 rounded-lg cursor-pointer transition-colors ${activeChatId === chat.id ? 'bg-[#2873ec]/10 border border-[#2873ec]/30' : 'hover:bg-gray-900/50 border border-transparent'
                }`}
            >
              <div className="flex-1 min-w-0">
                {editingChatId === chat.id ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveRename}
                      className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1 border border-[#2873ec] focus:outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className={`text-sm font-medium truncate ${activeChatId === chat.id ? 'text-[#2873ec]' : 'text-gray-300 group-hover:text-white'}`}>
                      {chat.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate group-hover:text-gray-400">
                      {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : 'لا توجد رسائل'}
                    </p>
                  </>
                )}
              </div>

              <button
                onClick={(e) => handleMenuClick(e, chat.id)}
                className={`p-1 rounded-full hover:bg-gray-800 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${menuOpenId === chat.id ? 'opacity-100' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {menuOpenId === chat.id && (
                <div ref={menuRef} className="absolute right-2 top-8 w-32 bg-gray-900 rounded-lg shadow-xl border border-[#2873ec]/20 py-1 z-10">
                  <button
                    onClick={(e) => startRenaming(e, chat)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>إعادة تسمية</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center space-x-2"
                  >
                    <ExportButton chatTitle={chat.title} messages={chat.messages} format="txt" className="p-0! bg-transparent! border-0! text-xs" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); setMenuOpenId(null); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>حذف</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-[#2873ec]/20 space-y-2">
        {/* Dashboard Link */}
        <Link
          to="/dashboard"
          className="flex items-center space-x-3 space-x-reverse px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900/50 transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-[#2873ec]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-sm font-medium">لوحة التحكم</span>
        </Link>

        {/* Account Link */}
        <Link
          to="/account"
          className="flex items-center space-x-3 space-x-reverse px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900/50 transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-[#2873ec]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm font-medium">الحساب</span>
        </Link>

        {/* Settings Link (optional - can link to account settings) */}
        <Link
          to="/account"
          className="flex items-center space-x-3 space-x-reverse px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900/50 transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-[#2873ec]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium">الإعدادات</span>
        </Link>
      </div>
    </div>
  );
};

export default ChatSidebar;
