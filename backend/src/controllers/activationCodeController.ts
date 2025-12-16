import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const activateCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const userId = (req as any).user.userId;

    if (!code || code.length !== 10 || !/^\d{10}$/.test(code)) {
      return res.status(400).json({
        error: 'كود التفعيل يجب أن يكون مكون من 10 أرقام'
      });
    }

    const activationCode = await prisma.activationCode.findUnique({
      where: { code }
    });

    if (!activationCode) {
      return res.status(404).json({
        error: 'كود التفعيل غير صحيح'
      });
    }

    if (activationCode.isUsed) {
      return res.status(400).json({
        error: 'هذا الكود تم استخدامه من قبل'
      });
    }

    if (activationCode.expiresAt && new Date() > activationCode.expiresAt) {
      return res.status(400).json({
        error: 'هذا الكود منتهي الصلاحية'
      });
    }

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