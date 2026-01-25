import { Router } from 'express';
import { getUserState, getUserAgent } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/state', authenticate, getUserState);
router.get('/agent', authenticate, getUserAgent);

export default router;
