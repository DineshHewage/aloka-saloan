import { NextRequest, NextResponse } from "next/server";

export function GET() {
  console.log("Liyanna.................Get request received");
  return NextResponse.json({
    message: "GET request received successfully",
  });
}

export async function POST(req: NextRequest) {
  console.log("Nirosha.................POST request received");

  const body = await req.json();

  console.log(body);

  return NextResponse.json({
    message: "POST request received successfully",
  });
}
