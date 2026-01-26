import { openai, DEFAULT_MODEL } from '../config/openai';
import { AgentService } from './agent.service';
import { Agent } from '../models/Agent';
import { Topic } from '../models/Topic';
import { Message } from '../models/Message';
import { Guardrail } from './agent.service';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  static async generateAgentResponse(
    agent: Agent,
    topic: Topic,
    guardrails: Guardrail | null,
    chatHistory: Message[],
    userMessage: string
  ): Promise<string> {
    try {
      // Build system prompt
      const systemPrompt = await AgentService.buildSystemPrompt(
        agent,
        topic,
        guardrails
      );

      // Convert chat history to OpenAI format
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
      ];

      // Add chat history (last 10 messages to stay within token limits)
      const recentHistory = chatHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }

      // Add current user message
      messages.push({ role: 'user', content: userMessage });

      // Call OpenAI API with timeout protection
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('OpenAI API request timeout')), 30000)
      );
      
      const completion = await Promise.race([
        openai.chat.completions.create({
          model: DEFAULT_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        }),
        timeoutPromise
      ]) as any;

      const response = completion.choices[0]?.message?.content;

      if (!response || response.trim().length === 0) {
        // Log minimal info in production
        if (process.env.NODE_ENV === 'development') {
          console.error('OpenAI returned empty response:', {
            model: DEFAULT_MODEL,
            usage: completion.usage,
          });
        } else {
          console.error('OpenAI returned empty response');
        }
        // Return a fallback response instead of throwing
        return "I understand your question. Let me help you with that. Could you provide a bit more detail so I can assist you better?";
      }

      // Optional: Lightweight keyword detection for extreme violations
      const violationKeywords = ['hack', 'exploit', 'illegal', 'harmful'];
      const lowerResponse = response.toLowerCase();
      
      if (violationKeywords.some(keyword => lowerResponse.includes(keyword))) {
        return AgentService.getOutOfScopeMessage();
      }

      return response;

    } catch (error: any) {
      // Log error details only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('OpenAI API error:', {
          name: error.name,
          message: error.message,
          status: error.status,
          code: error.code,
        });
      } else {
        // In production, log minimal info
        console.error('OpenAI API error:', error.name, error.status || error.code);
      }
      
      // Provide more specific error messages
      if (error.status === 401 || error.response?.status === 401) {
        throw new Error('OpenAI API key is invalid or has been revoked. Please verify your API key in Render environment variables and ensure it has not been disabled.');
      } else if (error.status === 429 || error.response?.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
      } else if (error.status === 503 || error.response?.status === 503) {
        throw new Error('OpenAI API is temporarily unavailable. Please try again later.');
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new Error('Unable to connect to OpenAI API. Please check your internet connection.');
      } else if (error.message?.includes('model') || error.response?.error?.message?.includes('model')) {
        throw new Error('The specified OpenAI model is not available. Please check your configuration.');
      } else if (error.response?.error) {
        // Handle OpenAI API error responses
        const apiError = error.response.error;
        const errorMessage = apiError.message || 'Unknown error';
        
        // Check for specific error types
        if (errorMessage.includes('insufficient_quota') || errorMessage.includes('billing')) {
          throw new Error('OpenAI API key has insufficient quota or billing issue. Please check your OpenAI account billing.');
        } else if (errorMessage.includes('invalid_api_key') || errorMessage.includes('Incorrect API key')) {
          throw new Error('OpenAI API key is invalid. Please check your API key in Render environment variables.');
        } else if (errorMessage.includes('revoked') || errorMessage.includes('disabled')) {
          throw new Error('OpenAI API key has been revoked or disabled. Please generate a new API key from OpenAI dashboard.');
        }
        
        throw new Error(`OpenAI API error: ${errorMessage}`);
      }
      
      throw new Error(`Failed to generate agent response: ${error.message || 'Unknown error'}`);
    }
  }
}
