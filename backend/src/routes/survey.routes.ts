import { Router } from 'express';
import {
  submitLiteracySurvey,
  submitPostTopicSurvey,
  getLiteracySurveyStatus,
  literacySurveySchema,
  postTopicSurveySchema,
} from '../controllers/survey.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/literacy',
  authenticate,
  validate(literacySurveySchema),
  submitLiteracySurvey
);
router.post(
  '/post-topic',
  authenticate,
  validate(postTopicSurveySchema),
  submitPostTopicSurvey
);
router.get('/literacy/status', authenticate, getLiteracySurveyStatus);

export default router;
