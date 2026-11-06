# API Documentation

## Sight Word Story Generator

This document describes all API endpoints available in the Sight Word Story Generator application.

---

## Table of Contents

- [Authentication](#authentication)
- [Stories](#stories)
- [Shared Stories](#shared-stories)
- [AI Stories](#ai-stories)
- [Analytics](#analytics)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Base URL

**Development**: `http://localhost:3000/api`
**Production**: `https://your-domain.com/api`

---

## Authentication

All protected endpoints require authentication via NextAuth session cookies.

Request bodies are validated with the Zod schemas in [`lib/validation.js`](../lib/validation.js). Fields a schema doesn't list are ignored, and size limits come from [`lib/limits.js`](../lib/limits.js).

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

`title`, `content`, `words` and `grade` (integer 0-3) are required. `format` defaults to `highlighted`, `includeImages` to `true`, `learningNeeds` to `{}` and `scenes` to `[]`. `scenes` holds the scene id behind each sentence (or `null`) for Classic stories; the illustrations use it. A `PUT` that changes `content` without sending `scenes` clears them. The server sets `userId` and computes `usedWords` (the sight words that appear in `content`); values for those, or for `sharedWith`, in the body are ignored.

**Response** (201 Created):

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "title": "My New Story",
  "content": ["Sentence one.", "Sentence two."],
  "words": ["word1", "word2"],
  "usedWords": [],
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

**Request Body**: any subset of the fields accepted by Create Story. `usedWords` is recomputed when `content` or `words` changes.

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

The first share creates a random token for the story; later shares reuse it, so every link sent for a story stays valid. The email links to `/shared-stories/:id?token=...` on `NEXTAUTH_URL`. User-supplied text in the email is HTML-escaped.

**Response** (200 OK):

```json
{
  "success": true
}
```

**Errors**:

- `400` - Invalid email address or message too long
- `401` - Unauthorized
- `404` - Story not found
- `429` - Share email limit reached (see [Rate Limiting](#rate-limiting))
- `500` - Server error, including SMTP failures
- `503` - Email service not configured

**Error Codes**:

- `EMAIL_NOT_CONFIGURED` - SMTP settings or `NEXTAUTH_URL` not configured

---

## Shared Stories

### Get Shared Story

Read a story through a share link.

**Endpoint**: `GET /shared-stories/:id?token=...`

**Authentication**: None. The token is the credential.

**Response** (200 OK): the story's `_id`, `title`, `content`, `words`, `usedWords`, `format`, `includeImages`, `grade`, `learningNeeds` and `createdAt`. The owner, recipients and token are not included.

**Errors**:

- `404` - Story not found, never shared, or wrong token. All three return the same response.
- `500` - Server error

---

## AI Stories

AI stories don't go through this API. The browser calls the Anthropic Messages API directly with the signed-in grown-up's own API key, using Claude Haiku 4.5 (`claude-haiku-4-5-20251001`), so the key never reaches this server. See [`lib/aiStory.js`](../lib/aiStory.js).

Words are trimmed and lower-cased, and may contain only letters, with apostrophes or hyphens inside a word. At most `STORY_LIMITS.maxAiWords` words. `usedWords` is computed from the story text, so a word the model left out is not listed. The story is not saved; save it with Create Story.

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

- `400` - Missing or invalid `words`, or `grade` not an integer 0-3
- `401` - Unauthorized
- `500` - Server error

---

### Get Word Usage Statistics

Get analytics on word usage. `topWords`, `byGrade` and `totalUniqueWords` count words across all users; `totalStories` counts the signed-in user's stories.

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
    "3": 8
  },
  "totalStories": 42,
  "totalUniqueWords": 156
}
```

**Errors**:

- `401` - Unauthorized
- `500` - Server error

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "message": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

`code` is only present on some errors. Validation errors (`400`) also list the failing fields:

```json
{
  "message": "Invalid request",
  "issues": [{ "path": "grade", "message": "Too big: expected number to be <=3" }]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `404` - Not Found
- `405` - Method Not Allowed (the `Allow` header lists the accepted methods)
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Special Error Codes

- `EMAIL_NOT_CONFIGURED` - Email service is not set up
- `SERVICE_NOT_CONFIGURED` - A server setting the request needs is missing, such as `MONGODB_URI` (status `503`). The server log names the missing setting.

Uncaught server errors return `{ "message": "Internal server error" }` with status `500`; the detail goes to the server log only.

---

## Rate Limiting

Share emails are limited per signed-in user, in fixed windows. The limits are `RATE_LIMITS` in [`lib/limits.js`](../lib/limits.js). Counters are stored in the `ratelimits` MongoDB collection and removed by a TTL index when their window ends.

Limited responses include `X-RateLimit-Limit` and `X-RateLimit-Remaining`. When the limit is reached the response is `429` with a `Retry-After` header and body:

```json
{
  "message": "Too many requests. Please try again later.",
  "retryAfterSeconds": 1800
}
```

Other endpoints are not rate limited.

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
  usedWords: string[], // Sight words that appear in content (set by the server)
  scenes: (string | null)[], // Scene id behind each sentence, for the illustrations
  format: 'highlighted' | 'bold' | 'underlined' | 'normal',
  includeImages: boolean,
  grade: number, // 0-3 (0 = Kindergarten)
  learningNeeds: {
    adhd: boolean,
    dyslexia: boolean,
    autism: boolean,
    esl: boolean,
    visualProcessing: boolean
  },
  sharedWith: string[], // Array of email addresses
  shareToken: string, // Share link secret; not returned unless selected with '+shareToken'
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

1. **Authentication**: story and analytics endpoints require a session. Shared stories need the share token instead.
2. **Authorization**: users can only read, change or share their own stories.
3. **Input validation**: Zod schemas on story, share and analytics bodies; unknown fields are dropped.
4. **Password hashing**: bcrypt with 10 salt rounds.
5. **Story text**: rendered as React text in the UI, never as HTML.

---

## Known Limitations

1. No pagination on story lists (returns all user stories)
2. Registration, sign-in and the story CRUD endpoints are not rate limited
3. Email sharing requires SMTP configuration
4. Word analytics are shared across all users

---

## Support

For questions or issues:

- GitHub Issues: [https://github.com/ces0491/sight-word-app/issues](https://github.com/ces0491/sight-word-app/issues)

---

Last Updated: 2026-11-05
