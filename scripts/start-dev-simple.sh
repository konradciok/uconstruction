#!/bin/bash

# Simple Development Startup Script
# Alternative to the Node.js script for environments that need a basic approach

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Utility functions
log() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

step() {
    echo -e "${BOLD}${BLUE}[$1]${NC} ${CYAN}$2${NC}"
}

# Main startup sequence
main() {
    clear
    echo -e "${BOLD}${CYAN}🔧 UConstruction Development Startup${NC}"
    echo -e "${BOLD}Watercolor Artist Site - Optimized & Consolidated${NC}"
    echo ""

    # Step 1: Check Node and npm
    step "1/4" "Checking environment..."
    if ! command -v node &> /dev/null; then
        error "Node.js not found. Please install Node.js first."
        exit 1
    fi
    if ! command -v npm &> /dev/null; then
        error "npm not found. Please install npm first."
        exit 1
    fi
    success "Node.js and npm are available"

    # Step 2: Generate Prisma client
    step "2/4" "Generating Prisma client..."
    if npm run prisma:generate > /dev/null 2>&1; then
        success "Prisma client generated"
    else
        error "Failed to generate Prisma client"
        exit 1
    fi

    # Step 3: Setup database
    step "3/4" "Setting up database..."
    if npm run prisma:db:push > /dev/null 2>&1; then
        success "Database schema synchronized"
    else
        warning "Database setup had issues, but continuing..."
    fi

    # Step 4: Start development server
    step "4/4" "Starting development server..."
    echo ""
    success "Database initialized successfully"
    echo -e "${BOLD}${GREEN}🚀 Starting Next.js development server...${NC}"
    echo -e "${BOLD}${BLUE}📊 Visit http://localhost:3000/products-demo to test components${NC}"
    echo -e "${BOLD}${CYAN}🎨 Visit http://localhost:3000/portfolio for the gallery${NC}"
    echo ""

    # Start the dev server
    npm run dev
}

# Handle cleanup on exit
cleanup() {
    echo ""
    warning "Shutting down development server..."
    exit 0
}

# Trap signals for cleanup
trap cleanup SIGINT SIGTERM

# Show help if requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo -e "${BOLD}UConstruction Development Startup Script${NC}"
    echo ""
    echo "Usage:"
    echo "  ./scripts/start-dev-simple.sh    - Start development server with DB init"
    echo "  npm run dev:full                 - Use advanced Node.js script"
    echo "  npm run dev:db                   - Simple command chain"
    echo "  npm run dev                      - Standard Next.js dev server only"
    echo ""
    echo "This script will:"
    echo "  • Generate Prisma client"
    echo "  • Setup database schema"
    echo "  • Start Next.js development server"
    exit 0
fi

# Run main function
main "$@"