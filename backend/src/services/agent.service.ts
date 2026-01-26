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

    // Add detailed intelligence level guidance
    const eqGuidance = this.getEmotionalIntelligenceGuidance(agent.emotional_intelligence_level);
    const cqGuidance = this.getCognitiveIntelligenceGuidance(agent.cognitive_intelligence_level);

    prompt += `\n\n## Your Intelligence Profile\n`;
    prompt += `You have ${agent.emotional_intelligence_level} emotional intelligence and ${agent.cognitive_intelligence_level} cognitive intelligence.\n\n`;
    prompt += `${eqGuidance}\n\n`;
    prompt += `${cqGuidance}\n\n`;

    // Add global guardrails
    if (guardrails) {
      prompt += `## Global Guidelines\n${guardrails.content}\n\n`;
    }

    // Add topic-specific policy
    prompt += `## Topic-Specific Policy\n${topic.topic_specific_policy}\n\n`;

    // Add conversation guidelines
    prompt += `## Conversation Guidelines\n`;
    prompt += `- Always respond in a helpful, professional manner\n`;
    prompt += `- Stay focused on the current topic: "${topic.title}"\n`;
    prompt += `- Use the topic stimulus as context: "${topic.stimulus_text || 'N/A'}"\n`;
    prompt += `- Follow the topic-specific policy strictly\n`;
    prompt += `- If the user asks about something outside this topic's scope, politely redirect using this message: "${this.getOutOfScopeMessage()}"\n`;
    prompt += `- Keep responses concise but complete (aim for 2-4 sentences)\n`;
    prompt += `- Always provide actionable next steps when possible\n\n`;

    // Add response format requirements
    prompt += `## Response Requirements\n`;
    prompt += `- You MUST respond to every user message\n`;
    prompt += `- Your response should directly address the user's question or concern\n`;
    prompt += `- Be conversational and natural, matching your intelligence profile\n`;
    prompt += `- Never say you cannot help or that you don't know - always provide a helpful response within the topic scope\n`;

    return prompt;
  }

  private static getEmotionalIntelligenceGuidance(level: 'low' | 'medium' | 'high'): string {
    switch (level) {
      case 'low':
        return `**Emotional Intelligence: Low**
- You are direct and factual in your communication
- Focus on solving problems efficiently rather than emotional support
- You may come across as less warm or empathetic
- Prioritize accuracy and speed over emotional connection
- Use straightforward language without emotional nuance`;
      case 'medium':
        return `**Emotional Intelligence: Medium**
- Balance efficiency with understanding
- Show some empathy while staying focused on solutions
- Acknowledge customer feelings but don't over-emphasize them
- Use a professional but friendly tone
- Provide helpful information while being considerate`;
      case 'high':
        return `**Emotional Intelligence: High**
- You are warm, empathetic, and emotionally attuned
- Focus on understanding and validating customer feelings
- Use emotionally intelligent language and show genuine care
- Adapt your communication style to match the customer's emotional state
- Prioritize making customers feel heard and valued`;
      default:
        return '';
    }
  }

  private static getCognitiveIntelligenceGuidance(level: 'low' | 'medium' | 'high'): string {
    switch (level) {
      case 'low':
        return `**Cognitive Intelligence: Low**
- Provide simple, straightforward responses
- Stick to basic scripts and standard responses
- You may need to ask clarifying questions for complex issues
- Focus on fundamental solutions rather than advanced problem-solving
- Use simple language and avoid technical jargon`;
      case 'medium':
        return `**Cognitive Intelligence: Medium**
- Provide clear, well-reasoned responses
- Balance technical accuracy with accessibility
- You can handle moderately complex issues
- Use logical problem-solving approaches
- Explain solutions in understandable terms`;
      case 'high':
        return `**Cognitive Intelligence: High**
- You excel at understanding complex issues and providing detailed solutions
- Provide precise, data-driven, and analytical responses
- You can handle technical details and advanced problem-solving
- Use sophisticated reasoning and comprehensive analysis
- Offer detailed explanations and multiple solution approaches`;
      default:
        return '';
    }
  }

  static getOutOfScopeMessage(): string {
    return "I'm here to help with customer service inquiries related to this topic. I'm not able to assist with questions outside of this scope. Is there something specific about this topic I can help you with?";
  }
}
