import { Router, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import {
  requireAdmin,
  verifyAdminKey,
  getAllUsers,
  getAllMessages,
  getAllLiteracySurveyResponses,
  getAllPostTopicSurveyResponses,
  getUserData,
  getDashboardStats,
  runMigrations,
  runSeeds,
} from '../controllers/admin.controller';

// Rate limiting for admin endpoints — also throttles brute-forcing of the API key,
// since failed (401) attempts count against the limit
const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many admin requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// All admin routes are rate-limited and require the admin API key
router.use(adminRateLimiter);
router.use(requireAdmin as RequestHandler);

// Key verification (used by the admin dashboard login form)
router.get('/verify', verifyAdminKey as RequestHandler);

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

// Run migrations (POST to trigger)
router.post('/migrations/run', runMigrations as RequestHandler);

// Run seeds (POST to trigger)
router.post('/seeds/run', runSeeds as RequestHandler);

export default router;
