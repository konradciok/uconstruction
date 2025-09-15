# Docker Setup for uconstruction

This document provides comprehensive instructions for running the uconstruction watercolor artist site in Docker containers.

## 🏗️ Architecture Overview

The Docker setup includes:

- **PostgreSQL Database**: Production-ready database with persistent storage
- **Next.js Application**: Full-stack React application with API routes
- **pgAdmin**: Optional database management interface
- **Health Checks**: Automated monitoring of all services

## 📋 Prerequisites

- Docker Desktop installed and running
- docker-compose installed
- Git (to clone the repository)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd shop_sep_25
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env with your actual values
nano .env
```

**Required Environment Variables:**
```env
# Database (automatically configured for Docker)
DATABASE_URL=postgresql://uconstruction:uconstruction_dev_password@postgres:5432/uconstruction

# Stripe Configuration (required for e-commerce)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Workshop Configuration (optional)
WORKSHOP_CAPACITY=8
WORKSHOP_DURATION=120
WORKSHOP_LOCATION=Güímar, Tenerife
WORKSHOP_TIME=11:00 AM
```

### 3. Start the Application

```bash
# Option 1: Automated startup (recommended)
npm run docker:startup

# Option 2: Manual startup
docker-compose up --build -d
```

### 4. Access the Application

- **Main Application**: http://localhost:3000
- **Database Admin (pgAdmin)**: http://localhost:8080
- **Health Check**: http://localhost:3000/api/health

## 🛠️ Available Commands

### Docker Commands

```bash
# Build and start all services
npm run docker:startup

# Start services in background
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Restart services
npm run docker:restart

# Clean up (removes volumes and containers)
npm run docker:clean
```

### Database Commands

```bash
# Access database directly
docker-compose exec postgres psql -U uconstruction -d uconstruction

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma client
docker-compose exec app npx prisma generate

# Open Prisma Studio
docker-compose exec app npx prisma studio
```

### Application Commands

```bash
# Access application container
docker-compose exec app bash

# View application logs
docker-compose logs -f app

# Restart application only
docker-compose restart app
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following key models:

### Core Models
- **Product**: Shopify product data with variants, media, and collections
- **Variant**: Product variants with pricing and inventory
- **Collection**: Product collections and categories
- **Tag**: Normalized product tags

### Cart System
- **Cart**: Session-based shopping carts with expiration
- **CartItem**: Individual cart items with product/variant references

### Sync & Metadata
- **SyncState**: Tracks Shopify synchronization state
- **Metafield**: Flexible metadata storage

## 🔧 Development Workflow

### Making Changes

1. **Code Changes**: Edit files in your local environment
2. **Rebuild**: `docker-compose build app`
3. **Restart**: `docker-compose restart app`

### Database Changes

1. **Update Schema**: Modify `prisma/schema.prisma`
2. **Create Migration**: `docker-compose exec app npx prisma migrate dev --name your_migration_name`
3. **Apply Migration**: `docker-compose exec app npx prisma migrate deploy`

### Adding Dependencies

1. **Update package.json**: Add new dependencies
2. **Rebuild**: `docker-compose build app`
3. **Restart**: `docker-compose restart app`

## 🐛 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
docker-compose logs app

# Check database connection
docker-compose exec app npx prisma db pull
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U uconstruction -d uconstruction

# View database logs
docker-compose logs postgres
```

#### Port Conflicts
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :5432
lsof -i :8080

# Stop conflicting services or change ports in docker-compose.yml
```

### Reset Everything

```bash
# Complete reset (removes all data)
npm run docker:clean
docker-compose up --build -d
```

## 📊 Monitoring

### Health Checks

The application includes automated health checks:

- **Application**: Checks API endpoints and database connectivity
- **Database**: Monitors PostgreSQL availability
- **Container**: Docker-level health monitoring

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

## 🔒 Security Considerations

### Production Deployment

1. **Change Default Passwords**: Update database credentials
2. **Use Secrets**: Store sensitive data in Docker secrets
3. **Network Security**: Configure proper firewall rules
4. **SSL/TLS**: Use reverse proxy with SSL termination

### Environment Variables

- Never commit `.env` files to version control
- Use different credentials for production
- Rotate API keys regularly

## 📈 Performance Optimization

### Database

- **Connection Pooling**: Configured in Prisma client
- **Indexes**: Optimized for common queries
- **Caching**: Redis can be added for session storage

### Application

- **Static Generation**: Next.js optimizations enabled
- **Image Optimization**: Configured for Shopify CDN
- **Bundle Analysis**: Use `npm run build` to analyze bundle size

## 🚀 Production Deployment

### Docker Swarm / Kubernetes

The Docker setup is production-ready and can be deployed to:

- Docker Swarm
- Kubernetes
- AWS ECS
- Google Cloud Run
- Azure Container Instances

### Environment-Specific Configs

Create environment-specific docker-compose files:

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

## 🤝 Support

For issues or questions:

1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Ensure Docker is running
4. Check port availability
5. Review this documentation

---

**Happy coding! 🎨**
