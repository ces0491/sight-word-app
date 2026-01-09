# API Documentation

## Sight Word Story Generator

This document describes all API endpoints available in the Sight Word Story Generator application.

---

## Table of Contents

- [Authentication](#authentication)
- [Stories](#stories)
- [Analytics](#analytics)
- [Images](#images)
- [Error Handling](#error-handling)

---

## Base URL

**Development**: `http://localhost:3000/api`
**Production**: `https://your-domain.com/api`

---

## Authentication

All protected endpoints require authentication via NextAuth session cookies.

### Register User

Create a new user account.

**Endpoint**: `POST /auth/register`

**Authentication**: None required

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (201 Created):

```json
{
  "message": "User created successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "teacher"
  }
}
```

**Errors**:

- `400` - Missing required fields or user already exists
- `500` - Server error

---

### Login

Login is handled by NextAuth at `/api/auth/signin`

See NextAuth documentation for details.

---

## Stories

### List User Stories

Get all stories created by the authenticated user.

**Endpoint**: `GET /stories`

**Authentication**: Required

**Response** (200 OK):

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "title": "Fun at the Park",
    "content": [
      "We went to the park.",
      "I saw a dog.",
      "The dog was happy."
    ],
    "words": ["park", "dog", "happy"],
    "format": "highlighted",
    "includeImages": true,
    "grade": 1,
    "learningNeeds": {
      "adhd": false,
      "dyslexia": true,
      "autism": false,
      "esl": false,
      "visualProcessing": false
    },
    "sharedWith": [],
    "createdAt": "2025-01-09T12:00:00.000Z"
  }
]
```

**Errors**:

- `401` - Unauthorized
- `500` - Server error

---

### Create Story

Create a new story.

**Endpoint**: `POST /stories`

**Authentication**: Required

**Request Body**:

```json
{
  "title": "My New Story",
  "content": ["Sentence one.", "Sentence two."],
  "words": ["word1", "word2"],
  "format": "highlighted",
  "includeImages": true,
  "grade": 2,
  "learningNeeds": {
    "adhd": false,
    "dyslexia": false,
    "autism": false,
    "esl": false,
    "visualProcessing": false
  }
}
```

**Response** (201 Created):

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "title": "My New Story",
  "content": ["Sentence one.", "Sentence two."],
  "words": ["word1", "word2"],
  "format": "highlighted",
  "includeImages": true,
  "grade": 2,
  "learningNeeds": {
    "adhd": false,
    "dyslexia": false,
    "autism": false,
    "esl": false,
    "visualProcessing": false
  },
  "sharedWith": [],
  "createdAt": "2025-01-09T12:00:00.000Z"
}
```

**Errors**:

- `400` - Invalid data
- `401` - Unauthorized
- `500` - Server error

---

### Get Story by ID

Get a specific story by ID.

**Endpoint**: `GET /stories/:id`

**Authentication**: Required

**Parameters**:

- `id` (path) - Story ID

**Response** (200 OK):

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "title": "Fun at the Park",
  "content": ["We went to the park."],
  "words": ["park"],
  "format": "highlighted",
  "includeImages": true,
  "grade": 1,
  "learningNeeds": {},
  "sharedWith": [],
  "createdAt": "2025-01-09T12:00:00.000Z"
}
```

**Errors**:

- `401` - Unauthorized
- `404` - Story not found
- `500` - Server error

---

### Update Story

Update an existing story.

**Endpoint**: `PUT /stories/:id`

**Authentication**: Required

**Parameters**:

- `id` (path) - Story ID

**Request Body**: (partial update supported)

```json
{
  "title": "Updated Title",
  "content": ["New sentence."]
}
```

**Response** (200 OK):

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Updated Title",
  "content": ["New sentence."],
  ...
}
```

**Errors**:

- `400` - Invalid data
- `401` - Unauthorized
- `404` - Story not found
- `500` - Server error

---

### Delete Story

Delete a story.

**Endpoint**: `DELETE /stories/:id`

**Authentication**: Required

**Parameters**:

- `id` (path) - Story ID

**Response** (200 OK):

```json
{
  "message": "Story deleted successfully"
}
```

**Errors**:

- `401` - Unauthorized
- `404` - Story not found
- `500` - Server error

---

### Share Story

Share a story via email.

**Endpoint**: `POST /stories/:id/share`

**Authentication**: Required

**Parameters**:

- `id` (path) - Story ID

**Request Body**:

```json
{
  "email": "recipient@example.com",
  "message": "Optional personal message"
}
```

**Response** (200 OK):

```json
{
  "success": true
}
```

**Errors**:

- `400` - Email is required
- `401` - Unauthorized
- `404` - Story not found
- `500` - Server error
- `503` - Email service not configured

**Error Codes**:

- `EMAIL_NOT_CONFIGURED` - SMTP settings not configured

---

## Analytics

### Track Word Usage

Track sight words used in stories (called automatically by story generation).

**Endpoint**: `POST /analytics/trackWords`

**Authentication**: Required

**Request Body**:

```json
{
  "words": ["cat", "dog", "run"],
  "grade": 1
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "count": 3
}
```

**Errors**:

- `400` - Words array required
- `401` - Unauthorized
- `500` - Server error

---

### Get Word Usage Statistics

Get analytics on word usage across all user stories.

**Endpoint**: `GET /analytics/wordUsage`

**Authentication**: Required

**Response** (200 OK):

```json
{
  "topWords": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "word": "cat",
      "count": 45
    },
    {
      "word": "dog",
      "count": 38
    }
  ],
  "byGrade": {
    "0": 10,
    "1": 25,
    "2": 15,
    "3": 8,
    "4": 5,
    "5": 2
  },
  "totalStories": 42,
  "totalUniqueWords": 156
}
```

**Errors**:

- `401` - Unauthorized
- `500` - Server error

---

### Get Suggested Words

Get suggested sight words for a specific grade level.

**Endpoint**: `GET /analytics/suggestedWords?grade=1`

**Authentication**: Required

**Query Parameters**:

- `grade` (optional) - Grade level (0-5), defaults to 1

**Response** (200 OK):

```json
{
  "grade": 1,
  "suggestedWords": [
    "he", "she", "we", "they", "was",
    "for", "are", "you", "have", "with",
    "the", "a", "and", "I", "to"
  ]
}
```

**Errors**:

- `400` - Invalid grade level
- `401` - Unauthorized
- `500` - Server error

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "message": "Human-readable error message",
  "code": "ERROR_CODE" // (optional)
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error
- `503` - Service Unavailable

### Special Error Codes

- `EMAIL_NOT_CONFIGURED` - Email service is not set up

---

## Rate Limiting

**Current Status**: ❌ Not implemented

**Recommendation**: Implement rate limiting before production launch to prevent abuse.

---

## Authentication Flow

1. User registers via `/api/auth/register`
2. User logs in via NextAuth
3. NextAuth creates a session cookie
4. Session cookie is sent with each request
5. Server validates session on protected routes

---

## Data Models

### Story

```typescript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  title: string,
  content: string[], // Array of sentences
  words: string[], // Array of sight words
  format: 'highlighted' | 'bold' | 'underlined' | 'normal',
  includeImages: boolean,
  grade: number, // 0-5 (0 = Kindergarten)
  learningNeeds: {
    adhd: boolean,
    dyslexia: boolean,
    autism: boolean,
    esl: boolean,
    visualProcessing: boolean
  },
  sharedWith: string[], // Array of email addresses
  createdAt: Date
}
```

### User

```typescript
{
  _id: ObjectId,
  name: string,
  email: string, // Unique
  password: string, // Hashed with bcrypt
  role: 'teacher' | 'admin',
  createdAt: Date
}
```

### WordAnalytics

```typescript
{
  _id: ObjectId,
  word: string, // Unique
  count: number,
  gradeLevel: {
    0: number,
    1: number,
    2: number,
    3: number,
    4: number,
    5: number
  },
  lastUsed: Date
}
```

---

## Examples

### Complete Story Creation Flow

```javascript
// 1. Register a user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Teacher',
    email: 'jane@school.edu',
    password: 'securePassword123'
  })
});

// 2. Login (handled by NextAuth - creates session cookie)

// 3. Create a story
const storyResponse = await fetch('/api/stories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My First Story',
    content: ['The cat is happy.', 'The dog is happy too.'],
    words: ['cat', 'dog', 'happy'],
    format: 'highlighted',
    includeImages: true,
    grade: 1,
    learningNeeds: { dyslexia: true }
  })
});

const story = await storyResponse.json();

// 4. Share the story
await fetch(`/api/stories/${story._id}/share`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'parent@example.com',
    message: 'Here is the story we created today!'
  })
});

// 5. Get analytics
const analyticsResponse = await fetch('/api/analytics/wordUsage');
const analytics = await analyticsResponse.json();
console.log(`Total stories: ${analytics.totalStories}`);
```

---

## Security Considerations

1. **Authentication**: All story and analytics endpoints require authentication
2. **Authorization**: Users can only access their own stories
3. **Input Validation**: All inputs are validated
4. **Password Hashing**: Passwords are hashed with bcrypt (10 salt rounds)
5. **SQL Injection**: N/A - uses MongoDB with Mongoose ORM
6. **XSS**: React automatically escapes output

---

## Known Limitations

1. No pagination on story lists (returns all user stories)
2. No rate limiting (vulnerable to abuse)
3. Email sharing requires manual SMTP configuration
4. AI image generation requires OpenAI API key (SVG fallback available)

---

## Support

For questions or issues:

- GitHub Issues: [https://github.com/ces0491/sight-word-app/issues](https://github.com/ces0491/sight-word-app/issues)
- Email: [Contact information]

---

Last Updated: 2026-01-09
