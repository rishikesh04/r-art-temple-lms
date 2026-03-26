# Database Schema Plan - R Art Temple LMS

## Main Collections

- users
- chapters
- questions
- tests
- testAttempts

---

# 1. Users Collection

## Purpose
Stores admin and student accounts.

## Fields

```js
{
  _id,
  name: String,
  email: String,
  phone: String,
  password: String,
  role: "student" | "admin",
  classLevel: "6" | "7" | "8" | "9" | "10",
  status: "pending" | "approved" | "rejected",
  createdAt: Date,
  updatedAt: Date
}
```

---

# 2. Chapters Collection

## Purpose
Stores chapter names mapped to class and subject.

## Fields

```js
{
  _id,
  classLevel: String,
  subject: String,
  name: String
}
```

---

# 3. Questions Collection

## Purpose
Stores reusable MCQ questions.

## Fields

```js
{
  _id,
  questionText: String,
  options: [String],
  correctAnswer: String,
  explanation: String,
  classLevel: String,
  subject: String,
  chapter: String,
  difficulty: "easy" | "medium" | "hard",
  marks: Number,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

# 4. Tests Collection

## Purpose
Stores scheduled MCQ tests.

## Fields

```js
{
  _id,
  title: String,
  description: String,
  classLevel: String,
  subject: String,
  chapter: String,
  questionIds: [ObjectId],
  durationInMinutes: Number,
  totalMarks: Number,
  startTime: Date,
  endTime: Date,
  status: "draft" | "published" | "closed",
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

# 5. TestAttempts Collection

## Purpose
Stores student test submissions and result data.

## Fields

```js
{
  _id,
  testId: ObjectId,
  studentId: ObjectId,
  answers: [
    {
      questionId: ObjectId,
      selectedOption: String,
      isCorrect: Boolean
    }
  ],
  score: Number,
  correctCount: Number,
  incorrectCount: Number,
  unattemptedCount: Number,
  accuracy: Number,
  timeTaken: Number,
  submittedAt: Date,
  rank: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

# Relationship Overview

## User → TestAttempt
One student can have many test attempts.

## Test → TestAttempt
One test can have many attempts.

## Test → Questions
One test contains many questions.

## Question → Admin
Questions are created by admin.

---

# Important Business Logic

- Only approved students should access tests
- Students can only access tests for their own class
- Students should only attempt a test once (MVP)
- Leaderboard should be generated from `testAttempts`