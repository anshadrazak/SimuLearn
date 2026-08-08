# LMS Platform

A scalable, full-stack learning management platform built with React, Vite, Node.js, Express, and MongoDB.

## Features
- Role-based access control (Student, Instructor, Admin)
- Course management with modules, lessons, labs, assignments, quizzes, scenarios
- JWT authentication
- File uploads and practical labs
- Progress tracking and certificates
- Color-coded courses (Software Development, DevOps, Cybersecurity, ComplyMint Compliance Auditing)

## Setup

### Backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Project Structure
```
server/
  config/
  controllers/
  middlewares/
  models/
  routes/
  utils/
  uploads/
  tests/
client/
  src/
    pages/
    components/
    contexts/
    services/
    styles/
```

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB
- Auth: JWT