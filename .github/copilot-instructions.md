# Copilot Instructions for Express.js Secure Gateway API

## Project Overview

This is a lightweight Express.js API acting as a secure gateway between **n8n workflows** and a **MariaDB database**. It replaces direct database connections in n8n with controlled, validated, and authenticated API endpoints to prevent SQL injection, credential exposure, and unauthorized access.

The API follows RESTful principles and emphasizes **security**, **input validation**, and **simplicity** — not full-scale microservice patterns.

## Architecture & Patterns

### Directory Structure

```bash
/
├── src/
│   ├── routes/             # API route definitions (e.g., /chatlogs, /users)
│   ├── controllers/        # Route handlers with safe DB operations
│   ├── middleware/         # Authentication, validation, error handling
│   ├── utils/db.js         # MariaDB connection pool
│   └── app.js              # Express app configuration
├── .env                    # Environment variables (DB & API key)
├── server.js               # Server entry point with graceful shutdown
└── package.json
```

### Key Principles

- 🔐 Never expose DB credentials to n8n
- 🛡️ All data access must go through API endpoints
- ✅ All inputs must be validated
- 🧼 Use parameterized queries only — no string concatenation
- 🔑 Authenticate every request using API key
- ⚖️ Keep it minimal — only implement what's needed for n8n integration
- 🧩 Use `nanoid(12)` for generating unique IDs (e.g., record IDs)

## Core Requirements

### 1. Database Connection (Server-Side Only)

- Use `mysql2` with **connection pooling**
- Store credentials in `.env`, never hardcoded
- Do not allow public access to the API server (firewall or VPC preferred)
- Use `pool.execute()` for safe parameterized queries

### 2. Authentication: API Key

- Require `X-API-Key` header on all endpoints
- Compare against `API_KEY` from `.env`
- Reject unauthorized requests with `401`

**See**: `src/middleware/auth.js`

### 3. Input Validation

- Use `express-validator` for all request data
- Validate: types, lengths, ranges, required fields
- Return clear `400` errors if validation fails

**See**: `src/middleware/validation.js` or inline validation

### 4. Rate Limiting

- Apply global rate limiting to prevent abuse
- Limit: 100 requests per IP per 15 minutes
- Helps protect against runaway n8n loops

**See**: `src/middleware/rateLimiter.js`

### 5. Security Headers

- Use `helmet()` for secure HTTP headers
- Use `compression()` for performance
- Parse JSON with size limit: `app.use(express.json({ limit: '10mb' }))`

### 6. Error Handling

- Catch and log errors server-side
- Never expose stack traces or SQL errors to client
- Return generic `500` error message

**See**: `src/middleware/errorHandler.js`

### 7. ID Generation

- Use `nanoid` to generate short, unique IDs
- Install: `npm install nanoid`
- Generate 10-character IDs: `nanoid(12)`
- Use for `id` fields when inserting new records

## Example Endpoint Pattern

### POST /api/chatlogs

```js
app.post('/chatlogs',
  authenticateApiKey,
  body('message').isString().trim().isLength({ min: 1, max: 1000 }),
  body('userId').isInt({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, userId } = req.body;
    const id = nanoid(12); // Generate unique ID
    const db = await pool.getConnection();

    try {
      await db.execute(
        'INSERT INTO chat_logs (id, message, user_id) VALUES (?, ?, ?)',
        [id, message, userId]
      );
      res.status(201).json({ success: true, id });
    } catch (err) {
      console.error('DB Error:', err);
      res.status(500).json({ error: 'Failed to save data' });
    } finally {
      db.release();
    }
  }
);
```

## Environment Configuration

```bash
# .env
DB_HOST=localhost
DB_USER=secure_user
DB_PASSWORD=strong_password
DB_NAME=your_database
DB_CONNECTION_LIMIT=5

API_KEY=your-super-secret-api-key-here

PORT=3001
NODE_ENV=production
```

## Security Best Practices

- 🔒 Never commit `.env` to version control
- 🔐 Run API in private network if possible (n8n can still reach it)
- 🧼 Always use parameterized queries (`?` placeholders)
- 🚫 Do not allow dynamic table/column names from input
- 📈 Use rate limiting to prevent abuse
- 🧰 Log errors (console is fine for now), but never leak DB details
- 🧩 Use `nanoid(12)` for ID generation — never rely on auto-increment if business logic needs stable IDs

## n8n Integration Guide

- Use the **HTTP Request** node
- Set method (`GET`, `POST`, etc.) and URL (e.g., `http://api:3001/api/chatlogs`)
- Add header: `X-API-Key: your-api-key`
- Send data in JSON body
- Handle `4xx/5xx` responses appropriately

## What to Avoid

- ❌ No JWT, OAuth, or session management
- ❌ No full user authentication system
- ❌ No migrations or ORM (use raw SQL safely)
- ❌ No extensive logging pipeline (console.log OK)
- ❌ No request ID tracing or monitoring tools
- ❌ No Swagger/OpenAPI (unless needed later)
- ❌ No emojis whatsoever in code comments or logs

## Key Files

- `src/utils/db.js` – Secure DB connection pool
- `src/middleware/auth.js` – API key authentication
- `src/middleware/errorHandler.js` – Prevent error leakage
- `src/routes/*.js` – Minimal, focused endpoints
- `server.js` – Starts the server with shutdown handling

All code should be clean, well-commented, and production-safe — but **not over-engineered**.
