# API Documentation

## Base URL

**Production:** `https://your-backend.onrender.com`  
**Development:** `http://localhost:3000`

All endpoints are prefixed with `/api`

---

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "assignedAgentId": 3,
      "currentTopicIndex": 0,
      "hasCompletedLiteracySurvey": false
    },
    "token": "jwt-token"
  }
}
```

**Errors:**
- `400` - Email already exists
- `400` - Invalid email format
- `400` - Password too short

---

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "assignedAgentId": 3,
      "currentTopicIndex": 5,
      "hasCompletedLiteracySurvey": true
    },
    "token": "jwt-token"
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `404` - User not found

---

#### Get User State
```http
GET /api/user/state
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "assignedAgentId": 3,
      "currentTopicIndex": 5,
      "hasCompletedLiteracySurvey": true
    },
    "agent": {
      "id": 3,
      "name": "Agent Name",
      "emotionalIntelligence": 7,
      "cognitiveIntelligence": 5
    },
    "currentTopic": {
      "id": 6,
      "title": "Topic Title",
      "stimulusText": "...",
      "order": 6
    }
  }
}
```

---

### Topics

#### Get All Topics
```http
GET /api/topics
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "topics": [
      {
        "id": 1,
        "title": "Topic 1",
        "order": 1
      },
      ...
    ]
  }
}
```

---

#### Get Current Topic
```http
GET /api/topics/current
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "topic": {
      "id": 5,
      "title": "Topic Title",
      "stimulusText": "Topic stimulus text...",
      "order": 5
    },
    "interactionCount": 7,
    "isLocked": false,
    "surveyCompleted": false
  }
}
```

---

#### Get Topic Details
```http
GET /api/topics/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "topic": {
      "id": 5,
      "title": "Topic Title",
      "stimulusText": "Topic stimulus text...",
      "order": 5
    }
  }
}
```

---

### Chat

#### Send Message
```http
POST /api/chat/message
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "topicId": 5,
  "content": "User's message here"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "uuid",
      "content": "User's message here",
      "role": "user",
      "timestamp": "2024-01-01T12:00:00Z"
    },
    "agentMessage": {
      "id": "uuid",
      "content": "Agent's response here",
      "role": "agent",
      "timestamp": "2024-01-01T12:00:01Z"
    },
    "interactionCount": 8,
    "isLocked": false,
    "shouldShowSurvey": false
  }
}
```

**Response (200) - After 10th interaction:**
```json
{
  "success": true,
  "data": {
    "userMessage": { ... },
    "agentMessage": { ... },
    "interactionCount": 10,
    "isLocked": true,
    "shouldShowSurvey": true
  }
}
```

**Errors:**
- `400` - Topic is locked (survey required)
- `400` - Invalid topic ID
- `429` - Rate limit exceeded
- `500` - OpenAI API error

---

#### Get Chat History
```http
GET /api/chat/messages/:topicId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "content": "Message content",
        "role": "user",
        "timestamp": "2024-01-01T12:00:00Z"
      },
      {
        "id": "uuid",
        "content": "Agent response",
        "role": "agent",
        "timestamp": "2024-01-01T12:00:01Z"
      },
      ...
    ]
  }
}
```

---

#### Get Chat Status
```http
GET /api/chat/status/:topicId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "interactionCount": 7,
    "isLocked": false,
    "surveyCompleted": false,
    "maxInteractions": 10
  }
}
```

---

### Surveys

#### Submit AI Literacy Survey
```http
POST /api/surveys/literacy
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "responses": [
    {
      "questionId": "q1",
      "value": 5
    },
    {
      "questionId": "q2",
      "value": 3
    },
    ...
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Survey submitted successfully",
    "userState": {
      "hasCompletedLiteracySurvey": true
    }
  }
}
```

**Errors:**
- `400` - Survey already completed
- `400` - Invalid responses format
- `400` - Missing required questions

---

#### Submit Post-Topic Survey
```http
POST /api/surveys/post-topic
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "topicId": 5,
  "responses": [
    {
      "questionId": "q1",
      "value": 6
    },
    {
      "questionId": "q2",
      "value": 4
    },
    ...
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Survey submitted successfully",
    "nextTopicUnlocked": true,
    "nextTopicIndex": 6
  }
}
```

**Errors:**
- `400` - Survey already completed for this topic
- `400` - Topic not locked (survey not required yet)
- `400` - Invalid responses (must be 1-7)
- `400` - Missing required questions (must be 16)

---

#### Check Literacy Survey Status
```http
GET /api/surveys/literacy/status
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hasCompleted": true
  }
}
```

---

## Error Codes

### Client Errors (4xx)
- `400` - Bad Request (validation errors, invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)

### Server Errors (5xx)
- `500` - Internal Server Error
- `502` - Bad Gateway (external service error)
- `503` - Service Unavailable

---

## Rate Limiting

- **Chat endpoints:** 30 requests per minute per user
- **Other endpoints:** 60 requests per minute per user

Rate limit headers:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1640995200
```

---

## Webhooks

Not applicable for V1.

---

## WebSocket

Not applicable for V1. All communication is REST-based.

---

## Pagination

For endpoints that return lists (e.g., messages), pagination may be added:

```
GET /api/chat/messages/:topicId?page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 120,
      "totalPages": 3
    }
  }
}
```

---

## Data Types

### UUID
String format: `550e8400-e29b-41d4-a716-446655440000`

### Timestamp
ISO 8601 format: `2024-01-01T12:00:00.000Z`

### Likert Scale
Integer between 1 and 7 (inclusive)

---

## Example Requests

### Complete User Flow

1. **Register:**
```bash
curl -X POST https://api.example.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

2. **Submit Literacy Survey:**
```bash
curl -X POST https://api.example.com/api/surveys/literacy \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"responses":[{"questionId":"q1","value":5}]}'
```

3. **Send Chat Message:**
```bash
curl -X POST https://api.example.com/api/chat/message \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"topicId":1,"content":"Hello!"}'
```

4. **Submit Post-Topic Survey:**
```bash
curl -X POST https://api.example.com/api/surveys/post-topic \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"topicId":1,"responses":[{"questionId":"q1","value":6}]}'
```

---

## Versioning

Current version: `v1`

Version may be specified in URL path in future:
```
/api/v1/auth/register
```

---

## Support

For API support or questions, refer to the project documentation or contact the development team.
