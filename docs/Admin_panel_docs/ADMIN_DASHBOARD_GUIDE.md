# Admin Dashboard Guide

## Overview

The admin dashboard is built into the website at `/#/admin`. Access requires the **admin API key** (the `ADMIN_API_KEY` environment variable configured on the backend). There are no hardcoded admin credentials — the key is entered in the browser, verified against the backend, and kept only for the current browser session.

---

## How to Access

1. **Go to your website's admin route:** `https://your-netlify-site.netlify.app/#/admin`
   (a plain `/admin` URL redirects there automatically)
2. **Enter the admin API key** in the "Admin Access" form — the value of `ADMIN_API_KEY` set in the backend's environment (Render dashboard → your service → Environment).
3. The key is verified against the backend (`GET /api/admin/verify`). On success the dashboard loads.

The key is stored in `sessionStorage` only — closing the tab clears it, and you'll be asked for it again next time.

---

## What You Can See in Admin Dashboard

### 1. Dashboard Statistics
- Total users
- Total messages
- Completed literacy surveys
- Completed post-topic surveys
- Agent distribution

### 2. Users Tab
- All registered users
- Email addresses
- Assigned agents (with EQ/IQ)
- Topic progress
- Literacy survey completion status
- Created dates
- **Click "View Details"** to see complete user data

### 3. Messages Tab
- All chat messages
- User emails
- Topic titles
- Message content
- Timestamps
- Role (user/agent)

### 4. Literacy Surveys Tab
- All AI literacy survey responses
- User emails
- Question IDs
- Response values
- Dates

### 5. Post-Topic Surveys Tab
- All post-topic survey responses
- User emails
- Topic titles
- Question IDs
- Response values (1-7 Likert scale)
- Dates

---

## Features

### Search
- Search users by email or ID
- Search messages by content, user, or topic

### Export Data
- Click **"Export CSV"** button on any tab
- Downloads data as CSV file for analysis
- File name includes date

### User Details
- Click **"View Details"** on any user
- See complete user information:
  - User profile
  - All messages
  - All survey responses
  - Progress statistics

---

## Security

- The backend validates the `x-admin-api-key` header on every `/api/admin/*` request (timing-safe comparison).
- If `ADMIN_API_KEY` is not set on the backend, the admin API is **disabled entirely** — there is no fallback key and no development bypass.
- Admin endpoints are rate-limited (100 requests / 15 minutes), which also throttles key guessing.
- The key never ships in the frontend bundle and is never written to disk by the app; treat it like a password and share it only with researchers who need data access.

---

## Logout

- Click **"Logout"** button in top right
- Clears the stored admin key and returns to the main page

---

## Troubleshooting

### "Access denied" / "Invalid admin key"

1. Confirm the key matches `ADMIN_API_KEY` in the backend environment exactly (no leading/trailing spaces).
2. If the backend responds with "Admin API is disabled", `ADMIN_API_KEY` is not set on the server — add it in the Render dashboard and redeploy/restart.

### Data Not Loading

1. **Check backend is running:**
   - Verify Render backend is live (`/health` endpoint)
   - Check backend logs for errors
2. On the free tier the backend may need ~30–60s to wake from idle; the dashboard waits on `/health` before loading.

### Changing the key

Set a new `ADMIN_API_KEY` in the Render environment and restart the service. Anyone using the dashboard just enters the new key — no frontend change or redeploy is needed.
