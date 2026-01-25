import { Router } from 'express';
import { getGuardrails } from '../controllers/guardrail.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getGuardrails);

export default router;
