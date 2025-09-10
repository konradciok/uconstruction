#!/bin/bash

# Full migration script: SQLite → PostgreSQL
# This script handles the complete migration process

set -e

echo "🚀 Starting full migration from SQLite to PostgreSQL..."
echo ""

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

# Step 1: Backup existing data
print_status "Step 1: Creating backup of existing SQLite data..."
if [ -f "prisma/dev.db" ]; then
    node scripts/backup-sqlite.js
    print_success "Backup completed"
else
    print_warning "No existing SQLite database found, skipping backup"
fi
echo ""

# Step 2: Start PostgreSQL
print_status "Step 2: Starting PostgreSQL instance..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
timeout=60
counter=0
while ! docker-compose exec postgres pg_isready -U uconstruction -d uconstruction > /dev/null 2>&1; do
    if [ $counter -eq $timeout ]; then
        print_error "PostgreSQL failed to start within $timeout seconds"
        exit 1
    fi
    sleep 1
    counter=$((counter + 1))
done
print_success "PostgreSQL is ready"
echo ""

# Step 3: Install dependencies
print_status "Step 3: Installing PostgreSQL dependencies..."
npm install
print_success "Dependencies installed"
echo ""

# Step 4: Generate Prisma client
print_status "Step 4: Generating Prisma client for PostgreSQL..."
npm run prisma:generate
print_success "Prisma client generated"
echo ""

# Step 5: Run database migration
print_status "Step 5: Running database migration..."
npm run prisma:migrate
print_success "Database migration completed"
echo ""

# Step 6: Migrate existing data (if available)
if [ -f "prisma/dev.db" ]; then
    print_status "Step 6: Migrating existing data from SQLite..."
    node scripts/simple-migrate.js
    print_success "Data migration completed"
else
    print_warning "No existing SQLite data to migrate"
fi
echo ""

# Step 7: Verify migration
print_status "Step 7: Verifying migration..."
if docker-compose exec postgres psql -U uconstruction -d uconstruction -c "SELECT COUNT(*) FROM \"Product\";" > /dev/null 2>&1; then
    print_success "Migration verification passed"
else
    print_error "Migration verification failed"
    exit 1
fi
echo ""

# Final status
print_success "🎉 Migration completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Update your .env file with the PostgreSQL connection string"
echo "   2. Test your application: npm run dev"
echo "   3. Optional: Access pgAdmin at http://localhost:8080"
echo ""
echo "🔧 Available commands:"
echo "   npm run postgres:start    - Start PostgreSQL"
echo "   npm run postgres:stop     - Stop PostgreSQL"
echo "   npm run prisma:studio     - Open Prisma Studio"
echo "   npm run db:backup         - Create SQLite backup"
echo ""
echo "📚 For more information, see: scripts/migration-guide.md"
