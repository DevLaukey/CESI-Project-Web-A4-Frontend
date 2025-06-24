import { connectToDatabase } from "@/libs/mongoConnect";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {

  console.log("Payment History API called", req.method, req.headers.authorization);
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Verify JWT token
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { db } = await connectToDatabase();

    const payments = await db
      .collection("payments")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.status(200).json({ payments });
  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({
      error: "Failed to fetch payment history",
      details: error.message,
    });
  }
}
