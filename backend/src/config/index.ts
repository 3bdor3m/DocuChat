import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // App
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  appName: process.env.APP_NAME || 'DocuChat Backend',
  
  // Database
  databaseUrl: process.env.DATABASE_URL!,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Gemini AI (Optional - leave empty for mock responses)
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // File Upload
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || '.pdf,.docx,.doc,.txt,.md').split(','),
  
  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Email
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@testapp.com',
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '50', 10),
  },
  
  // Subscription Limits
  limits: {
    free: {
      files: parseInt(process.env.FREE_FILE_LIMIT || '5', 10),
      messages: parseInt(process.env.FREE_MESSAGE_LIMIT || '100', 10),
      storageMB: parseInt(process.env.FREE_STORAGE_MB || '100', 10),
    },
    basic: {
      files: parseInt(process.env.BASIC_FILE_LIMIT || '20', 10),
      messages: parseInt(process.env.BASIC_MESSAGE_LIMIT || '500', 10),
      storageMB: parseInt(process.env.BASIC_STORAGE_MB || '500', 10),
    },
    premium: {
      files: parseInt(process.env.PREMIUM_FILE_LIMIT || '100', 10),
      messages: parseInt(process.env.PREMIUM_MESSAGE_LIMIT || '-1', 10),
      storageMB: parseInt(process.env.PREMIUM_STORAGE_MB || '2000', 10),
    },
  },
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Warn if GEMINI_API_KEY is not set
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set. AI features will not work properly.');
}
