# R Art Temple LMS

A private web-based learning and assessment platform for an offline coaching institute.

## Overview

**R Art Temple LMS** is a private ed-tech platform built for a coaching institute run by a single teacher who teaches **Mathematics** and **Science** to students from **Class 6 to Class 10**.

The institute has approximately **100 students**, and this platform is designed so that **only enrolled students** can access the system. No outsider student should be able to use the platform.

This platform digitizes the academic workflow of the coaching institute by providing:

- controlled student access
- class-wise and subject-wise MCQ tests
- scheduled assessments
- leaderboard ranking
- performance analytics

---

## Problem Statement

The coaching institute currently operates offline. Students attend classes physically, but there is no centralized digital system for:

- managing student access
- conducting tests online
- tracking student performance
- comparing results through leaderboard and analytics

This project aims to solve that by building a **private LMS + assessment platform**.

---

## Core Business Rule

This is **not** a public ed-tech app.

### Access model:
- Students can sign up
- Their account stays in **pending** status
- Only the teacher/admin can approve them
- Only **approved students** can access the platform

### Admin model:
- There is **only one teacher/admin**
- No public admin signup will exist
- Admin account will be created manually or via a seed script

---

## MVP Features

### Student Features
- Signup / Login
- Approval-based access
- Student dashboard
- View upcoming scheduled tests
- Attempt MCQ tests
- Submit tests
- View results
- View leaderboard
- View personal analytics

### Admin Features
- Admin login
- Dashboard
- Approve / reject students
- View all students
- Create/manage question bank
- Create scheduled tests
- Assign tests by class and subject
- View student submissions
- View leaderboard
- View analytics

---

## Academic Structure

- Classes: 6, 7, 8, 9, 10
- Subjects: Mathematics, Science

### Content hierarchy:
Class → Subject → Chapter → Test

---

## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- Axios
- React Hook Form
- Recharts

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt
- cookie-parser
- Mongoose

### Database
- MongoDB Atlas

### Deployment
- Frontend: Vercel
- Backend: Render / Railway

---

## Planned Architecture

```text
r-art-temple-lms/
├── Frontend/     # React frontend
├── Backend/     # Node.js backend
├── docs/       # Project planning and technical docs
├── .gitignore
└── README.md
```

---

## Development Approach

This project will be built in phases:

1. Project planning and architecture
2. Authentication + student approval system
3. Admin dashboard
4. Question bank system
5. Test creation and scheduling
6. Test attempt flow
7. Result calculation + leaderboard
8. Analytics dashboard
9. Deployment and polish

---

## Status

Currently in planning and architecture phase.

---

## Author
* **Rishikesh Shaw** - [github](https://github.com/rishikesh04)
* **Email** - rishikeshshaw04@gmail.com
* **LinkedIn** - [Rishikesh Shaw](https://www.linkedin.com/in/rishikeshshaw/)


Built as a real-world full-stack project for a private coaching institute LMS.