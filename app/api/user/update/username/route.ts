import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User.model";
import connectMongo from "@/lib/connectMongo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const newUsername = body.newUsername

    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Unauthorized (no user email)" },
        { status: 401 },
      );
    }

    await connectMongo();

    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { name: newUsername } },
      { new: true },
    );

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
