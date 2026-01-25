# Product Requirements Document (PRD)
## Research-Focused Chat Platform

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** In Development

---

## Executive Summary

This document outlines the requirements for building a backend system to support a research-focused chat platform. The platform enables users to interact with one of 9 predefined service agents across 20 topics, complete surveys, and have all interactions logged for later analysis.

**Project Goal:** Create a research V1 system that prioritizes correctness of flow over polish, designed to support approximately 120 users.

---

## Tech Stack

### Backend
- **Runtime:** Node.js + Express (or Next.js API routes)
- **Database:** PostgreSQL (or Supabase / SQLite for speed)
- **AI Integration:** OpenAI API (ChatGPT)
- **Deployment:** Render

### Frontend
- **Framework:** React + TypeScript + Vite
- **UI Library:** shadcn-ui + Tailwind CSS
- **Deployment:** Netlify

---

## Core Requirements

### 1. Authentication

**Requirements:**
- Email + password authentication
- Store users in database
- Each user must have:
  - Unique ID
  - Email
  - Assigned agent ID (persistent, never changes)
  - Current topic index
  - Completion status flags

**Implementation Notes:**
- No social login
- No role-based access control
- Simple email/password flow only

---

### 2. Agent Assignment

**Agent Configuration:**
- **Total agents:** 9
- Each agent has:
  - Emotional intelligence level
  - Cognitive intelligence level
  - System prompt template

**Assignment Logic:**
- On first signup: randomly assign one agent
- Persist assignment so it never changes
- User remains with the same agent throughout all 20 topics

---

### 3. Topics & Policies

**Topic Configuration:**
- **Total topics:** 20
- Each topic has:
  - Title
  - Stimulus text
  - Topic-specific policy

**Policy Structure:**
- One global guardrail applies to all topics
- Each topic has its own specific policy
- Policies are used in system prompts (not visible to users)

---

### 4. Chat Logic

**Message Storage:**
Each message must be stored with:
- `user_id`
- `topic_id`
- `role` (user / agent)
- `content`
- `timestamp`

**Interaction Tracking:**
- For each user + topic combination:
  - Track interaction count
  - After 10 exchanges, lock chat until survey completed
  - Survey must be completed before chat unlocks for next topic

**Chat Flow:**
1. User sends message
2. System checks interaction count
3. If < 10 interactions: process message
4. If = 10 interactions: lock chat, trigger survey
5. After survey completion: unlock next topic

---

### 5. Surveys

#### A. AI Literacy Survey (One-Time)
- **Trigger:** Immediately after first signup
- **Storage:** Responses linked to `user_id`
- **Purpose:** Baseline assessment of user's AI knowledge

#### B. Post-Topic Survey
- **Questions:** 16 fixed questions
- **Scale:** Likert scale (1–7)
- **Trigger:** Required after each topic (after 10 interactions)
- **Requirement:** Must be completed before unlocking next topic
- **Storage:** Responses linked to:
  - `user_id`
  - `topic_id`

---

### 6. OpenAI Integration

**API Usage:**
- Use ChatGPT via OpenAI API
- All agent responses generated through API calls

**Prompt Structure:**
```
System: agent personality + emotional/cognitive level
System: global guardrails
System: topic-specific policy
User: user message
```

**Scope Enforcement:**
- Primary enforcement via prompt discipline
- Use provided redirect messages for out-of-scope queries
- Do NOT reveal:
  - Prompts
  - Policies
  - Internal logic

**Content Boundaries:**
- No content generation outside customer-service domain
- Always redirect using predefined language

---

### 7. Guardrails Enforcement

**Enforcement Strategy:**
- Primary: System prompts (prompt engineering)
- Optional: Lightweight keyword detection for extreme violations
- Always redirect using predefined language
- Never reveal guardrail logic to users

**Out-of-Scope Handling:**
- Use predefined redirect messages
- Maintain consistent user experience
- Log violations for analysis

---

### 8. Data Visibility

**Database Tables (Admin-Accessible):**
- Users
- Agent assignments
- Chat messages (with timestamps)
- Survey responses

**Access:**
- DB-level visibility is sufficient for V1
- No full admin UI required
- Direct database access for analysis

---

## User Flow

### New User Journey
1. **Sign Up**
   - User provides email + password
   - System creates user record
   - System randomly assigns agent (persistent)

2. **AI Literacy Survey**
   - Immediately after signup
   - User completes survey
   - Responses stored

3. **Topic 1 Chat**
   - User interacts with assigned agent
   - Topic 1 context loaded
   - Up to 10 message exchanges

4. **Post-Topic Survey**
   - After 10 interactions, chat locks
   - User completes 16-question survey
   - Responses stored with topic_id

5. **Next Topic**
   - System unlocks Topic 2
   - Process repeats (steps 3-4)

6. **Completion**
   - After all 20 topics completed
   - User sees completion message

### Returning User Journey
1. **Login**
   - User provides email + password
   - System loads user state:
     - Assigned agent
     - Current topic index
     - Completion status

2. **Resume**
   - Continue from last topic
   - If survey pending, show survey first
   - Otherwise, resume chat

