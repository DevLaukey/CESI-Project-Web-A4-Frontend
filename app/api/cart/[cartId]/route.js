import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/libs/mongoConnect";

export async function GET(request, { params }) {
  try {
    const { cartId } = params;

    if (!cartId || !ObjectId.isValid(cartId)) {
      return NextResponse.json({ error: "Invalid cart ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("food-delivery");
    const cartsCollection = db.collection("carts");

    const cart = await cartsCollection.findOne({
      _id: new ObjectId(cartId),
      expiresAt: { $gt: new Date() }, // Not expired
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      cartId: cart._id.toString(),
      items: cart.items,
      restaurant: cart.restaurant,
      updatedAt: cart.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { cartId } = params;

    if (!cartId || !ObjectId.isValid(cartId)) {
      return NextResponse.json({ error: "Invalid cart ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("food-delivery");
    const cartsCollection = db.collection("carts");

    const result = await cartsCollection.deleteOne({
      _id: new ObjectId(cartId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Cart deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting cart:", error);
    return NextResponse.json(
      { error: "Failed to delete cart" },
      { status: 500 }
    );
  }
}
