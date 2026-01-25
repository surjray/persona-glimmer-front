import { Router } from 'express';
import {
  requireAdmin,
  getAllUsers,
  getAllMessages,
  getAllLiteracySurveyResponses,
  getAllPostTopicSurveyResponses,
  getUserData,
  getDashboardStats,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require admin API key
router.use(requireAdmin);

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// Get all users
router.get('/users', getAllUsers);

// Get all messages (with optional filters: ?userId=xxx&topicId=xxx&limit=100&offset=0)
router.get('/messages', getAllMessages);

// Get all AI literacy survey responses (with optional filter: ?userId=xxx)
router.get('/surveys/literacy', getAllLiteracySurveyResponses);

// Get all post-topic survey responses (with optional filters: ?userId=xxx&topicId=xxx)
router.get('/surveys/post-topic', getAllPostTopicSurveyResponses);

// Get comprehensive data for a specific user
router.get('/users/:userId', getUserData);

export default router;
