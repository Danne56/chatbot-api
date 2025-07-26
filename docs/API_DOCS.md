# API Documentation

## Base URL

```bash
http://localhost:3001
```

## Authentication

All API endpoints (except `/health`) require an API key in the header:

```bash
X-API-Key: your-api-key-here
```

## Response Format

All responses are in JSON format with consistent structure:

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "error": "Error message"
}
```

### Validation Error Response

```json
{
  "errors": [
    {
      "type": "field",
      "value": "invalid_value",
      "msg": "Validation message",
      "path": "field_name",
      "location": "body"
    }
  ]
}
```

---

## Endpoints

### Health Check

Check if the API is running.

**GET** `/health`

**Headers:** None required

**Response:**

```json
{
  "status": "OK",
  "message": "Secure Gateway API is running",
  "timestamp": "2025-07-26T04:38:07.647Z"
}
```

---

### Contacts

#### Create Contact

Create a new contact or return existing contact if phone number already exists.

**POST** `/api/contacts`

**Headers:**

- `Content-Type: application/json`
- `X-API-Key: your-api-key`

**Body:**

```json
{
  "phone_number": "+1234567890"
}
```

**Validation:**

- `phone_number`: Required string, 5-20 characters

**Response (New Contact):**

```json
{
  "success": true,
  "id": 123
}
```

**Response (Existing Contact):**

```json
{
  "success": true,
  "id": 123,
  "existed": true
}
```

#### Get Contact by Phone Number

Retrieve contact details by phone number.

**GET** `/api/contacts/:phone_number`

**Headers:**

- `X-API-Key: your-api-key`

**Response:**

```json
{
  "id": 123,
  "phone_number": "+1234567890",
  "timestamp": "2025-07-26 12:00:00",
  "created_at": "2025-07-26T12:00:00.000Z"
}
```

**Error Response (404):**

```json
{
  "error": "Contact not found"
}
```

---

### Messages

#### Log Message

Record an incoming message and optional outgoing response.

**POST** `/api/messages`

**Headers:**

- `Content-Type: application/json`
- `X-API-Key: your-api-key`

**Body:**

```json
{
  "contact_id": 123,
  "message_in": "Hello, I need help",
  "message_out": "Hi! How can I assist you?"
}
```

**Validation:**

- `contact_id`: Required integer, minimum 1
- `message_in`: Required non-empty string
- `message_out`: Optional string

**Response:**

```json
{
  "success": true
}
```

**Error Response (400):**

```json
{
  "error": "Invalid contact_id"
}
```

---

### User Preferences

#### Opt-In User

Mark a user as opted-in for communications.

**POST** `/api/preferences/opt-in`

**Headers:**

- `Content-Type: application/json`
- `X-API-Key: your-api-key`

**Body:**

```json
{
  "contact_id": 123
}
```

**Validation:**

- `contact_id`: Required integer, minimum 1

**Response:**

```json
{
  "success": true
}
```

#### Opt-Out User

Mark a user as opted-out from communications.

**POST** `/api/preferences/opt-out`

**Headers:**

- `Content-Type: application/json`
- `X-API-Key: your-api-key`

**Body:**

```json
{
  "contact_id": 123
}
```

**Response:**

```json
{
  "success": true
}
```

#### Get User Preferences

Retrieve user preference settings.

**GET** `/api/preferences/:contact_id`

**Headers:**

- `X-API-Key: your-api-key`

**Response:**

```json
{
  "id": 456,
  "contact_id": 123,
  "has_opted_in": true,
  "awaiting_optin": false,
  "opted_in_at": "2025-07-26 12:00:00",
  "opted_out_at": null,
  "created_at": "2025-07-26T12:00:00.000Z",
  "updated_at": "2025-07-26T12:30:00.000Z"
}
```

**Error Response (404):**

```json
{
  "error": "Preferences not found"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid API key) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Limit:** 100 requests per IP per 15 minutes
- **Headers:** Standard rate limit headers are included in responses
- **Error Response (429):**

```json
{
  "error": "Too many requests from this IP"
}
```

---

## n8n Integration Examples

### HTTP Request Node Configuration

1. **Method:** Select appropriate HTTP method (GET, POST, etc.)
2. **URL:** `http://your-api-host:3001/api/endpoint`
3. **Headers:**
   - `X-API-Key`: `your-api-key-here`
   - `Content-Type`: `application/json` (for POST requests)
4. **Body:** JSON data as required by endpoint

### Example n8n Workflow Steps

1. **Create Contact**
   - HTTP Request Node
   - POST `/api/contacts`
   - Body: `{"phone_number": "{{$json.phone}}"}`

2. **Log Message**
   - HTTP Request Node  
   - POST `/api/messages`
   - Body: `{"contact_id": {{$json.contact_id}}, "message_in": "{{$json.message}}", "message_out": "{{$json.response}}"}`

3. **Check Opt-in Status**
   - HTTP Request Node
   - GET `/api/preferences/{{$json.contact_id}}`
   - Use response to determine if user has opted in
