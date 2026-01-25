import { AgentModel, Agent } from '../models/Agent';
import { TopicModel, Topic } from '../models/Topic';
import { query } from '../config/database';

export interface Guardrail {
  id: number;
  title: string;
  content: string;
}

export class AgentService {
  static async getGlobalGuardrails(): Promise<Guardrail | null> {
    const result = await query('SELECT * FROM global_guardrails WHERE id = 1');
    return result.rows[0] as Guardrail || null;
  }

  static async buildSystemPrompt(
    agent: Agent,
    topic: Topic,
    guardrails: Guardrail | null
  ): Promise<string> {
    let prompt = agent.system_prompt_template;

    // Add global guardrails
    if (guardrails) {
      prompt += `\n\n${guardrails.content}`;
    }

    // Add topic-specific policy
    prompt += `\n\n${topic.topic_specific_policy}`;

    // Add context about emotional and cognitive intelligence levels
    prompt += `\n\nYou are operating with an emotional intelligence level of ${agent.emotional_intelligence_level}/10 and a cognitive intelligence level of ${agent.cognitive_intelligence_level}/10. Adjust your responses accordingly.`;

    return prompt;
  }

  static getOutOfScopeMessage(): string {
    return "I'm here to help with customer service inquiries related to this topic. I'm not able to assist with questions outside of this scope. Is there something specific about this topic I can help you with?";
  }
}
