# Research-Focused Chat Platform

A research-focused chat platform where users interact with one of 9 predefined service agents across 20 topics, complete surveys, and have all interactions logged for later analysis.

## 📚 Documentation

- **[Product Requirements Document (PRD)](./PRD.md)** - Complete project overview and requirements
- **[Backend Implementation Plan](./docs/BACKEND_IMPLEMENTATION.md)** - Detailed backend development guide
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Admin API Documentation](./docs/ADMIN_API_DOCUMENTATION.md)** - Admin endpoints for data access and analysis
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Database structure and relationships

## Project Overview

This is a research V1 system that prioritizes correctness of flow over polish. The platform enables:

- **User Authentication** - Email/password authentication with persistent agent assignment
- **Agent Interactions** - Chat with one of 9 predefined agents across 20 topics
- **Survey System** - AI literacy survey (one-time) and post-topic surveys (16 questions each)
- **Data Logging** - All interactions logged for research analysis
- **Topic Progression** - Sequential topic unlocking after survey completion

## Tech Stack

### Frontend (Current)
- Vite + TypeScript + React
- shadcn-ui + Tailwind CSS
- React Router
- TanStack Query

### Backend (To Be Built)
- Node.js + Express
- PostgreSQL
- OpenAI API (ChatGPT)
- Deployed on Render

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
