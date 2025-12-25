import api from '../config/api';

export const activationCodeService = {
  activate: async (code: string) => {
    const response = await api.post('/users/activate-code', { code });
    return response.data;
  },
};