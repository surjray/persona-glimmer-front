# Admin Dashboard Guide

## Overview

The admin dashboard is now built into the website. The owner can log in with special credentials to view all database data directly in the browser.

---

## Admin Login Credentials

**Email:** `yazdani.e@gmail.com`  
**Password:** `backend123`

---

## How to Access

1. **Go to your website** (Netlify URL)
2. **Click "Sign In"** (or go to login page)
3. **Enter admin credentials:**
   - Email: `yazdani.e@gmail.com`
   - Password: `backend123`
4. **Click "Sign In"**
5. **You'll be automatically redirected to:** `/admin` (Admin Dashboard)

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

- ✅ Only `yazdani.e@gmail.com` with password `backend123` can access
- ✅ Admin dashboard is protected route
- ✅ Regular users cannot access `/admin` route
- ✅ Admin API key (`backend123`) is used for data access

---

## Logout

- Click **"Logout"** button in top right
- Returns to main login page
- Clears admin session

---

## Direct URL Access

If you're already logged in as admin, you can directly visit:
```
https://your-netlify-site.netlify.app/admin
```

**Note:** If you're not logged in as admin, you'll be redirected to the main page.

---

## Troubleshooting

### Can't Access Admin Dashboard

1. **Check credentials:**
   - Email must be exactly: `yazdani.e@gmail.com`
   - Password must be exactly: `backend123`
   - Case-sensitive

2. **Clear browser cache:**
   - Clear localStorage
   - Try logging in again

3. **Check URL:**
   - Should redirect to `/admin` after login
   - If not, manually go to `/admin`

### Data Not Loading

1. **Check backend is running:**
   - Verify Render backend is live
   - Check backend logs for errors

2. **Check Admin API Key:**
   - Should be `backend123` in Render environment variables
   - Should match the key in the code

---

## Summary

✅ **Admin Dashboard:** Built into website  
✅ **Login:** `yazdani.e@gmail.com` / `backend123`  
✅ **Access:** Automatic redirect after admin login  
✅ **Features:** View all users, messages, surveys  
✅ **Export:** CSV download available  
✅ **Security:** Protected route, only owner can access

---

## Next Steps

1. **Test admin login:**
   - Go to your website
   - Login with admin credentials
   - Should see admin dashboard

2. **Explore data:**
   - Browse different tabs
   - View user details
   - Export data as needed

3. **Commit changes:**
   ```bash
   git add src/pages/AdminDashboard.tsx src/pages/Index.tsx src/App.tsx src/lib/api.ts
   git commit -m "Add admin dashboard with database access"
   git push origin main
   ```
