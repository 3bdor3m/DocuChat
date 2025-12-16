import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Initialize Google AI File Manager
const fileManager = new GoogleAIFileManager(config.geminiApiKey);

/**
 * Process a file by uploading it to Google's Gemini File API
 * This replaces the old chunking/embedding approach with direct file upload
 */
export const processFile = async (fileId: string): Promise<void> => {
  try {
    // Get file record from database
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error(`File not found: ${fileId}`);
    }

    console.log(`Processing file: ${file.originalFilename}`);

    // Check if Gemini API key is configured
    if (!config.geminiApiKey) {
      await prisma.file.update({
        where: { id: fileId },
        data: {
          status: 'error',
          errorMessage: 'GEMINI_API_KEY is not configured',
        },
      });
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Determine MIME type based on file extension
    const mimeType = getMimeType(file.fileType);
    
    // Upload file to Gemini File API
    console.log(`Uploading ${file.originalFilename} to Gemini...`);
    
    const uploadResult = await fileManager.uploadFile(file.storagePath, {
      mimeType: mimeType,
      displayName: file.originalFilename,
    });

    console.log(`File uploaded: ${uploadResult.file.name}`);

    // Wait for file to be processed by Gemini
    let geminiFile = uploadResult.file;
    
    while (geminiFile.state === FileState.PROCESSING) {
      console.log(`File ${file.originalFilename} is still processing...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      geminiFile = await fileManager.getFile(geminiFile.name);
    }

    if (geminiFile.state === FileState.FAILED) {
      await prisma.file.update({
        where: { id: fileId },
        data: {
          status: 'error',
          errorMessage: 'File processing failed on Gemini servers',
        },
      });
      throw new Error('File processing failed on Gemini servers');
    }

    // Update file record with Gemini file information
    await prisma.file.update({
      where: { id: fileId },
      data: {
        status: 'completed',
        metadata: {
          geminiFileName: geminiFile.name,
          geminiFileUri: geminiFile.uri,
          geminiMimeType: geminiFile.mimeType,
          geminiState: geminiFile.state,
          geminiSizeBytes: geminiFile.sizeBytes,
          processedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`File ${file.originalFilename} processed successfully`);
    console.log(`Gemini URI: ${geminiFile.uri}`);

  } catch (error) {
    console.error(`Error processing file ${fileId}:`, error);
    
    // Update file status to error
    await prisma.file.update({
      where: { id: fileId },
      data: {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error during file processing',
      },
    });
    
    throw error;
  }
};

/**
 * Get the Gemini file information for a given file ID
 */
export const getGeminiFileInfo = async (fileId: string): Promise<{
  uri: string;
  mimeType: string;
  name: string;
} | null> => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file || file.status !== 'completed' || !file.metadata) {
    return null;
  }

  const metadata = file.metadata as any;
  
  if (!metadata.geminiFileUri) {
    return null;
  }

  return {
    uri: metadata.geminiFileUri,
    mimeType: metadata.geminiMimeType || 'application/pdf',
    name: metadata.geminiFileName,
  };
};

/**
 * Delete a file from Gemini's servers
 */
export const deleteGeminiFile = async (fileId: string): Promise<void> => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || !file.metadata) {
      return;
    }

    const metadata = file.metadata as any;
    
    if (metadata.geminiFileName) {
      await fileManager.deleteFile(metadata.geminiFileName);
      console.log(`Deleted Gemini file: ${metadata.geminiFileName}`);
    }
  } catch (error) {
    console.error(`Error deleting Gemini file for ${fileId}:`, error);
    // Don't throw - file deletion from Gemini is not critical
  }
};

/**
 * Get MIME type based on file extension
 */
const getMimeType = (fileType: string): string => {
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.html': 'text/html',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.xml': 'application/xml',
  };

  return mimeTypes[fileType.toLowerCase()] || 'application/octet-stream';
};

/**
 * List all files uploaded to Gemini (for debugging)
 */
export const listGeminiFiles = async (): Promise<any[]> => {
  try {
    const listResult = await fileManager.listFiles();
    return listResult.files || [];
  } catch (error) {
    console.error('Error listing Gemini files:', error);
    return [];
  }
};
