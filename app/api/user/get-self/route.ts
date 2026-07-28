import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import { User } from "@/models/User.model";
import "@/models/Chapter.model";

export async function GET(req: NextRequest) {
  try {
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Unauthorized (no user email)" },
        { status: 401 }
      );
    }

    await connectMongo();

    const user = await User.findOne({ email: userEmail })
      .populate("likes")
      .select("-__v");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("GET USER ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
