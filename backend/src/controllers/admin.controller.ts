import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { ValidationError } from '../utils/errors';

// Simple admin authentication - check for admin API key in header
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'dev-admin-key-change-in-production';

export interface AdminRequest extends Express.Request {
  headers: {
    'x-admin-api-key'?: string;
  };
}

// Middleware to check admin access
export const requireAdmin = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-admin-api-key'];
  
  // In development, if ADMIN_API_KEY is not set in env, allow access
  // Otherwise, require the key to match
  if (process.env.NODE_ENV === 'development' && ADMIN_API_KEY === 'dev-admin-key-change-in-production') {
    // No admin key configured, allow in dev mode
    return next();
  }
  
  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized: Admin API key required',
        code: 'ADMIN_UNAUTHORIZED',
      },
    });
    return;
  }
  
  next();
};

// Get all users with their agent assignments and progress
export const getAllUsers = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await query(
      `SELECT 
        u.id,
        u.email,
        u.assigned_agent_id,
        u.current_topic_index,
        u.has_completed_literacy_survey,
        u.created_at,
        u.updated_at,
        a.emotional_intelligence_level as agent_eq,
        a.cognitive_intelligence_level as agent_iq
      FROM users u
      LEFT JOIN agents a ON u.assigned_agent_id = a.id
      ORDER BY u.created_at DESC`
    );

    res.json({
      success: true,
      data: {
        users: result.rows.map((row) => ({
          id: row.id,
          email: row.email,
          assignedAgentId: row.assigned_agent_id,
          agentEQ: row.agent_eq,
          agentIQ: row.agent_iq,
          currentTopicIndex: row.current_topic_index,
          hasCompletedLiteracySurvey: row.has_completed_literacy_survey,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
        total: result.rows.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all chat messages with user and topic information
export const getAllMessages = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, topicId, limit, offset } = req.query;
    
    let queryStr = `
      SELECT 
        m.id,
        m.user_id,
        m.topic_id,
        m.role,
        m.content,
        m.timestamp,
        m.created_at,
        u.email as user_email,
        t.title as topic_title
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN topics t ON m.topic_id = t.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 1;
    
    if (userId) {
      queryStr += ` AND m.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }
    
    if (topicId) {
      queryStr += ` AND m.topic_id = $${paramCount}`;
      params.push(parseInt(topicId as string));
      paramCount++;
    }
    
    queryStr += ` ORDER BY m.timestamp DESC`;
    
    if (limit) {
      queryStr += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit as string));
      paramCount++;
    } else {
      queryStr += ` LIMIT 1000`; // Default limit
    }
    
    if (offset) {
      queryStr += ` OFFSET $${paramCount}`;
      params.push(parseInt(offset as string));
    }
    
    const result = await query(queryStr, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM messages WHERE 1=1`;
    const countParams: any[] = [];
    let countParamCount = 1;
    
    if (userId) {
      countQuery += ` AND user_id = $${countParamCount}`;
      countParams.push(userId);
      countParamCount++;
    }
    
    if (topicId) {
      countQuery += ` AND topic_id = $${countParamCount}`;
      countParams.push(parseInt(topicId as string));
    }
    
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      success: true,
      data: {
        messages: result.rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          userEmail: row.user_email,
          topicId: row.topic_id,
          topicTitle: row.topic_title,
          role: row.role,
          content: row.content,
          timestamp: row.timestamp,
          createdAt: row.created_at,
        })),
        total,
        limit: limit ? parseInt(limit as string) : 1000,
        offset: offset ? parseInt(offset as string) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all AI literacy survey responses
export const getAllLiteracySurveyResponses = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.query;
    
    let queryStr = `
      SELECT 
        r.id,
        r.user_id,
        r.question_id,
        r.response_value,
        r.created_at,
        u.email as user_email
      FROM ai_literacy_survey_responses r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 1;
    
    if (userId) {
      queryStr += ` AND r.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }
    
    queryStr += ` ORDER BY r.created_at DESC`;
    
    const result = await query(queryStr, params);
    
    res.json({
      success: true,
      data: {
        responses: result.rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          userEmail: row.user_email,
          questionId: row.question_id,
          responseValue: row.response_value,
          createdAt: row.created_at,
        })),
        total: result.rows.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all post-topic survey responses
export const getAllPostTopicSurveyResponses = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, topicId } = req.query;
    
    let queryStr = `
      SELECT 
        r.id,
        r.user_id,
        r.topic_id,
        r.question_id,
        r.response_value,
        r.created_at,
        u.email as user_email,
        t.title as topic_title
      FROM post_topic_survey_responses r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN topics t ON r.topic_id = t.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 1;
    
    if (userId) {
      queryStr += ` AND r.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }
    
    if (topicId) {
      queryStr += ` AND r.topic_id = $${paramCount}`;
      params.push(parseInt(topicId as string));
      paramCount++;
    }
    
    queryStr += ` ORDER BY r.created_at DESC`;
    
    const result = await query(queryStr, params);
    
    res.json({
      success: true,
      data: {
        responses: result.rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          userEmail: row.user_email,
          topicId: row.topic_id,
          topicTitle: row.topic_title,
          questionId: row.question_id,
          responseValue: row.response_value,
          createdAt: row.created_at,
        })),
        total: result.rows.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get comprehensive user data (user + messages + surveys)
export const getUserData = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      throw new ValidationError('User ID is required');
    }
    
    // Get user
    const userResult = await query(
      `SELECT 
        u.*,
        a.emotional_intelligence_level as agent_eq,
        a.cognitive_intelligence_level as agent_iq
      FROM users u
      LEFT JOIN agents a ON u.assigned_agent_id = a.id
      WHERE u.id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      throw new ValidationError('User not found');
    }
    
    const user = userResult.rows[0];
    
    // Get all messages
    const messagesResult = await query(
      `SELECT 
        m.*,
        t.title as topic_title
      FROM messages m
      LEFT JOIN topics t ON m.topic_id = t.id
      WHERE m.user_id = $1
      ORDER BY m.timestamp ASC`,
      [userId]
    );
    
    // Get literacy survey responses
    const literacyResult = await query(
      `SELECT * FROM ai_literacy_survey_responses WHERE user_id = $1`,
      [userId]
    );
    
    // Get post-topic survey responses
    const postTopicResult = await query(
      `SELECT 
        r.*,
        t.title as topic_title
      FROM post_topic_survey_responses r
      LEFT JOIN topics t ON r.topic_id = t.id
      WHERE r.user_id = $1`,
      [userId]
    );
    
    // Get topic interactions
    const interactionsResult = await query(
      `SELECT 
        i.*,
        t.title as topic_title
      FROM user_topic_interactions i
      LEFT JOIN topics t ON i.topic_id = t.id
      WHERE i.user_id = $1
      ORDER BY i.topic_id ASC`,
      [userId]
    );
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          assignedAgentId: user.assigned_agent_id,
          agentEQ: user.agent_eq,
          agentIQ: user.agent_iq,
          currentTopicIndex: user.current_topic_index,
          hasCompletedLiteracySurvey: user.has_completed_literacy_survey,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        messages: messagesResult.rows.map((row) => ({
          id: row.id,
          topicId: row.topic_id,
          topicTitle: row.topic_title,
          role: row.role,
          content: row.content,
          timestamp: row.timestamp,
          createdAt: row.created_at,
        })),
        literacySurveyResponses: literacyResult.rows.map((row) => ({
          id: row.id,
          questionId: row.question_id,
          responseValue: row.response_value,
          createdAt: row.created_at,
        })),
        postTopicSurveyResponses: postTopicResult.rows.map((row) => ({
          id: row.id,
          topicId: row.topic_id,
          topicTitle: row.topic_title,
          questionId: row.question_id,
          responseValue: row.response_value,
          createdAt: row.created_at,
        })),
        topicInteractions: interactionsResult.rows.map((row) => ({
          id: row.id,
          topicId: row.topic_id,
          topicTitle: row.topic_title,
          interactionCount: row.interaction_count,
          isLocked: row.is_locked,
          surveyCompleted: row.survey_completed,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
export const getDashboardStats = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Total users
    const usersCount = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersCount.rows[0].count);
    
    // Total messages
    const messagesCount = await query('SELECT COUNT(*) as count FROM messages');
    const totalMessages = parseInt(messagesCount.rows[0].count);
    
    // Users who completed literacy survey
    const literacyCount = await query(
      'SELECT COUNT(*) as count FROM users WHERE has_completed_literacy_survey = TRUE'
    );
    const completedLiteracySurvey = parseInt(literacyCount.rows[0].count);
    
    // Total topic interactions (handle case where table might be empty)
    let totalInteractions = 0;
    try {
      const interactionsCount = await query(
        'SELECT SUM(interaction_count) as total FROM user_topic_interactions'
      );
      totalInteractions = parseInt(interactionsCount.rows[0].total || '0');
    } catch (err) {
      // Table might not exist or be empty
      totalInteractions = 0;
    }
    
    // Total post-topic surveys completed (count distinct user_id, topic_id pairs)
    let completedPostTopicSurveys = 0;
    try {
      const postTopicCount = await query(
        'SELECT COUNT(*) as count FROM (SELECT DISTINCT user_id, topic_id FROM post_topic_survey_responses) as distinct_surveys'
      );
      completedPostTopicSurveys = parseInt(postTopicCount.rows[0].count || '0');
    } catch (err) {
      // Table might not exist or be empty
      completedPostTopicSurveys = 0;
    }
    
    // Agent distribution
    const agentDist = await query(
      `SELECT 
        assigned_agent_id,
        COUNT(*) as count
      FROM users
      GROUP BY assigned_agent_id
      ORDER BY assigned_agent_id`
    );
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalMessages,
        completedLiteracySurvey,
        totalInteractions,
        completedPostTopicSurveys,
        agentDistribution: agentDist.rows.map((row) => ({
          agentId: row.assigned_agent_id,
          userCount: parseInt(row.count),
        })),
      },
    });
  } catch (error: any) {
    // Enhanced error logging
    console.error('Admin dashboard error:', error.message);
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      console.error('Database connection timeout. Check DATABASE_URL and network connectivity.');
    }
    next(error);
  }
};
