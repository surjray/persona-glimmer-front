import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { MessageModel } from '../models/Message';
import { UserTopicInteractionModel } from '../models/UserTopicInteraction';
import { TopicModel } from '../models/Topic';
import { AgentModel } from '../models/Agent';
import { UserModel } from '../models/User';
import { OpenAIService } from '../services/openai.service';
import { AgentService } from '../services/agent.service';
import { ValidationError } from '../utils/errors';
import { sanitizeMessageContent } from '../utils/sanitize';
import { z } from 'zod';

const sendMessageSchema = z.object({
  body: z.object({
    topicId: z.number().int().positive(),
    content: z.string().min(1, 'Message content is required'),
  }),
});

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new ValidationError('User not authenticated');
    }

    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Invalid request body');
    }

    let { topicId, content } = req.body;
    
    // Validate topicId
    if (!topicId || typeof topicId !== 'number') {
      throw new ValidationError('Topic ID is required and must be a number');
    }
    
    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new ValidationError('Message content is required');
    }
    
    // Sanitize message content
    content = sanitizeMessageContent(content);

    // Check if topic is locked
    const interaction = await UserTopicInteractionModel.findOrCreate(
      req.userId,
      topicId
    );

    if (interaction.is_locked && !interaction.survey_completed) {
      throw new ValidationError(
        'Topic is locked. Please complete the survey to continue.'
      );
    }

    // Get topic
    const topic = await TopicModel.findById(topicId);
    if (!topic) {
      throw new ValidationError('Topic not found');
    }

    // Get user and agent
    const user = await UserModel.findById(req.userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    const agent = await AgentModel.findById(user.assigned_agent_id);
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    // Get guardrails
    const guardrails = await AgentService.getGlobalGuardrails();

    // Get chat history
    const chatHistory = await MessageModel.findByUserAndTopic(
      req.userId,
      topicId
    );

    // Save user message
    const userMessage = await MessageModel.create({
      userId: req.userId,
      topicId,
      role: 'user',
      content,
    });

    // Generate agent response with error handling
    let agentResponseContent: string;
    try {
      agentResponseContent = await OpenAIService.generateAgentResponse(
        agent,
        topic,
        guardrails,
        chatHistory,
        content
      );
    } catch (error: any) {
      // Log error for debugging (minimal in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('OpenAI service error in chat:', error.message);
      } else {
        console.error('OpenAI service error:', error.name);
      }
      
      // Provide a helpful fallback message instead of failing completely
      agentResponseContent = `I apologize, but I'm having trouble processing your message right now. Could you please rephrase your question or try again in a moment?`;
    }

    // Save agent message
    const agentMessage = await MessageModel.create({
      userId: req.userId,
      topicId,
      role: 'agent',
      content: agentResponseContent,
    });

    // Increment interaction count
    const updatedInteraction = await UserTopicInteractionModel.incrementInteraction(
      req.userId,
      topicId
    );

    res.json({
      success: true,
      data: {
        userMessage: MessageModel.toPublic(userMessage),
        agentMessage: MessageModel.toPublic(agentMessage),
        interactionCount: updatedInteraction.interaction_count,
        isLocked: updatedInteraction.is_locked,
        shouldShowSurvey: updatedInteraction.is_locked,
      },
    });
  } catch (error: any) {
    // Log error details only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Chat sendMessage error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        userId: req.userId,
        topicId: req.body?.topicId,
      });
    } else {
      // In production, log minimal info without sensitive data
      console.error('Chat sendMessage error:', error.name, error.message);
    }
    next(error);
  }
};

export const getChatHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new ValidationError('User not authenticated');
    }

    const topicId = parseInt(req.params.topicId);
    if (isNaN(topicId)) {
      throw new ValidationError('Invalid topic ID');
    }

    const messages = await MessageModel.findByUserAndTopic(
      req.userId,
      topicId
    );

    res.json({
      success: true,
      data: {
        messages: messages.map(MessageModel.toPublic),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChatStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new ValidationError('User not authenticated');
    }

    const topicId = parseInt(req.params.topicId);
    if (isNaN(topicId)) {
      throw new ValidationError('Invalid topic ID');
    }

    const interaction = await UserTopicInteractionModel.findOrCreate(
      req.userId,
      topicId
    );

    res.json({
      success: true,
      data: {
        interactionCount: interaction.interaction_count,
        isLocked: interaction.is_locked,
        surveyCompleted: interaction.survey_completed,
        maxInteractions: 10,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { sendMessageSchema };
