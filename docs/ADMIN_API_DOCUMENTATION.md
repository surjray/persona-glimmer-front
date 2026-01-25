# Admin API Documentation

The Admin API provides access to all platform data including users, chat histories, timestamps, and survey responses. This is designed for research analysis and data review.

## Authentication

All admin endpoints require an admin API key to be sent in the request header:

```
x-admin-api-key: your-admin-api-key-here
```

**Setting the Admin API Key:**

1. Add to your `.env` file:
   ```env
   ADMIN_API_KEY=your-secure-admin-key-here
   ```

2. In development mode, if no `ADMIN_API_KEY` is set, admin endpoints will be accessible without authentication (for testing only).

3. **Important:** In production, always set a strong, unique `ADMIN_API_KEY`.

## Base URL

All admin endpoints are prefixed with `/api/admin`:

```
http://localhost:3000/api/admin
```

## Endpoints

### 1. Dashboard Statistics

Get overview statistics about the platform.

**Endpoint:** `GET /api/admin/dashboard`

**Headers:**
```
x-admin-api-key: your-admin-api-key
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 120,
    "totalMessages": 2450,
    "completedLiteracySurvey": 115,
    "totalInteractions": 3200,
    "completedPostTopicSurveys": 1800,
    "agentDistribution": [
      { "agentId": 1, "userCount": 13 },
      { "agentId": 2, "userCount": 14 },
      ...
    ]
  }
}
```

---

### 2. Get All Users

Retrieve all users with their agent assignments and progress.

**Endpoint:** `GET /api/admin/users`

**Headers:**
```
x-admin-api-key: your-admin-api-key
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "assignedAgentId": 5,
        "agentEQ": 7,
        "agentIQ": 3,
        "currentTopicIndex": 12,
        "hasCompletedLiteracySurvey": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-20T14:22:00Z"
      },
      ...
    ],
    "total": 120
  }
}
```

---

### 3. Get All Messages

Retrieve all chat messages with optional filtering.

**Endpoint:** `GET /api/admin/messages`

**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `topicId` (optional) - Filter by topic ID
- `limit` (optional) - Limit results (default: 1000)
- `offset` (optional) - Pagination offset

**Headers:**
```
x-admin-api-key: your-admin-api-key
```

**Example:**
```
GET /api/admin/messages?userId=xxx&topicId=5&limit=100&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "userId": "user-uuid",
        "userEmail": "user@example.com",
        "topicId": 5,
        "topicTitle": "Topic Title",
        "role": "user",
        "content": "Message content",
        "timestamp": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-15T10:30:00Z"
      },
      ...
    ],
    "total": 2450,
    "limit": 100,
    "offset": 0
  }
}
```

---

### 4. Get All AI Literacy Survey Responses

Retrieve all AI literacy survey responses.

**Endpoint:** `GET /api/admin/surveys/literacy`

**Query Parameters:**
- `userId` (optional) - Filter by user ID

**Headers:**
```
x-admin-api-key: your-admin-api-key
```

**Example:**
```
GET /api/admin/surveys/literacy?userId=xxx
```

**Response:**
```json
{
  "success": true,
  "data": {
    "responses": [
      {
        "id": "uuid",
        "userId": "user-uuid",
        "userEmail": "user@example.com",
        "questionId": "q1",
        "responseValue": "5",
        "createdAt": "2024-01-15T10:30:00Z"
      },
      ...
    ],
    "total": 1150
  }
}
```

---

### 5. Get All Post-Topic Survey Responses

Retrieve all post-topic survey responses.

**Endpoint:** `GET /api/admin/surveys/post-topic`

**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `topicId` (optional) - Filter by topic ID

**Headers:**
```
x-admin-api-key: your-admin-api-key
```

**Example:**
```
GET /api/admin/surveys/post-topic?userId=xxx&topicId=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "responses": [
      {
        "id": "uuid",
        "userId": "user-uuid",
        "userEmail": "user@example.com",
        "topicId": 5,
        "topicTitle": "Topic Title",
        "questionId": "q1",
        "responseValue": 4,
        "createdAt": "2024-01-15T10:30:00Z"
      },
      ...
    ],
    "total": 28800
  }
}
```

