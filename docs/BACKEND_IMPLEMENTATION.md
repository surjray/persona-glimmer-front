# Backend Implementation Plan

## Overview

This document outlines the implementation plan for the backend system supporting the research-focused chat platform.

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── openai.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── survey.controller.ts
│   │   └── topic.controller.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Agent.ts
│   │   ├── Topic.ts
│   │   ├── Message.ts
│   │   └── SurveyResponse.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── survey.routes.ts
│   │   └── topic.routes.ts
│   ├── services/
│   │   ├── agent.service.ts
│   │   ├── openai.service.ts
│   │   └── guardrail.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   ├── utils/
│   │   ├── password.ts
│   │   └── errors.ts
│   └── app.ts
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_agents.sql
│   ├── 003_create_topics.sql
│   ├── 004_create_messages.sql
│   ├── 005_create_interactions.sql
│   └── 006_create_surveys.sql
├── seeds/
│   ├── agents.seed.ts
│   ├── topics.seed.ts
│   └── guardrails.seed.ts
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Database Setup

### Step 1: Initialize Database

```sql
-- Create database
CREATE DATABASE research_chat_platform;

-- Connect to database
\c research_chat_platform;
```

### Step 2: Run Migrations

Execute migrations in order to create all tables.

### Step 3: Seed Data

- Seed 9 agents with their configurations
- Seed 20 topics with policies
- Seed global guardrails

---

## Core Implementation Steps

### Phase 1: Authentication & User Management

**Tasks:**
1. Set up database connection (PostgreSQL)
2. Create User model and migration
3. Implement password hashing (bcrypt)
4. Create registration endpoint
5. Create login endpoint with JWT/session
6. Create user state retrieval endpoint

**Key Files:**
- `src/models/User.ts`
- `src/controllers/auth.controller.ts`
- `src/routes/auth.routes.ts`
- `src/middleware/auth.middleware.ts`

**Agent Assignment Logic:**
```typescript
// On user registration
const assignedAgentId = Math.floor(Math.random() * 9) + 1;
// Store in user record, never change
```

---

### Phase 2: Agent & Topic Management

**Tasks:**
1. Create Agent model
2. Create Topic model
3. Seed agent data (9 agents)
4. Seed topic data (20 topics)
5. Create endpoints to retrieve agent/topic info
6. Implement topic progression logic

**Key Files:**
- `src/models/Agent.ts`
- `src/models/Topic.ts`
- `src/controllers/topic.controller.ts`
- `src/seeds/agents.seed.ts`
- `src/seeds/topics.seed.ts`

---

### Phase 3: Chat System

**Tasks:**
1. Create Message model
2. Create UserTopicInteraction model
3. Implement message storage
4. Implement interaction counting
5. Implement chat locking logic (10 interactions)
6. Create chat endpoints

**Key Files:**
- `src/models/Message.ts`
- `src/controllers/chat.controller.ts`
- `src/routes/chat.routes.ts`

**Interaction Counting Logic:**
```typescript
// On each message exchange
const interaction = await getUserTopicInteraction(userId, topicId);
interaction.interactionCount += 1;

if (interaction.interactionCount >= 10) {
  interaction.isLocked = true;
  // Trigger survey requirement
}
```

---

### Phase 4: OpenAI Integration

**Tasks:**
1. Set up OpenAI API client
2. Create prompt builder service
3. Implement agent response generation
4. Implement guardrail enforcement
5. Handle out-of-scope queries

**Key Files:**
- `src/services/openai.service.ts`
- `src/services/agent.service.ts`
- `src/services/guardrail.service.ts`
- `src/config/openai.ts`

**Prompt Building:**
```typescript
const systemPrompt = `
${agent.systemPromptTemplate}
${globalGuardrails.content}
${currentTopic.topicSpecificPolicy}
`;

const messages = [
  { role: 'system', content: systemPrompt },
  ...chatHistory,
  { role: 'user', content: userMessage }
];
```

---

### Phase 5: Survey System

**Tasks:**
1. Create survey response models
2. Implement AI literacy survey endpoint
3. Implement post-topic survey endpoint
4. Create survey validation
5. Link survey completion to topic unlocking

**Key Files:**
- `src/models/SurveyResponse.ts`
- `src/controllers/survey.controller.ts`
- `src/routes/survey.routes.ts`

**Survey Completion Logic:**
```typescript
// After post-topic survey submission
await markSurveyCompleted(userId, topicId);
await unlockNextTopic(userId);
```

---

### Phase 6: Guardrails & Safety

**Tasks:**
1. Implement global guardrails
2. Create keyword detection (optional)
3. Implement redirect messages
4. Test out-of-scope handling

**Key Files:**
- `src/services/guardrail.service.ts`
- `src/config/guardrails.ts`

---

## Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/research_chat_platform

# OpenAI
OPENAI_API_KEY=sk-...

# Server
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=your-secret-key

# CORS
FRONTEND_URL=https://your-frontend.netlify.app
```

---

## API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

---

## Testing Strategy

### Unit Tests
- Password hashing
- Agent assignment logic
- Interaction counting
- Prompt building

### Integration Tests
- Authentication flow
- Chat message flow
- Survey submission flow
- Topic progression

### End-to-End Tests
- Complete user journey (signup → 20 topics)
- Returning user flow
- Error scenarios

---

## Deployment Checklist

### Pre-Deployment
- [ ] All migrations run successfully
- [ ] Seed data loaded
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] OpenAI integration tested
- [ ] Database backups configured

### Render Deployment
- [ ] Create Render service
- [ ] Connect PostgreSQL database
- [ ] Set environment variables
- [ ] Configure build command
- [ ] Set start command
- [ ] Configure CORS

### Post-Deployment
- [ ] Test registration flow
- [ ] Test chat functionality
- [ ] Test survey submission
- [ ] Monitor error logs
- [ ] Verify data persistence

---

## Performance Considerations

1. **Database Indexing:**
   - Index on `user_id` in messages table
   - Index on `(user_id, topic_id)` in interactions table
   - Index on `email` in users table

2. **API Rate Limiting:**
   - Implement rate limiting for chat endpoints
   - Monitor OpenAI API usage

3. **Caching:**
   - Cache agent configurations
   - Cache topic data
   - Cache guardrails

4. **Connection Pooling:**
   - Configure PostgreSQL connection pool
   - Set appropriate pool size

---

## Monitoring & Logging

### Logging
- Log all API requests
- Log OpenAI API calls
- Log errors with stack traces
- Log user actions (for research)

### Monitoring
- Database connection health
- API response times
- OpenAI API usage
- Error rates

---

## Security Best Practices

1. **Password Security:**
   - Use bcrypt with salt rounds >= 10
   - Never log passwords
   - Enforce password complexity

2. **API Security:**
   - Validate all inputs
   - Sanitize user messages
   - Use HTTPS only
   - Implement CORS properly

3. **Database Security:**
   - Use parameterized queries (prevent SQL injection)
   - Limit database user permissions
   - Regular backups

4. **Secrets Management:**
   - Never commit secrets to git
   - Use environment variables
   - Rotate API keys regularly

---

## Next Steps

1. Set up project structure
2. Initialize database
3. Create migrations
4. Implement authentication
5. Implement chat system
6. Integrate OpenAI
7. Implement surveys
8. Add guardrails
9. Test end-to-end
10. Deploy to Render

---

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Render Documentation](https://render.com/docs)
