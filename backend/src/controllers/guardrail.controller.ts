import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AgentService } from '../services/agent.service';

export const getGuardrails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const guardrails = await AgentService.getGlobalGuardrails();

    if (!guardrails) {
      res.json({
        success: true,
        data: {
          guardrails: null,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        guardrails: {
          id: guardrails.id,
          title: guardrails.title,
          content: guardrails.content,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
