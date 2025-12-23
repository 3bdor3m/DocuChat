import { Router } from 'express';
import { validate } from '../../common/middleware/validate.js';
import { RegisterSchema, LoginSchema } from './auth.schema.js';
import * as authController from './auth.controller.js';

const router = Router();

router.post(
  '/register',
  validate(RegisterSchema), // 1. تحقق
  authController.register   // 2. نفذ
);

router.post(
  '/login',
  validate(LoginSchema),
  authController.login
);

export default router;