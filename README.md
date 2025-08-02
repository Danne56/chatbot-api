# Secure Gateway API

**A lightweight, secure, and performant Express.js API designed to act as a robust intermediary between n8n workflows and a MariaDB database.**

Say goodbye to risky direct database connections in your automation workflows. This gateway ensures that all data access is controlled, validated, and authenticated through a clean, modern API.

## Key Features

- **API Key Authentication**: All endpoints are protected. No key, no entry.
- **Rate Limiting**: Prevents abuse with sensible request limits.
- **Input Validation**: Sanitizes all incoming data to prevent injection attacks.
- **Performance-Tuned**: Uses `helmet`, `cors`, and `compression` for a fast and secure experience.
- **Efficient DB Pooling**: Manages database connections efficiently with `mysql2/promise`.
- **Graceful Shutdown**: Ensures no requests or connections are dropped during restarts.
- **Dockerized Environment**: Comes with a `docker-compose` setup for easy development.
- **Clean Codebase**: A well-organized and easy-to-understand project structure.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MariaDB (via `mysql2` driver)
- **Security**: `helmet`, `express-rate-limit`, `express-validator`
- **Development**: `nodemon`, `dotenv`, Docker

## Getting Started

Follow these steps to get the API up and running on your local machine.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [Docker](https://www.docker.com/get-started) and Docker Compose

### 2. Clone & Configure

1. **Clone the repository:**

   ```bash
   git clone https://your-repository-url/secure-gateway-api.git
   cd secure-gateway-api
   ```

2. **Create your environment file:**
   Copy the example file and fill in your details.

   ```bash
   cp .env.example .env
   ```

3. **Update `.env` with your credentials:**

   ```env
   # Database Settings
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_database_name
   DB_CONNECTION_LIMIT=10

   # API Security
   API_KEY=generate-a-super-secret-key-here

   # Server Settings
   PORT=5000
   NODE_ENV=development
   ```

   > **Security Note**: Use a strong, randomly generated string for `API_KEY`.

### 3. Launch the Database

This command will start a MariaDB container in the background. The schema from `src/db/database-setup.sql` will be automatically applied.

```bash
npm run db:up
```

You can monitor the database logs with `npm run db:logs`.

### 4. Install Dependencies & Run

```bash
# Install npm packages
npm install

# Start the server in development mode (with auto-reload)
npm run dev
```

The API will now be running at `http://localhost:5000`.

## API Endpoints

All endpoints require an `X-API-Key` header for authentication.

### Example: Create a Contact

```http
POST /api/contacts
Content-Type: application/json
X-API-Key: your-super-secret-key-here

{
  "phone_number": "+1234567890"
}
```

## n8n Integration

To use this API in your n8n workflows, use the **HTTP Request** node:

- **Method**: `GET`, `POST`, etc.
- **URL**: `http://your-api-host:5000/api/contacts` (or other endpoints)
- **Authentication**: `Header Auth`
- **Name**: `X-API-Key`
- **Value**: Your secret API key
- **Body Content Type**: `JSON`
- **Body**: JSON data as required by the endpoint.

This setup ensures your database credentials never leave your secure network.

## Project Structure

```bash
/
├── docker-compose.yml      # Docker setup for MariaDB
├── Dockerfile              # Container definition for the API
├── server.js               # Server entry point with graceful shutdown
├── package.json            # Project dependencies and scripts
├── .env.example            # Environment variable template
├── src/
│   ├── app.js              # Express app configuration and middleware
│   ├── routes/             # API route definitions
│   ├── middleware/         # Auth, validation, error handling, etc.
│   ├── utils/db.js         # MariaDB connection pool
│   └── db/
│       └── database-setup.sql # Initial database schema
└── ...
```
