#!/usr/bin/env node

/**
 * Migration script to migrate data from SQLite to PostgreSQL
 * This script handles the data migration while preserving all existing data
 */

const { PrismaClient: SQLitePrismaClient } = require('../src/generated/prisma')
const { Client } = require('pg')
const path = require('path')
const fs = require('fs')

// Configuration
const SQLITE_DB_PATH = path.join(__dirname, '../prisma/prisma/dev.db')
const POSTGRES_URL = process.env.DATABASE_URL || 'postgresql://uconstruction:uconstruction_dev_password@localhost:5432/uconstruction'

// Check if SQLite database exists
if (!fs.existsSync(SQLITE_DB_PATH)) {
  console.log('❌ SQLite database not found at:', SQLITE_DB_PATH)
  console.log('   Make sure you have existing data to migrate.')
  process.exit(1)
}

// Initialize clients
const sqliteClient = new SQLitePrismaClient({
  datasources: {
    db: {
      url: `file:${SQLITE_DB_PATH}`
    }
  }
})

const postgresClient = new Client({
  connectionString: POSTGRES_URL
})

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...')
  
  try {
    // Connect to PostgreSQL
    await postgresClient.connect()
    console.log('✅ Connected to PostgreSQL')

    // Test SQLite connection
    await sqliteClient.$queryRaw`SELECT 1`
    console.log('✅ Connected to SQLite')

    // Migration order (respecting foreign key constraints)
    const migrationOrder = [
      'Tag',
      'Collection', 
      'Product',
      'ProductOption',
      'Variant',
      'ProductMedia',
      'ProductCollection',
      'ProductTag',
      'InventoryLevel',
      'SyncState',
      'Metafield'
    ]

    for (const tableName of migrationOrder) {
      console.log(`📦 Migrating ${tableName}...`)
      
      const data = await sqliteClient[tableName.toLowerCase()].findMany()
      
      if (data.length === 0) {
        console.log(`   ⏭️  No data in ${tableName}, skipping...`)
        continue
      }

      // Clear existing data in PostgreSQL (in case of re-run)
      await postgresClient.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`)
      
      // Insert data in batches
      const batchSize = 100
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize)
        
        if (batch.length > 0) {
          const columns = Object.keys(batch[0])
          const values = batch.map(row => 
            columns.map(col => {
              const value = row[col]
              if (value === null) return 'NULL'
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`
              if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`
              return value
            })
          )
          
          const insertQuery = `
            INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
            VALUES ${values.map(v => `(${v.join(', ')})`).join(', ')}
          `
          
          await postgresClient.query(insertQuery)
        }
      }
      
      console.log(`   ✅ Migrated ${data.length} records from ${tableName}`)
    }

    console.log('🎉 Migration completed successfully!')
    
    // Verify migration
    console.log('🔍 Verifying migration...')
    for (const tableName of migrationOrder) {
      const sqliteCount = await sqliteClient[tableName.toLowerCase()].count()
      const postgresResult = await postgresClient.query(`SELECT COUNT(*) FROM "${tableName}"`)
      const postgresCount = parseInt(postgresResult.rows[0].count)
      
      if (sqliteCount === postgresCount) {
        console.log(`   ✅ ${tableName}: ${sqliteCount} records`)
      } else {
        console.log(`   ❌ ${tableName}: SQLite=${sqliteCount}, PostgreSQL=${postgresCount}`)
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await sqliteClient.$disconnect()
    await postgresClient.end()
  }
}

// Run migration
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('✅ Migration script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateData }
