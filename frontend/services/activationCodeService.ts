import { API_ENDPOINTS, getApiUrl, getAuthHeaders } from '../config/api';

export const activationCodeService = {
  // تفعيل كود
  async activate(code: string) {
    const response = await fetch(getApiUrl(API_ENDPOINTS.ACTIVATE_CODE), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تفعيل الكود');
    }

    return response.json();
  },
};
