# Contacts API Endpoints

This file provides `curl` commands for interacting with the contacts API.

Replace `YOUR_API_KEY` with your actual API key.

## Create a new contact

Creates a new contact or returns the existing one if the phone number is already registered.

```bash
curl -X POST \
  http://localhost:5000/api/contacts \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR_API_KEY' \
  -d '{
    "phone_number": "1234567890"
  }'
```

## Get contact by phone number

Retrieves a contact's details by their phone number. Replace `+1234567890` with the desired phone number.

```bash
curl -X GET \
  http://localhost:5000/api/contacts/+1234567890 \
  -H 'x-api-key: YOUR_API_KEY'
```
