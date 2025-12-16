import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { processFile, deleteGeminiFile } from '../services/fileService.js';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// Upload file
export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('لم يتم رفع أي ملف', 400);
    }

    const userId = req.user!.userId;
    const file = req.file;

    // Create file record
    const fileRecord = await prisma.file.create({
      data: {
        userId,
        filename: file.filename,
        originalFilename: file.originalname,
        fileType: path.extname(file.originalname).toLowerCase(),
        fileSize: BigInt(file.size),
        storagePath: file.path,
        status: 'processing',
      },
    });

    // Process file asynchronously
    processFile(fileRecord.id).catch(console.error);

    res.status(201).json({
      id: fileRecord.id,
      filename: fileRecord.originalFilename,
      fileType: fileRecord.fileType,
      fileSize: Number(fileRecord.fileSize),
      status: fileRecord.status,
      createdAt: fileRecord.createdAt,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في رفع الملف', 500);
  }
};

// Get all files
export const getFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: { userId },
        select: {
          id: true,
          filename: true,
          originalFilename: true,
          fileType: true,
          fileSize: true,
          status: true,
          metadata: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.file.count({ where: { userId } }),
    ]);

    res.json({
      items: files.map(f => ({
        ...f,
        fileSize: Number(f.fileSize),
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    throw new AppError('خطأ في جلب الملفات', 500);
  }
};

// Get file by ID
export const getFileById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    const userId = req.user!.userId;

    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      throw new AppError('الملف غير موجود', 404);
    }

    res.json({
      ...file,
      fileSize: Number(file.fileSize),
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في جلب الملف', 500);
  }
};

// Delete file
export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    const userId = req.user!.userId;

    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      throw new AppError('الملف غير موجود', 404);
    }

    // Delete from Gemini servers first
    await deleteGeminiFile(fileId);

    // Delete physical file
    try {
      await fs.unlink(file.storagePath);
    } catch (err) {
      console.error('Error deleting physical file:', err);
    }

    // Delete from database
    await prisma.file.delete({ where: { id: fileId } });

    res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في حذف الملف', 500);
  }
};

// Get file status
export const getFileStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    const userId = req.user!.userId;

    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
      select: {
        status: true,
        errorMessage: true,
        metadata: true,
      },
    });

    if (!file) {
      throw new AppError('الملف غير موجود', 404);
    }

    res.json({
      status: file.status,
      errorMessage: file.errorMessage,
      metadata: file.metadata,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في جلب حالة الملف', 500);
  }
};
