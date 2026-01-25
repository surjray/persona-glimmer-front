import { query } from '../config/database';

export interface Message {
  id: string;
  user_id: string;
  topic_id: number;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  created_at: Date;
}

export interface MessagePublic {
  id: string;
  content: string;
  role: 'user' | 'agent';
  timestamp: Date;
}

export interface CreateMessageData {
  userId: string;
  topicId: number;
  role: 'user' | 'agent';
  content: string;
}

export class MessageModel {
  static async create(data: CreateMessageData): Promise<Message> {
    const result = await query(
      `INSERT INTO messages (user_id, topic_id, role, content, timestamp)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [data.userId, data.topicId, data.role, data.content]
    );

    return result.rows[0] as Message;
  }

  static async findByUserAndTopic(
    userId: string,
    topicId: number
  ): Promise<Message[]> {
    const result = await query(
      `SELECT * FROM messages 
       WHERE user_id = $1 AND topic_id = $2 
       ORDER BY timestamp ASC`,
      [userId, topicId]
    );

    return result.rows as Message[];
  }

  static toPublic(message: Message): MessagePublic {
    return {
      id: message.id,
      content: message.content,
      role: message.role,
      timestamp: message.timestamp,
    };
  }
}
