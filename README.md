# EduManage - Student Management System

A minimalist, modern, and highly responsive Student Management Dashboard built with **Next.js** (Frontend) and **Node.js/Express** (Backend), backed by a **PostgreSQL** database.

## Features
- **Role-Based Portals:** Separate secure dashboards for Teachers and Students.
- **Attendance Tracking:** Clean, calendar-based interfaces for marking daily attendance and viewing historical records.
- **Monthly Analytics:** Automatic calculation of classes attended and attendance percentage rates.
- **Export & Print:** Built-in PDF/Print layouts for monthly reports.
- **Minimalist UI:** Custom Date and Month pickers replacing clunky native browser inputs. Fully responsive on Mobile and Desktop. Dual Light/Dark mode themes.

## Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS v4, Lucide Icons, Date-fns.
- **Backend:** Node.js, Express, PostgreSQL, JSON Web Tokens (JWT) for Auth, Helmet & Express-Rate-Limit for security.

## Getting Started

### 1. Database Setup
Ensure PostgreSQL is installed and running. Create a database named `student_management` and run the queries found in `backend/database.sql` to generate the schema and seed data.

### 2. Backend Setup
```bash
cd backend
npm install
# Ensure a .env file is present with DB_USER, DB_PASSWORD, JWT_SECRET, etc.
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:3000` to interact with the application.
