import { NextResponse } from "next/server";

export async function GET() {
  console.log("Stripe test API called");

  const config = {
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasStripePublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKeyPrefix: process.env.STRIPE_SECRET_KEY
      ? process.env.STRIPE_SECRET_KEY.substring(0, 8) + "..."
      : "Missing",
    publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 8) + "..."
      : "Missing",
    nodeEnv: process.env.NODE_ENV,
    router: "App Router",
  };

  console.log("Stripe configuration:", config);

  return NextResponse.json(config);
}
