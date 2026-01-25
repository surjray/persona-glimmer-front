import { Router } from 'express';
import {
  sendMessage,
  getChatHistory,
  getChatStatus,
  sendMessageSchema,
} from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for chat endpoints
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many chat requests, please try again later.',
});

router.post(
  '/message',
  authenticate,
  chatRateLimiter,
  validate(sendMessageSchema),
  sendMessage
);
router.get('/messages/:topicId', authenticate, getChatHistory);
router.get('/status/:topicId', authenticate, getChatStatus);

export default router;
