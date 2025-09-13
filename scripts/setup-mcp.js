#!/usr/bin/env node

/**
 * MCP Setup Script for Stripe Integration
 * 
 * This script helps set up the Model Context Protocol (MCP) configuration
 * for Stripe integration with your existing environment.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Setting up MCP configuration for Stripe integration...\n')

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env')
const envExamplePath = path.join(__dirname, '..', 'env.example')

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env file from env.example...')
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ .env file created from env.example')
    console.log('⚠️  Please update the Stripe credentials in .env file with your actual keys')
  } else {
    console.log('❌ No .env or env.example file found')
    process.exit(1)
  }
} else {
  console.log('✅ .env file already exists')
}

// Install required MCP packages
console.log('\n📦 Installing MCP packages...')
try {
  execSync('npm install -g @stripe/mcp @modelcontextprotocol/server-postgres', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  })
  console.log('✅ MCP packages installed successfully')
} catch (error) {
  console.log('⚠️  Failed to install MCP packages globally, trying locally...')
  try {
    execSync('npm install @stripe/mcp @modelcontextprotocol/server-postgres', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    })
    console.log('✅ MCP packages installed locally')
  } catch (localError) {
    console.log('❌ Failed to install MCP packages:', localError.message)
    console.log('Please install manually:')
    console.log('  npm install -g @stripe/mcp @modelcontextprotocol/server-postgres')
  }
}

// Verify MCP configuration
const mcpConfigPath = path.join(__dirname, '..', 'mcp.json')
if (fs.existsSync(mcpConfigPath)) {
  console.log('\n✅ MCP configuration file (mcp.json) already exists')
} else {
  console.log('\n❌ MCP configuration file (mcp.json) not found')
  console.log('Please ensure the mcp.json file is in the project root')
}

console.log('\n🎉 MCP setup complete!')
console.log('\nNext steps:')
console.log('1. Update your Stripe credentials in the .env file')
console.log('2. Verify the mcp.json configuration')
console.log('3. Test the MCP connection with your AI assistant')
console.log('\nRequired environment variables:')
console.log('- STRIPE_SECRET_KEY (your Stripe secret key)')
console.log('- DATABASE_URL (your database connection string)')
console.log('\nNote: @stripe/mcp uses only STRIPE_SECRET_KEY')
console.log('Note: @modelcontextprotocol/server-postgres provides read-only database access')
