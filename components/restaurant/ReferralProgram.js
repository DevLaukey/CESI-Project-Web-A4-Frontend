// components/restaurant/ReferralProgram.js
"use client";
import { useState, useEffect } from "react";

export default function ReferralProgram() {
  const [referralCode, setReferralCode] = useState("REF-BV2024-ABC123");
  const [referralStats, setReferralStats] = useState({
    totalEarnings: 350,
    pendingEarnings: 150,
    totalReferrals: 7,
    pendingReferrals: 3,
    conversionRate: 58.3,
    thisMonthReferrals: 2,
  });

  const [referralHistory, setReferralHistory] = useState([
    {
      id: 1,
      restaurantName: "Pizza Palace",
      ownerName: "Mario Rossi",
      email: "mario@pizzapalace.com",
      dateInvited: "2024-12-15",
      dateJoined: "2024-12-18",
      status: "completed",
      earnings: 50,
      phone: "+1 (555) 123-4567",
    },
    {
      id: 2,
      restaurantName: "Burger Corner",
      ownerName: "John Smith",
      email: "john@burgercorner.com",
      dateInvited: "2024-12-10",
      dateJoined: "2024-12-12",
      status: "completed",
      earnings: 50,
      phone: "+1 (555) 987-6543",
    },
    {
      id: 3,
      restaurantName: "Sushi Zen",
      ownerName: "Yuki Tanaka",
      email: "info@sushizen.com",
      dateInvited: "2024-12-20",
      dateJoined: null,
      status: "pending",
      earnings: 0,
      phone: "+1 (555) 456-7890",
    },
    {
      id: 4,
      restaurantName: "Taco Fiesta",
      ownerName: "Carlos Rodriguez",
      email: "carlos@tacofiesta.com",
      dateInvited: "2024-12-22",
      dateJoined: null,
      status: "pending",
      earnings: 0,
      phone: "+1 (555) 321-0987",
    },
    {
      id: 5,
      restaurantName: "Pasta Express",
      ownerName: "Luigi Ferrari",
      email: "luigi@pastaexpress.com",
      dateInvited: "2024-12-08",
      dateJoined: null,
      status: "declined",
      earnings: 0,
      phone: "+1 (555) 654-3210",
    },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [showReferralDetails, setShowReferralDetails] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    // You could add a toast notification here
    alert("Referral code copied to clipboard!");
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (inviteForm.restaurantName && inviteForm.ownerName && inviteForm.email) {
      const newReferral = {
        id: Date.now(),
        restaurantName: inviteForm.restaurantName,
        ownerName: inviteForm.ownerName,
        email: inviteForm.email,
        phone: inviteForm.phone,
        dateInvited: new Date().toISOString().split("T")[0],
        dateJoined: null,
        status: "pending",
        earnings: 0,
      };

      setReferralHistory((prev) => [newReferral, ...prev]);
      setReferralStats((prev) => ({
        ...prev,
        pendingReferrals: prev.pendingReferrals + 1,
      }));

      setInviteForm({
        restaurantName: "",
        ownerName: "",
        email: "",
        phone: "",
        message: "",
      });
      setShowInviteModal(false);
    }
  };

  const generateNewCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "REF-BV2024-";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setReferralCode(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Referral Program</h2>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Invite Restaurant
        </button>
      </div>

      {/* Referral Code Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Your Referral Code</h3>
            <p className="text-blue-100">
              Share this code and earn $50 for each successful referral!
            </p>
          </div>
          <div className="text-4xl">🎁</div>
        </div>

        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
          <code className="text-lg font-mono font-bold">{referralCode}</code>
          <div className="flex space-x-2">
            <button
              onClick={copyReferralCode}
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Copy Code
            </button>
            <button
              onClick={generateNewCode}
              className="bg-white bg-opacity-20 text-white px-3 py-1 rounded text-sm font-medium hover:bg-opacity-30 transition-colors"
            >
              Generate New
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-blue-100">
            💡 Tip: Share via email, social media, or direct contact
          </span>
          <button
            onClick={() => setShowReferralDetails(true)}
            className="text-blue-100 hover:text-white underline"
          >
            How it works
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            ${referralStats.totalEarnings}
          </div>
          <div className="text-sm text-gray-600">Total Earnings</div>
          <div className="text-xs text-green-600 mt-1">All time</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            ${referralStats.pendingEarnings}
          </div>
          <div className="text-sm text-gray-600">Pending Earnings</div>
          <div className="text-xs text-yellow-600 mt-1">Awaiting approval</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {referralStats.totalReferrals}
          </div>
          <div className="text-sm text-gray-600">Total Referrals</div>
          <div className="text-xs text-blue-600 mt-1">Successful signups</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">
            {referralStats.pendingReferrals}
          </div>
          <div className="text-sm text-gray-600">Pending Referrals</div>
          <div className="text-xs text-orange-600 mt-1">Waiting for signup</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {referralStats.conversionRate}%
          </div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
          <div className="text-xs text-purple-600 mt-1">Success rate</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-teal-600">
            {referralStats.thisMonthReferrals}
          </div>
          <div className="text-sm text-gray-600">This Month</div>
          <div className="text-xs text-teal-600 mt-1">New referrals</div>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Referral History
            </h3>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Restaurant
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Owner
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Contact
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Date Invited
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Date Joined
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Earnings
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {referralHistory.map((referral) => (
                <tr
                  key={referral.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">
                    {referral.restaurantName}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {referral.ownerName}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    <div>{referral.email}</div>
                    {referral.phone && (
                      <div className="text-xs text-gray-500">
                        {referral.phone}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {referral.dateInvited}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {referral.dateJoined || "-"}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        referral.status
                      )}`}
                    >
                      {referral.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">
                    {referral.earnings > 0 ? `${referral.earnings}` : "-"}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      {referral.status === "pending" && (
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          Resend
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-700 text-sm">
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {referralHistory.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No referrals yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start inviting other restaurant owners to earn rewards!
            </p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send First Invite
            </button>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invite Restaurant Owner</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  value={inviteForm.restaurantName}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      restaurantName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Mario's Pizzeria"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name *
                </label>
                <input
                  type="text"
                  value={inviteForm.ownerName}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      ownerName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Mario Rossi"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="owner@restaurant.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={inviteForm.phone}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message
                </label>
                <textarea
                  value={inviteForm.message}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Add a personal message to your invitation..."
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  💰 You'll earn $50 when they successfully sign up and complete
                  their first month on the platform.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* How It Works Modal */}
      {showReferralDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">How Referrals Work</h3>
              <button
                onClick={() => setShowReferralDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Share Your Code</h4>
                  <p className="text-sm text-gray-600">
                    Send your referral code to restaurant owners you know
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">They Sign Up</h4>
                  <p className="text-sm text-gray-600">
                    When they register using your code, you're credited for the
                    referral
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">You Earn Money</h4>
                  <p className="text-sm text-gray-600">
                    Get $50 after they complete their first month successfully
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">💡 Pro Tips</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Personal recommendations work best</li>
                <li>• Explain the platform benefits</li>
                <li>• Follow up on pending invites</li>
                <li>• Help them get started</li>
              </ul>
            </div>

            <button
              onClick={() => setShowReferralDetails(false)}
              className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
