import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { PdfFile, ChatSession, Message } from '../types';
import { UploadIcon, PaperAirplaneIcon, PlusCircleIcon, SparklesIcon, UserIcon, BotIcon } from '../components/icons/Icons';
import { GoogleGenAI } from "@google/genai";

const ChatPage: React.FC = () => {
    const { files, addFile, addMessage, addSession } = useAppContext();
    const [selectedFile, setSelectedFile] = useState<PdfFile | null>(files.length > 0 ? files[0] : null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(files.length > 0 ? files[0].sessions[0]?.id : null);
    const [creativity, setCreativity] = useState<number>(50);
    const [userInput, setUserInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentSession = selectedFile?.sessions.find(s => s.id === selectedSessionId);

    useEffect(() => {
        if (!selectedFile && files.length > 0) {
            setSelectedFile(files[0]);
        }
        if (selectedFile && (!selectedSessionId || !selectedFile.sessions.find(s => s.id === selectedSessionId))) {
            setSelectedSessionId(selectedFile.sessions[0]?.id || null);
        }
    }, [files, selectedFile, selectedSessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentSession?.history]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsLoading(true);
            try {
                const newFile = await addFile(file);
                setSelectedFile(newFile);
                setSelectedSessionId(newFile.sessions[0].id);
            } catch (error) {
                console.error("Error adding file:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const handleSendMessage = async () => {
        if (!userInput.trim() || !selectedFile || !selectedSessionId) return;

        const userMessage: Message = {
            id: `msg-user-${Date.now()}`,
            text: userInput,
            sender: 'user',
            timestamp: Date.now(),
        };
        addMessage(selectedFile.id, selectedSessionId, userMessage);
        setUserInput('');
        setIsLoading(true);

        // Simulate Gemini API call
        try {
            // In a real app, you would initialize this once.
            // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // For this example, we mock the response.
            await new Promise(res => setTimeout(res, 1500));
            const yPercentage = creativity;
            const xPercentage = 100 - yPercentage;
            
            let responseText = `بناءً على تحليل الملف ومستوى الإبداع (${creativity}%)، إليك إجابتي حول "${userInput.substring(0, 20)}...": `;
            if (creativity < 30) {
                responseText += "هذا هو النص الحرفي من المستند.";
            } else if (creativity < 70) {
                responseText += "هذا شرح مبسط للمعلومات الموجودة في الملف، مع ربط بعض المفاهيم لتسهيل الفهم.";
            } else {
                 responseText += "هذه فكرة إبداعية مستوحاة من المحتوى، مع أمثلة خارجية لتوضيح الفكرة بشكل أعمق.";
            }
            responseText += `\n\n> تم الاعتماد على ${xPercentage}٪ من محتوى الملف و${yPercentage}٪ من التحليل الإضافي.`;
            
            const aiMessage: Message = {
                id: `msg-ai-${Date.now()}`,
                text: responseText,
                sender: 'ai',
                timestamp: Date.now(),
            };
            addMessage(selectedFile.id, selectedSessionId, aiMessage);
        } catch (error) {
             const errorMessage: Message = {
                id: `msg-ai-error-${Date.now()}`,
                text: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.",
                sender: 'ai',
                timestamp: Date.now(),
            };
            addMessage(selectedFile.id, selectedSessionId, errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewSession = () => {
        if(!selectedFile) return;
        const sessionName = `المحادثة ${selectedFile.sessions.length + 1}`;
        const newSession = addSession(selectedFile.id, sessionName);
        setSelectedSessionId(newSession.id);
    };

    if (isLoading && !selectedFile) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
                <SparklesIcon className="w-16 h-16 text-sky-500 animate-pulse mb-4" />
                <h2 className="text-2xl font-bold">جاري تحليل الملف...</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">يقوم المساعد الذكي بقراءة وفهم محتوى ملفك الآن.</p>
            </div>
        );
    }

    if (!selectedFile) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                <UploadIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
                <h2 className="text-2xl font-bold">ابدأ رحلتك التعليمية</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">ارفع ملف PDF لبدء المحادثة مع المدرس الافتراضي.</p>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-6 px-6 py-3 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 transition-transform transform hover:scale-105"
                >
                    اختر ملفًا
                </button>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-[calc(100vh-150px)] bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <label htmlFor="file-select" className="text-sm font-medium text-slate-500 dark:text-slate-400">الملف الحالي</label>
                        <div className="flex items-center gap-2 mt-1">
                            <select 
                                id="file-select"
                                value={selectedFile?.id || ''}
                                onChange={(e) => {
                                    const file = files.find(f => f.id === e.target.value);
                                    setSelectedFile(file || null);
                                    setSelectedSessionId(file?.sessions[0]?.id || null);
                                }}
                                className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            >
                                {files.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 flex-shrink-0"
                                title="رفع ملف جديد"
                            >
                                <UploadIcon className="w-6 h-6"/>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1">
                        <label htmlFor="session-select" className="text-sm font-medium text-slate-500 dark:text-slate-400">جلسة المحادثة</label>
                        <div className="flex items-center gap-2 mt-1">
                            <select 
                                id="session-select"
                                value={selectedSessionId || ''}
                                onChange={(e) => setSelectedSessionId(e.target.value)}
                                className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            >
                                {selectedFile?.sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <button onClick={handleNewSession} className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                                <PlusCircleIcon className="w-6 h-6"/>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <label htmlFor="creativity-slider" className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>مستوى الإبداع: <span className="font-bold text-sky-500">{creativity}%</span></span>
                        <SparklesIcon className="w-5 h-5 text-yellow-400"/>
                    </label>
                    <input 
                        id="creativity-slider"
                        type="range" 
                        min="0" 
                        max="100" 
                        value={creativity}
                        onChange={(e) => setCreativity(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer mt-1 accent-sky-500"
                    />
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentSession?.history.map(msg => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-sky-500"/></div>}
                        <div className={`max-w-xl p-3 rounded-2xl whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-sky-500 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                        {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5"/></div>}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-sky-500"/></div>
                        <div className="max-w-xl p-3 rounded-2xl bg-slate-200 dark:bg-slate-700 rounded-bl-none">
                            <div className="flex items-center space-s-2">
                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="relative">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                        placeholder="اسأل عن أي شيء في الملف..."
                        disabled={isLoading}
                        className="w-full p-3 ps-4 pe-12 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-full focus:ring-2 focus:ring-sky-500 focus:outline-none disabled:opacity-50"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={isLoading || !userInput.trim()}
                        className="absolute top-1/2 -translate-y-1/2 end-2 p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;