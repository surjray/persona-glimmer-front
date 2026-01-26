import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

// Validate API key format (should start with sk-)
const apiKey = process.env.OPENAI_API_KEY.trim();
if (!apiKey.startsWith('sk-')) {
  console.warn('⚠️  Warning: OpenAI API key does not start with "sk-". Please verify the key is correct.');
}

export const openai = new OpenAI({
  apiKey: apiKey,
  timeout: 30000, // 30 second timeout
});

// Using gpt-4o-mini for cost efficiency, or gpt-4-turbo for better quality
// gpt-4-turbo-preview is deprecated, use gpt-4-turbo or gpt-4o-mini
export const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Validate API key on startup (lightweight check, only in development)
export async function validateApiKey(): Promise<boolean> {
  try {
    // Make a minimal test request to validate the key with timeout
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Validation timeout')), 5000)
    );
    
    await Promise.race([
      openai.models.list(),
      timeoutPromise
    ]);
    return true;
  } catch (error: any) {
    if (error.status === 401 || error.response?.status === 401) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ OpenAI API key validation failed: Invalid or revoked key');
      }
      return false;
    }
    // Other errors might be network issues, not necessarily key problems
    return true;
  }
}
