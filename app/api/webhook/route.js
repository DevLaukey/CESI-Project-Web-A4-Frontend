import { buffer } from "micro";
import Stripe from "stripe";
import { connectToDatabase } from "../../lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { db } = await connectToDatabase();

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;

      // Update payment record in database
      await db.collection("payments").updateOne(
        { paymentIntentId: paymentIntent.id },
        {
          $set: {
            status: "completed",
            stripeStatus: paymentIntent.status,
            completedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      // Notify other microservices about successful payment
      await notifyOrderService(
        paymentIntent.metadata.orderId,
        "payment_completed"
      );
      await notifyNotificationService(
        paymentIntent.metadata.userId,
        "payment_success"
      );

      console.log("Payment succeeded:", paymentIntent.id);
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;

      // Update payment record
      await db.collection("payments").updateOne(
        { paymentIntentId: failedPayment.id },
        {
          $set: {
            status: "failed",
            stripeStatus: failedPayment.status,
            failedAt: new Date(),
            updatedAt: new Date(),
            failureReason:
              failedPayment.last_payment_error?.message || "Payment failed",
          },
        }
      );

      // Notify about failed payment
      await notifyOrderService(
        failedPayment.metadata.orderId,
        "payment_failed"
      );
      await notifyNotificationService(
        failedPayment.metadata.userId,
        "payment_failed"
      );

      console.log("Payment failed:", failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}

// Helper functions for inter-service communication
async function notifyOrderService(orderId, status) {
  try {
    await fetch(
      `${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}/payment-status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Token": process.env.SERVICE_TOKEN,
        },
        body: JSON.stringify({ paymentStatus: status }),
      }
    );
  } catch (error) {
    console.error("Failed to notify order service:", error);
  }
}

async function notifyNotificationService(userId, type) {
  try {
    await fetch(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Service-Token": process.env.SERVICE_TOKEN,
      },
      body: JSON.stringify({
        userId,
        type,
        message:
          type === "payment_success"
            ? "Your payment was processed successfully!"
            : "Payment failed. Please try again.",
      }),
    });
  } catch (error) {
    console.error("Failed to notify notification service:", error);
  }
}
