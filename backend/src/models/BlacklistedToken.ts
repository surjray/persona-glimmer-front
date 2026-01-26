import { query } from '../config/database';
import jwt from 'jsonwebtoken';

export interface BlacklistedToken {
  id: string;
  token_id: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
}

export class BlacklistedTokenModel {
  /**
   * Extract token ID from JWT token
   * Uses the JWT signature as a unique identifier
   */
  static getTokenId(token: string): string {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === 'string') {
        // Fallback: use hash of token
        return Buffer.from(token).toString('base64').substring(0, 100);
      }
      // Use the signature part of the JWT as the token ID
      const parts = token.split('.');
      return parts[2] || Buffer.from(token).toString('base64').substring(0, 100);
    } catch {
      // Fallback: use hash of token
      return Buffer.from(token).toString('base64').substring(0, 100);
    }
  }

  /**
   * Get expiration time from JWT token
   */
  static getTokenExpiration(token: string): Date {
    try {
      const decoded = jwt.decode(token) as { exp?: number };
      if (decoded?.exp) {
        return new Date(decoded.exp * 1000);
      }
      // Default to 7 days from now (matching token expiration)
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } catch {
      // Default to 7 days from now
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Blacklist a token
   */
  static async blacklist(token: string, userId: string): Promise<BlacklistedToken> {
    const tokenId = this.getTokenId(token);
    const expiresAt = this.getTokenExpiration(token);

    const result = await query(
      `INSERT INTO blacklisted_tokens (token_id, user_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (token_id) DO UPDATE SET expires_at = EXCLUDED.expires_at
       RETURNING *`,
      [tokenId, userId, expiresAt]
    );

    return result.rows[0] as BlacklistedToken;
  }

  /**
   * Check if a token is blacklisted
   * Returns false if table doesn't exist (graceful degradation)
   */
  static async isBlacklisted(token: string): Promise<boolean> {
    try {
      const tokenId = this.getTokenId(token);

      const result = await query(
        `SELECT * FROM blacklisted_tokens 
         WHERE token_id = $1 AND expires_at > NOW()`,
        [tokenId]
      );

      return result.rows.length > 0;
    } catch (error: any) {
      // If table doesn't exist (42P01) or any other error, return false
      // This allows the system to work without the blacklist table
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return false; // Table doesn't exist, so token is not blacklisted
      }
      // For other errors, log and return false (don't block authentication)
      console.warn('Error checking blacklist, allowing authentication:', error.message);
      return false;
    }
  }

  /**
   * Clean up expired blacklisted tokens
   */
  static async cleanupExpired(): Promise<number> {
    const result = await query(
      `DELETE FROM blacklisted_tokens WHERE expires_at < NOW()`
    );
    return result.rowCount || 0;
  }

  /**
   * Get all blacklisted tokens for a user (for debugging/admin)
   */
  static async findByUserId(userId: string): Promise<BlacklistedToken[]> {
    const result = await query(
      `SELECT * FROM blacklisted_tokens 
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows as BlacklistedToken[];
  }
}
