import Stripe from "stripe";
import { connectToDatabase } from "../../lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { paymentIntentId, amount, reason } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ error: "Payment Intent ID is required" });
        }

        // Create refund with Stripe
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
            reason: reason || "requested_by_customer",
        });

        // Store refund record in database
        const { db } = await connectToDatabase();

        const refundRecord = {
            refundId: refund.id,
            paymentIntentId,
            amount: refund.amount / 100,
            reason: refund.reason,
            status: refund.status,
            createdAt: new Date(),
        };

        await db.collection("refunds").insertOne(refundRecord);

        // Update original payment record
        await db.collection("payments").updateOne(
            { paymentIntentId },
            {
                $set: {
                    refundStatus: refund.status,
                    refundAmount: refund.amount / 100,
                    updatedAt: new Date(),
                },
            }
        );

        res.status(200).json({
            success: true,
            refund: refundRecord,
        });
    } catch (error) {
        console.error("Refund creation error:", error);
        res.status(500).json({
            error: "Failed to process refund",
            details: error.message,
        });
    }
}