import { NextResponse, NextRequest } from "next/server";
import { Admin } from "@/models/Admin.model";
import bcrypt from "bcryptjs";
import connectMongo from "@/lib/connectMongo";

interface CreateAdminBody {
  email: string;
  password: string;
  secret: string;
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "environment does not supported" },
      { status: 500 }
    );
  }

  try {
    const body: CreateAdminBody = await req.json();
    const { email, password, secret } = body;

    if (!email || !password || !secret) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: "you're not an admin" },
        { status: 400 }
      );
    }

    await connectMongo();
console.log({
      email,
      password,
    })
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Admin already exists" },
        { status: 409 }
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await Admin.create({
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
