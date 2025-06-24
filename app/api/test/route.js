import { NextResponse } from "next/server";

export async function GET() {
  console.log("Test API called");
  return NextResponse.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    router: "App Router",
  });
}

export async function POST() {
  return NextResponse.json({
    message: "POST method working!",
    timestamp: new Date().toISOString(),
  });
}

