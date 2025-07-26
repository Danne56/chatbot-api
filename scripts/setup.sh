#!/bin/bash

# setup.sh - Complete setup script for the Secure Gateway API

set -e

echo "🚀 Setting up Secure Gateway API..."
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Start MariaDB with Docker Compose
echo "🗄️  Starting MariaDB database..."
docker-compose up -d mariadb

# Wait for MariaDB to be ready
echo "⏳ Waiting for MariaDB to be ready..."
sleep 10

# Check if MariaDB is responding
while ! docker exec chatbot-mariadb mysql -h localhost -u root -prootpassword -e "SELECT 1" >/dev/null 2>&1; do
    echo "   Still waiting for MariaDB..."
    sleep 2
done

echo "✅ MariaDB is ready!"

# Test database connection
echo "🔍 Testing database connection..."
docker exec chatbot-mariadb mysql -h localhost -u secure_user -pstrong_password -D n8n -e "SHOW TABLES;"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || cat > .env << EOF
DB_HOST=localhost
DB_USER=secure_user
DB_PASSWORD=strong_password
DB_NAME=n8n
DB_CONNECTION_LIMIT=5

API_KEY=your-super-secret-api-key-here

PORT=3001
NODE_ENV=production
EOF
fi

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Update your API key in .env file"
echo "2. Start the API server: npm start"
echo "3. Test the API: ./test-api.sh"
echo ""
echo "Available services:"
echo "- API Server: http://localhost:3001"
echo "- Health Check: http://localhost:3001/health"
echo "- phpMyAdmin: http://localhost:8080 (root/rootpassword)"
echo ""
echo "To stop the database: docker-compose down"
