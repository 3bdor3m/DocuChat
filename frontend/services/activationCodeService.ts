import api from '../config/api'; // أو axios مباشرة حسب إعداداتك

export const activationCodeService = {
  // دالة تفعيل الكود
  activate: async (code: string) => {
    // 👇 نرسل الكود داخل كائن JSON
    const response = await api.post('/activation-codes/activate', { code });
    return response.data;
  },

  // دالة توليد الأكواد (اختياري - لو حبيت تعمل لوحة تحكم أدمن مستقبلاً)
  generate: async (count: number, tier: string) => {
    const response = await api.post('/activation-codes/generate', { count, tier });
    return response.data;
  }
};