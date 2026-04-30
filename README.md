# 🚀 Team Task Manager (Full-Stack MERN)

A collaborative full-stack web application designed for teams to create projects, assign tasks, and track progress in real-time. Built to satisfy the requirements of a rigorous full-stack engineering assignment.

## ✨ Features

- **Secure Authentication:** JWT-based HTTP-only cookie authentication with secure password hashing.
- **Role-Based Access Control (RBAC):** Strict separation of privileges.
  - **Admins:** Can create projects, add team members, and create/assign tasks.
  - **Members:** Can view their assigned tasks and update task statuses.
- **Project & Team Management:** Dynamic forms to initialize projects and assign multiple users from the database.
- **Task Tracking:** Granular task controls including Status (To Do, Doing, Done), Priority levels, and Due Dates.
- **Smart Dashboard:** Live statistics calculating total tasks, status breakdowns, and a dynamic overdue tracking system that highlights past-due tasks in red.

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS v4, React Router DOM, Axios, React Hot Toast.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose ORM).
- **Security:** JSON Web Tokens (JWT), Bcrypt.js, CORS, Cookie Parser.

## ⚙️ Local Setup Instructions

If you wish to run this application locally, follow these steps:

### 1. Backend Setup
\`\`\`bash
cd task-manager-backend
npm install
\`\`\`
Create a `.env` file in the root of the backend folder with the following variables:
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
\`\`\`
Start the server:
\`\`\`bash
npm run dev
\`\`\`

### 2. Frontend Setup
\`\`\`bash
cd task-manager-frontend
npm install
\`\`\`
Start the Vite development server:
\`\`\`bash
npm run dev
\`\`\`

## 🌐 Live Deployment

- **Frontend Application:** []()
- **Backend API:** [task-manager-backend-production-00e4.up.railway.app](task-manager-backend-production-00e4.up.railway.app)

*Note: The backend is hosted on a free tier, so the initial API request may take up to 30 seconds to wake the server from sleep.*