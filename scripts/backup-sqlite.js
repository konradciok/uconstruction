#!/usr/bin/env node

/**
 * Backup script for SQLite database before migration
 * Creates a timestamped backup of the current SQLite database
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const SQLITE_DB_PATH = path.join(__dirname, '../prisma/prisma/dev.db')
const BACKUP_DIR = path.join(__dirname, '../backups')

async function createBackup() {
  console.log('💾 Creating SQLite backup before migration...')
  
  try {
    // Check if SQLite database exists
    if (!fs.existsSync(SQLITE_DB_PATH)) {
      console.log('❌ SQLite database not found at:', SQLITE_DB_PATH)
      console.log('   No backup needed.')
      return
    }

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    // Generate timestamp for backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(BACKUP_DIR, `dev-backup-${timestamp}.db`)

    // Copy the database file
    fs.copyFileSync(SQLITE_DB_PATH, backupPath)
    
    console.log(`✅ Backup created: ${backupPath}`)
    
    // Also create a SQL dump for additional safety
    const sqlDumpPath = path.join(BACKUP_DIR, `dev-backup-${timestamp}.sql`)
    
    try {
      // Try to create SQL dump using sqlite3 command
      execSync(`sqlite3 "${SQLITE_DB_PATH}" .dump > "${sqlDumpPath}"`, { stdio: 'pipe' })
      console.log(`✅ SQL dump created: ${sqlDumpPath}`)
    } catch (error) {
      console.log('⚠️  Could not create SQL dump (sqlite3 command not found)')
      console.log('   The binary backup is still available.')
    }

    // List backup files
    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('dev-backup-'))
      .sort()
      .reverse()

    console.log('\n📋 Available backups:')
    backupFiles.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file)
      const stats = fs.statSync(filePath)
      const size = (stats.size / 1024).toFixed(2)
      console.log(`   ${file} (${size} KB)`)
    })

    console.log('\n💡 To restore from backup:')
    console.log(`   cp "${backupPath}" "${SQLITE_DB_PATH}"`)

  } catch (error) {
    console.error('❌ Backup failed:', error)
    throw error
  }
}

// Run backup
if (require.main === module) {
  createBackup()
    .then(() => {
      console.log('✅ Backup completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Backup failed:', error)
      process.exit(1)
    })
}

module.exports = { createBackup }
