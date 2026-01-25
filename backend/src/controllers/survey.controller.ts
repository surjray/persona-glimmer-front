import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserModel } from '../models/User';
import { UserTopicInteractionModel } from '../models/UserTopicInteraction';
import { query } from '../config/database';
import { ValidationError, ConflictError } from '../utils/errors';
import { sanitizeString } from '../utils/sanitize';
import { z } from 'zod';

const surveyResponseSchema = z.object({
  questionId: z.string(),
  value: z.union([z.number(), z.string()]),
});

const literacySurveySchema = z.object({
  body: z.object({
    responses: z.array(surveyResponseSchema).min(1),
  }),
});

const postTopicSurveySchema = z.object({
  body: z.object({
    topicId: z.number().int().positive(),
    responses: z
      .array(
        z.object({
          questionId: z.string(),
          value: z.number().int().min(1).max(7),
        })
      )
      .length(16, 'Must have exactly 16 responses'),
  }),
});

export const submitLiteracySurvey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new ValidationError('User not authenticated');
    }

    const { responses } = req.body;

    // Check if already completed
    const user = await UserModel.findById(req.userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    if (user.has_completed_literacy_survey) {
      throw new ConflictError('AI literacy survey already completed');
    }

    // Save responses
    for (const response of responses) {
      const sanitizedQuestionId = sanitizeString(response.questionId);
      await query(
        `INSERT INTO ai_literacy_survey_responses (user_id, question_id, response_value)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, question_id) DO UPDATE SET response_value = $3`,
        [req.userId, sanitizedQuestionId, String(response.value)]
      );
    }

    // Mark survey as completed
    await UserModel.markLiteracySurveyCompleted(req.userId);

    res.json({
      success: true,
      data: {
        message: 'Survey submitted successfully',
        userState: {
          hasCompletedLiteracySurvey: true,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitPostTopicSurvey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new ValidationError('User not authenticated');
    }

    const { topicId, responses } = req.body;

    // Validate exactly 16 responses
    if (responses.length !== 16) {
      throw new ValidationError('Must have exactly 16 responses');
    }

    // Check if topic is locked and survey not completed
    const interaction = await UserTopicInteractionModel.findOrCreate(
      req.userId,
      topicId
    );

    if (!interaction.is_locked) {
      throw new ValidationError(
        'Survey is not required yet. Complete 10 interactions first.'
      );
    }

    if (interaction.survey_completed) {
      throw new ConflictError('Survey already completed for this topic');
    }

    // Save responses
    for (const response of responses) {
      const sanitizedQuestionId = sanitizeString(response.questionId);
      await query(
        `INSERT INTO post_topic_survey_responses 
         (user_id, topic_id, question_id, response_value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, topic_id, question_id) DO UPDATE SET response_value = $4`,
        [req.userId, topicId, sanitizedQuestionId, response.value]
      );
    }

    // Mark survey as completed
    await UserTopicInteractionModel.markSurveyCompleted(req.userId, topicId);

    // Unlock next topic
    await UserTopicInteractionModel.unlockNextTopic(req.userId);

    // Get new topic index
    const user = await UserModel.findById(req.userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    res.json({
      success: true,
      data: {
        message: 'Survey submitted successfully',
        nextTopicUnlocked: true,
        nextTopicIndex: user.current_topic_index,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLiteracySurveyStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new ValidationError('User not authenticated');
    }

    const user = await UserModel.findById(req.userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    res.json({
      success: true,
      data: {
        hasCompleted: user.has_completed_literacy_survey,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { literacySurveySchema, postTopicSurveySchema };
