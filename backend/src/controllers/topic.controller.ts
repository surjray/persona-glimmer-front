import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { TopicModel } from '../models/Topic';
import { UserTopicInteractionModel } from '../models/UserTopicInteraction';
import { UserModel } from '../models/User';
import { NotFoundError } from '../utils/errors';

export const getAllTopics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const topics = await TopicModel.findAll();

    res.json({
      success: true,
      data: {
        topics: topics.map(TopicModel.toPublic),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTopicsWithStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new NotFoundError('User');
    }

    const topics = await TopicModel.findAll();
    const user = await UserModel.findById(req.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Get completion status for each topic
    const topicsWithStatus = await Promise.all(
      topics.map(async (topic) => {
        const interaction = await UserTopicInteractionModel.findOrCreate(
          req.userId!,
          topic.id
        );

        const isCurrent = user.current_topic_index + 1 === topic.order_index;
        const isCompleted = interaction.survey_completed;
        const isLocked = interaction.is_locked && !interaction.survey_completed;
        const isAccessible = topic.order_index <= user.current_topic_index + 1;

        return {
          ...TopicModel.toPublic(topic),
          status: isCompleted
            ? 'completed'
            : isCurrent
            ? 'current'
            : isLocked
            ? 'locked'
            : isAccessible
            ? 'accessible'
            : 'locked',
          interactionCount: interaction.interaction_count,
        };
      })
    );

    res.json({
      success: true,
      data: {
        topics: topicsWithStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentTopic = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new NotFoundError('User');
    }

    const topic = await TopicModel.getCurrentTopicForUser(req.userId);
    if (!topic) {
      throw new NotFoundError('Topic');
    }

    const interaction = await UserTopicInteractionModel.findOrCreate(
      req.userId,
      topic.id
    );

    res.json({
      success: true,
      data: {
        topic: TopicModel.toPublic(topic),
        interactionCount: interaction.interaction_count,
        isLocked: interaction.is_locked,
        surveyCompleted: interaction.survey_completed,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTopicById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const topicId = parseInt(req.params.id);
    if (isNaN(topicId)) {
      throw new NotFoundError('Topic');
    }

    const topic = await TopicModel.findById(topicId);
    if (!topic) {
      throw new NotFoundError('Topic');
    }

    res.json({
      success: true,
      data: {
        topic: TopicModel.toPublic(topic),
      },
    });
  } catch (error) {
    next(error);
  }
};
