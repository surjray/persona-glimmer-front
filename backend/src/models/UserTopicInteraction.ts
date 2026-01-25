import { query } from '../config/database';

export interface UserTopicInteraction {
  id: string;
  user_id: string;
  topic_id: number;
  interaction_count: number;
  is_locked: boolean;
  survey_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export class UserTopicInteractionModel {
  static async findOrCreate(
    userId: string,
    topicId: number
  ): Promise<UserTopicInteraction> {
    // Try to find existing interaction
    let result = await query(
      `SELECT * FROM user_topic_interactions 
       WHERE user_id = $1 AND topic_id = $2`,
      [userId, topicId]
    );

    if (result.rows.length > 0) {
      return result.rows[0] as UserTopicInteraction;
    }

    // Create new interaction record
    result = await query(
      `INSERT INTO user_topic_interactions 
       (user_id, topic_id, interaction_count, is_locked, survey_completed)
       VALUES ($1, $2, 0, FALSE, FALSE)
       RETURNING *`,
      [userId, topicId]
    );

    return result.rows[0] as UserTopicInteraction;
  }

  static async incrementInteraction(
    userId: string,
    topicId: number
  ): Promise<UserTopicInteraction> {
    const interaction = await this.findOrCreate(userId, topicId);
    const newCount = interaction.interaction_count + 1;
    const shouldLock = newCount >= 10;

    const result = await query(
      `UPDATE user_topic_interactions 
       SET interaction_count = $1, 
           is_locked = $2,
           updated_at = NOW()
       WHERE user_id = $3 AND topic_id = $4
       RETURNING *`,
      [newCount, shouldLock, userId, topicId]
    );

    return result.rows[0] as UserTopicInteraction;
  }

  static async markSurveyCompleted(
    userId: string,
    topicId: number
  ): Promise<void> {
    await query(
      `UPDATE user_topic_interactions 
       SET survey_completed = TRUE, updated_at = NOW()
       WHERE user_id = $1 AND topic_id = $2`,
      [userId, topicId]
    );
  }

  static async unlockNextTopic(userId: string): Promise<void> {
    // Get current topic index
    const userResult = await query(
      'SELECT current_topic_index FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return;
    }

    const currentIndex = userResult.rows[0].current_topic_index;
    const nextIndex = currentIndex + 1;

    // Update user's current topic index
    await query(
      'UPDATE users SET current_topic_index = $1, updated_at = NOW() WHERE id = $2',
      [nextIndex, userId]
    );
  }

  static async getCompletedTopicsCount(userId: string): Promise<number> {
    const result = await query(
      `SELECT COUNT(DISTINCT topic_id) as count
       FROM user_topic_interactions
       WHERE user_id = $1 AND survey_completed = TRUE`,
      [userId]
    );

    return parseInt(result.rows[0].count || '0', 10);
  }

  static async getTotalInteractions(userId: string): Promise<number> {
    const result = await query(
      `SELECT SUM(interaction_count) as total
       FROM user_topic_interactions
       WHERE user_id = $1`,
      [userId]
    );

    return parseInt(result.rows[0].total || '0', 10);
  }
}
