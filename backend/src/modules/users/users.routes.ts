import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js'; // ما زال في مكانه القديم مؤقتاً
import { validate } from '../../common/middleware/validate.js';
import { UpdateProfileSchema, ChangePasswordSchema, UpdateProfileImageSchema } from './users.schema.js';
import * as userController from './users.controller.js';

const router = Router();

// جميع الروابط هنا تتطلب تسجيل دخول
router.use(authenticate);

router.get('/me', userController.getMe);
router.get('/stats', userController.getStats);

router.put(
  '/profile', 
  validate(UpdateProfileSchema), 
  userController.updateProfile
);

router.put(
  '/profile-image',
  validate(UpdateProfileImageSchema),
  userController.updateProfileImage
);

router.delete('/profile-image', userController.deleteProfileImage);

router.put(
  '/password', 
  validate(ChangePasswordSchema), 
  userController.changePassword
);

router.delete('/account', userController.deleteAccount);

router.get('/export-data', userController.exportData);

export default router;