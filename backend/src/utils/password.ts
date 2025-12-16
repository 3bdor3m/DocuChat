import bcrypt from 'bcrypt';

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (enteredPassword: string, storedHash: string): Promise<boolean> => {
  return bcrypt.compare(enteredPassword, storedHash);
};

// Generate reset token (هذا الجزء لا يعتمد على bcrypt غالباً، لكن سأضعه لك لضمان الملف كاملاً)
import crypto from 'crypto';

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashResetToken = (token: string): string => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};