/**
 * Input sanitization utilities
 * Removes potentially dangerous characters and normalizes input
 */

export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length (prevent extremely long inputs)
  const MAX_LENGTH = 10000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }

  return sanitized;
}

export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  // Basic email sanitization (validation happens in Zod schema)
  let sanitized = email.trim().toLowerCase();

  // Remove any whitespace
  sanitized = sanitized.replace(/\s/g, '');

  // Limit length
  const MAX_EMAIL_LENGTH = 255;
  if (sanitized.length > MAX_EMAIL_LENGTH) {
    sanitized = sanitized.substring(0, MAX_EMAIL_LENGTH);
  }

  return sanitized;
}

export function sanitizePassword(password: string): string {
  if (typeof password !== 'string') {
    return '';
  }

  // Passwords should not be trimmed (leading/trailing spaces might be intentional)
  // But we should remove null bytes and control characters
  let sanitized = password.replace(/\0/g, '');
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Limit length
  const MAX_PASSWORD_LENGTH = 1000;
  if (sanitized.length > MAX_PASSWORD_LENGTH) {
    sanitized = sanitized.substring(0, MAX_PASSWORD_LENGTH);
  }

  return sanitized;
}

export function sanitizeMessageContent(content: string): string {
  if (typeof content !== 'string') {
    return '';
  }

  // Allow more characters in messages (newlines, etc.)
  let sanitized = content.replace(/\0/g, ''); // Remove null bytes

  // Remove only the most dangerous control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim only leading/trailing whitespace (preserve internal formatting)
  sanitized = sanitized.trim();

  // Limit length
  const MAX_MESSAGE_LENGTH = 5000;
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    sanitized = sanitized.substring(0, MAX_MESSAGE_LENGTH);
  }

  return sanitized;
}
