# Sight Word Stories API

The routes under `pages/api/`.

---

## Table of Contents

- [Authentication](#authentication)
- [Account](#account)
- [Stories](#stories)
- [Shared Stories](#shared-stories)
- [AI Stories](#ai-stories)
- [Analytics](#analytics)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Base URL

**Development**: `http://localhost:3000/api`
**Production**: `https://sightwords.sheetsolved.com/api`

---

## Authentication

Endpoints marked **Authentication: Required** need a NextAuth session cookie.

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

The body is validated before any query (`registerSchema`):

- `name`: 1 to 60 characters; letters in any script, with spaces, apostrophes, hyphens and full stops. It appears in share emails.
- `email`: a valid address of up to 254 characters, stored trimmed and lower-cased. An address already registered in any case is refused.
- `password`: at least 8 characters and at most 72 bytes, the most bcrypt reads.

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

- `400` - A field fails validation (the `message` says which rule, and `issues` lists the fields) or the email is already registered
- `405` - Method not allowed
- `429` - Registration limit for this IP address reached (see [Rate Limiting](#rate-limiting))
- `500` - Server error

---

### Login

Login is handled by NextAuth's credentials provider: the app calls `signIn('credentials', { email, password })` from `next-auth/react`, which posts to `/api/auth/callback/credentials`. Emails are matched case-insensitively.

Sign-in attempts, successful or not, are counted per IP address and per email address (see [Rate Limiting](#rate-limiting)). Past either limit the password isn't checked, and `signIn()` resolves with `error: "TooManySignInAttempts"`. A wrong email or password gives NextAuth's `CredentialsSignin`.

---

## Account

### Delete Account

Delete the signed-in account and its saved stories. Share links to those stories stop working. Word usage counts aren't linked to accounts, so they stay. The session cookie isn't cleared by this call; the app signs out afterwards.

**Endpoint**: `DELETE /account`

**Authentication**: Required

**Request Body**:

```json
{
  "password": "the account's password"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "storiesDeleted": 3
}
```

**Errors**:

- `400` - No password sent
- `401` - Unauthorized
- `403` - Wrong password
- `404` - The session's account no longer exists
- `405` - Method not allowed
- `429` - Too many attempts (see [Rate Limiting](#rate-limiting))
- `500` - Server error

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

**Request Body**: any subset of the fields accepted by Create Story. `usedWords` is recomputed when `content` or `words` changes. `learningNeeds`, if sent, must include all five flags, because it replaces the stored object.

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

The first share creates a random token for the story; later shares reuse it, so every link sent for a story stays valid until sharing is stopped. Two first shares at the same moment end up with the same token. The email links to `/shared-stories/:id?token=...` on `NEXTAUTH_URL`. User-supplied text in the email is HTML-escaped.

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

### Stop Sharing

Remove a story's share token and recipient list. Every link sent for the story stops working; sharing it again sends a new link.

**Endpoint**: `DELETE /stories/:id/share`

**Authentication**: Required

**Response** (200 OK):

```json
{
  "success": true
}
```

**Errors**:

- `401` - Unauthorized
- `404` - Story not found
- `500` - Server error

---

## Shared Stories

### Get Shared Story

Read a story through a share link.

**Endpoint**: `GET /shared-stories/:id?token=...`

**Authentication**: None. The token is the credential.

**Response** (200 OK): the story's `_id`, `title`, `content`, `scenes`, `words`, `usedWords`, `format`, `includeImages`, `grade` and `createdAt`. The owner, recipients and token are not included, and neither are the learning needs, which describe the child.

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

Count the sight words used in a story (the app calls it after making one). Word usage is shared by every signed-in user, so only Dolch words are counted; other words, such as a child's name, are dropped. `count` is the number of words counted.

**Endpoint**: `POST /analytics/trackWords`

**Authentication**: Required

**Request Body**:

```json
{
  "words": ["cat", "dog", "run"],
  "grade": 1
}
```

**Response** (200 OK), for `["cat", "dog", "run"]`, where only "run" is a Dolch word:

```json
{
  "success": true,
  "count": 1
}
```

**Errors**:

- `400` - Missing or invalid `words`, or `grade` not an integer 0-3
- `401` - Unauthorized
- `429` - Word usage limit reached (see [Rate Limiting](#rate-limiting))
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

Errors from these routes look like this (NextAuth's own routes under `/api/auth/` excepted):

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
- `403` - Forbidden (wrong password on account deletion)
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

Limits are counted in fixed windows. The numbers are `RATE_LIMITS` in [`lib/limits.js`](../lib/limits.js):

| What | Counted per | Limit |
| --- | --- | --- |
| Registration | IP address | 5 an hour |
| Sign-in attempts | IP address | 20 in 15 minutes |
| Sign-in attempts | email address | 10 in 15 minutes |
| Account deletion attempts | signed-in user | 5 in 15 minutes |
| Share emails | signed-in user | 10 an hour |
| Word-usage updates | signed-in user | 60 an hour |

The IP address is the one Vercel puts in `x-real-ip`. The per-email sign-in limit means someone who knows an address can lock its owner out of signing in for up to 15 minutes.

Counters are stored in the `ratelimits` MongoDB collection and removed by a TTL index when their window ends.

Limited API routes include `X-RateLimit-Limit` and `X-RateLimit-Remaining` in their responses. When the limit is reached the response is `429` with a `Retry-After` header and body:

```json
{
  "message": "Too many requests. Please try again later.",
  "retryAfterSeconds": 1800
}
```

Sign-in goes through NextAuth instead, so it gets the `TooManySignInAttempts` error described under [Login](#login).

The story endpoints are not rate limited.

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
  email: string, // Unique, stored lower-cased
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
    3: number
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

1. **Authentication**: the account, story and analytics endpoints require a session, and account deletion also takes the password. Shared stories need the share token instead.
2. **Authorization**: users can only read, change or share their own stories.
3. **Input validation**: Zod schemas on registration, account, story, share and analytics bodies, checked before any query; unknown fields are dropped.
4. **Password hashing**: bcrypt with 10 salt rounds.
5. **Story text**: rendered as React text in the UI, never as HTML.

---

## Known Limitations

1. No pagination on story lists (returns all user stories)
2. The story endpoints are not rate limited
3. Email sharing requires SMTP configuration
4. Sessions are signed JWTs and can't be revoked: signing out or deleting the account clears the cookie in that browser, but a copied cookie stays valid until it expires (30 days)

---

## Support

Questions and bugs go to [GitHub Issues](https://github.com/ces0491/sight-word-app/issues).

---

Last Updated: 2026-11-06
