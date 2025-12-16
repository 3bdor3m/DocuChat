# DocuChat - Chat with PDF using Google Gemini

A full-stack application that allows users to upload PDF documents and chat with them using Google Gemini's Long Context capabilities.

## 🚀 Architecture Change

This project has been refactored from an **Embeddings/RAG approach** to a **Direct File Upload (Long Context) approach** using Google Gemini 1.5.

### Previous Approach (RAG)
- PDF files were chunked into smaller pieces
- Text chunks were stored in the database
- Simple keyword matching was used for retrieval
- Context was limited to matched chunks

### New Approach (Gemini Long Context)
- PDF files are uploaded directly to Google's servers via `GoogleAIFileManager`
- The entire document is passed to Gemini as context
- No chunking or embedding required
- Full document understanding with up to 1M+ tokens context

## 📁 Project Structure

```
docuchat_refactored/
├── backend/                 # Node.js/Express Backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth & error handling
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   │   ├── aiService.ts      # Gemini AI integration
│   │   │   └── fileService.ts    # File upload to Gemini
│   │   ├── utils/          # Helper functions
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── prisma/             # Database schema
│   ├── uploads/            # Local file storage
│   └── package.json
│
└── frontend/               # React/Vite Frontend
    ├── components/         # UI components
    ├── pages/              # Page components
    ├── context/            # React contexts
    ├── services/           # API services
    ├── config/             # Frontend config
    └── package.json
```

## 🔧 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=8000
NODE_ENV=development
APP_NAME=DocuChat Backend

# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/docuchat_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=50
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt,.md

# Google Gemini AI Configuration (REQUIRED)
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Gemini API key

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env if needed

# Start development server
npm run dev
```

## 🔑 Key Changes Made

### 1. File Service (`backend/src/services/fileService.ts`)

**New Implementation:**
- Uses `GoogleAIFileManager` to upload files directly to Google's servers
- Stores Gemini file URI in database metadata
- Handles file state polling until processing is complete

```typescript
// Upload file to Gemini
const uploadResult = await fileManager.uploadFile(file.storagePath, {
  mimeType: 'application/pdf',
  displayName: file.originalFilename,
});

// Store Gemini URI in metadata
await prisma.file.update({
  where: { id: fileId },
  data: {
    status: 'completed',
    metadata: {
      geminiFileName: geminiFile.name,
      geminiFileUri: geminiFile.uri,
      // ...
    },
  },
});
```

### 2. AI Service (`backend/src/services/aiService.ts`)

**New Implementation:**
- Passes file URI directly to Gemini model
- Uses `fileData` part type for document context
- Full document is available for answering questions

```typescript
// Include file in generation request
const parts: Part[] = [];

if (fileId) {
  const geminiFileInfo = await getGeminiFileInfo(fileId);
  if (geminiFileInfo) {
    parts.push({
      fileData: {
        mimeType: geminiFileInfo.mimeType,
        fileUri: geminiFileInfo.uri,
      },
    });
  }
}

parts.push({ text: userPrompt });

const result = await model.generateContent({
  contents: [{ role: 'user', parts }],
  systemInstruction: systemInstruction,
});
```

### 3. Removed Dependencies

The following are no longer needed:
- Vector database libraries (Pinecone, Chroma, etc.)
- Embedding generation libraries
- Text chunking utilities

### 4. Simplified Message Handling

- Removed `MessageSource` tracking (no longer relevant)
- Messages now include metadata about token usage
- Simplified response format

## 📊 Database Schema

The schema remains largely the same, but the `FileContent` table is now optional (kept for backward compatibility):

```prisma
model File {
  id               String   @id @default(uuid())
  userId           String
  filename         String
  originalFilename String
  fileType         String
  fileSize         BigInt
  storagePath      String
  status           String   @default("processing")
  errorMessage     String?
  metadata         Json?    // Now stores geminiFileUri, geminiFileName, etc.
  // ...
}
```

## 🔒 Security Notes

1. **API Key Protection**: The `GEMINI_API_KEY` is stored server-side only
2. **File Validation**: Only allowed file types are accepted
3. **User Isolation**: Users can only access their own files and chats
4. **JWT Authentication**: All API endpoints are protected

## 🚀 Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve the dist/ folder with your preferred web server
```

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Files
- `POST /api/v1/files/upload` - Upload a file
- `GET /api/v1/files` - List user's files
- `GET /api/v1/files/:fileId` - Get file details
- `GET /api/v1/files/:fileId/status` - Get processing status
- `DELETE /api/v1/files/:fileId` - Delete a file

### Chats
- `POST /api/v1/chats` - Create new chat
- `GET /api/v1/chats` - List user's chats
- `GET /api/v1/chats/:chatId` - Get chat details
- `PUT /api/v1/chats/:chatId` - Update chat
- `DELETE /api/v1/chats/:chatId` - Delete chat

### Messages
- `POST /api/v1/chats/:chatId/messages` - Send message
- `GET /api/v1/chats/:chatId/messages` - Get chat messages

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC License
