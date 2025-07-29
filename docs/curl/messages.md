# Messages API Endpoints

This file provides `curl` commands for interacting with the messages API.

Replace `YOUR_API_KEY` with your actual API key.

## Log a message

Logs an incoming and/or outgoing message for a given contact.

```bash
curl -X POST \
  http://localhost:3000/api/messages \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR_API_KEY' \
  -d '{
    "contact_id": 1,
    "message_in": "Hello",
    "message_out": "Hi there!"
  }'
```
