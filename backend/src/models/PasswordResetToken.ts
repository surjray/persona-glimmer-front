import { query } from '../config/database';
import crypto from 'crypto';

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export class PasswordResetTokenModel {
  static async create(userId: string, expiresInHours: number = 24): Promise<PasswordResetToken> {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Invalidate any existing tokens for this user
    await query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
      [userId]
    );

    const result = await query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, token, expiresAt]
    );

    return result.rows[0] as PasswordResetToken;
  }

  static async findByToken(token: string): Promise<PasswordResetToken | null> {
    const result = await query(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND used = FALSE',
      [token]
    );

    return result.rows[0] as PasswordResetToken || null;
  }

  static async isValid(token: string): Promise<boolean> {
    const resetToken = await this.findByToken(token);
    
    if (!resetToken) {
      return false;
    }

    // Check if token is expired
    if (new Date() > resetToken.expires_at) {
      return false;
    }

    return true;
  }

  static async markAsUsed(token: string): Promise<void> {
    await query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE token = $1',
      [token]
    );
  }

  static async cleanupExpiredTokens(): Promise<void> {
    // Delete tokens older than 7 days
    await query(
      'DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL \'7 days\' OR used = TRUE',
      []
    );
  }
}
