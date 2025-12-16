import React from 'react';

const ChatBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2873ec]/20 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1a5bb8]/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
    </div>
  );
};

export default ChatBackground;
