# Admin API Usage Examples

This document provides practical examples for using the Admin API endpoints.

## Prerequisites

1. **Backend server must be running** on `http://localhost:3000`
2. **Admin API Key** (optional in development, required in production)

### Setting Admin API Key

In development, you can use the default key or set your own in `backend/.env`:

```env
ADMIN_API_KEY=your-secure-admin-key-here
```

If no key is set in development, the endpoints are accessible without authentication.

---

## Quick Test

Test if the admin API is working:

```bash
# Windows PowerShell
curl -H "x-admin-api-key: dev-admin-key-change-in-production" http://localhost:3000/api/admin/dashboard

# Or without key in development
curl http://localhost:3000/api/admin/dashboard
```

---

## Example Commands

### 1. Get Dashboard Statistics

**Endpoint:** `GET /api/admin/dashboard`

**cURL:**
```bash
curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/dashboard
```

**PowerShell:**
```powershell
$headers = @{'x-admin-api-key' = 'your-key'}
$response = Invoke-WebRequest -Uri http://localhost:3000/api/admin/dashboard -Headers $headers
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Response:**
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

**Endpoint:** `GET /api/admin/users`

**cURL:**
```bash
curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/users
```

**PowerShell:**
```powershell
$headers = @{'x-admin-api-key' = 'your-key'}
$response = Invoke-WebRequest -Uri http://localhost:3000/api/admin/users -Headers $headers
$users = ($response.Content | ConvertFrom-Json).data.users
$users | Format-Table id, email, assignedAgentId, currentTopicIndex
```

**Save to File:**
```bash
curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/users > users.json
```

---

### 3. Get All Messages

**Endpoint:** `GET /api/admin/messages`

**Basic:**
```bash
curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/messages
```

**With Filters:**
```bash
# Filter by user ID
curl -H "x-admin-api-key: your-key" "http://localhost:3000/api/admin/messages?userId=xxx"

# Filter by topic ID
curl -H "x-admin-api-key: your-key" "http://localhost:3000/api/admin/messages?topicId=5"

# Pagination
curl -H "x-admin-api-key: your-key" "http://localhost:3000/api/admin/messages?limit=100&offset=0"
```

**PowerShell with Filtering:**
```powershell
$headers = @{'x-admin-api-key' = 'your-key'}
$userId = "your-user-id-here"
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/messages?userId=$userId" -Headers $headers
$messages = ($response.Content | ConvertFrom-Json).data.messages
$messages | Select-Object userEmail, topicTitle, role, content, timestamp | Format-Table
```

---

### 4. Get AI Literacy Survey Responses

**Endpoint:** `GET /api/admin/surveys/literacy`

**All Responses:**
```bash
curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/surveys/literacy
```

**Filter by User:**
```bash
curl -H "x-admin-api-key: your-key" "http://localhost:3000/api/admin/surveys/literacy?userId=xxx"
```

**Export to CSV (using jq):**
```bash
curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/surveys/literacy | jq -r '.data.responses[] | [.userEmail, .questionId, .responseValue, .createdAt] | @csv' > literacy_surveys.csv
```

---

### 5. Get Post-Topic Survey Responses

**Endpoint:** `GET /api/admin/surveys/post-topic`

**All Responses:**
```bash
curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/surveys/post-topic
```

**Filter by User and Topic:**
```bash
curl -H "x-admin-api-key: your-key" "http://localhost:3000/api/admin/surveys/post-topic?userId=xxx&topicId=5"
```

---

### 6. Get Complete User Data

**Endpoint:** `GET /api/admin/users/:userId`

**Example:**
```bash
curl -H "x-admin-api-key: your-key" http://localhost:3000/api/admin/users/123e4567-e89b-12d3-a456-426614174000
```

**PowerShell:**
```powershell
$headers = @{'x-admin-api-key' = 'your-key'}
$userId = "123e4567-e89b-12d3-a456-426614174000"
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/users/$userId" -Headers $headers
$userData = ($response.Content | ConvertFrom-Json).data

Write-Host "User: $($userData.user.email)"
Write-Host "Messages: $($userData.messages.Count)"
Write-Host "Literacy Survey Responses: $($userData.literacySurveyResponses.Count)"
Write-Host "Post-Topic Survey Responses: $($userData.postTopicSurveyResponses.Count)"
```

---

## JavaScript/Node.js Examples

### Using Fetch API

```javascript
const adminApiKey = 'your-admin-api-key';
const baseUrl = 'http://localhost:3000/api/admin';

// Get dashboard stats
async function getDashboardStats() {
  const response = await fetch(`${baseUrl}/dashboard`, {
    headers: {
      'x-admin-api-key': adminApiKey
    }
  });
  const data = await response.json();
  console.log('Dashboard Stats:', data.data);
  return data.data;
}

// Get all users
async function getAllUsers() {
  const response = await fetch(`${baseUrl}/users`, {
    headers: {
      'x-admin-api-key': adminApiKey
    }
  });
  const data = await response.json();
  return data.data.users;
}

// Get messages for a specific user
async function getUserMessages(userId) {
  const response = await fetch(`${baseUrl}/messages?userId=${userId}`, {
    headers: {
      'x-admin-api-key': adminApiKey
    }
  });
  const data = await response.json();
  return data.data.messages;
}