---

### 6. Get Comprehensive User Data

Get all data for a specific user (user info, messages, surveys, interactions).

**Endpoint:** `GET /api/admin/users/:userId`

**Headers:**
```
x-admin-api-key: your-admin-api-key
```

**Example:**
```
GET /api/admin/users/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "assignedAgentId": 5,
      "agentEQ": 7,
      "agentIQ": 3,
      "currentTopicIndex": 12,
      "hasCompletedLiteracySurvey": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:22:00Z"
    },
    "messages": [
      {
        "id": "uuid",
        "topicId": 1,
        "topicTitle": "Topic 1",
        "role": "user",
        "content": "Hello",
        "timestamp": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-15T10:30:00Z"
      },
      ...
    ],
    "literacySurveyResponses": [
      {
        "id": "uuid",
        "questionId": "q1",
        "responseValue": "5",
        "createdAt": "2024-01-15T10:30:00Z"
      },
      ...
    ],
    "postTopicSurveyResponses": [
      {
        "id": "uuid",
        "topicId": 1,
        "topicTitle": "Topic 1",
        "questionId": "q1",
        "responseValue": 4,
        "createdAt": "2024-01-15T10:30:00Z"
      },
      ...
    ],
    "topicInteractions": [
      {
        "id": "uuid",
        "topicId": 1,
        "topicTitle": "Topic 1",
        "interactionCount": 10,
        "isLocked": true,
        "surveyCompleted": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T11:00:00Z"
      },
      ...
    ]
  }
}
```

---

## Usage Examples

### Using cURL

```bash
# Get dashboard stats
curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/dashboard

# Get all users
curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/users

# Get messages for a specific user
curl -H "x-admin-api-key: your-key" "http://localhost:3000/api/admin/messages?userId=xxx"

# Get all data for a user
curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/users/xxx
```

### Using JavaScript/Fetch

```javascript
const adminApiKey = 'your-admin-api-key';

// Get dashboard stats
const response = await fetch('http://localhost:3000/api/admin/dashboard', {
  headers: {
    'x-admin-api-key': adminApiKey
  }
});
const data = await response.json();
console.log(data);
```

### Using Python

```python
import requests

admin_api_key = 'your-admin-api-key'
headers = {'x-admin-api-key': admin_api_key}

# Get dashboard stats
response = requests.get(
    'http://localhost:3000/api/admin/dashboard',
    headers=headers
)
data = response.json()
print(data)
```

---

## Data Export

You can use these endpoints to export all data for analysis:

1. **Export all users:**
   ```bash
   curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/users > users.json
   ```

2. **Export all messages:**
   ```bash
   curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/messages > messages.json
   ```

3. **Export all survey responses:**
   ```bash
   curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/surveys/literacy > literacy_surveys.json
   curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/surveys/post-topic > post_topic_surveys.json
   ```

---

## Security Notes

1. **Never commit the admin API key to version control**
2. **Use a strong, unique key in production**
3. **Restrict access to admin endpoints in production (IP whitelist, VPN, etc.)**
4. **Monitor admin API usage for suspicious activity**
5. **Rotate the admin API key periodically**

---

## Error Responses

### Unauthorized (401)
```json
{
  "success": false,
  "error": {
    "message": "Unauthorized: Admin API key required",
    "code": "ADMIN_UNAUTHORIZED"
  }
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "message": "User ID is required",
    "code": "VALIDATION_ERROR"
  }
}
```

---

## Database Access Alternative

If you prefer direct database access, you can connect to your Render PostgreSQL database using:

- **psql command line tool**
- **pgAdmin** (GUI)
- **DBeaver** (GUI)
- **Any PostgreSQL client**

The database contains all the same data accessible through the admin API:
- `users` table
- `messages` table
- `ai_literacy_survey_responses` table
- `post_topic_survey_responses` table
- `user_topic_interactions` table

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete schema details.
