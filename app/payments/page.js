"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PaymentForm from "../../components/PaymentForm";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && amount) {
      // Simulate fetching order details
      setOrderDetails({
        id: orderId,
        total: parseFloat(amount),
        items: [
          { name: "Burger Deluxe", price: 12.99, quantity: 1 },
          { name: "French Fries", price: 4.99, quantity: 1 },
        ],
        restaurant: "Best Burgers",
        deliveryFee: 2.99,
        tax: 1.6,
      });
      setLoading(false);
    }
  }, [orderId, amount]);

  const handlePaymentSuccess = (paymentIntent) => {
    console.log("Payment successful:", paymentIntent);
    // Redirect to success page
    window.location.href = `/order-confirmation?orderId=${orderId}&paymentId=${paymentIntent.id}`;
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            {orderDetails && (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg">
                    {orderDetails.restaurant}
                  </h3>
                  <p className="text-gray-600">Order #{orderDetails.id}</p>
                </div>

                <div className="space-y-2">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      $
                      {(
                        orderDetails.total -
                        orderDetails.deliveryFee -
                        orderDetails.tax
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>${orderDetails.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${orderDetails.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

            {orderDetails && (
              <PaymentForm
                orderId={orderId}
                amount={orderDetails.total}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
