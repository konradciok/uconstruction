#!/usr/bin/env node
/*
 Minimal Phase 0 verification:
 - Validates required env vars
 - Calls Shopify Admin API (GraphQL) to fetch shop name and API version header
 - Optionally lists first product to confirm scopes
*/

const https = require('https');

function getEnv(name, { required = true } = {}) {
  const value = process.env[name];
  if (required && (!value || value.trim().length === 0)) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

async function postGraphQL({ domain, token, apiVersion, query }) {
  const options = {
    method: 'POST',
    hostname: domain,
    path: `/admin/api/${apiVersion}/graphql.json`,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
  };

  const body = JSON.stringify({ query });

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

(async () => {
  const domain = getEnv('MYSHOPIFY_DOMAIN');
  const token = getEnv('SHOPIFY_ACCESS_TOKEN');
  const apiVersion = getEnv('SHOPIFY_API_VERSION');

  // 1) Verify basic access by fetching shop and a tiny product list
  const query = `#graphql
    query VerifyAccess {
      shop { name myshopifyDomain }
      products(first: 1) { edges { node { id title handle updatedAt } } }
    }
  `;
  try {
    const { status, headers, json } = await postGraphQL({
      domain,
      token,
      apiVersion,
      query,
    });
    if (status !== 200) {
      console.error(`Shopify responded with HTTP ${status}`);
      console.error(json);
      process.exit(1);
    }

    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      process.exit(1);
    }

    const apiHeader = headers['x-shopify-api-version'];
    console.log(
      'Verified access to shop:',
      json.data?.shop?.name || '(unknown)'
    );
    console.log('MyShopify domain reported:', json.data?.shop?.myshopifyDomain);
    console.log('Pinned API version requested:', apiVersion);
    console.log('API version from response header:', apiHeader);

    const firstProduct = json.data?.products?.edges?.[0]?.node;
    if (firstProduct) {
      console.log('Sample product fetched:', {
        id: firstProduct.id,
        title: firstProduct.title,
        handle: firstProduct.handle,
        updatedAt: firstProduct.updatedAt,
      });
    } else {
      console.log(
        'No products returned (this may be fine if the store is empty).'
      );
    }

    console.log('Phase 0 verification succeeded.');
  } catch (err) {
    console.error('Verification failed:', err.message);
    process.exit(1);
  }
})();
