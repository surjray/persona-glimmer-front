import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware';
import { validateApiKey } from './config/openai';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import topicRoutes from './routes/topic.routes';
import chatRoutes from './routes/chat.routes';
import surveyRoutes from './routes/survey.routes';
import guardrailRoutes from './routes/guardrail.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

// Validate required environment variables on startup
const requiredEnvVars = ['DATABASE_URL', 'OPENAI_API_KEY', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease set these variables in your .env file or environment.');
  process.exit(1);
}

console.log('✅ All required environment variables are set');

// Validate OpenAI API key on startup (non-blocking, silent in production)
if (process.env.NODE_ENV === 'development') {
  validateApiKey().then(isValid => {
    if (!isValid) {
      console.error('⚠️  Warning: OpenAI API key validation failed. Chat functionality may not work.');
      console.error('   Please check your OPENAI_API_KEY in Render environment variables.');
    } else {
      console.log('✅ OpenAI API key validated successfully');
    }
  }).catch(() => {
    // Non-blocking - continue startup even if validation fails
    console.log('⚠️  Could not validate OpenAI API key (may be network issue)');
  });
}

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // In development, allow any localhost port
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
          return callback(null, true);
        }
      }
      
      // In production, automatically allow Netlify domains
      if (process.env.NODE_ENV === 'production') {
        // Automatically allow any Netlify domain
        if (origin.includes('.netlify.app')) {
          return callback(null, true);
        }
        
        // Allow FRONTEND_URL if set
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
          return callback(null, true);
        }
        
        // If FRONTEND_URL is set but origin doesn't match, reject
        if (process.env.FRONTEND_URL) {
          return callback(new Error('Not allowed by CORS'));
        }
      }
      
      // Fallback for development or if no production check matched
      const defaultOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:8083',
        'http://localhost:8080',
        'http://localhost:5173',
      ];
      
      if (defaultOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/guardrails', guardrailRoutes);
app.use('/api/admin', adminRoutes);

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
