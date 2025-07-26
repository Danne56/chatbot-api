# Secure Gateway API

A lightweight Express.js API acting as a secure gateway between **n8n workflows** and a **MariaDB database**. This API replaces direct database connections in n8n with controlled, validated, and authenticated API endpoints to prevent SQL injection, credential exposure, and unauthorized access.

## 🔧 Setup

### 1. Environment Configuration

Update the `.env` file with your actual database credentials and API key:

```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
DB_CONNECTION_LIMIT=5

API_KEY=your-super-secret-api-key-here

PORT=3000
NODE_ENV=production
```

### 2. Database Schema

Ensure your MariaDB database has the following tables:

```sql
-- Contacts table
CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  timestamp DATETIME NOT NULL
);

-- Message logs table
CREATE TABLE message_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT NOT NULL,
  timestamp DATETIME NOT NULL,
  message_in TEXT NOT NULL,
  message_out TEXT,
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- User preferences table
CREATE TABLE user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT UNIQUE NOT NULL,
  has_opted_in BOOLEAN DEFAULT FALSE,
  awaiting_optin BOOLEAN DEFAULT FALSE,
  opted_in_at DATETIME,
  opted_out_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

Development mode with auto-restart:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## 📡 API Endpoints

All endpoints require the `X-API-Key` header with your API key.

### Contacts

#### Create Contact

```http
POST /api/contacts
Content-Type: application/json
X-API-Key: your-api-key

{
  "phone_number": "+1234567890"
}
```

#### Get Contact by Phone Number

```http
GET /api/contacts/+1234567890
X-API-Key: your-api-key
```

### Messages

#### Log Message

```http
POST /api/messages
Content-Type: application/json
X-API-Key: your-api-key

{
  "contact_id": 1,
  "message_in": "Hello",
  "message_out": "Hi there!"
}
```

### User Preferences

#### Opt-In User

```http
POST /api/preferences/opt-in
Content-Type: application/json
X-API-Key: your-api-key

{
  "contact_id": 1
}
```

#### Opt-Out User

```http
POST /api/preferences/opt-out
Content-Type: application/json
X-API-Key: your-api-key

{
  "contact_id": 1
}
```

#### Get User Preferences

```http
GET /api/preferences/1
X-API-Key: your-api-key
```

## 🔒 Security Features

- **API Key Authentication**: All endpoints protected with API key
- **Rate Limiting**: 100 requests per IP per 15 minutes
- **Input Validation**: All inputs validated using express-validator
- **SQL Injection Protection**: Parameterized queries only
- **Security Headers**: Helmet.js for secure HTTP headers
- **Error Handling**: No sensitive information leaked in errors

## 🚀 n8n Integration

Use the **HTTP Request** node in n8n with:

- Method: `GET`, `POST`, etc.
- URL: `http://your-api-host:3000/api/...`
- Headers: `X-API-Key: your-api-key`, `Content-Type: application/json`
- Body: JSON data as needed

## 📁 Project Structure

```bash
/
├── src/
│   ├── routes/             # API route definitions
│   ├── middleware/         # Authentication, validation, error handling
│   ├── utils/db.js         # MariaDB connection pool
│   └── app.js              # Express app configuration
├── .env                    # Environment variables (DB & API key)
├── server.js               # Server entry point with graceful shutdown
└── package.json
```

## 🔧 Development

- All code follows security best practices
- Uses connection pooling for database efficiency
- Graceful shutdown handling
- Comprehensive error logging
- Production-ready configuration

## ⚠️ Important Notes

- Never commit `.env` to version control
- Run API in a private network if possible
- Update the API key to a strong, unique value
- Test all endpoints thoroughly before production use
- Monitor logs for any errors or security issues
