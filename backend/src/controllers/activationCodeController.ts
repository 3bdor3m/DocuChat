import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const activateCode = async (req: Request, res: Response) => {
  try {
    // 1. استقبال الكود ومعالجة الفراغات
    let { code } = req.body;
    
    // تنظيف الكود من أي مسافات فارغة قد تأتي بالخطأ عند النسخ
    const cleanCode = code ? code.toString().trim() : '';
    
    // الحصول على معرف المستخدم
    const userId = (req as any).user.userId;

    // 🔥 طباعة الكود في التيرمينال للمراقبة (Debug)
    console.log(`🚀 محاولة تفعيل الكود: "${cleanCode}" للمستخدم: ${userId}`);

    // 2. التحقق من صحة المدخلات (Validation)
    if (!cleanCode || cleanCode.length !== 10 || !/^\d{10}$/.test(cleanCode)) {
      console.log('❌ فشل التحقق من صيغة الكود');
      return res.status(400).json({
        error: 'كود التفعيل يجب أن يكون مكون من 10 أرقام'
      });
    }

    // 3. البحث عن الكود في قاعدة البيانات
    const activationCode = await prisma.activationCode.findUnique({
      where: { code: cleanCode } // استخدام الكود المنظف
    });

    // 4. التحقق من وجود الكود
    if (!activationCode) {
      console.log('❌ الكود غير موجود في قاعدة البيانات');
      return res.status(404).json({
        error: 'كود التفعيل غير صحيح'
      });
    }

    // 5. التحقق مما إذا كان مستخدماً
    if (activationCode.isUsed) {
      console.log('❌ الكود مستخدم مسبقاً');
      return res.status(400).json({
        error: 'هذا الكود تم استخدامه من قبل'
      });
    }

    // 6. التحقق من تاريخ الصلاحية
    if (activationCode.expiresAt && new Date() > activationCode.expiresAt) {
      console.log('❌ الكود منتهي الصلاحية');
      return res.status(400).json({
        error: 'هذا الكود منتهي الصلاحية'
      });
    }

    // 7. تنفيذ العملية (تحديث المستخدم + حرق الكود)
    const [updatedUser, updatedCode] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { subscriptionTier: activationCode.tier }
      }),
      prisma.activationCode.update({
        where: { id: activationCode.id },
        data: {
          isUsed: true,
          usedBy: userId,
          usedAt: new Date()
        }
      })
    ]);

    console.log(`✅ تم التفعيل بنجاح! الباقة الجديدة: ${activationCode.tier}`);

    return res.json({
      message: 'تم تفعيل الكود بنجاح!',
      tier: activationCode.tier,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        subscriptionTier: updatedUser.subscriptionTier
      }
    });

  } catch (error) {
    console.error('Error activating code:', error);
    return res.status(500).json({
      error: 'حدث خطأ أثناء تفعيل الكود'
    });
  }
};

// دالة التوليد كما هي (ممتازة ولا تحتاج تعديل)
export const generateActivationCodes = async (req: Request, res: Response) => {
  try {
    const { count = 1, tier = 'basic', expiresInDays } = req.body;

    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = Math.floor(1000000000 + Math.random() * 9000000000).toString();

      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      const activationCode = await prisma.activationCode.create({
        data: { code, tier, expiresAt }
      });

      codes.push(activationCode);
    }

    return res.json({
      message: `تم إنشاء ${count} كود تفعيل`,
      codes: codes.map(c => ({
        code: c.code,
        tier: c.tier,
        expiresAt: c.expiresAt
      }))
    });

  } catch (error) {
    console.error('Error generating codes:', error);
    return res.status(500).json({
      error: 'حدث خطأ أثناء إنشاء الأكواد'
    });
  }
};