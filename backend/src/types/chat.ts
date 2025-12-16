export interface Source {
  file: string;
  page?: number;
  paragraph?: number;
  relevanceScore?: number;
}

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sources?: Source[];
  messageType?: string;
  createdAt?: string;
}

export interface ChatSettings {
  creativity_level?: number;
  search_mode?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  date: Date;
  messages: Message[];
  fileId?: string | null;
  settings?: ChatSettings;
  createdAt?: string;
}

export interface UploadedFile {
  id?: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  filename?: string;
  originalFilename?: string;
  fileType?: string;
  fileSize?: string;
  errorMessage?: string;
  createdAt?: string;
}
