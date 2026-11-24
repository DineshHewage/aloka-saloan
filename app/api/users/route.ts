import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import createUserSchema from "@/dto/userRegistrationRequest";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // 1. Validate bad JSON requests -> client mistake
  let body;
  try {
    // Read the request body and convert the JSON text into a JavaScript object
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid requests" }, { status: 400 });
  }

  // 2. validate, save and handle database errors.
  try {
    //check the data(user information against the dto) and save the outcome in result.
    const result = createUserSchema.safeParse(body);
    //If everything is valid -- result = { success: true, data: { email: "...", firstName: "...", ... } }
    //If there is a validation error -- result = { success: false, error: ZodError }

    if (!result.success) {
      /*Zod never looks at the database and it does not check unique constraints like email*/
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 },
      );
    }

    /**
     * safeParse(body)  ← only checks the data's shape and format
      │
      ├─ invalid format → result.success = false → 400 (first block runs)
      │
      └─ valid format → result.success = true → skip the first block
                              │
                       prisma.user.create(...)  ← the database checks uniqueness
                              │
                  ├─ email already exists → throws error P2002 → catch block → 409
                  └─ email is new → saved → 201
     */

    // result.data holds the validated user details, so we pull each value out into its own variable.
    const { email, firstName, lastName, password } = result.data;

    // hash() converts the plain password (for example "123456789") into a scrambled string
    // (for example "$2b$12$KSvzR0u4dMffoc...") that cannot be turned back into the original.
    // 12 is the cost factor: a higher number is slower to compute, so it is harder for attackers to guess.
    // hash() is async, so we use await.
    const passwordHash = await hash(password, 12);

    // Save the user in PostgreSQL.
    // We store passwordHash instead of password, so the real password is never saved in the database.
    await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: passwordHash,
      },
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 },
    );
  } catch (error) {
    // know database error: duplicate email (unique constraint)
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 },
      );
    }
    // Anything else is unexpected: log it and return 500
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 },
    );
  }
}
