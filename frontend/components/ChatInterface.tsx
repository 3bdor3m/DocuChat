import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import ChatBackground from './ChatBackground';
import { CopyButton } from './CopyButton';
import { MarkdownRenderer } from './MarkdownRenderer';

const ChatInterface: React.FC = () => {
  const { messages, isTyping, isLoading, sendMessage, searchMode, toggleSearchMode, stopGenerating, creativityLevel, setCreativityLevel, uploadFile, uploadedFile, clearUploadedFile } = useChat();
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadFile(file);
        // Reset input to allow uploading the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative">
      {/* Animated Background */}
      <ChatBackground />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-16 space-y-6 custom-scrollbar relative z-10">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start w-full'}`}
          >
            <div className={`flex max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
              {/* Bot Avatar */}
              {msg.type === 'bot' && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div
                className={`relative group ${msg.type === 'user'
                  ? 'bg-[#2873ec] text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md'
                  : 'text-gray-200 px-2 py-1'
                  }`}
              >
                {/* Copy Button */}
                <div className={`absolute top-2 ${msg.type === 'user' ? 'left-2' : 'left-0'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <CopyButton text={msg.content} />
                </div>

                {msg.type === 'bot' ? (
                  <MarkdownRenderer content={msg.content} className="text-sm leading-relaxed" />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      <p className="text-xs text-gray-400 font-medium">المصادر المستخدمة</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-900/50 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-800 flex items-center space-x-2 hover:border-gray-700 transition-colors cursor-default"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span>{source.file} (ص {source.page})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className={`text-[10px] mt-2 ${msg.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-900 border border-[#2873ec]/20 rounded-2xl rounded-br-none px-4 py-3 flex items-center space-x-1 space-x-reverse">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Stop Generating Button */}
          {(isLoading || isTyping) && (
            <div className="flex justify-center mb-4">
              <button
                onClick={stopGenerating}
                className="px-4 py-2 bg-red-600/20 border border-red-500/40 text-red-400 rounded-full hover:bg-red-600/30 transition-all duration-300 flex items-center space-x-2 space-x-reverse shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm">إيقاف الرد</span>
              </button>
            </div>
          )}

          {/* Uploaded File Display */}
          {uploadedFile && (
            <div className="mb-4">
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-3 flex items-center space-x-3 space-x-reverse relative group">
                {/* File Icon */}
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${uploadedFile.status === 'completed' ? 'bg-green-500/10' :
                  uploadedFile.status === 'error' ? 'bg-red-500/10' :
                    'bg-blue-500/10'
                  }`}>
                  {uploadedFile.status === 'completed' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : uploadedFile.status === 'error' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate font-medium">{uploadedFile.name}</p>
                  <div className="flex items-center space-x-2 space-x-reverse mt-0.5">
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <span className="text-gray-700">•</span>
                    <p className={`text-xs ${uploadedFile.status === 'completed' ? 'text-green-500' :
                      uploadedFile.status === 'error' ? 'text-red-500' :
                        uploadedFile.status === 'processing' ? 'text-yellow-500' :
                          'text-blue-500'
                      }`}>
                      {uploadedFile.status === 'completed' ? 'مكتمل' :
                        uploadedFile.status === 'error' ? 'فشل' :
                          uploadedFile.status === 'processing' ? 'جاري المعالجة...' :
                            'جاري الرفع...'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {uploadedFile.status === 'uploading' && (
                    <div className="mt-2 w-full bg-gray-800 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={clearUploadedFile}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="حذف الملف"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="relative bg-[#1a1a1a] border border-gray-800 rounded-[2rem] shadow-2xl shadow-black/50 transition-colors focus-within:border-gray-700">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={searchMode ? "اطرح سؤالاً للبحث..." : "كيف يمكنني مساعدتك اليوم؟"}
              className="w-full bg-transparent text-white rounded-[2rem] pl-4 pr-4 py-4 focus:outline-none resize-none max-h-[200px] custom-scrollbar text-right min-h-[60px]"
              rows={1}
              style={{ minHeight: '60px' }}
              disabled={isLoading || isTyping}
            />

            <div className="flex items-center justify-between px-4 pb-3 pt-1">
              <div className="flex items-center gap-2">
                {/* Settings Menu */}
                <div className="relative" ref={settingsRef}>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
                    title="الإعدادات"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl p-4 space-y-4 z-50">
                      {/* Search Mode Toggle */}
                      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                        <label className="text-sm text-gray-300">وضع البحث</label>
                        <button
                          onClick={toggleSearchMode}
                          className={`relative w-12 h-6 rounded-full transition-colors ${searchMode ? 'bg-[#2873ec]' : 'bg-gray-700'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${searchMode ? 'right-1' : 'right-7'}`}></div>
                        </button>
                      </div>

                      {/* Creativity Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-gray-300">مستوى الإبداع</label>
                          <span className="text-xs text-[#2873ec] font-semibold">{creativityLevel}%</span>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={creativityLevel}
                            onChange={(e) => setCreativityLevel(Number(e.target.value))}
                            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2873ec] [&::-webkit-slider-thumb]:shadow-[0_0_10px_#2873ec]"
                          />
                          <div className="flex justify-between text-[10px] text-gray-500">
                            <span>التزام</span>
                            <span>إبداع</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.docx,.doc,.txt,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
                  title="رفع صورة"
                  disabled={isLoading || isTyping}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isTyping}
                className={`p-2 rounded-xl transition-all duration-300 ${input.trim() && !isLoading && !isTyping
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-[10px] text-gray-600">يمكن للذكاء الاصطناعي أن يرتكب أخطاء. يرجى التحقق من المعلومات المهمة.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
