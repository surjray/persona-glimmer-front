import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserModel } from '../models/User';
import { AgentModel } from '../models/Agent';
import { TopicModel } from '../models/Topic';
import { UserTopicInteractionModel } from '../models/UserTopicInteraction';
import { NotFoundError } from '../utils/errors';

export const getUserState = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new NotFoundError('User');
    }

    // Get user
    const user = await UserModel.findById(req.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Get assigned agent
    const agent = await AgentModel.findById(user.assigned_agent_id);
    if (!agent) {
      throw new Error('Assigned agent not found');
    }

    // Get current topic
    const currentTopic = await TopicModel.getCurrentTopicForUser(req.userId);

    // Get interaction status for current topic
    let interactionStatus = null;
    if (currentTopic) {
      const interaction = await UserTopicInteractionModel.findOrCreate(
        req.userId,
        currentTopic.id
      );
      interactionStatus = {
        interactionCount: interaction.interaction_count,
        isLocked: interaction.is_locked,
        surveyCompleted: interaction.survey_completed,
      };
    }

    // Get progress information
    const completedTopicsCount = await UserTopicInteractionModel.getCompletedTopicsCount(req.userId);
    const totalTopics = 20; // Fixed number of topics
    const completionPercentage = Math.round((completedTopicsCount / totalTopics) * 100);
    const totalInteractions = await UserTopicInteractionModel.getTotalInteractions(req.userId);

    res.json({
      success: true,
      data: {
        user: UserModel.toPublic(user),
        agent: AgentModel.toPublic(agent),
        currentTopic: currentTopic ? TopicModel.toPublic(currentTopic) : null,
        interactionStatus,
        progress: {
          completedTopics: completedTopicsCount,
          totalTopics,
          completionPercentage,
          totalInteractions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAgent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new NotFoundError('User');
    }

    // Get user
    const user = await UserModel.findById(req.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Get assigned agent
    const agent = await AgentModel.findById(user.assigned_agent_id);
    if (!agent) {
      throw new Error('Assigned agent not found');
    }

    res.json({
      success: true,
      data: {
        agent: AgentModel.toPublic(agent),
      },
    });
  } catch (error) {
    next(error);
  }
};
