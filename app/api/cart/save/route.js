import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/libs/mongoConnect";

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, restaurant, cartId, userId } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid cart items" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("food-delivery");
    const cartsCollection = db.collection("carts");

    const cartData = {
      items,
      restaurant,
      userId: userId || null,
      sessionId: request.headers.get("x-session-id") || null,
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    let result;
    if (cartId) {
      // Update existing cart
      result = await cartsCollection.updateOne(
        { _id: new ObjectId(cartId) },
        {
          $set: cartData,
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );

      return NextResponse.json({
        success: true,
        cartId: cartId,
        message: "Cart updated successfully",
      });
    } else {
      // Create new cart
      cartData.createdAt = new Date();
      result = await cartsCollection.insertOne(cartData);

      return NextResponse.json({
        success: true,
        cartId: result.insertedId.toString(),
        message: "Cart created successfully",
      });
    }
  } catch (error) {
    console.error("Error saving cart:", error);
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
  }
}
