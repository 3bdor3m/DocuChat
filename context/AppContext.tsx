import React, { createContext, useState, useContext, ReactNode } from 'react';
import { PdfFile, ChatSession, Message, UserStats } from '../types';

interface AppContextType {
  files: PdfFile[];
  setFiles: React.Dispatch<React.SetStateAction<PdfFile[]>>;
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  addFile: (file: File) => Promise<PdfFile>;
  addMessage: (fileId: string, sessionId: string, message: Message) => void;
  addSession: (fileId: string, sessionName: string) => ChatSession;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [stats, setStats] = useState<UserStats>({
    filesAnalyzed: 0,
    avgCreativity: 0,
    commonTopics: [],
});

  const addFile = async (file: File): Promise<PdfFile> => {
    // Simulate PDF analysis
    await new Promise(res => setTimeout(res, 1500));
    const newFile: PdfFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        createdAt: Date.now(),
        analysis: {
            pageCount: Math.floor(Math.random() * 200) + 50,
            chapters: ['مقدمة', 'الفصل الأول: المفاهيم الأساسية', 'الفصل الثاني: تطبيقات عملية', 'الخاتمة'],
            mainTopics: ['الموضوع الرئيسي أ', 'الموضوع الرئيسي ب', 'الموضوع الرئيسي ج']
        },
        sessions: []
    };
    const initialSession = addSessionToFile(newFile, 'المحادثة الأولى');
    newFile.sessions.push(initialSession);
    
    setFiles(prev => [newFile, ...prev]);
    setStats(prev => ({ ...prev, filesAnalyzed: prev.filesAnalyzed + 1, avgCreativity: Math.floor((prev.avgCreativity * prev.filesAnalyzed + 50) / (prev.filesAnalyzed + 1)) }));
    return newFile;
  };

  const addSessionToFile = (file: PdfFile, sessionName: string): ChatSession => {
    const newSession: ChatSession = {
        id: `session-${file.id}-${Date.now()}`,
        name: sessionName,
        createdAt: Date.now(),
        history: [
            {
                id: `msg-${Date.now()}`,
                sender: 'ai',
                text: `أهلاً بك! لقد قمت بتحليل ملفك "${file.name}". يحتوي على ${file.analysis.pageCount} صفحة، وأهم فصوله هي: ${file.analysis.chapters.join('، ')}. أنا جاهز لمساعدتك في فهمه بشكل أعمق.`,
                timestamp: Date.now()
            }
        ]
    };
    return newSession;
  };
  
  const addSession = (fileId: string, sessionName: string): ChatSession => {
      let newSession: ChatSession | null = null;
      setFiles(prevFiles => {
          return prevFiles.map(file => {
              if (file.id === fileId) {
                  newSession = addSessionToFile(file, sessionName);
                  return { ...file, sessions: [...file.sessions, newSession] };
              }
              return file;
          });
      });
      if (!newSession) throw new Error("File not found");
      return newSession;
  };

  const addMessage = (fileId: string, sessionId: string, message: Message) => {
    setFiles(prevFiles => {
        return prevFiles.map(file => {
            if (file.id === fileId) {
                const updatedSessions = file.sessions.map(session => {
                    if (session.id === sessionId) {
                        return { ...session, history: [...session.history, message] };
                    }
                    return session;
                });
                return { ...file, sessions: updatedSessions };
            }
            return file;
        });
    });
  };

  return (
    <AppContext.Provider value={{ files, setFiles, stats, setStats, addFile, addMessage, addSession }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};