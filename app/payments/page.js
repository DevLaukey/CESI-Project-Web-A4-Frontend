"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PaymentForm from "@/components/PaymentForm";

export default function PaymentPage() {
  const router = useParams();
  const { orderId, amount } = router;
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      fetchPaymentHistory();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      // This would typically fetch from your order microservice
      // For now, we'll simulate order details
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
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payment-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPaymentHistory(data.payments || []);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log("Payment successful:", paymentIntent);
    router.push(
      `/order-confirmation?orderId=${orderId}&paymentId=${paymentIntent.id}`
    );
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

        {/* Payment History */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Recent Payments</h2>

          {paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Order ID</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.slice(0, 5).map((payment, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{payment.orderId}</td>
                      <td className="px-4 py-2">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No payment history found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
