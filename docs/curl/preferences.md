# Preferences API Endpoints

This file provides `curl` commands for interacting with the user preferences API.

Replace `YOUR_API_KEY` with your actual API key and `YOUR_CONTACT_ID` with a valid contact ID.

## Opt-in a user

```bash
curl -X POST \
  http://localhost:3000/api/preferences/opt-in \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR_API_KEY' \
  -d '{
    "contact_id": YOUR_CONTACT_ID
  }'
```

## Opt-out a user

```bash
curl -X POST \
  http://localhost:3000/api/preferences/opt-out \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR_API_KEY' \
  -d '{
    "contact_id": YOUR_CONTACT_ID
  }'
```

## Mark intro as sent

```bash
curl -X POST \
  http://localhost:3000/api/preferences/intro-sent \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: YOUR_API_KEY' \
  -d '{
    "contact_id": YOUR_CONTACT_ID
  }'
```

## Reset all intro flags

```bash
curl -X POST \
  http://localhost:3000/api/preferences/reset \
  -H 'x-api-key: YOUR_API_KEY'
```

## Get user preferences

```bash
curl -X GET \
  http://localhost:3000/api/preferences/YOUR_CONTACT_ID \
  -H 'x-api-key: YOUR_API_KEY'
```
