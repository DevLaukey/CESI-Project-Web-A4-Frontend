import clientPromise from "@/libs/mongoConnect";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("food-delivery");
    const cartsCollection = db.collection("carts");

    // Delete expired carts
    const result = await cartsCollection.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: "Expired carts cleaned up successfully",
    });
  } catch (error) {
    console.error("Error cleaning up carts:", error);
    return NextResponse.json(
      { error: "Failed to cleanup carts" },
      { status: 500 }
    );
  }
}
