import dotenv from 'dotenv';

dotenv.config();

console.log('=== Environment Variables Check ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || '3000');
console.log('====================================');

if (!process.env.DATABASE_URL) {
  console.error('\n✗ ERROR: DATABASE_URL is not set!');
  console.error('Please set DATABASE_URL in your .env file');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('\n✗ ERROR: JWT_SECRET is not set!');
  console.error('Please set JWT_SECRET in your .env file');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.warn('\n⚠ WARNING: OPENAI_API_KEY is not set!');
  console.warn('Chat functionality will not work without this');
}

console.log('\n✓ All required environment variables are set!');
