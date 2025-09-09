#!/bin/bash

# Setup PostgreSQL for uconstruction project
# This script helps set up the PostgreSQL database for development

set -e

echo "🐘 Setting up PostgreSQL for uconstruction..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start PostgreSQL container
echo "🚀 Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout=60
counter=0
while ! docker-compose exec postgres pg_isready -U uconstruction -d uconstruction > /dev/null 2>&1; do
    if [ $counter -eq $timeout ]; then
        echo "❌ PostgreSQL failed to start within $timeout seconds"
        exit 1
    fi
    sleep 1
    counter=$((counter + 1))
done

echo "✅ PostgreSQL is ready!"

# Test connection
echo "🔍 Testing database connection..."
docker-compose exec postgres psql -U uconstruction -d uconstruction -c "SELECT version();"

echo ""
echo "🎉 PostgreSQL setup complete!"
echo ""
echo "📋 Connection details:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: uconstruction"
echo "   Username: uconstruction"
echo "   Password: uconstruction_dev_password"
echo ""
echo "🌐 Optional: pgAdmin is available at http://localhost:8080"
echo "   Email: admin@uconstruction.local"
echo "   Password: admin"
echo ""
echo "📝 Next steps:"
echo "   1. Update your .env file with the PostgreSQL connection string"
echo "   2. Run: npm run prisma:generate"
echo "   3. Run: npm run prisma:migrate"
echo ""
