"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const CheckoutForm = ({ orderId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    setDebugInfo({
      stripeLoaded: !!stripe,
      elementsLoaded: !!elements,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
  }, [stripe, elements]);

  const testAPIConnection = async () => {
    try {
      console.log("Testing API connection...");
      const response = await fetch("/api/test");
      const data = await response.json();
      console.log("API test result:", data);
      return true;
    } catch (error) {
      console.error("API test failed:", error);
      return false;
    }
  };

  const testStripeConfig = async () => {
    try {
      console.log("Testing Stripe configuration...");
      const response = await fetch("/api/stripe-test");
      const data = await response.json();
      console.log("Stripe config test result:", data);
      return data;
    } catch (error) {
      console.error("Stripe config test failed:", error);
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setPaymentError("Stripe not loaded yet. Please refresh the page.");
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    try {
      console.log("🚀 Creating payment intent...");

      const requestData = {
        amount: parseFloat(amount),
        orderId: orderId || `order-${Date.now()}`,
        userId: "test-user-123",
      };

      console.log("Request data:", requestData);

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error Response:", errorData);
        throw new Error(errorData.error || `API returned ${response.status}`);
      }

      const responseData = await response.json();
      console.log("✅ Payment intent response:", responseData);

      const { clientSecret } = responseData;

      if (!clientSecret) {
        throw new Error("No client secret received from server");
      }

      console.log("🔒 Confirming payment with Stripe...");

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: "Test Customer",
            },
          },
        }
      );

      if (error) {
        console.error("❌ Stripe payment error:", error);
        setPaymentError(error.message);
        onError(error);
      } else if (paymentIntent.status === "succeeded") {
        console.log("✅ Payment succeeded:", paymentIntent);

        // Optionally confirm payment in your backend
        try {
          await fetch("/api/confirm-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
            }),
          });
        } catch (confirmError) {
          console.error("Error confirming payment:", confirmError);
        }

        onSuccess(paymentIntent);
      } else {
        console.log("⚠️ Payment status:", paymentIntent.status);
        setPaymentError(`Payment ${paymentIntent.status}. Please try again.`);
      }
    } catch (err) {
      console.error("❌ Payment flow error:", err);
      setPaymentError(err.message || "An unexpected error occurred");
      onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug Panel */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="bg-gray-100 p-4 rounded-lg text-sm">
          <h3 className="font-bold mb-2">Debug Info (App Router):</h3>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          <div className="mt-2 space-x-2">
            <button
              type="button"
              onClick={testAPIConnection}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Test API
            </button>
            <button
              type="button"
              onClick={testStripeConfig}
              className="px-3 py-1 bg-green-500 text-white rounded text-xs"
            >
              Test Stripe Config
            </button>
          </div>
        </div>
      )} */}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 border border-gray-300 rounded-lg bg-white">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>

        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-600 text-sm font-medium">
              ❌ {paymentError}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            isProcessing || !stripe
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay $${parseFloat(amount).toFixed(2)}`
          )}
        </button>

        {/* Test card info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <p className="font-medium text-yellow-800 mb-2">
            Test Mode - Use these test cards:
          </p>
          <ul className="text-yellow-700 space-y-1">
            <li>• Success: 4242 4242 4242 4242</li>
            <li>• Decline: 4000 0000 0000 0002</li>
            <li>• Expiry: Any future date (12/34)</li>
            <li>• CVC: Any 3 digits (123)</li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default function PaymentForm({ orderId, amount, onSuccess, onError }) {
  const [stripeError, setStripeError] = useState(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setStripeError("Stripe publishable key is missing");
      return;
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_")) {
      setStripeError("Invalid Stripe publishable key format");
      return;
    }
  }, []);

  if (stripeError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 font-medium">{stripeError}</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        orderId={orderId}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
