declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RESEND_API_KEY: string;
      STRIPE_PAYMENT_LINK: string;
      VERCEL_ANALYTICS?: string;
    }
  }
}

export {};
