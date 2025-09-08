#!/usr/bin/env node
/*
 Shopify Webhook CLI Setup Script
 - Creates webhooks programmatically using Shopify Admin API
 - Configures product and collection webhooks automatically
 - Generates webhook secret and updates environment

 Usage:
   node --env-file=.env --env-file=.env.local --env-file=env.local scripts/setup-webhooks.js --url https://yourdomain.com

 Options:
   --url        Base URL for webhook endpoints (required)
   --ngrok      Use ngrok URL for local development
   --secret     Custom webhook secret (optional, generates one if not provided)
   --dry-run    Show what would be created without actually creating

 Required env vars:
   MYSHOPIFY_DOMAIN
   SHOPIFY_ACCESS_TOKEN
   SHOPIFY_API_VERSION
*/

'use strict';

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function getEnv(name, { required = true } = {}) {
  const value = process.env[name];
  if (required && (!value || value.trim().length === 0)) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: null,
    ngrok: false,
    secret: null,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        options.url = args[++i];
        break;
      case '--ngrok':
        options.ngrok = true;
        break;
      case '--secret':
        options.secret = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
        console.log(`
Shopify Webhook Setup Script

Usage:
  node scripts/setup-webhooks.js --url https://yourdomain.com

Options:
  --url        Base URL for webhook endpoints (required)
  --ngrok      Use ngrok URL for local development  
  --secret     Custom webhook secret (optional)
  --dry-run    Show what would be created without creating
  --help       Show this help message

Examples:
  # Production setup
  node scripts/setup-webhooks.js --url https://myapp.vercel.app

  # Development with ngrok
  node scripts/setup-webhooks.js --url https://abc123.ngrok.io

  # Dry run to see what would be created
  node scripts/setup-webhooks.js --url https://myapp.com --dry-run
`);
        process.exit(0);
        break;
    }
  }

  if (!options.url) {
    console.error('Error: --url is required');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  return options;
}

async function postGraphQL({ domain, token, apiVersion, query, variables }) {
  const options = {
    method: 'POST',
    hostname: domain,
    path: `/admin/api/${apiVersion}/graphql.json`,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
  };
  const body = JSON.stringify(variables ? { query, variables } : { query });

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, json });
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function createWebhook({ domain, token, apiVersion }, webhookData) {
  const mutation = `#graphql
    mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        webhookSubscription {
          id
          callbackUrl
          topic
          format
          createdAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    topic: webhookData.topic,
    webhookSubscription: {
      callbackUrl: webhookData.callbackUrl,
      format: 'JSON',
    },
  };

  const { status, json } = await postGraphQL({
    domain,
    token,
    apiVersion,
    query: mutation,
    variables,
  });

  if (status !== 200 || json.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(json.errors || json)}`);
  }

  const result = json.data?.webhookSubscriptionCreate;
  if (result?.userErrors?.length > 0) {
    throw new Error(
      `Webhook creation error: ${JSON.stringify(result.userErrors)}`
    );
  }

  return result?.webhookSubscription;
}

