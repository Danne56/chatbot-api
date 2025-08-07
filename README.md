# Chatbot API

**A lightweight Express.js API gateway for secure n8n-to-MariaDB communication.**

This API acts as a secure intermediary between n8n workflows and a MariaDB database, eliminating the need for direct database connections in automation workflows.

## Key Features

- **API Key Authentication**: All endpoints require valid authentication
- **Rate Limiting**: Built-in protection against abuse
- **Input Validation**: Comprehensive data sanitization and validation
- **Security Headers**: Uses `helmet`, `cors`, and `compression`
- **Connection Pooling**: Efficient MariaDB connection management
- **Structured Logging**: JSON-based logging with `pino`
- **Docker Support**: Complete containerized development environment

## Tech Stack

- **Backend**: Node.js 20+, Express.js 5
- **Database**: MariaDB (via `mysql2`)
- **Security**: `helmet`, `express-rate-limit`, `express-validator`
- **Logging**: `pino` with pretty printing
- **Development**: `nodemon`, ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose

### Setup

1. **Clone and configure**

   ```bash
   git clone <repository-url>
   cd secure-gateway-api
   cp .env.example .env
   ```

2. **Update `.env` with your settings**

   ```env
   # Database
   DB_HOST=localhost
   DB_USER=secure_user
   DB_PASSWORD=strong_password
   DB_NAME=n8n

   # API Security
   API_KEY=your-super-secret-api-key

   # Server
   PORT=5000
   NODE_ENV=development
   ```

3. **Start the database**

   ```bash
   npm run db:up
   ```

4. **Install dependencies and run**

   ```bash
   npm install
   npm run dev
   ```

The API will be available at `http://localhost:5000`.

## API Endpoints

All endpoints require the `X-API-Key` header for authentication.

### Contacts

- `POST /api/contacts` - Create a new contact
- `GET /api/contacts/:phone_number` - Get contact by phone number

### Messages

- `POST /api/messages` - Log a new message

### User Preferences

- `PUT /api/preferences/opt-in/:contact_id` - Mark user as opted-in
- `PUT /api/preferences/opt-out/:contact_id` - Mark user as opted-out
- `PUT /api/preferences/intro-sent/:contact_id` - Mark daily intro as sent
- `GET /api/preferences/:contact_id` - Get user preferences
- `POST /api/preferences/reset` - Reset daily intro flags

### Health Check

- `GET /health` - Server health status (no auth required)

## Example Usage

Create a contact:

```http
POST /api/contacts
Content-Type: application/json
X-API-Key: your-api-key

{
  "phone_number": "+1234567890"
}
```

## n8n Integration

Use the **HTTP Request** node in n8n:

- **URL**: `http://your-api-host:5000/api/contacts`
- **Method**: `POST`, `GET`, etc.
- **Authentication**: Header Auth
  - **Name**: `X-API-Key`
  - **Value**: Your API key
- **Body**: JSON data as required

## Available Scripts

```bash
npm run dev          # Start development server
npm run start        # Start production server
npm test             # Run API tests
npm run db:up        # Start MariaDB container
npm run db:down      # Stop MariaDB container
npm run db:logs      # View database logs
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Project Structure

```text
/
├── docker-compose.yml          # Docker services configuration
├── Dockerfile                  # Multi-stage container build
├── server.js                   # Server entry point
├── src/
│   ├── app.js                  # Express application setup
│   ├── routes/                 # API route definitions
│   │   ├── contactRoutes.js    # Contact management endpoints
│   │   ├── messageLogRoutes.js # Message logging endpoints
│   │   └── userPreferenceRoutes.js # User preference endpoints
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # API key authentication
│   │   ├── errorHandler.js     # Error handling
│   │   └── rateLimiter.js      # Rate limiting
│   ├── utils/                  # Utilities
│   │   ├── db.js               # Database connection pool
│   │   ├── id-generator.js     # Unique ID generation
│   │   └── logger.js           # Structured logging
│   └── db/
│       └── database-setup.sql  # Database schema
├── docs/                       # API documentation
└── scripts/                    # Development scripts
```
