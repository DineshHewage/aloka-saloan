import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const students = await prisma.student.findMany();

  return NextResponse.json({
    students: students,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  await prisma.student.create({
    data: {
      name: body.name,
      age: body.age,
      email: body.email,
      city: body.city,
    },
  });

  return NextResponse.json({
    message: "Student creation is successfull",
  });
}
