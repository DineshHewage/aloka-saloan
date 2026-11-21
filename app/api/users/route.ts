import { NextRequest, NextResponse } from "next/server";
import createUserSchema from "@/dto/userRegistrationRequest";
import prisma from "@/lib/prisma";

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
  try {
    //check the data and save the outcome in result.
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

    await prisma.user.create({ data: result.data });

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
