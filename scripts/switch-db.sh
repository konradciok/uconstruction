#!/bin/bash

# Database switching script
# Allows switching between SQLite and PostgreSQL for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

show_usage() {
    echo "Usage: $0 [sqlite|postgres]"
    echo ""
    echo "Options:"
    echo "  sqlite   - Switch to SQLite database"
    echo "  postgres - Switch to PostgreSQL database"
    echo ""
    echo "Examples:"
    echo "  $0 sqlite    # Switch to SQLite"
    echo "  $0 postgres  # Switch to PostgreSQL"
}

switch_to_sqlite() {
    print_status "Switching to SQLite database..."
    
    # Update schema.prisma
    sed -i.bak 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
    sed -i.bak 's/url      = env("DATABASE_URL") \/\/ e\.g\. DATABASE_URL="postgresql:\/\/user:password@localhost:5432\/uconstruction"/url      = env("DATABASE_URL") \/\/ e\.g\. DATABASE_URL="file:.\/prisma\/dev.db"/' prisma/schema.prisma
    
    # Remove PostgreSQL-specific decimal annotations
    sed -i.bak 's/@db\.Decimal(18, 6)//g' prisma/schema.prisma
    
    # Update .env if it exists
    if [ -f ".env" ]; then
        sed -i.bak 's|DATABASE_URL=postgresql://.*|DATABASE_URL=file:./prisma/dev.db|' .env
    fi
    
    # Generate Prisma client
    npm run prisma:generate
    
    print_success "Switched to SQLite database"
    print_warning "Note: You may need to run 'npm run prisma:migrate' to apply schema changes"
}

switch_to_postgres() {
    print_status "Switching to PostgreSQL database..."
    
    # Check if PostgreSQL is running
    if ! docker-compose ps postgres | grep -q "Up"; then
        print_status "Starting PostgreSQL..."
        docker-compose up -d postgres
        
        # Wait for PostgreSQL to be ready
        timeout=30
        counter=0
        while ! docker-compose exec postgres pg_isready -U uconstruction -d uconstruction > /dev/null 2>&1; do
            if [ $counter -eq $timeout ]; then
                print_error "PostgreSQL failed to start within $timeout seconds"
                exit 1
            fi
            sleep 1
            counter=$((counter + 1))
        done
    fi
    
    # Update schema.prisma
    sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
    sed -i.bak 's/url      = env("DATABASE_URL") \/\/ e\.g\. DATABASE_URL="file:.\/prisma\/dev.db"/url      = env("DATABASE_URL") \/\/ e\.g\. DATABASE_URL="postgresql:\/\/user:password@localhost:5432\/uconstruction"/' prisma/schema.prisma
    
    # Add PostgreSQL-specific decimal annotations
    sed -i.bak 's/priceAmount               Decimal?/priceAmount               Decimal? @db.Decimal(18, 6)/' prisma/schema.prisma
    sed -i.bak 's/compareAtPriceAmount      Decimal?/compareAtPriceAmount      Decimal? @db.Decimal(18, 6)/' prisma/schema.prisma
    
    # Update .env if it exists
    if [ -f ".env" ]; then
        sed -i.bak 's|DATABASE_URL=file:.*|DATABASE_URL=postgresql://uconstruction:uconstruction_dev_password@localhost:5432/uconstruction|' .env
    fi
    
    # Generate Prisma client
    npm run prisma:generate
    
    print_success "Switched to PostgreSQL database"
    print_warning "Note: You may need to run 'npm run prisma:migrate' to apply schema changes"
}

# Main script logic
case "${1:-}" in
    "sqlite")
        switch_to_sqlite
        ;;
    "postgres")
        switch_to_postgres
        ;;
    *)
        print_error "Invalid option: ${1:-}"
        echo ""
        show_usage
        exit 1
        ;;
esac

echo ""
print_status "Current database configuration:"
if grep -q 'provider = "postgresql"' prisma/schema.prisma; then
    echo "   Database: PostgreSQL"
    echo "   Connection: Check your .env file"
else
    echo "   Database: SQLite"
    echo "   Connection: file:./prisma/dev.db"
fi
