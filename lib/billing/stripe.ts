import Stripe from 'stripe';

// Sets up Stripe client exactly once
// Fails loudly if the key is not set
// Exports a single client

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});