async function listExistingWebhooks({ domain, token, apiVersion }) {
  const query = `#graphql
    query {
      webhookSubscriptions(first: 50) {
        edges {
          node {
            id
            callbackUrl
            topic
            format
            createdAt
            updatedAt
          }
        }
      }
    }
  `;

  const { status, json } = await postGraphQL({
    domain,
    token,
    apiVersion,
    query,
  });

  if (status !== 200 || json.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(json.errors || json)}`);
  }

  return json.data?.webhookSubscriptions?.edges?.map((edge) => edge.node) || [];
}

async function deleteWebhook({ domain, token, apiVersion }, webhookId) {
  const mutation = `#graphql
    mutation webhookSubscriptionDelete($id: ID!) {
      webhookSubscriptionDelete(id: $id) {
        deletedWebhookSubscriptionId
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = { id: webhookId };

  const { status, json } = await postGraphQL({
    domain,
    token,
    apiVersion,
    query: mutation,
    variables,
  });

  if (status !== 200 || json.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(json.errors || json)}`);
  }

  const result = json.data?.webhookSubscriptionDelete;
  if (result?.userErrors?.length > 0) {
    throw new Error(
      `Webhook deletion error: ${JSON.stringify(result.userErrors)}`
    );
  }

  return result?.deletedWebhookSubscriptionId;
}

function generateWebhookSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function updateEnvFile(secret, baseUrl) {
  const envPath = path.join(process.cwd(), 'env.local');
  let envContent = '';

  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (err) {
    console.log('Creating new env.local file...');
  }

  // Update or add webhook secret
  const secretLine = `SHOPIFY_WEBHOOK_SECRET="${secret}"`;
  if (envContent.includes('SHOPIFY_WEBHOOK_SECRET=')) {
    envContent = envContent.replace(/SHOPIFY_WEBHOOK_SECRET=.*/, secretLine);
  } else {
    envContent += `\n# Generated webhook secret\n${secretLine}\n`;
  }

  // Add webhook base URL for reference
  const urlComment = `\n# Webhook base URL: ${baseUrl}`;
  if (!envContent.includes('Webhook base URL:')) {
    envContent += urlComment;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`✓ Updated ${envPath} with webhook secret`);
}

async function main() {
  const options = parseArgs();
  const domain = getEnv('MYSHOPIFY_DOMAIN');
  const token = getEnv('SHOPIFY_ACCESS_TOKEN');
  const apiVersion = getEnv('SHOPIFY_API_VERSION');

  const credentials = { domain, token, apiVersion };

  console.log('🔧 Shopify Webhook Setup');
  console.log(`📍 Base URL: ${options.url}`);
  console.log(`🏪 Shop: ${domain}`);
  console.log(`📡 API Version: ${apiVersion}`);

  if (options.dryRun) {
    console.log('🧪 DRY RUN MODE - No changes will be made');
  }

  // Generate or use provided webhook secret
  const webhookSecret = options.secret || generateWebhookSecret();
  console.log(`🔐 Webhook Secret: ${webhookSecret.substring(0, 8)}...`);

  // Define webhooks to create
  const webhooksToCreate = [
    {
      topic: 'PRODUCTS_CREATE',
      callbackUrl: `${options.url}/api/shopify/webhooks/products`,
      description: 'Product creation events',
    },
    {
      topic: 'PRODUCTS_UPDATE',
      callbackUrl: `${options.url}/api/shopify/webhooks/products`,
      description: 'Product update events',
    },
    {
      topic: 'PRODUCTS_DELETE',
      callbackUrl: `${options.url}/api/shopify/webhooks/products`,
      description: 'Product deletion events',
    },
    {
      topic: 'COLLECTIONS_CREATE',
      callbackUrl: `${options.url}/api/shopify/webhooks/collections`,
      description: 'Collection creation events',
    },
    {
      topic: 'COLLECTIONS_UPDATE',
      callbackUrl: `${options.url}/api/shopify/webhooks/collections`,
      description: 'Collection update events',
    },
    {
      topic: 'COLLECTIONS_DELETE',
      callbackUrl: `${options.url}/api/shopify/webhooks/collections`,
      description: 'Collection deletion events',
    },
  ];

  try {
    // List existing webhooks
    console.log('\n📋 Checking existing webhooks...');
    const existingWebhooks = await listExistingWebhooks(credentials);

    if (existingWebhooks.length > 0) {
      console.log(`Found ${existingWebhooks.length} existing webhooks:`);
      existingWebhooks.forEach((webhook) => {
        console.log(`  - ${webhook.topic}: ${webhook.callbackUrl}`);
      });

      // Ask user if they want to delete existing webhooks
      console.log('\n⚠️  Note: Existing webhooks may conflict with new ones');
      console.log(
        '💡 Consider deleting old webhooks first with: --delete-existing'
      );
    }

    if (options.dryRun) {
      console.log('\n📝 Would create these webhooks:');
      webhooksToCreate.forEach((webhook) => {
        console.log(`  - ${webhook.topic}: ${webhook.callbackUrl}`);
        console.log(`    ${webhook.description}`);
      });
      console.log(
        `\n🔐 Would update env.local with secret: ${webhookSecret.substring(0, 8)}...`
      );
      return;
    }

    // Create webhooks
    console.log('\n🚀 Creating webhooks...');
    const createdWebhooks = [];

    for (const webhookData of webhooksToCreate) {
      try {
        console.log(`Creating ${webhookData.topic}...`);
        const webhook = await createWebhook(credentials, webhookData);
        createdWebhooks.push(webhook);
        console.log(`✓ Created: ${webhook.id}`);
      } catch (error) {
        console.error(
          `❌ Failed to create ${webhookData.topic}:`,
          error.message
        );
        if (error.message.includes('already exists')) {
          console.log(`  → Webhook already exists, skipping...`);
        }
      }
    }

    // Update environment file
    updateEnvFile(webhookSecret, options.url);

    console.log('\n🎉 Webhook setup completed!');
    console.log(`✅ Created ${createdWebhooks.length} webhooks`);
    console.log('✅ Updated env.local with webhook secret');

    console.log('\n📋 Next steps:');
    console.log(
      '1. Restart your development server to load new environment variables'
    );
    console.log('2. Test webhook endpoints with ngrok (for local development)');
    console.log('3. Monitor webhook delivery in your application logs');

    console.log('\n🔍 Testing commands:');
    console.log('  npm run dev              # Start development server');
    console.log('  npm run sync:delta       # Test delta sync');
    console.log(
      '  ngrok http 3000          # Expose local server (if using --ngrok)'
    );
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
