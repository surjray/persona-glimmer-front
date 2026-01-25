import { query } from '../config/database';
import { NotFoundError } from '../utils/errors';

export interface Topic {
  id: number;
  title: string;
  stimulus_text: string;
  topic_specific_policy: string;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface TopicPublic {
  id: number;
  title: string;
  stimulusText: string;
  order: number;
}

export class TopicModel {
  static async findById(id: number): Promise<Topic | null> {
    const result = await query('SELECT * FROM topics WHERE id = $1', [id]);
    return result.rows[0] as Topic || null;
  }

  static async findByOrderIndex(orderIndex: number): Promise<Topic | null> {
    const result = await query('SELECT * FROM topics WHERE order_index = $1', [orderIndex]);
    return result.rows[0] as Topic || null;
  }

  static async findAll(): Promise<Topic[]> {
    const result = await query('SELECT * FROM topics ORDER BY order_index');
    return result.rows as Topic[];
  }

  static async getCurrentTopicForUser(userId: string): Promise<Topic | null> {
    // Get user's current topic index
    const userResult = await query(
      'SELECT current_topic_index FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new NotFoundError('User');
    }

    const currentTopicIndex = userResult.rows[0].current_topic_index;
    const topicOrderIndex = currentTopicIndex + 1; // Convert 0-based to 1-based

    return this.findByOrderIndex(topicOrderIndex);
  }

  static toPublic(topic: Topic): TopicPublic {
    return {
      id: topic.id,
      title: topic.title,
      stimulusText: topic.stimulus_text,
      order: topic.order_index,
    };
  }
}