// Usage
(async () => {
  const stats = await getDashboardStats();
  console.log(`Total Users: ${stats.totalUsers}`);
  
  const users = await getAllUsers();
  console.log(`Found ${users.length} users`);
  
  if (users.length > 0) {
    const messages = await getUserMessages(users[0].id);
    console.log(`User has ${messages.length} messages`);
  }
})();
```

### Using Axios

```javascript
const axios = require('axios');

const adminApi = axios.create({
  baseURL: 'http://localhost:3000/api/admin',
  headers: {
    'x-admin-api-key': 'your-admin-api-key'
  }
});

// Get dashboard stats
adminApi.get('/dashboard')
  .then(response => {
    console.log('Dashboard Stats:', response.data.data);
  })
  .catch(error => {
    console.error('Error:', error.response?.data || error.message);
  });

// Get all users
adminApi.get('/users')
  .then(response => {
    const users = response.data.data.users;
    console.log(`Found ${users.length} users`);
  });

// Get messages with filters
adminApi.get('/messages', {
  params: {
    userId: 'xxx',
    limit: 100,
    offset: 0
  }
})
  .then(response => {
    const messages = response.data.data.messages;
    console.log(`Found ${messages.length} messages`);
  });
```

---

## Python Examples

### Using requests

```python
import requests
import json

admin_api_key = 'your-admin-api-key'
base_url = 'http://localhost:3000/api/admin'
headers = {'x-admin-api-key': admin_api_key}

# Get dashboard stats
def get_dashboard_stats():
    response = requests.get(f'{base_url}/dashboard', headers=headers)
    response.raise_for_status()
    return response.json()['data']

# Get all users
def get_all_users():
    response = requests.get(f'{base_url}/users', headers=headers)
    response.raise_for_status()
    return response.json()['data']['users']

# Get messages with filters
def get_messages(user_id=None, topic_id=None, limit=1000, offset=0):
    params = {'limit': limit, 'offset': offset}
    if user_id:
        params['userId'] = user_id
    if topic_id:
        params['topicId'] = topic_id
    
    response = requests.get(f'{base_url}/messages', headers=headers, params=params)
    response.raise_for_status()
    return response.json()['data']['messages']

# Usage
if __name__ == '__main__':
    stats = get_dashboard_stats()
    print(f"Total Users: {stats['totalUsers']}")
    print(f"Total Messages: {stats['totalMessages']}")
    
    users = get_all_users()
    print(f"Found {len(users)} users")
    
    if users:
        messages = get_messages(user_id=users[0]['id'])
        print(f"User has {len(messages)} messages")
```

---

## Data Export Workflow

### Export All Data to JSON Files

**PowerShell Script:**
```powershell
$adminKey = 'your-admin-api-key'
$headers = @{'x-admin-api-key' = $adminKey}
$baseUrl = 'http://localhost:3000/api/admin'

# Export dashboard stats
Invoke-WebRequest -Uri "$baseUrl/dashboard" -Headers $headers -OutFile "dashboard_stats.json"

# Export users
Invoke-WebRequest -Uri "$baseUrl/users" -Headers $headers -OutFile "users.json"

# Export messages
Invoke-WebRequest -Uri "$baseUrl/messages" -Headers $headers -OutFile "messages.json"

# Export surveys
Invoke-WebRequest -Uri "$baseUrl/surveys/literacy" -Headers $headers -OutFile "literacy_surveys.json"
Invoke-WebRequest -Uri "$baseUrl/surveys/post-topic" -Headers $headers -OutFile "post_topic_surveys.json"

Write-Host "All data exported successfully!"
```

**Bash Script:**
```bash
#!/bin/bash
ADMIN_KEY="your-admin-api-key"
BASE_URL="http://localhost:3000/api/admin"

curl -H "x-admin-api-key: $ADMIN_KEY" "$BASE_URL/dashboard" > dashboard_stats.json
curl -H "x-admin-api-key: $ADMIN_KEY" "$BASE_URL/users" > users.json
curl -H "x-admin-api-key: $ADMIN_KEY" "$BASE_URL/messages" > messages.json
curl -H "x-admin-api-key: $ADMIN_KEY" "$BASE_URL/surveys/literacy" > literacy_surveys.json
curl -H "x-admin-api-key: $ADMIN_KEY" "$BASE_URL/surveys/post-topic" > post_topic_surveys.json

echo "All data exported successfully!"
```

---

## Troubleshooting

### 401 Unauthorized

**Problem:** Getting 401 error even with correct key.

**Solution:**
1. Check that the `x-admin-api-key` header is being sent correctly
2. Verify the key matches the one in your `.env` file
3. In development, try without the header (if no key is set)

### 500 Internal Server Error

**Problem:** Server error when accessing endpoints.

**Solution:**
1. Check backend server logs for detailed error messages
2. Ensure database is connected and migrations are run
3. Verify all required environment variables are set
4. Restart the backend server after making code changes

### Connection Refused

**Problem:** Can't connect to `http://localhost:3000`

**Solution:**
1. Ensure backend server is running: `cd backend && npm run dev`
2. Check the server is listening on port 3000
3. Verify no firewall is blocking the connection

---

## Next Steps

- See [Admin API Documentation](./docs/ADMIN_API_DOCUMENTATION.md) for complete API reference
- See [Admin Access Guide](./ADMIN_ACCESS_GUIDE.md) for data access options
- See [Database Schema](./docs/DATABASE_SCHEMA.md) for direct database queries
