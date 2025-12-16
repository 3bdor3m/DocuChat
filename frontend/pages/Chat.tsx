import React from 'react';
import { useChat } from '../context/ChatContext';
import ChatSidebar from '../components/ChatSidebar';
import ChatInterface from '../components/ChatInterface';
import FileUpload from '../components/FileUpload';
import { Link } from 'react-router-dom';

const Chat: React.FC = () => {
  const { activeChatId } = useChat();

  return (
    <div className="flex h-screen bg-black overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <ChatSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Close Button - positioned correctly in RTL */}
        <Link to="/" className="absolute top-4 left-4 z-20 bg-gray-900/80 backdrop-blur p-2 rounded-full shadow-lg border border-[#2873ec]/20 hover:bg-[#2873ec] hover:text-white text-gray-400 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>

        {activeChatId ? <ChatInterface /> : <FileUpload />}
      </div>
    </div>
  );
};

export default Chat;
