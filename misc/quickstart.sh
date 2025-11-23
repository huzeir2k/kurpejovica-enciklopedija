#!/bin/bash

# Quick Start Script for Kurpejovica Enciklopedija
# This script automates the initial setup process

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   Kurpejovica Enciklopedija - Quick Start Setup           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Backend won't work without it."
    echo "   Install PostgreSQL 12+ and try again."
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ PostgreSQL: $(psql --version)"
echo ""

# Frontend setup
echo "════════════════════════════════════════════════════════════"
echo "Setting up FRONTEND..."
echo "════════════════════════════════════════════════════════════"

cd frontend
echo "📦 Installing frontend dependencies..."
npm install

if [ ! -f ".env" ]; then
    echo "✅ Frontend environment file exists"
else
    echo "ℹ️  Frontend .env already configured"
fi

echo "✅ Frontend setup complete!"
cd ..
echo ""

# Backend setup
echo "════════════════════════════════════════════════════════════"
echo "Setting up BACKEND..."
echo "════════════════════════════════════════════════════════════"

cd backend
echo "📦 Installing backend dependencies..."
npm install

# Setup environment file
if [ ! -f ".env" ]; then
    echo "📝 Creating backend environment file..."
    cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kurpejovica_db
DB_USER=postgres
DB_PASSWORD=postgres

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRE=7d

# DeepL API (optional, set later)
DEEPL_API_KEY=

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
EOF
    echo "✅ Created .env file"
else
    echo "ℹ️  Backend .env already exists"
fi

# Database setup
echo ""
echo "🗄️  Setting up database..."

# Try to connect to postgres and create database
if psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'kurpejovica_db'" | grep -q 1; then
    echo "ℹ️  Database 'kurpejovica_db' already exists"
else
    echo "📝 Creating database..."
    psql -U postgres -c "CREATE DATABASE kurpejovica_db;" || true
fi

# Run migrations
echo "📝 Running database migrations..."
npm run migrate

# Ask about seeding
echo ""
read -p "Would you like to seed sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Seeding database..."
    npm run seed
    echo "✅ Sample data created"
    echo ""
    echo "📌 Test Login Credentials:"
    echo "   Email: admin@family.local"
    echo "   Password: admin123"
    echo ""
fi

cd ..
echo ""

# Final instructions
echo "════════════════════════════════════════════════════════════"
echo "✅ Setup Complete!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📝 To start development, open two terminal windows:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  npm run dev"
echo "  (Will run on http://localhost:3000)"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo "  (Will run on http://localhost:5173)"
echo ""
echo "📖 Documentation:"
echo "  - Main: README.md"
echo "  - Backend: backend/README.md"
echo "  - API: backend/API.md"
echo "  - Extension Guide: BACKEND_EXTENSION_GUIDE.md"
echo "  - Setup Summary: SETUP_SUMMARY.md"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start both servers (see above)"
echo "  2. Visit http://localhost:5173"
echo "  3. Login with test credentials"
echo "  4. Explore the application"
echo ""
echo "Happy developing! 🎉"
