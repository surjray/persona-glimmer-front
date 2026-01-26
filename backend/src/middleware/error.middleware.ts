import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
      },
    });
  } else {
    // Enhanced error logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Unhandled error:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      if (err.stack) {
        console.error('Error stack:', err.stack);
      }
      if ((err as any).code) {
        console.error('Error code:', (err as any).code);
      }
    } else {
      // In production, log minimal info without stack traces
      console.error('Unhandled error:', err.name, err.message);
    }
    
    // Always return user-friendly error message
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (err.message || 'Internal server error')
      : 'An unexpected error occurred. Please try again or contact support if the problem persists.';
    
    res.status(500).json({
      success: false,
      error: {
        message: errorMessage,
        code: 'INTERNAL_ERROR',
      },
    });
  }
};
