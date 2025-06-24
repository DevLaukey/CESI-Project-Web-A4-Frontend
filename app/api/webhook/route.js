// app/api/webhook/route.js
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log("Webhook received:", event.type);

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSuccess(event.data.object);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailure(event.data.object);
      break;
    case "charge.dispute.created":
      await handleDispute(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent) {
  const { orderId } = paymentIntent.metadata;

  // Update order status in database
  await updateOrderStatus(orderId, "paid");

  // Notify restaurant
  await notifyRestaurant(orderId);

  // Send confirmation email
  await sendConfirmationEmail(paymentIntent.metadata.userEmail);

  // Update inventory
  await updateInventory(orderId);
}

async function handlePaymentFailure(paymentIntent) {
  const { orderId } = paymentIntent.metadata;

  // Mark order as failed
  await updateOrderStatus(orderId, "payment_failed");

  // Notify customer
  await notifyPaymentFailure(paymentIntent.metadata.userEmail);
}
