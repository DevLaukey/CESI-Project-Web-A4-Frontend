import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request) {
  console.log("=== Payment Intent API Called (App Router) ===");

  try {
    // Check Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log("❌ Missing Stripe secret key");
      return NextResponse.json(
        {
          error: "Stripe not configured - missing secret key",
          hint: "Add STRIPE_SECRET_KEY to .env.local",
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log("Request body:", body);

    const { amount, currency = "usd", orderId, userId } = body;

    // Validate required fields
    if (!amount || !orderId || !userId) {
      console.log("❌ Missing required fields:", { amount, orderId, userId });
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["amount", "orderId", "userId"],
          received: { amount, orderId, userId },
        },
        { status: 400 }
      );
    }

    console.log("✅ Creating payment intent...");

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(amount) * 100), // Convert to cents
      currency,
      metadata: {
        orderId: orderId.toString(),
        userId: userId.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("✅ Payment intent created:", paymentIntent.id);

    // Success response
    const response = {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency,
    };

    console.log("✅ Sending response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ API Error:", error);

    // Handle specific Stripe errors
    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        {
          error: "Invalid request to Stripe",
          details: error.message,
          code: error.code,
        },
        { status: 400 }
      );
    }

    if (error.type === "StripeAuthenticationError") {
      return NextResponse.json(
        {
          error: "Stripe authentication failed",
          details: "Invalid API key",
          hint: "Check your STRIPE_SECRET_KEY",
        },
        { status: 401 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Handle CORS for other methods
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
