import { query } from '../config/database';

export interface Agent {
  id: number;
  name: string;
  emotional_intelligence_level: number;
  cognitive_intelligence_level: number;
  system_prompt_template: string;
  created_at: Date;
  updated_at: Date;
}

export interface AgentPublic {
  id: number;
  name: string;
  emotionalIntelligence: number;
  cognitiveIntelligence: number;
}

export class AgentModel {
  static async findById(id: number): Promise<Agent | null> {
    const result = await query('SELECT * FROM agents WHERE id = $1', [id]);
    return result.rows[0] as Agent || null;
  }

  static async findAll(): Promise<Agent[]> {
    const result = await query('SELECT * FROM agents ORDER BY id');
    return result.rows as Agent[];
  }

  static toPublic(agent: Agent): AgentPublic {
    return {
      id: agent.id,
      name: agent.name,
      emotionalIntelligence: agent.emotional_intelligence_level,
      cognitiveIntelligence: agent.cognitive_intelligence_level,
    };
  }
}
