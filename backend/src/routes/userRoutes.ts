import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getUserStats,
  updateProfile,
  updateProfileImage,
  changePassword,
  deleteAccount,
  exportUserData,
} from '../controllers/userController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user stats
router.get('/stats', getUserStats);

// Update profile
router.put('/profile', updateProfile);

// Update profile image
router.put('/profile-image', updateProfileImage);

// Change password
router.put('/password', changePassword);

// Delete account
router.delete('/account', deleteAccount);

// Export user data
router.post('/export-data', exportUserData);

export default router;
