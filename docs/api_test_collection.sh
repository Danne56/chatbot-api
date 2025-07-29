#!/bin/bash

# API Test Collection
#
# This script contains a collection of curl commands to test the API endpoints.
# Before running, make sure the server is running and the environment variables are set.
#
# Usage:
# ./api_test_collection.sh

# --- Variables ---
BASE_URL="http://localhost:5000/api"
PHONE_NUMBER="1234567890"
CONTACT_ID=1

# --- Helper Functions ---
function print_header {
  echo ""
  echo "========================================================================"
  echo "$1"
  echo "========================================================================"
}

# --- Contacts ---
print_header "Contacts API"

echo "Creating a new contact..."
curl -X POST -H "Content-Type: application/json" -d "{\"phone_number\": \"$PHONE_NUMBER\"}" $BASE_URL/contacts

echo ""
echo "Getting contact by phone number..."
curl $BASE_URL/contacts/$PHONE_NUMBER

# --- Messages ---
print_header "Messages API"

echo "Logging a new message..."
curl -X POST -H "Content-Type: application/json" -d "{\"contact_id\": $CONTACT_ID, \"message_in\": \"Hello\", \"message_out\": \"Hi there!\"}" $BASE_URL/messages

# --- User Preferences ---
print_header "User Preferences API"

echo "Opting in a user..."
curl -X POST -H "Content-Type: application/json" -d "{\"contact_id\": $CONTACT_ID}" $BASE_URL/preferences/opt-in

echo ""
echo "Getting user preferences..."
curl $BASE_URL/preferences/$CONTACT_ID

echo ""
echo "Opting out a user..."
curl -X POST -H "Content-Type: application/json" -d "{\"contact_id\": $CONTACT_ID}" $BASE_URL/preferences/opt-out

echo ""
echo "Marking intro as sent..."
curl -X POST -H "Content-Type: application/json" -d "{\"contact_id\": $CONTACT_ID}" $BASE_URL/preferences/intro-sent

echo ""
echo "Resetting intro flags..."
curl -X POST $BASE_URL/preferences/reset
