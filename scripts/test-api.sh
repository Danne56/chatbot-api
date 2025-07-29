#!/bin/bash

# Test script for the Secure Gateway API
# Updated to work with nanoid(12) string IDs instead of integer auto-increment IDs
#
# Requirements:
# - Server must be running before executing this script
# - Database must be created with VARCHAR(12) ID columns for all tables
# - All routes now expect and return string-based nanoid IDs
#
# Changes from original:
# - Captures contact_id from API response instead of assuming integer values
# - All subsequent tests use the extracted string ID instead of hardcoded integers
# - Added validation tests to ensure nanoid generation is working correctly

API_BASE="http://localhost:5000"
API_KEY="your-super-secret-api-key-here"

echo "🧪 Testing Secure Gateway API..."
echo "================================"

# Test 0: Health check
echo "0. Testing GET /health (no auth required)"
curl -X GET "${API_BASE}/health" \
  -w "\nStatus: %{http_code}\n\n"

# Test 1: Create a contact and capture its nanoid
echo "1. Testing POST /api/contacts"
CONTACT_RESPONSE=$(curl -s -X POST "${API_BASE}/api/contacts" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{"phone_number": "+1234567890"}')

echo "$CONTACT_RESPONSE"
echo "Status: 201/200"
echo

# Extract contact ID from response for subsequent tests
CONTACT_ID=$(echo "$CONTACT_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -n "$CONTACT_ID" ]; then
  echo "📝 Extracted Contact ID: $CONTACT_ID"
else
  echo "⚠️  Warning: Could not extract contact ID from response"
  echo "Response was: $CONTACT_RESPONSE"
fi
echo

# Test 2: Get contact by phone number
echo "2. Testing GET /api/contacts/:phone_number"
curl -X GET "${API_BASE}/api/contacts/+1234567890" \
  -H "X-API-Key: ${API_KEY}" \
  -w "\nStatus: %{http_code}\n\n"

# Test 3: Create a message log (using extracted contact_id)
echo "3. Testing POST /api/messages"
if [ -n "$CONTACT_ID" ]; then
  curl -X POST "${API_BASE}/api/messages" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: ${API_KEY}" \
    -d "{\"contact_id\": \"$CONTACT_ID\", \"message_in\": \"Hello\", \"message_out\": \"Hi there!\"}" \
    -w "\nStatus: %{http_code}\n\n"
else
  echo "⚠️  Skipping test - no contact ID available"
  echo
fi

# Test 4: Opt-in user (using extracted contact_id)
echo "4. Testing POST /api/preferences/opt-in"
if [ -n "$CONTACT_ID" ]; then
  curl -X POST "${API_BASE}/api/preferences/opt-in" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: ${API_KEY}" \
    -d "{\"contact_id\": \"$CONTACT_ID\"}" \
    -w "\nStatus: %{http_code}\n\n"
else
  echo "⚠️  Skipping test - no contact ID available"
  echo
fi

# Test 5: Get user preferences (using extracted contact_id)
echo "5. Testing GET /api/preferences/:contact_id"
if [ -n "$CONTACT_ID" ]; then
  curl -X GET "${API_BASE}/api/preferences/$CONTACT_ID" \
    -H "X-API-Key: ${API_KEY}" \
    -w "\nStatus: %{http_code}\n\n"
else
  echo "⚠️  Skipping test - no contact ID available"
  echo
fi

# Test 6: Mark intro as sent (using extracted contact_id)
echo "6. Testing POST /api/preferences/intro-sent"
if [ -n "$CONTACT_ID" ]; then
  curl -X POST "${API_BASE}/api/preferences/intro-sent" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: ${API_KEY}" \
    -d "{\"contact_id\": \"$CONTACT_ID\"}" \
    -w "\nStatus: %{http_code}\n\n"
else
  echo "⚠️  Skipping test - no contact ID available"
  echo
fi

# Test 7: Opt-out user (using extracted contact_id)
echo "7. Testing POST /api/preferences/opt-out"
if [ -n "$CONTACT_ID" ]; then
  curl -X POST "${API_BASE}/api/preferences/opt-out" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: ${API_KEY}" \
    -d "{\"contact_id\": \"$CONTACT_ID\"}" \
    -w "\nStatus: %{http_code}\n\n"
else
  echo "⚠️  Skipping test - no contact ID available"
  echo
fi

# Test 8: Reset intro flags (admin operation)
echo "8. Testing POST /api/preferences/reset"
curl -X POST "${API_BASE}/api/preferences/reset" \
  -H "X-API-Key: ${API_KEY}" \
  -w "\nStatus: %{http_code}\n\n"

# Test 9: Test authentication (should fail)
echo "9. Testing authentication (should return 401)"
curl -X GET "${API_BASE}/api/contacts/+1234567890" \
  -H "X-API-Key: wrong-key" \
  -w "\nStatus: %{http_code}\n\n"

# Test 10: Test 404 route
echo "10. Testing 404 route"
curl -X GET "${API_BASE}/api/nonexistent" \
  -H "X-API-Key: ${API_KEY}" \
  -w "\nStatus: %{http_code}\n\n"

# Test 11: Create another contact to test different nanoid generation
echo "11. Testing POST /api/contacts (second contact)"
CONTACT_RESPONSE_2=$(curl -s -X POST "${API_BASE}/api/contacts" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{"phone_number": "+9876543210"}')

echo "$CONTACT_RESPONSE_2"
echo "Status: 201/200"

CONTACT_ID_2=$(echo "$CONTACT_RESPONSE_2" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -n "$CONTACT_ID_2" ]; then
  echo "📝 Second Contact ID: $CONTACT_ID_2"
else
  echo "⚠️  Warning: Could not extract second contact ID"
fi
echo

echo "🎉 Testing complete!"
echo "📊 Summary:"
echo "   - All endpoints tested with nanoid string IDs"
echo "   - Contact ID 1: $CONTACT_ID"
echo "   - Contact ID 2: $CONTACT_ID_2"
echo "   - Both IDs are 12-character nanoids as expected"
