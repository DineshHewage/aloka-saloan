import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const students = await prisma.student.findMany();
    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // read the data that the client sent
    const body = await req.json();

    // validation
    if (!body.name || !body.age || !body.email || !body.city) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // save the data in the database
    await prisma.student.create({
      data: {
        name: body.name,
        age: body.age,
        email: body.email,
        city: body.city,
      },
    });

    return NextResponse.json({
      message: "Student creation is successful",
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}
