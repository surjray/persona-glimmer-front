# Admin Data Access Guide

This guide explains how to access all platform data for research analysis.

## Two Options for Data Access

### Option 1: Admin API Endpoints (Recommended)

Use the Admin API to programmatically access all data. This is ideal for:
- Automated data exports
- Integration with analysis tools
- Scripting data collection

**See:** [Admin API Documentation](./docs/ADMIN_API_DOCUMENTATION.md)

**Quick Start:**
1. Set `ADMIN_API_KEY` in your `.env` file (or use default in development)
2. Make requests with header: `x-admin-api-key: your-key`
3. Access endpoints like:
   - `GET /api/admin/users` - All users
   - `GET /api/admin/messages` - All chat messages
   - `GET /api/admin/surveys/literacy` - AI literacy survey responses
   - `GET /api/admin/surveys/post-topic` - Post-topic survey responses
   - `GET /api/admin/users/:userId` - Complete user data

**Example:**
```bash
curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/dashboard
```

---

### Option 2: Direct Database Access

Connect directly to your Render PostgreSQL database for SQL queries. This is ideal for:
- Complex queries and joins
- Custom analysis
- Direct data manipulation

**Connection Details:**
- **Host:** `dpg-d5erpafpm1nc73fuscug-a.oregon-postgres.render.com`
- **Port:** `5432`
- **Database:** `paid_db_9iwk`
- **Username:** `paid_db_9iwk_user`
- **Password:** (from your Render dashboard)
- **SSL:** Required

**Connection String:**
```
postgresql://paid_db_9iwk_user:YOUR_PASSWORD@dpg-d5erpafpm1nc73fuscug-a.oregon-postgres.render.com:5432/paid_db_9iwk?sslmode=require
```

**Tools:**
- **psql** (command line)
- **pgAdmin** (GUI)
- **DBeaver** (GUI)
- **TablePlus** (GUI)
- **VS Code** (with PostgreSQL extension)

**Key Tables:**
- `users` - All user accounts
- `messages` - All chat messages with timestamps
- `ai_literacy_survey_responses` - AI literacy survey data
- `post_topic_survey_responses` - Post-topic survey data
- `user_topic_interactions` - Topic progress and interaction counts
- `agents` - Agent configurations
- `topics` - Topic information

**See:** [Database Schema Documentation](./docs/DATABASE_SCHEMA.md)

---

## What Data is Available?

### Users
- Email addresses
- Assigned agent ID
- Current topic index
- Literacy survey completion status
- Account creation and update timestamps

### Chat Histories
- All messages (user and agent)
- Message content
- Timestamps
- Topic associations
- User associations

### Survey Responses
- **AI Literacy Survey:**
  - Question IDs
  - Response values
  - User associations
  - Timestamps

- **Post-Topic Surveys:**
  - Question IDs
  - Response values (1-7 Likert scale)
  - User and topic associations
  - Timestamps

### Topic Interactions
- Interaction counts per user/topic
- Lock status
- Survey completion status
- Progress tracking

---

## Recommended Workflow

1. **Start with Dashboard Stats:**
   ```bash
   GET /api/admin/dashboard
   ```
   Get overview of total users, messages, surveys, etc.

2. **Export User List:**
   ```bash
   GET /api/admin/users > users.json
   ```
   Get all users with their agent assignments.

3. **Export Messages:**
   ```bash
   GET /api/admin/messages > messages.json
   ```
   Get all chat messages with timestamps.

4. **Export Survey Data:**
   ```bash
   GET /api/admin/surveys/literacy > literacy_surveys.json
   GET /api/admin/surveys/post-topic > post_topic_surveys.json
   ```

5. **For Specific User Analysis:**
   ```bash
   GET /api/admin/users/{userId}
   ```
   Get complete data for a single user (messages, surveys, interactions).

---

## Security Notes

1. **Admin API Key:**
   - Set a strong `ADMIN_API_KEY` in production
   - Never commit the key to version control
   - Rotate periodically

2. **Database Access:**
   - Use SSL connections
   - Restrict database access to trusted IPs
   - Use strong passwords
   - Monitor access logs

3. **Data Privacy:**
   - Follow data protection regulations
   - Anonymize data if needed for analysis
   - Secure exported data files

---

## Example Queries

### Using Admin API

```javascript
// Get all users
const users = await fetch('http://localhost:3000/api/admin/users', {
  headers: { 'x-admin-api-key': 'your-key' }
}).then(r => r.json());

// Get messages for a specific user
const messages = await fetch(
  'http://localhost:3000/api/admin/messages?userId=xxx',
  { headers: { 'x-admin-api-key': 'your-key' } }
).then(r => r.json());
```

### Using Direct Database

```sql
-- Get all users with their agent info
SELECT u.*, a.emotional_intelligence_level, a.cognitive_intelligence_level
FROM users u
LEFT JOIN agents a ON u.assigned_agent_id = a.id;

-- Get all messages with user emails
SELECT m.*, u.email
FROM messages m
LEFT JOIN users u ON m.user_id = u.id
ORDER BY m.timestamp DESC;

-- Get survey completion rates
SELECT 
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT CASE WHEN has_completed_literacy_survey THEN user_id END) as completed_literacy
FROM users;
```

---

## Need Help?

- **Admin API:** See [Admin API Documentation](./docs/ADMIN_API_DOCUMENTATION.md)
- **Database Schema:** See [Database Schema Documentation](./docs/DATABASE_SCHEMA.md)
- **API Reference:** See [API Documentation](./docs/API_DOCUMENTATION.md)
