import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Using gpt-4o-mini for cost efficiency, or gpt-4-turbo for better quality
// gpt-4-turbo-preview is deprecated, use gpt-4-turbo or gpt-4o-mini
export const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
