import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import { config } from '../../config/index.js';
import { AppError } from '../../common/utils/AppError.js';
import path from 'path';

const prisma = new PrismaClient();
const fileManager = new GoogleAIFileManager(config.geminiApiKey);

export class FileService {
  
  // 1. عملية الرفع (أصبحت الآن تنتظر جوجل)
  async uploadFile(userId: string, file: Express.Multer.File) {
    // أ) حفظ السجل في قاعدة البيانات
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

    // ب) الانتظار حتى تنتهي معالجة Gemini
    // لن نستخدم .catch هنا لأننا نريد انتظار النتيجة
    await this.processFileWithGemini(fileRecord.id);

    // ج) جلب الحالة النهائية للملف
    const finalRecord = await prisma.file.findUnique({ where: { id: fileRecord.id } });

    // د) إذا فشلت المعالجة، نرمي خطأ لكي يظهر في الفرونت إند ولا يعطي "مكتمل"
    if (!finalRecord || finalRecord.status === 'error') {
      throw new AppError(
        `فشل معالجة الملف من قبل جوجل: ${finalRecord?.errorMessage || 'خطأ غير معروف'}`, 
        400
      );
    }

    // هـ) إذا نجح، نعيد الملف المحدث (الذي حالته completed)
    return finalRecord;
  }

  // 2. معالجة Gemini (كما هي، لكن استدعاؤها تغير)
  private async processFileWithGemini(fileId: string) {
    const fileRecord = await prisma.file.findUnique({ where: { id: fileId } });
    if (!fileRecord) return;

    try {
      console.log(`🚀 Starting Gemini upload for: ${fileRecord.originalFilename}`);

      const mimeType = this.getMimeType(fileRecord.fileType);

      const uploadResult = await fileManager.uploadFile(fileRecord.storagePath, {
        mimeType,
        displayName: fileRecord.originalFilename,
      });

      let geminiFile = uploadResult.file;
      console.log(`✅ Uploaded to Gemini, waiting for processing...`);

      // حلقة الانتظار (Polling) من جوجل
      while (geminiFile.state === FileState.PROCESSING) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        geminiFile = await fileManager.getFile(geminiFile.name);
      }

      if (geminiFile.state === FileState.FAILED) {
        throw new Error('Google Gemini marked the file as FAILED');
      }

      // تحديث الحالة للنجاح
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
      // تسجيل الخطأ في قاعدة البيانات
      await prisma.file.update({
        where: { id: fileId },
        data: { 
          status: 'error', 
          errorMessage: error.message 
        },
      });
      // ملاحظة: لا نرمي الخطأ هنا حتى لا نوقف السيرفر، بل نكتفي بتحديث الحالة
      // ودالة uploadFile هي التي ستفحص الحالة وترمي الخطأ للمستخدم
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

    if (file.metadata && (file.metadata as any).geminiFileName) {
      try {
        await fileManager.deleteFile((file.metadata as any).geminiFileName);
      } catch (e) {
        console.warn('Could not delete from Gemini');
      }
    }

    try {
      await fs.unlink(file.storagePath);
    } catch (e) { console.warn('Local file missing'); }

    await prisma.file.delete({ where: { id: fileId } });
  }

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