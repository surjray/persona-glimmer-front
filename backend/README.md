# Research Chat Platform - Backend API

Backend API for the research-focused chat platform.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `env.example` to `.env` and fill in your values:

```bash
cp env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### 3. Database Setup

#### Create Database

```sql
CREATE DATABASE research_chat_platform;
```

#### Run Migrations

```bash
npm run migrate
```

#### Seed Data

```bash
npm run seed
```

**Note:** The seed files include placeholder data for topics. Replace the content in `src/seeds/topics.seed.ts` with your actual research topic data.

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with initial data
- `npm run lint` - Run ESLint

## API Endpoints

See [API Documentation](../docs/API_DOCUMENTATION.md) for complete API reference.

### Health Check

```
GET /health
```

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User

- `GET /api/user/state` - Get current user state

### Topics

- `GET /api/topics` - Get all topics
- `GET /api/topics/current` - Get current topic
- `GET /api/topics/:id` - Get topic by ID

### Chat

- `POST /api/chat/message` - Send message
- `GET /api/chat/messages/:topicId` - Get chat history
- `GET /api/chat/status/:topicId` - Get chat status

### Surveys

- `POST /api/surveys/literacy` - Submit AI literacy survey
- `POST /api/surveys/post-topic` - Submit post-topic survey
- `GET /api/surveys/literacy/status` - Check literacy survey status

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database and OpenAI configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic (OpenAI, agents)
│   ├── utils/           # Utility functions
│   ├── migrations/      # Database migrations
│   ├── seeds/           # Database seed data
│   └── app.ts           # Express app setup
├── dist/                # Compiled JavaScript (generated)
└── package.json
```

## Database Schema

See [Database Schema Documentation](../docs/DATABASE_SCHEMA.md) for complete schema details.

## Deployment

### Render

1. Connect your repository to Render
2. Set environment variables in Render dashboard
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Ensure PostgreSQL database is connected

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform.

## Development Notes

- All timestamps use UTC
- JWT tokens expire after 7 days
- Chat endpoints are rate-limited to 30 requests/minute
- OpenAI API uses `gpt-4-turbo-preview` model by default
- Database connection pooling is configured for 20 max connections

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Verify network access if using remote database

### OpenAI API Errors

- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits
- Monitor rate limits

### Migration Errors

- Ensure database exists
- Check user has CREATE TABLE permissions
- Run migrations in order
