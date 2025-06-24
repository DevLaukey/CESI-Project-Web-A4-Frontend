import { connectToDatabase } from "@/libs/mongoConnect";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment Intent ID is required" });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Connect to MongoDB and update payment record
    const { db } = await connectToDatabase();

    const updateData = {
      stripeStatus: paymentIntent.status,
      status: paymentIntent.status === "succeeded" ? "completed" : "failed",
      updatedAt: new Date(),
    };

    if (paymentIntent.status === "succeeded") {
      updateData.completedAt = new Date();
      updateData.paymentMethod = paymentIntent.payment_method;
    }

    await db
      .collection("payments")
      .updateOne({ paymentIntentId }, { $set: updateData });

    res.status(200).json({
      status: paymentIntent.status,
      paymentIntent: paymentIntent,
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({
      error: "Failed to confirm payment",
      details: error.message,
    });
  }
}
