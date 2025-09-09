#!/usr/bin/env node

/**
 * Simple migration script to migrate data from SQLite to PostgreSQL
 * This script directly reads from SQLite files and writes to PostgreSQL
 */

const { Client } = require('pg')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

// Configuration
const SQLITE_DB_PATH = path.join(__dirname, '../prisma/prisma/dev.db')
const POSTGRES_URL = process.env.DATABASE_URL || 'postgresql://uconstruction:uconstruction_dev_password@localhost:5432/uconstruction'

// Check if SQLite database exists
if (!fs.existsSync(SQLITE_DB_PATH)) {
  console.log('❌ SQLite database not found at:', SQLITE_DB_PATH)
  process.exit(1)
}

// Initialize clients
const postgresClient = new Client({
  connectionString: POSTGRES_URL
})

const sqliteDb = new sqlite3.Database(SQLITE_DB_PATH)

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...')
  
  try {
    // Connect to PostgreSQL
    await postgresClient.connect()
    console.log('✅ Connected to PostgreSQL')

    // Test SQLite connection
    await new Promise((resolve, reject) => {
      sqliteDb.get('SELECT 1', (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
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
      
      // Get data from SQLite
      const data = await new Promise((resolve, reject) => {
        sqliteDb.all(`SELECT * FROM ${tableName}`, (err, rows) => {
          if (err) {
            // Table might not exist, that's okay
            if (err.message.includes('no such table')) {
              resolve([])
            } else {
              reject(err)
            }
          } else {
            resolve(rows)
          }
        })
      })
      
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
              
              // Handle timestamp conversion from SQLite (Unix timestamp in milliseconds) to PostgreSQL
              if ((col === 'publishedAt' || col === 'createdAt' || col === 'updatedAt' || col === 'deletedAt' || col === 'shopifyUpdatedAt') && typeof value === 'number') {
                // Convert Unix timestamp (already in milliseconds) to PostgreSQL timestamp
                const date = new Date(value)
                return `'${date.toISOString()}'`
              }
              
              // Handle boolean conversion from SQLite (0/1) to PostgreSQL (true/false)
              if ((col === 'taxable' || col === 'requiresShipping') && typeof value === 'number') {
                return value === 1 ? 'true' : 'false'
              }
              
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
      const sqliteCount = await new Promise((resolve, reject) => {
        sqliteDb.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
          if (err) {
            if (err.message.includes('no such table')) {
              resolve(0)
            } else {
              reject(err)
            }
          } else {
            resolve(row.count)
          }
        })
      })
      
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
    await postgresClient.end()
    sqliteDb.close()
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
