#!/bin/bash

# Test script for the Secure Gateway API
# Make sure the server is running before executing this script

API_BASE="http://localhost:3001"
API_KEY="your-super-secret-api-key-here"

echo "🧪 Testing Secure Gateway API..."
echo "================================"

# Test 1: Create a contact
echo "1. Testing POST /api/contacts"
curl -X POST "${API_BASE}/api/contacts" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{"phone_number": "+1234567890"}' \
  -w "\nStatus: %{http_code}\n\n"

# Test 2: Get contact by phone number
echo "2. Testing GET /api/contacts/:phone_number"
curl -X GET "${API_BASE}/api/contacts/+1234567890" \
  -H "X-API-Key: ${API_KEY}" \
  -w "\nStatus: %{http_code}\n\n"

# Test 3: Create a message log (assuming contact_id = 1)
echo "3. Testing POST /api/messages"
curl -X POST "${API_BASE}/api/messages" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{"contact_id": 1, "message_in": "Hello", "message_out": "Hi there!"}' \
  -w "\nStatus: %{http_code}\n\n"

# Test 4: Opt-in user
echo "4. Testing POST /api/preferences/opt-in"
curl -X POST "${API_BASE}/api/preferences/opt-in" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{"contact_id": 1}' \
  -w "\nStatus: %{http_code}\n\n"

# Test 5: Get user preferences
echo "5. Testing GET /api/preferences/:contact_id"
curl -X GET "${API_BASE}/api/preferences/1" \
  -H "X-API-Key: ${API_KEY}" \
  -w "\nStatus: %{http_code}\n\n"

# Test 6: Test authentication (should fail)
echo "6. Testing authentication (should return 401)"
curl -X GET "${API_BASE}/api/contacts/+1234567890" \
  -H "X-API-Key: wrong-key" \
  -w "\nStatus: %{http_code}\n\n"

# Test 7: Test 404 route
echo "7. Testing 404 route"
curl -X GET "${API_BASE}/api/nonexistent" \
  -H "X-API-Key: ${API_KEY}" \
  -w "\nStatus: %{http_code}\n\n"

echo "🎉 Testing complete!"
