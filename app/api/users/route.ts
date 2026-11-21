import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 1. Read the body (bad JSON = client mistake)
  let body;
  try {
    // Read the request body and convert the JSON text into a JavaScript object
    body = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // 2. validate, save and handle database errors.
  try {} catch (error) {}
}
