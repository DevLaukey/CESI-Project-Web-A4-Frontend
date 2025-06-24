import { MongoClient } from "mongodb";

const uri = process.env.NEXT_PUBLIC_MONGO_URL;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.NEXT_PUBLIC_MONGO_URL) {
  console.warn("MongoDB URI not found. Database operations will be skipped.");
  // Create a mock client for development
  clientPromise = Promise.resolve({
    db: () => ({
      collection: () => ({
        insertOne: () => Promise.resolve({ insertedId: "mock-id" }),
        updateOne: () => Promise.resolve({ modifiedCount: 1 }),
        find: () => ({
          sort: () => ({
            limit: () => ({
              toArray: () => Promise.resolve([]),
            }),
          }),
        }),
      }),
    }),
  });
} else {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db("food_delivery_payments");
    return { client, db };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
