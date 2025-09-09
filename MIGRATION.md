# Database Migration: SQLite → PostgreSQL

This document outlines the migration from SQLite to PostgreSQL for the uconstruction project.

## 🎯 Migration Goals

- **Performance**: Better handling of complex queries and concurrent connections
- **Scalability**: Support for larger datasets and higher traffic
- **Production Ready**: PostgreSQL is more suitable for production deployments
- **Data Integrity**: Better ACID compliance and data consistency

## 📋 Migration Checklist

- [x] Set up PostgreSQL instance (Docker)
- [x] Update Prisma schema for PostgreSQL
- [x] Create migration scripts
- [x] Create backup and restore procedures
- [x] Add development workflow scripts
- [x] Document the migration process

## 🚀 Quick Start

### Option 1: Full Automated Migration

```bash
# Run the complete migration process
npm run migrate:full
```

### Option 2: Step-by-Step Migration

```bash
# 1. Start PostgreSQL
npm run postgres:setup

# 2. Backup existing data (if any)
npm run db:backup

# 3. Generate Prisma client
npm run prisma:generate

# 4. Run migration
npm run prisma:migrate

# 5. Migrate existing data (if any)
npm run db:migrate
```

## 🔧 Development Workflow

### Switching Between Databases

```bash
# Switch to PostgreSQL
npm run db:switch postgres

# Switch to SQLite
npm run db:switch sqlite
```

### Database Management

```bash
# Start PostgreSQL
npm run postgres:start

# Stop PostgreSQL
npm run postgres:stop

# Open Prisma Studio
npm run prisma:studio

# Reset database
npm run prisma:migrate:reset
```

## 📁 File Structure

```
scripts/
├── backup-sqlite.js          # Backup SQLite database
├── migrate-to-postgres.js    # Data migration script
├── setup-postgres.sh         # PostgreSQL setup
├── full-migration.sh         # Complete migration process
├── switch-db.sh             # Database switching utility
├── init-db.sql              # PostgreSQL initialization
└── migration-guide.md       # Detailed migration guide

docker-compose.yml           # PostgreSQL Docker configuration
MIGRATION.md                 # This file
```

## 🔍 Schema Changes

### Key Updates for PostgreSQL

1. **Provider Change**: `sqlite` → `postgresql`
2. **Decimal Precision**: Added `@db.Decimal(18, 6)` for currency fields
3. **JSON Fields**: Using PostgreSQL's native JSONB type
4. **Connection String**: Updated to PostgreSQL format

### Before (SQLite)
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Variant {
  priceAmount Decimal?
}
```

### After (PostgreSQL)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Variant {
  priceAmount Decimal? @db.Decimal(18, 6)
}
```

## 🛡️ Data Safety

### Backup Strategy

- **Automatic Backups**: Created before migration
- **Multiple Formats**: Binary (.db) and SQL (.sql) dumps
- **Timestamped**: Each backup includes timestamp
- **Verification**: Data integrity checks after migration

### Rollback Plan

```bash
# Restore from backup
cp backups/dev-backup-[timestamp].db prisma/dev.db

# Switch back to SQLite
npm run db:switch sqlite

# Regenerate client
npm run prisma:generate
```

## 🧪 Testing

### Verification Steps

1. **Connection Test**: Verify database connectivity
2. **Data Integrity**: Compare record counts
3. **Query Performance**: Test complex queries
4. **Application Functionality**: Run full application tests

### Test Commands

```bash
# Test database connection
node -e "
const { prisma } = require('./src/lib/db');
prisma.\$queryRaw\`SELECT version()\`.then(console.log).finally(() => prisma.\$disconnect());
"

# Verify data migration
npm run prisma:studio
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps
   
   # Restart PostgreSQL
   docker-compose restart postgres
   ```

2. **Migration Errors**
   ```bash
   # Reset and retry
   npm run prisma:migrate:reset
   npm run prisma:migrate
   ```

3. **Data Migration Issues**
   ```bash
   # Check backup files
   ls -la backups/
   
   # Restore and retry
   cp backups/dev-backup-[timestamp].db prisma/dev.db
   npm run db:migrate
   ```

### Logs and Debugging

```bash
# PostgreSQL logs
docker-compose logs postgres

# Prisma debug logs
DEBUG=prisma:* npm run dev

# Application logs
npm run dev
```

## 📊 Performance Considerations

### PostgreSQL Optimizations

- **Connection Pooling**: Configured in `src/lib/db.ts`
- **Indexes**: All necessary indexes created by Prisma
- **JSONB**: Better performance than regular JSON
- **Decimal Precision**: Proper handling of currency values

### Monitoring

```bash
# Access pgAdmin
open http://localhost:8080

# Monitor performance
docker-compose exec postgres psql -U uconstruction -d uconstruction -c "
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;
"
```

## 🔄 Production Deployment

### Environment Variables

```env
# Production PostgreSQL
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

### Considerations

- **SSL**: Use SSL connections in production
- **Connection Pooling**: Consider PgBouncer for high traffic
- **Backups**: Set up automated `pg_dump` backups
- **Monitoring**: Implement database monitoring

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Migration Guide](scripts/migration-guide.md)

## ✅ Migration Complete

After successful migration:

1. ✅ PostgreSQL instance running
2. ✅ Prisma schema updated
3. ✅ Data migrated successfully
4. ✅ Application tested and working
5. ✅ Backup created and verified

Your application is now running on PostgreSQL! 🎉
