import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import { config } from '../../config/index.js';
import { AppError } from '../../common/utils/AppError.js';
import path from 'path';

const prisma = new PrismaClient();
// تهيئة مدير ملفات Gemini باستخدام مفتاح ال API
const fileManager = new GoogleAIFileManager(config.geminiApiKey);

export class FileService {
  static uploadFile(userId: string, file: Express.Multer.File) {
    throw new Error('Method not implemented.');
  }
  static getUserFiles(userId: string, page: number, limit: number) {
    throw new Error('Method not implemented.');
  }
  static getFileStatus(userId: string, id: string) {
    throw new Error('Method not implemented.');
  }
  static deleteFile(userId: string, id: string) {
    throw new Error('Method not implemented.');
  }

  // 1. عملية الرفع والمعالجة
  async uploadFile(userId: string, file: Express.Multer.File) {
    // أ) حفظ السجل المبدئي في قاعدة البيانات
    const fileRecord = await prisma.file.create({
      data: {
        userId,
        filename: file.filename,
        originalFilename: file.originalname,
        fileType: path.extname(file.originalname).toLowerCase(),
        fileSize: BigInt(file.size),
        storagePath: file.path,
        status: 'processing', // الحالة الأولية
      },
    });

    console.log(`📂 File saved to DB: ${fileRecord.id}, starting Gemini upload...`);

    // ب) بدء المعالجة مع Gemini والانتظار حتى الانتهاء
    // نستخدم try-catch هنا لضمان عدم توقف السيرفر في حال فشل Gemini
    try {
        await this.processFileWithGemini(fileRecord.id);
    } catch (error) {
        console.error("Gemini processing failed, but DB record exists.");
    }

    // ج) جلب الحالة النهائية للملف بعد المعالجة
    const finalRecord = await prisma.file.findUnique({ where: { id: fileRecord.id } });

    // د) التحقق من نجاح العملية
    if (!finalRecord || finalRecord.status === 'error') {
      throw new AppError(
        `فشل معالجة الملف: ${finalRecord?.errorMessage || 'خطأ غير معروف أثناء المعالجة'}`, 
        400
      );
    }

    // هـ) إعادة الملف المحدث (الناجح)
    return finalRecord;
  }

  // 2. الدالة الخاصة لمعالجة الملف مع Gemini
  private async processFileWithGemini(fileId: string) {
    const fileRecord = await prisma.file.findUnique({ where: { id: fileId } });
    if (!fileRecord) return;

    try {
      console.log(`🚀 Starting Gemini upload for: ${fileRecord.originalFilename}`);

      const mimeType = this.getMimeType(fileRecord.fileType);

      // رفع الملف إلى سيرفرات جوجل
      const uploadResult = await fileManager.uploadFile(fileRecord.storagePath, {
        mimeType,
        displayName: fileRecord.originalFilename,
      });

      let geminiFile = uploadResult.file;
      console.log(`✅ Uploaded to Gemini, waiting for processing...`);

      // حلقة الانتظار (Polling) للتحقق من جاهزية الملف
      while (geminiFile.state === FileState.PROCESSING) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // انتظار ثانيتين
        geminiFile = await fileManager.getFile(geminiFile.name);
      }

      if (geminiFile.state === FileState.FAILED) {
        throw new Error('Google Gemini marked the file as FAILED');
      }

      // تحديث الحالة إلى "مكتمل" وحفظ بيانات Gemini
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
      console.log(`🎉 File ${fileId} is ready and active!`);

    } catch (error: any) {
      console.error(`❌ Error processing file ${fileId}:`, error);
      
      // في حال الفشل، نحدث الحالة إلى error ونسجل السبب
      await prisma.file.update({
        where: { id: fileId },
        data: { 
          status: 'error', 
          errorMessage: error.message 
        },
      });
      // نعيد رمي الخطأ ليعلم به المستدعي (uploadFile)
      throw error; 
    }
  }

  // 3. جلب ملفات المستخدم (مع Pagination)
  async getUserFiles(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: { // نحدد الحقول المطلوبة لتقليل حجم البيانات
            id: true,
            originalFilename: true,
            fileType: true,
            fileSize: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            errorMessage: true
        }
      }),
      prisma.file.count({ where: { userId } }),
    ]);

    // تحويل BigInt إلى Number لضمان التوافق مع JSON
    const sanitizedFiles = files.map(f => ({
      ...f,
      fileSize: Number(f.fileSize)
    }));

    return { 
      items: sanitizedFiles, 
      total, 
      page,
      pages: Math.ceil(total / limit) 
    };
  }

  // 4. جلب حالة ملف معين (للتحديث المباشر في الواجهة)
  async getFileStatus(userId: string, fileId: string) {
    const file = await prisma.file.findFirst({
        where: { id: fileId, userId },
        select: { status: true, errorMessage: true }
    });

    if (!file) throw new AppError('الملف غير موجود', 404);
    return file;
  }

  // 5. حذف الملف (من كل مكان)
  async deleteFile(userId: string, fileId: string) {
    const file = await prisma.file.findFirst({ where: { id: fileId, userId } });
    if (!file) throw new AppError('الملف غير موجود', 404);

    // أ) الحذف من Gemini
    if (file.metadata && (file.metadata as any).geminiFileName) {
      try {
        await fileManager.deleteFile((file.metadata as any).geminiFileName);
        console.log('🗑️ Deleted from Gemini');
      } catch (e) {
        console.warn('⚠️ Could not delete from Gemini (might be already deleted)');
      }
    }

    // ب) الحذف من السيرفر المحلي
    try {
      if (file.storagePath) {
        await fs.unlink(file.storagePath);
        console.log('🗑️ Deleted local file');
      }
    } catch (e) { console.warn('⚠️ Local file missing'); }

    // ج) الحذف من قاعدة البيانات
    await prisma.file.delete({ where: { id: fileId } });
    return true;
  }

  // دالة مساعدة لتحديد نوع الملف
  private getMimeType(ext: string): string {
    const map: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.csv': 'text/csv',
      '.js': 'text/javascript',
      '.py': 'text/x-python',
      '.ts': 'text/typescript',
      '.java': 'text/x-java-source',
      '.html': 'text/html',
      '.css': 'text/css'
    };
    return map[ext] || 'application/octet-stream';
  }
}

// تصدير نسخة واحدة من الكلاس (Singleton)
export const filesService = new FileService();