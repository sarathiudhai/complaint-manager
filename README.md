# ResolveX Complaint Management System

## 1. Project Name

**ResolveX — Complaint Management System**

## 2. Project Description

ResolveX is a MERN application for submitting and managing complaints through a ticket lifecycle. It provides separate workflows for end users, support staff, and administrators.

## 3. Key Features

- User registration, login, and profile updates
- Complaint submission with category and priority
- Role-scoped complaint lists, search, and filters
- Staff assignment and complaint status updates
- Complaint comments, staff/admin internal notes, and user feedback
- Role-specific dashboards and summary statistics
- Admin management of staff, users, and categories

## 4. Technology Stack

- **Frontend:** React 18, Vite, React Router, Axios, Lucide React, CSS
- **Backend:** Node.js, Express 4, JSON Web Tokens, bcryptjs
- **Database:** MongoDB with Mongoose
- **Development database fallback:** MongoMemoryServer when no `MONGO_URI` is configured

## 5. Project Structure

```text
backend/
  config/       MongoDB connection
  controllers/  API request handlers
  middleware/   Authentication, authorization, errors, and rate limits
  models/       Mongoose schemas
  routes/       Express API routes
  seed/         Demo data and targeted seed scripts
  utils/        Shared backend utilities
frontend/
  src/
    components/ Reusable UI components
    context/    Authentication context
    pages/      Application pages
    services/   Axios API client
    styles/     Application styles
  dist/         Vite build output
```

## 6. Setup and Installation

Install dependencies separately in the backend and frontend:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

Configure the backend environment variables before starting the API. Use the category-only seed command to add the default categories without clearing application data.

## 7. Environment Variables

Create `backend/.env` using the following keys. Replace the placeholders with values for your environment; do not commit this file or real secrets.

```env
PORT=5000
MONGO_URI=mongodb+srv://<database-user>:<url-encoded-password>@<cluster-host>/<database-name>?retryWrites=true&w=majority
JWT_SECRET=<a-long-random-secret>
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

`ALLOWED_ORIGINS` is optional; the backend has local development defaults. When `MONGO_URI` is configured but cannot connect, the backend exits rather than silently switching to an in-memory database.

## 8. How to Run the Application

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The API defaults to `http://localhost:5000`; Vite serves the frontend at `http://localhost:5173` and proxies `/api` requests to the backend.

### Basic App Flow

1. Sign in with one of the demo accounts listed at the end of this README, or register a new User account.
2. As a User, open the dashboard, submit a complaint, then track its status and comments under **My Complaints**.
3. As an Admin, review complaints, manage categories and accounts, and assign complaints to Staff.
4. As Staff, open the assigned queue, update complaint status, add comments or internal notes, and provide resolution notes.
5. As a User, view the completed complaint and leave feedback after it is resolved.

## 9. MongoDB Atlas Setup

1. Create an Atlas cluster and database user.
2. Allow the development machine's IP address in the Atlas network access settings.
3. Copy the application's connection string into `MONGO_URI`, replace the placeholders, and URL-encode special characters in the database user's password.
4. Choose the database name in the connection string, then seed categories with:

   ```bash
   cd backend
   npm run seed:categories
   ```

The category seeder adds missing defaults and leaves existing categories, users, and complaints untouched. The general `npm run seed` script is destructive: it clears users, categories, and complaints before inserting demo data. Do not run it against data you need to preserve.

## 10. Authentication and Role-Based Access

Passwords are hashed with bcryptjs. Login returns a JWT that the frontend stores in browser `localStorage` and sends as a bearer token. Tokens expire after seven days. Backend middleware authenticates requests and checks roles; complaint access is additionally scoped by creator for Users and assignee for Staff, while Admins can access all complaints. Public registration creates User accounts; Admins can create Staff accounts.

## 11. Code0 Usage

Code0 was used throughout the project as an efficient development assistant: to understand and analyze the existing MERN architecture, identify bugs and authorization issues, improve backend behavior, troubleshoot MongoDB Atlas integration and database startup, and resolve category loading and seeding. It also assisted with reviewing and validating changes, improving reliability and maintainability, and troubleshooting issues during development.

## 12. AI Development Experience

I remained responsible for development decisions and reviewed Code0 suggestions before using them. I manually tested the application and verified relevant changes with code inspection, syntax checks, the frontend production build, and the Atlas seed run. Code0 served as a development partner for analysis and implementation—not a substitute for my review or verification.

## 13. Specific Code0 Tasks

- Hardened backend complaint detail and comment authorization for User, Staff, and Admin roles.
- Filtered internal comments from user-facing complaint detail, list, dashboard, and comment responses.
- Improved MongoDB Atlas connection handling and API startup reliability when a configured database is unavailable.
- Added non-destructive category seeding for Atlas.
- Traced the frontend category request through the backend route, controller, model, and seed/database setup; verified the frontend build and seeded the configured Atlas database to resolve the empty category list.
- Added a non-destructive targeted seeder for the demo Admin and Staff accounts.

## Demo Admin and Staff Login Credentials

Enter these credentials on the Login page. The login form currently uses manual entry; quick-fill controls are not present. These accounts were seeded into the configured Atlas database, but will work only when the application is connected to that database and the accounts remain active.

| Role | Email | Password | Main workflow |
|---|---|---|---|
| Admin | `admin@resolvex.com` | `Admin@123` | Manage categories, users, and staff; review and assign complaints |
| Staff — Technical Support | `staff1@resolvex.com` | `Staff@123` | Work on complaints assigned to Technical Support |
| Staff — Billing & Accounts | `staff2@resolvex.com` | `Staff@123` | Work on complaints assigned to Billing & Accounts |

These are shared demo credentials for a controlled assessment environment only. Do not use them for a production deployment; replace or disable demo accounts before exposing an environment publicly.
