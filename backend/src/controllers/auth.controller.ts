import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { AgentModel } from '../models/Agent';
import { PasswordResetTokenModel } from '../models/PasswordResetToken';
import { generateToken } from '../middleware/auth.middleware';
import { AuthenticationError, ValidationError } from '../utils/errors';
import { sanitizeEmail, sanitizePassword, sanitizeString } from '../utils/sanitize';
import { z } from 'zod';

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { email, password } = req.body;
    
    // Sanitize inputs
    email = sanitizeEmail(email);
    password = sanitizePassword(password);

    // Create user (randomly assigns agent)
    const user = await UserModel.create({ email, password });

    // Get assigned agent
    const agent = await AgentModel.findById(user.assigned_agent_id);
    if (!agent) {
      // This should never happen, but handle gracefully
      throw new ValidationError('Unable to assign agent. Please try again.');
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      success: true,
      data: {
        user: UserModel.toPublic(user),
        agent: AgentModel.toPublic(agent),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { email, password } = req.body;
    
    // Sanitize inputs
    email = sanitizeEmail(email);
    password = sanitizePassword(password);

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isValid = await UserModel.verifyPassword(user, password);
    if (!isValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Get assigned agent
    const agent = await AgentModel.findById(user.assigned_agent_id);
    if (!agent) {
      // This should never happen, but handle gracefully
      throw new ValidationError('Unable to assign agent. Please try again.');
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      data: {
        user: UserModel.toPublic(user),
        agent: AgentModel.toPublic(agent),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { email } = req.body;
    
    // Sanitize input
    email = sanitizeEmail(email);

    // Find user
    const user = await UserModel.findByEmail(email);
    
    // Always return success to prevent email enumeration
    // But only create token if user exists
    if (user) {
      const resetToken = await PasswordResetTokenModel.create(user.id, 24); // 24 hour expiration
      
      // In production, send email here
      // For now, return token in response (for development/testing)
      res.json({
        success: true,
        data: {
          message: 'If an account with that email exists, a password reset token has been generated.',
          // In production, remove this token from response and send via email
          token: process.env.NODE_ENV === 'development' ? resetToken.token : undefined,
        },
      });
    } else {
      // Still return success to prevent email enumeration
      res.json({
        success: true,
        data: {
          message: 'If an account with that email exists, a password reset token has been generated.',
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { token, newPassword } = req.body;
    
    // Sanitize inputs
    token = sanitizeString(token);
    newPassword = sanitizePassword(newPassword);

    if (!token || !newPassword) {
      throw new ValidationError('Token and new password are required');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Validate token
    const isValid = await PasswordResetTokenModel.isValid(token);
    if (!isValid) {
      throw new ValidationError('Invalid or expired reset token');
    }

    // Get token record to find user
    const resetToken = await PasswordResetTokenModel.findByToken(token);
    if (!resetToken) {
      throw new ValidationError('Invalid reset token');
    }

    // Update password
    await UserModel.updatePassword(resetToken.user_id, newPassword);

    // Mark token as used
    await PasswordResetTokenModel.markAsUsed(token);

    res.json({
      success: true,
      data: {
        message: 'Password has been reset successfully. You can now login with your new password.',
      },
    });
  } catch (error) {
    next(error);
  }
};

const requestPasswordResetSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export { registerSchema, loginSchema, requestPasswordResetSchema, resetPasswordSchema };
