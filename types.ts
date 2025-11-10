
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface ChatSession {
  id: string;
  name: string;
  history: Message[];
  createdAt: number;
}

export interface PdfFile {
  id: string;
  name: string;
  sessions: ChatSession[];
  analysis: {
    pageCount: number;
    chapters: string[];
    mainTopics: string[];
  };
  createdAt: number;
}

export interface UserStats {
  filesAnalyzed: number;
  avgCreativity: number;
  commonTopics: { topic: string; count: number }[];
}