---

## Database Schema

### Users Table
```sql
- id (UUID, primary key)
- email (string, unique)
- password_hash (string)
- assigned_agent_id (integer, 1-9)
- current_topic_index (integer, 0-19)
- has_completed_literacy_survey (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### Agents Table
```sql
- id (integer, primary key, 1-9)
- emotional_intelligence_level (integer)
- cognitive_intelligence_level (integer)
- system_prompt_template (text)
```

### Topics Table
```sql
- id (integer, primary key, 1-20)
- title (string)
- stimulus_text (text)
- topic_specific_policy (text)
- order (integer)
```

### Messages Table
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- topic_id (integer, foreign key)
- role (enum: 'user' | 'agent')
- content (text)
- timestamp (timestamp)
```

### User-Topic Interactions Table
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- topic_id (integer, foreign key)
- interaction_count (integer)
- is_locked (boolean)
- survey_completed (boolean)
```

### AI Literacy Survey Responses Table
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- question_id (string)
- response_value (integer or text)
- created_at (timestamp)
```

### Post-Topic Survey Responses Table
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- topic_id (integer, foreign key)
- question_id (string)
- response_value (integer, 1-7)
- created_at (timestamp)
```

### Global Guardrails Table
```sql
- id (integer, primary key)
- title (string)
- content (text)
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End session

### User State
- `GET /api/user/state` - Get current user state
- `GET /api/user/agent` - Get assigned agent info

### Chat
- `POST /api/chat/message` - Send message, get agent response
- `GET /api/chat/messages/:topicId` - Get chat history for topic
- `GET /api/chat/status/:topicId` - Get interaction count and lock status

### Surveys
- `POST /api/surveys/literacy` - Submit AI literacy survey
- `POST /api/surveys/post-topic` - Submit post-topic survey
- `GET /api/surveys/literacy/status` - Check if literacy survey completed

### Topics
- `GET /api/topics` - Get all topics
- `GET /api/topics/:id` - Get specific topic details
- `GET /api/topics/current` - Get user's current topic

---

## Non-Goals (Important)

The following features are **explicitly out of scope** for V1:

- ❌ Analytics dashboards
- ❌ Policy editor UI
- ❌ Role-based access control
- ❌ Social login (Google, GitHub, etc.)
- ❌ Mobile-first optimization
- ❌ Real-time notifications
- ❌ Message editing/deletion
- ❌ Chat export functionality
- ❌ User profile customization

**Focus:** Correctness of flow over polish. This is a research V1, not a production SaaS.

---

## Delivery Criteria

The system is considered complete when:

✅ User can sign up  
✅ User completes AI literacy survey  
✅ User chats with assigned agent  
✅ Chat is topic-gated (10 interactions per topic)  
✅ Surveys trigger correctly  
✅ Data persists correctly  
✅ System is stable for ~120 users  

**Target Delivery:** Sunday

---

## Security Considerations

1. **Password Storage:** Use bcrypt or similar for password hashing
2. **API Keys:** Store OpenAI API key securely (environment variables)
3. **Session Management:** Implement secure session tokens
4. **Input Validation:** Sanitize all user inputs
5. **Rate Limiting:** Prevent abuse of API endpoints
6. **CORS:** Configure properly for frontend domain

---

## Error Handling

### User-Facing Errors
- Authentication failures
- Network errors
- Survey validation errors
- Chat lock notifications

### System Errors
- Database connection failures
- OpenAI API errors
- Invalid state transitions

**Principle:** Always provide clear, actionable error messages to users.

---

## Testing Requirements

### Critical Paths to Test
1. User registration → agent assignment
2. AI literacy survey completion
3. Chat interaction counting
4. Survey trigger after 10 interactions
5. Topic progression
6. Data persistence across sessions
7. Returning user flow

### Load Testing
- Test with ~120 concurrent users
- Verify database performance
- Monitor API rate limits

---

## Deployment Checklist

### Backend (Render)
- [ ] Environment variables configured
- [ ] Database connection established
- [ ] API endpoints tested
- [ ] OpenAI API key configured
- [ ] CORS configured for frontend domain

### Frontend (Netlify)
- [ ] API base URL configured
- [ ] Build process verified
- [ ] Environment variables set
- [ ] Routing configured

---

## Future Considerations (Post-V1)

While not in scope for V1, these may be considered for future versions:

- Analytics dashboard for researchers
- Advanced agent personality customization
- Multi-language support
- Enhanced guardrail enforcement
- Real-time collaboration features
- Export functionality for research data

---

## Notes for Development Team

1. **Prioritize Correctness:** Focus on getting the flow right, not on UI polish
2. **Data Integrity:** Ensure all interactions are logged correctly
3. **Agent Consistency:** Same agent must be used throughout user journey
4. **Survey Enforcement:** Surveys must be completed before progression
5. **Prompt Engineering:** Invest time in crafting effective system prompts
6. **Testing:** Test the full user journey end-to-end before delivery

---

## Contact & Questions

For questions about this PRD, please refer to the project documentation or contact the project lead.

---

**Document Status:** Active  
**Last Review Date:** 2024
