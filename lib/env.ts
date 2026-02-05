function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const STRIPE_SECRET_KEY = requireEnv('STRIPE_SECRET_KEY');
export const STRIPE_WEBHOOK_SECRET = requireEnv('STRIPE_WEBHOOK_SECRET');
export const APP_URL = requireEnv('NEXT_PUBLIC_APP_URL');
