import { query } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { NotFoundError, ConflictError } from '../utils/errors';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  assigned_agent_id: number;
  current_topic_index: number;
  has_completed_literacy_survey: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
}

export interface UserPublic {
  id: string;
  email: string;
  assignedAgentId: number;
  currentTopicIndex: number;
  hasCompletedLiteracySurvey: boolean;
}

export class UserModel {
  static async create(data: CreateUserData): Promise<User> {
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [data.email]
    );

    if (existingUser.rows.length > 0) {
      throw new ConflictError('Email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Randomly assign agent (1-9)
    const assignedAgentId = Math.floor(Math.random() * 9) + 1;

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, assigned_agent_id, current_topic_index, has_completed_literacy_survey)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.email, passwordHash, assignedAgentId, 0, false]
    );

    return result.rows[0] as User;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] as User || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] as User || null;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return comparePassword(password, user.password_hash);
  }

  static async updateTopicIndex(userId: string, topicIndex: number): Promise<void> {
    await query(
      'UPDATE users SET current_topic_index = $1, updated_at = NOW() WHERE id = $2',
      [topicIndex, userId]
    );
  }

  static async markLiteracySurveyCompleted(userId: string): Promise<void> {
    await query(
      'UPDATE users SET has_completed_literacy_survey = TRUE, updated_at = NOW() WHERE id = $1',
      [userId]
    );
  }

  static async updatePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await hashPassword(newPassword);
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );
  }

  static toPublic(user: User): UserPublic {
    return {
      id: user.id,
      email: user.email,
      assignedAgentId: user.assigned_agent_id,
      currentTopicIndex: user.current_topic_index,
      hasCompletedLiteracySurvey: user.has_completed_literacy_survey,
    };
  }
}
