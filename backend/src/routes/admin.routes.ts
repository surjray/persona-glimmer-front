import { Router, RequestHandler } from 'express';
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
router.use(requireAdmin as RequestHandler);

// Dashboard statistics
router.get('/dashboard', getDashboardStats as RequestHandler);

// Get all users
router.get('/users', getAllUsers as RequestHandler);

// Get all messages (with optional filters: ?userId=xxx&topicId=xxx&limit=100&offset=0)
router.get('/messages', getAllMessages as RequestHandler);

// Get all AI literacy survey responses (with optional filter: ?userId=xxx)
router.get('/surveys/literacy', getAllLiteracySurveyResponses as RequestHandler);

// Get all post-topic survey responses (with optional filters: ?userId=xxx&topicId=xxx)
router.get('/surveys/post-topic', getAllPostTopicSurveyResponses as RequestHandler);

// Get comprehensive data for a specific user
router.get('/users/:userId', getUserData as RequestHandler);

export default router;
