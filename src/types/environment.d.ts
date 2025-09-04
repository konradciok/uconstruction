declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RESEND_API_KEY: string;
      STRIPE_PAYMENT_LINK: string;
      VERCEL_ANALYTICS?: string;
      // Shopify sync
      MYSHOPIFY_DOMAIN: string;
      SHOPIFY_ACCESS_TOKEN: string;
      SHOPIFY_API_VERSION: string;
      // Database
      DATABASE_URL: string;
    }
  }
}

export {};
