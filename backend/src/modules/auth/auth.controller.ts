import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync.js';
import { authService } from './auth.service.js';

// Register Controller
export const register = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  
  res.status(201).json({
    status: 'success',
    data: { user },
  });
});

// Login Controller
export const login = catchAsync(async (req: Request, res: Response) => {
  const { user, token } = await authService.login(req.body);

  // إعداد الكوكيز
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
    maxAge: 3600 * 1000, // 1 hour
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token,
    data: { user },
  });
});