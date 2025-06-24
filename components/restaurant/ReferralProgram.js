"use client";
import { useState, useEffect } from "react";
import { referralAPI } from "@/libs/api"; // adjust path if needed

export default function ReferralProgram() {
  const [referralCode, setReferralCode] = useState("");
  const [codeCreatedAt, setCodeCreatedAt] = useState(null);
  const [referralHistory, setReferralHistory] = useState([]);
  const [referredByCode, setReferredByCode] = useState(null);

  const [loadingCode, setLoadingCode] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingReferredBy, setLoadingReferredBy] = useState(true);

  // Messages for code section
  const [codeMsg, setCodeMsg] = useState("");
  const [codeErr, setCodeErr] = useState("");

  // Shareable link state
  const [signupLink, setSignupLink] = useState("");
  const [linkMsg, setLinkMsg] = useState("");

  // Use-code form state
  const [useInput, setUseInput] = useState("");
  const [useMsg, setUseMsg] = useState("");
  const [useErr, setUseErr] = useState("");

  // Fetch referral code, history, and who referred me
  useEffect(() => {
    const fetchAll = async () => {
      // 1) My referral code
      setLoadingCode(true);
      setCodeErr("");
      try {
        console.log("🔄 Fetch /api/referrals/my");
        const data = await referralAPI.getMyReferralCode();
        console.log("✅ getMyReferralCode:", data);
        setReferralCode(data.code || "");
        setCodeCreatedAt(data.createdAt || null);
      } catch (err) {
        const msg = err.message || "";
        console.warn("⚠ getMyReferralCode error:", msg);
        if (msg.includes("404") || msg.includes("No referral code")) {
          setReferralCode("");
          setCodeCreatedAt(null);
        } else {
          setCodeErr(msg);
        }
      } finally {
        setLoadingCode(false);
      }

      // 2) Who I referred
      setLoadingHistory(true);
      try {
        console.log("🔄 Fetch /api/referrals/referrals");
        const hist = await referralAPI.getPeopleIReferred();
        console.log("✅ getPeopleIReferred:", hist);
        const items = Array.isArray(hist.referred)
          ? hist.referred.map((item) => ({
              id: item.id,
              referredUuid: item.uuid,
              dateReferred: item.createdAt,
              status: item.status || "completed",
            }))
          : [];
        setReferralHistory(items);
      } catch (err) {
        console.error("❌ getPeopleIReferred error:", err.message || err);
        setReferralHistory([]);
      } finally {
        setLoadingHistory(false);
      }

      // 3) Who referred me
      setLoadingReferredBy(true);
      try {
        console.log("🔄 Fetch /api/referrals/referred-by");
        const used = await referralAPI.getwhoreferredMe();
        console.log("✅ getwhoreferredMe:", used);
        const code =
          used.code_used || used.referred_by || used.referrerCode || null;
        setReferredByCode(code);
      } catch (err) {
        const msg = err.message || "";
        console.warn("⚠ getwhoreferredMe error:", msg);
        setReferredByCode(null);
      } finally {
        setLoadingReferredBy(false);
      }
    };

    fetchAll();
  }, []);

  // Recompute shareable signup link whenever referralCode changes
  useEffect(() => {
    if (referralCode) {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      setSignupLink(`${origin}/signup?ref=${encodeURIComponent(referralCode)}`);
    } else {
      setSignupLink("");
    }
    setLinkMsg("");
  }, [referralCode]);

  // Generate or Reset Code
  const handleGenerateOrReset = async () => {
    setCodeMsg("");
    setCodeErr("");
    const confirmMsg = referralCode
      ? "Reset your referral code? This invalidates the old one."
      : "Generate your referral code?";
    if (!confirm(confirmMsg)) return;

    try {
      if (!referralCode) {
        console.log("🛠 POST /api/referrals/generate");
        const data = await referralAPI.generateReferralCode();
        console.log("✅ generateReferralCode:", data);
        setReferralCode(data.code || "");
        setCodeCreatedAt(data.createdAt || new Date().toISOString());
        setCodeMsg("Referral code generated!");
      } else {
        console.log("🛠 POST /api/referrals/reset");
        const data = await referralAPI.resetreferralCode();
        console.log("✅ resetReferralCode:", data);
        setReferralCode(data.new_code || "");
        setCodeCreatedAt(new Date().toISOString());
        setCodeMsg("Referral code reset!");
      }
    } catch (err) {
      console.error("❌ generate/reset error:", err.message || err);
      setCodeErr(err.message || "Failed to generate/reset code.");
    }
  };

  // Copy Code
  const handleCopyCode = async () => {
    setCodeMsg("");
    setCodeErr("");
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCodeMsg("Copied to clipboard!");
    } catch (err) {
      console.error("❌ copy error", err);
      setCodeErr("Failed to copy.");
    }
  };

  // Copy Signup Link
  const handleCopyLink = async () => {
    setLinkMsg("");
    if (!signupLink) return;
    try {
      await navigator.clipboard.writeText(signupLink);
      setLinkMsg("Link copied!");
    } catch (err) {
      console.error("❌ copy link error", err);
      setLinkMsg("Failed to copy link.");
    }
  };

  // Use someone else's referral code
  const handleUseSubmit = async (e) => {
    e.preventDefault();
    setUseMsg("");
    setUseErr("");
    if (!useInput) {
      setUseErr("Enter a referral code.");
      return;
    }
    try {
      console.log("🛠 POST /api/referrals/use", useInput);
      const res = await referralAPI.useReferralCode(useInput);
      console.log("✅ useReferralCode:", res);
      setReferredByCode(useInput);
      setUseMsg("Referral code used successfully!");
      setUseInput("");
    } catch (err) {
      console.error("❌ useReferralCode error:", err.message || err);
      setUseErr(err.message || "Failed to use code.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Referral Code Card (blue gradient) */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Your Referral Code</h3>
            {loadingCode ? (
              <p className="text-blue-100 text-sm">Loading...</p>
            ) : referralCode ? (
              <p className="text-blue-100 text-sm">
                Created:{" "}
                {codeCreatedAt
                  ? new Date(codeCreatedAt).toLocaleDateString()
                  : "Date not available"}
              </p>
            ) : (
              <p className="text-blue-100 text-sm">No code yet</p>
            )}
          </div>
          <div className="text-4xl">🎁</div>
        </div>

        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
          <code className="text-lg font-mono font-bold text-black">
            {loadingCode ? "..." : referralCode || "-"}
          </code>
          <div className="flex gap-2">
            {referralCode && (
              <button
                onClick={handleCopyCode}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
              >
                Copy
              </button>
            )}
            <button
              onClick={handleGenerateOrReset}
              className="bg-white text-purple-700 px-3 py-1 rounded text-sm font-medium hover:bg-purple-100"
            >
              {referralCode ? "Reset Code" : "Generate"}
            </button>
          </div>
        </div>
        {/* Code section messages */}
        {codeMsg && <p className="mt-2 text-green-200 text-sm">{codeMsg}</p>}
        {codeErr && <p className="mt-2 text-red-200 text-sm">{codeErr}</p>}

        <div className="mt-4 text-sm text-blue-100">
          💡 Tip: Share this code with friends to invite them.
        </div>

        {/* Shareable signup link */}
        {referralCode && signupLink && (
          <div className="mt-4">
            <p className="text-blue-100 text-sm mb-1">Shareable signup link:</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={signupLink}
                className="flex-grow bg-white bg-opacity-20 text-white font-mono px-2 py-1 rounded"
              />
              <button
                onClick={handleCopyLink}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
              >
                Copy Link
              </button>
            </div>
            {linkMsg && (
              <p className="mt-1 text-green-200 text-sm">{linkMsg}</p>
            )}
          </div>
        )}
      </div>

      {/* Use Referral Code Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-2">Use a Referral Code</h3>
        <form onSubmit={handleUseSubmit} className="flex gap-2">
          <input
            type="text"
            value={useInput}
            onChange={(e) => setUseInput(e.target.value)}
            placeholder="Enter referral code"
            disabled={!!referredByCode}
            className="flex-grow border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!!referredByCode}
            className={`px-4 py-2 rounded-lg text-white ${
              referredByCode
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Submit
          </button>
        </form>
        {useMsg && <p className="mt-2 text-green-600 text-sm">{useMsg}</p>}
        {useErr && <p className="mt-2 text-red-600 text-sm">{useErr}</p>}

        {!loadingReferredBy && referredByCode && (
          <p className="mt-2 text-gray-700 text-sm">
            You were referred by code:{" "}
            <span className="font-mono">{referredByCode}</span>
          </p>
        )}
      </div>

      {/* Referral History Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Who You Referred
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Referred UUID
                </th>
                {/* <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Date Referred
                </th> */}
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {!loadingHistory && referralHistory.length > 0 ? (
                referralHistory.map((ref) => (
                  <tr
                    key={ref.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {ref.referredUuid}
                    </td>
                    {/* <td className="py-4 px-6 text-sm text-gray-600">
                      {ref.dateReferred
                        ? new Date(ref.dateReferred).toLocaleDateString()
                        : "-"}
                    </td> */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {ref.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : !loadingHistory && referralHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-6 text-center text-sm text-gray-500"
                  >
                    No referrals yet.
                  </td>
                </tr>
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="py-6 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
