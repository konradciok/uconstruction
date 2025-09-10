# Database Migration Guide: SQLite → PostgreSQL

This guide walks you through migrating your uconstruction database from SQLite to PostgreSQL.

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed
- Existing SQLite database with data (optional)

## Migration Steps

### 1. Start PostgreSQL Instance

```bash
# Start PostgreSQL using Docker Compose
./scripts/setup-postgres.sh

# Or manually:
docker-compose up -d postgres
```

### 2. Backup Existing Data (Recommended)

```bash
# Create backup of current SQLite database
node scripts/backup-sqlite.js
```

### 3. Update Environment Variables

Copy your `.env` file and update the `DATABASE_URL`:

```bash
cp env.example .env
```

Update `.env`:
```env
DATABASE_URL=postgresql://uconstruction:uconstruction_dev_password@localhost:5432/uconstruction
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Run Database Migration

```bash
# Create and apply the migration
npm run prisma:migrate

# Or if you want to reset and start fresh:
npm run prisma:migrate:reset
```

### 6. Migrate Existing Data (If Applicable)

If you have existing data in SQLite:

```bash
# Migrate data from SQLite to PostgreSQL
node scripts/simple-migrate.js
```

### 7. Verify Migration

```bash
# Check database connection
npm run prisma:studio

# Or test with a simple query
node -e "
const { prisma } = require('./src/lib/db');
prisma.\$queryRaw\`SELECT version()\`.then(console.log).finally(() => prisma.\$disconnect());
"
```

## Development Workflow

### Using PostgreSQL (Recommended)

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run development server
npm run dev
```

### Switching Back to SQLite (If Needed)

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```env
   DATABASE_URL=file:./prisma/dev.db
   ```

3. Regenerate and migrate:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

## Troubleshooting

### Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection manually
docker-compose exec postgres psql -U uconstruction -d uconstruction -c "SELECT version();"
```

### Migration Issues

```bash
# Reset PostgreSQL database
docker-compose down -v
docker-compose up -d postgres

# Reset Prisma migrations
rm -rf prisma/migrations
npm run prisma:migrate
```

### Data Migration Issues

```bash
# Check backup files
ls -la backups/

# Restore from backup
cp backups/dev-backup-[timestamp].db prisma/dev.db

# Re-run migration
node scripts/simple-migrate.js
```

## Performance Considerations

### PostgreSQL Optimizations

1. **Connection Pooling**: Already configured in `src/lib/db.ts`
2. **Indexes**: All necessary indexes are created by Prisma
3. **JSON Fields**: Using JSONB for better performance
4. **Decimal Precision**: Proper precision for currency fields

### Monitoring

```bash
# Access pgAdmin (optional)
open http://localhost:8080
# Email: admin@uconstruction.local
# Password: admin

# Monitor PostgreSQL performance
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

## Production Deployment

For production deployment:

1. **Environment Variables**:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

2. **SSL Configuration**:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   ```

3. **Connection Pooling**: Consider using PgBouncer for high-traffic applications

4. **Backup Strategy**: Set up automated backups using `pg_dump`

## Rollback Plan

If you need to rollback to SQLite:

1. Stop PostgreSQL: `docker-compose down`
2. Restore SQLite schema in `prisma/schema.prisma`
3. Restore backup: `cp backups/dev-backup-[timestamp].db prisma/dev.db`
4. Regenerate Prisma client: `npm run prisma:generate`

## Support

- Check Docker logs: `docker-compose logs postgres`
- Check Prisma logs: Set `DEBUG=prisma:*` environment variable
- PostgreSQL documentation: https://www.postgresql.org/docs/
- Prisma documentation: https://www.prisma.io/docs/
