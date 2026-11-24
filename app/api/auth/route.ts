import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import authUserSchema from "@/dto/userAuthenticationRequest";
import { Result } from "pg";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(req: NextRequest) {
  // 1. Read the body
  // 2. Validate with Zod
  // 3. Find the user by email (prisma.user.findUnique)
  // 4. Compare typed password with the stored hash: compare(password, user.password)
  // 5. Check user.status is ACTIVE
  // 6. Return success (later: a token)

  let body;

  // Read the body (bad JSON = client mistake)
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

  try {
    // Validate with zod
    const zodValidatedResult = authUserSchema.safeParse(body);

    if (!zodValidatedResult.success) {
      return NextResponse.json(
        {
          message: zodValidatedResult.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const { email, password } = zodValidatedResult.data;

    // Find the user by email.
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Compair the typed-password with the stord hash.
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    // Any unexpected error
    console.error("Error logging in:", error);
    return NextResponse.json({ message: "Error log in" }, { status: 500 });
  }
}
