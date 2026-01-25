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
    // Enhanced error logging
    console.error('Unhandled error:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.stack) {
      console.error('Error stack:', err.stack);
    }
    if ((err as any).code) {
      console.error('Error code:', (err as any).code);
    }
    
    let errorMessage = 'Internal server error';
    if (process.env.NODE_ENV === 'development') {
      errorMessage = err.message || 'Internal server error';
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: errorMessage,
        code: 'INTERNAL_ERROR',
      },
    });
  }
};
