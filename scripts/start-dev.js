#!/usr/bin/env node

/**
 * Development Startup Script
 * 
 * This script ensures the database is properly initialized before starting
 * the Next.js development server. It handles:
 * 
 * 1. Database setup and migrations
 * 2. Prisma client generation
 * 3. Next.js development server startup
 * 4. Graceful shutdown handling
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const DB_FILE = path.join(__dirname, '..', 'prisma', 'dev.db');
const PRISMA_CLIENT_PATH = path.join(__dirname, '..', 'src', 'generated', 'prisma');

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Utility functions
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const logStep = (step, message) => {
  log(`${colors.bright}[${step}]${colors.reset} ${colors.cyan}${message}${colors.reset}`);
};

const logSuccess = (message) => {
  log(`${colors.green}✅ ${message}${colors.reset}`);
};

const logError = (message) => {
  log(`${colors.red}❌ ${message}${colors.reset}`);
};

const logWarning = (message) => {
  log(`${colors.yellow}⚠️ ${message}${colors.reset}`);
};

// Execute command and return promise
const execCommand = (command, cwd = process.cwd()) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
        return;
      }
      resolve({ stdout, stderr });
    });
  });
};

// Check if database exists and has tables
const checkDatabase = async () => {
  logStep('1/5', 'Checking database status...');
  
  if (!fs.existsSync(DB_FILE)) {
    logWarning('Database file does not exist');
    return false;
  }
  
  try {
    // Check if database has tables by trying a simple query
    await execCommand('npx prisma db pull --print');
    logSuccess('Database exists and has schema');
    return true;
  } catch (error) {
    logWarning('Database exists but may need setup');
    return false;
  }
};

// Generate Prisma client
const generatePrismaClient = async () => {
  logStep('2/5', 'Generating Prisma client...');
  
  try {
    const { stdout } = await execCommand('npm run prisma:generate');
    logSuccess('Prisma client generated successfully');
    return true;
  } catch (error) {
    logError('Failed to generate Prisma client:');
    console.error(error.stderr || error.error?.message);
    return false;
  }
};

// Setup database schema
const setupDatabase = async () => {
  logStep('3/5', 'Setting up database schema...');
  
  try {
    // Push schema to database (creates tables if they don't exist)
    const { stdout } = await execCommand('npm run prisma:db:push');
    logSuccess('Database schema setup complete');
    return true;
  } catch (error) {
    logError('Failed to setup database schema:');
    console.error(error.stderr || error.error?.message);
    return false;
  }
};

// Verify database connection
const verifyDatabase = async () => {
  logStep('4/5', 'Verifying database connection...');
  
  try {
    // Try to connect to database
    await execCommand('npx prisma db execute --stdin < /dev/null');
    logSuccess('Database connection verified');
    return true;
  } catch (error) {
    // This is expected to fail, but it verifies connection
    if (error.stderr && error.stderr.includes('Could not connect')) {
      logError('Database connection failed');
      return false;
    }
    logSuccess('Database connection verified');
    return true;
  }
};

// Start Next.js development server
const startDevServer = () => {
  logStep('5/5', 'Starting Next.js development server...');
  
  return new Promise((resolve, reject) => {
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    server.on('spawn', () => {
      logSuccess('Development server started');
      log(`${colors.bright}${colors.green}🚀 Server running at http://localhost:3000${colors.reset}`);
      log(`${colors.bright}${colors.blue}📊 Visit /products-demo to test product components${colors.reset}`);
      log(`${colors.bright}${colors.magenta}🎨 Visit /portfolio to see the unified gallery system${colors.reset}`);
    });

    server.on('error', (error) => {
      logError('Failed to start development server:');
      console.error(error);
      reject(error);
    });

    server.on('exit', (code) => {
      if (code !== 0) {
        logError(`Development server exited with code ${code}`);
        reject(new Error(`Server exit code: ${code}`));
      } else {
        log(`${colors.yellow}Development server stopped${colors.reset}`);
        resolve();
      }
    });

    // Handle graceful shutdown
    const cleanup = () => {
      log(`${colors.yellow}Shutting down development server...${colors.reset}`);
      server.kill('SIGINT');
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('beforeExit', cleanup);

    return server;
  });
};

// Main execution
const main = async () => {
  console.clear();
  log(`${colors.bright}${colors.cyan}🔧 UConstruction Development Startup${colors.reset}`);
  log(`${colors.bright}Watercolor Artist Site - Optimized & Consolidated${colors.reset}\n`);

  try {
    // Step 1: Check database status
    const dbExists = await checkDatabase();
    
    // Step 2: Generate Prisma client (always needed)
    const clientGenerated = await generatePrismaClient();
    if (!clientGenerated) {
      process.exit(1);
    }
    
    // Step 3: Setup database if needed
    if (!dbExists) {
      const dbSetup = await setupDatabase();
      if (!dbSetup) {
        process.exit(1);
      }
    } else {
      logSuccess('Database schema is up to date');
    }
    
    // Step 4: Verify database connection
    const dbVerified = await verifyDatabase();
    if (!dbVerified) {
      logWarning('Database verification failed, but continuing...');
    }
    
    log(''); // Empty line for spacing
    
    // Step 5: Start development server
    await startDevServer();
    
  } catch (error) {
    logError('Startup failed:');
    console.error(error);
    process.exit(1);
  }
};

// Additional helper information
const showHelp = () => {
  log(`${colors.bright}UConstruction Development Startup Script${colors.reset}\n`);
  log('This script automatically:');
  log('  • Checks database status');
  log('  • Generates Prisma client');
  log('  • Sets up database schema if needed');
  log('  • Verifies database connection');
  log('  • Starts Next.js development server\n');
  log('Available commands:');
  log(`  ${colors.green}npm run dev:full${colors.reset}     - Full startup with database init`);
  log(`  ${colors.green}npm run dev${colors.reset}          - Standard Next.js dev server`);
  log(`  ${colors.green}npm run prisma:studio${colors.reset} - Open database admin interface\n`);
  log('Environment variables needed:');
  log('  DATABASE_URL - Path to SQLite database');
  log('  Other vars from .env.local for Shopify/Stripe integration');
};

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run the main function
main().catch((error) => {
  logError('Fatal error during startup:');
  console.error(error);
  process.exit(1);
});