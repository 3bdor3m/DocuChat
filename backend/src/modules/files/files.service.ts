import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import { config } from '../../config/index.js';
import { AppError } from '../../common/utils/AppError.js';
import path from 'path';

const prisma = new PrismaClient();
const fileManager = new GoogleAIFileManager(config.geminiApiKey);

export class FileService {
  
  // 1. عملية الرفع الأولية (حفظ في DB وبدء المعالجة)
  async uploadFile(userId: string, file: Express.Multer.File) {
    // إنشاء سجل في قاعدة البيانات
    const fileRecord = await prisma.file.create({
      data: {
        userId,
        filename: file.filename, // الاسم على السيرفر
        originalFilename: file.originalname, // الاسم الأصلي
        fileType: path.extname(file.originalname).toLowerCase(),
        fileSize: BigInt(file.size),
        storagePath: file.path,
        status: 'processing', // الحالة المبدئية
      },
    });

    // بدء عملية الرفع لـ Gemini في الخلفية (بدون انتظار)
    this.processFileWithGemini(fileRecord.id).catch(err => {
      console.error(`Background processing failed for file ${fileRecord.id}:`, err);
    });

    return fileRecord;
  }

  // 2. العملية الخلفية (Gemini Upload) - هذه الدالة تعمل في الخلفية
  private async processFileWithGemini(fileId: string) {
    const fileRecord = await prisma.file.findUnique({ where: { id: fileId } });
    if (!fileRecord) return;

    try {
      console.log(`🚀 Starting Gemini upload for: ${fileRecord.originalFilename}`);

      // تحديد نوع MIME
      const mimeType = this.getMimeType(fileRecord.fileType);

      // الرفع لـ Gemini
      const uploadResult = await fileManager.uploadFile(fileRecord.storagePath, {
        mimeType,
        displayName: fileRecord.originalFilename,
      });

      let geminiFile = uploadResult.file;
      console.log(`✅ Uploaded to Gemini, waiting for processing...`);

      // انتظار المعالجة من طرف Google
      while (geminiFile.state === FileState.PROCESSING) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        geminiFile = await fileManager.getFile(geminiFile.name);
      }

      if (geminiFile.state === FileState.FAILED) {
        throw new Error('Gemini processing failed');
      }

      // تحديث الحالة عند النجاح
      await prisma.file.update({
        where: { id: fileId },
        data: {
          status: 'completed',
          metadata: {
            geminiFileName: geminiFile.name,
            geminiFileUri: geminiFile.uri,
            geminiMimeType: geminiFile.mimeType,
          },
        },
      });
      console.log(`🎉 File ${fileId} is ready!`);

    } catch (error: any) {
      console.error(`❌ Error processing file ${fileId}:`, error);
      await prisma.file.update({
        where: { id: fileId },
        data: { 
          status: 'error', 
          errorMessage: error.message 
        },
      });
    }
  }

  // 3. عرض الملفات
  async getUserFiles(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.file.count({ where: { userId } }),
    ]);

    return { 
      files: files.map(f => ({ ...f, fileSize: Number(f.fileSize) })), 
      total, 
      totalPages: Math.ceil(total / limit) 
    };
  }

  // 4. حذف الملف
  async deleteFile(userId: string, fileId: string) {
    const file = await prisma.file.findFirst({ where: { id: fileId, userId } });
    if (!file) throw new AppError('الملف غير موجود', 404);

    // الحذف من Gemini
    if (file.metadata && (file.metadata as any).geminiFileName) {
      try {
        await fileManager.deleteFile((file.metadata as any).geminiFileName);
      } catch (e) {
        console.warn('Could not delete from Gemini (might be already deleted)');
      }
    }

    // الحذف من السيرفر المحلي
    try {
      await fs.unlink(file.storagePath);
    } catch (e) {
      console.warn('Could not delete local file');
    }

    // الحذف من قاعدة البيانات
    await prisma.file.delete({ where: { id: fileId } });
  }

  // Helper
  private getMimeType(ext: string): string {
    const map: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return map[ext] || 'application/octet-stream';
  }
}

export const fileService = new FileService();