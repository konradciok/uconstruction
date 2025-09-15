#!/bin/bash

# Docker Startup Script for uconstruction
# This script handles the complete Docker setup and startup process

set -e

echo "🐳 Starting uconstruction Docker environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from env.example..."
    if [ -f env.example ]; then
        cp env.example .env
        print_success "Created .env file from env.example"
        print_warning "Please update the .env file with your actual values before continuing."
        read -p "Press Enter to continue after updating .env file..."
    else
        print_error "env.example file not found. Please create a .env file manually."
        exit 1
    fi
fi

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down

# Build and start the services
print_status "Building and starting services..."
docker-compose up --build -d

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
timeout=60
counter=0
while ! docker-compose exec -T postgres pg_isready -U uconstruction -d uconstruction > /dev/null 2>&1; do
    if [ $counter -eq $timeout ]; then
        print_error "PostgreSQL failed to start within $timeout seconds"
        docker-compose logs postgres
        exit 1
    fi
    sleep 1
    counter=$((counter + 1))
done

print_success "PostgreSQL is ready!"

# Run database migrations
print_status "Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Generate Prisma client
print_status "Generating Prisma client..."
docker-compose exec -T app npx prisma generate

# Wait for the application to be ready
print_status "Waiting for application to be ready..."
timeout=60
counter=0
while ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; do
    if [ $counter -eq $timeout ]; then
        print_error "Application failed to start within $timeout seconds"
        docker-compose logs app
        exit 1
    fi
    sleep 2
    counter=$((counter + 2))
done

print_success "Application is ready!"

echo ""
print_success "🎉 uconstruction Docker environment is running!"
echo ""
echo "📋 Service URLs:"
echo "   🌐 Application: http://localhost:3000"
echo "   🗄️  pgAdmin: http://localhost:8080"
echo "   🔍 Health Check: http://localhost:3000/api/health"
echo ""
echo "📊 Database Connection:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: uconstruction"
echo "   Username: uconstruction"
echo "   Password: uconstruction_dev_password"
echo ""
echo "🛠️  Useful Commands:"
echo "   docker-compose logs app          - View application logs"
echo "   docker-compose logs postgres     - View database logs"
echo "   docker-compose exec app bash     - Access application container"
echo "   docker-compose exec postgres psql -U uconstruction -d uconstruction - Access database"
echo "   docker-compose down              - Stop all services"
echo "   docker-compose restart app       - Restart application only"
echo ""
