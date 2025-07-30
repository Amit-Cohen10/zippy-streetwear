#!/bin/bash

echo "🚀 Starting Zippy E-commerce Platform..."
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
PORT=3000
NODE_ENV=development
JWT_SECRET=zippy-secret-key-change-in-production
EOF
    echo "✅ .env file created"
fi

# Create data directories if they don't exist
echo "📁 Setting up data directories..."
mkdir -p data/users data/products data/exchanges data/activity-logs

echo "✅ Data directories created"

# Start the server
echo "🌐 Starting server..."
echo "📍 Main site: http://localhost:3000"
echo "👨‍💼 Admin panel: http://localhost:3000/admin"
echo "🔑 Default admin: admin / admin"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start 