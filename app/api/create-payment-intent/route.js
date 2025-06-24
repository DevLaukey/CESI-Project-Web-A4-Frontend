// pages/api/create-payment-intent.js
import { connectToDatabase } from '@/libs/mongoConnect';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'usd', orderId, userId, restaurantId } = req.body;

    // Validate required fields
    if (!amount || !orderId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, orderId, userId' 
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        orderId,
        userId,
        restaurantId: restaurantId || '',
      },
    });

    // Connect to MongoDB and save payment record
    const { db } = await connectToDatabase();
    
    const paymentRecord = {
      paymentIntentId: paymentIntent.id,
      orderId,
      userId,
      restaurantId,
      amount,
      currency,
      status: 'pending',
      stripeStatus: paymentIntent.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('payments').insertOne(paymentRecord);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error.message 
    });
  }
}
