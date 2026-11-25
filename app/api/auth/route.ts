import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import authUserSchema from "@/dto/userAuthenticationRequest";
import { Result } from "pg";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { console } from "inspector";
import { Role } from "@/app/generated/prisma/enums";
import { SignJWT } from "jose";

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
    const selectedUser = await prisma.user.findUnique({ where: { email } });

    if (!selectedUser) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Compair the typed-password with the stord hash.
    const isPasswordValid = await compare(password, selectedUser.password);

    if (!isPasswordValid) {
      return NextResponse.json({
        message: "Invalid email or password",
      });
    }

    // check the account status
    if (selectedUser.status !== "ACTIVE") {
      return NextResponse.json(
        {
          message: "Your account is not activated. Please contact support team",
        },
        { status: 403 },
      );
    }

    // Create a new user object from the selected user(who tries to log in and has correct PW and email)
    // Here never use the password of the selected user.
    const tokenUserInfromation = {
      id: selectedUser.id,
      email: selectedUser.email,
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      role: selectedUser.role,
      image: selectedUser.image,
      permisions: selectedUser.permisions,
    };

    // Read the secret key from the .env file (only our server knows it)
    const signature = process.env.JOSE_JWT_SECRET;

    // jose needs the secret as bytes, not plain text, so we convert it
    const signatureEncoded = new TextEncoder().encode(signature);

    // Create the token (JWT)
    const token = await new SignJWT(tokenUserInfromation) // the user information goes inside the token
      .setProtectedHeader({ alg: "HS256" }) // the signing method (algorithm) we use
      .setExpirationTime("48h") // the token stops working after 48 hours
      .sign(signatureEncoded); // add the secret signature to finish the token

    // Build the response that goes back to Postman or the browser
    const response = NextResponse.json(
      { message: "You logged in successfully", token: token },
      { status: 200 },
    );

    // Save the token in a cookie, so the browser stores it
    response.cookies.set({
      name: "auth-token", // the name of the cookie
      value: token, // what is stored inside the cookie: our token
      httpOnly: true, // what is stored inside the cookie: our token
      secure: false, // false = works on http://localhost. Use true on a real https website
      sameSite: "lax", // other websites can't send this cookie in most cross-site requests
      maxAge: 60 * 60 * 24 * 2, // cookie lives for 2 days (60 sec x 60 min x 24 h x 2), in seconds
    });

    // Send the response (with the cookie attached) back to the client
    return response;
  } catch (error) {
    // Any unexpected error
    console.error("Error logging in:", error);
    return NextResponse.json({ message: "Error log in" }, { status: 500 });
  }
}
