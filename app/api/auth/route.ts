import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 1. Read the body
  // 2. Validate with Zod
  // 3. Find the user by email (prisma.user.findUnique)
  // 4. Compare typed password with the stored hash: compare(password, user.password)
  // 5. Check user.status is ACTIVE
  // 6. Return success (later: a token)

  let body;

  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Invalid request. Please check the email and password and send the request",
      },
      { status: 400 },
    );
  }
}
