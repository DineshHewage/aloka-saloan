import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const students = await prisma.student.findMany();

  return NextResponse.json({
    students: students,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json(); //read the data that the client sent.
  /**Waits until all the data has arrived.
   * Turns the text into a JavaScript object.
   * Saves it in the variable body. */

  //save the data in the database.
  await prisma.student.create({
    data: {
      name: body.name,
      age: body.age,
      email: body.email,
      city: body.city,
    },
  });
  /**Sends the student data to PostgreSQL.
   * Waits until the database says “saved”. */

  return NextResponse.json({
    message: "Student creation is successfull",
  });
}
