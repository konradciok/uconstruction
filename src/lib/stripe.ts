import Stripe from 'stripe';

// Mock API keys for development - replace with real keys in production
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_development';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  // Let SDK pin the API version
});

// Real product ID provided by user
export const WORKSHOP_PRODUCT_ID = 'prod_SOWATu1c4uQeh0';
export const WORKSHOP_PRODUCT_NAME = 'workshop_friday';

export const getPaymentLink = (dateKey: string): string => {
  // This will be implemented when we have the actual payment links
  // For now, return a placeholder
  throw new Error(`Payment link not found for date: ${dateKey}`);
};
