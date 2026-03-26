# API Plan - R Art Temple LMS

## Base URL

```text
/api
```

---

# Auth Routes

## Student Signup
```http
POST /api/auth/signup
```

## Login (student/admin)
```http
POST /api/auth/login
```

## Logout
```http
POST /api/auth/logout
```

## Current User
```http
GET /api/auth/me
```

---

# Admin Routes

## Get Pending Students
```http
GET /api/admin/students/pending
```

## Approve Student
```http
PATCH /api/admin/students/:id/approve
```

## Reject Student
```http
PATCH /api/admin/students/:id/reject
```

## Get All Students
```http
GET /api/admin/students
```

## Admin Dashboard
```http
GET /api/admin/dashboard
```

---

# Question Routes

## Create Question
```http
POST /api/questions
```

## Get All Questions
```http
GET /api/questions
```

## Get Single Question
```http
GET /api/questions/:id
```

## Update Question
```http
PATCH /api/questions/:id
```

## Delete Question
```http
DELETE /api/questions/:id
```

---

# Test Routes

## Create Test
```http
POST /api/tests
```

## Get All Tests
```http
GET /api/tests
```

## Get Single Test
```http
GET /api/tests/:id
```

## Update Test
```http
PATCH /api/tests/:id
```

## Delete Test
```http
DELETE /api/tests/:id
```

## Get Upcoming Tests (student)
```http
GET /api/tests/upcoming
```

## Get Tests for My Class
```http
GET /api/tests/my-class
```

---

# Attempt Routes

## Start Test
```http
POST /api/attempts/start/:testId
```

## Submit Test
```http
POST /api/attempts/submit/:testId
```

## Get Result
```http
GET /api/attempts/result/:testId
```

## Attempt History
```http
GET /api/attempts/history
```

---

# Leaderboard Routes

## Get Leaderboard for a Test
```http
GET /api/tests/:testId/leaderboard
```

---

# Analytics Routes

## Get My Analytics
```http
GET /api/analytics/student/me
```

## Get Student Analytics (admin)
```http
GET /api/analytics/student/:studentId
```

## Get Test Analytics
```http
GET /api/analytics/test/:testId
```

---

# Security Rules

- Students should not access admin routes
- Unapproved students should not access protected student routes
- Students should only access tests for their own class
- Students should not see answers before submission
- Students should not attempt the same test multiple times (MVP)