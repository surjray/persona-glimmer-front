import { Router } from 'express';
import {
  getAllTopics,
  getCurrentTopic,
  getTopicById,
  getTopicsWithStatus,
} from '../controllers/topic.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getAllTopics);
router.get('/with-status', authenticate, getTopicsWithStatus);
router.get('/current', authenticate, getCurrentTopic);
router.get('/:id', authenticate, getTopicById);

export default router;
