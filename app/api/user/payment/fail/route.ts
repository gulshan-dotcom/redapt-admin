import connectMongo from "@/lib/connectMongo";
import { Payment } from "@/models/Payment.model";
import { User } from "@/models/User.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const userEmail = req.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Unauthorized (no user email)" },
        { status: 401 },
      );
    }

    await connectMongo();
    const user = await User.findOne({ email: userEmail });

    const updatedPayment = await Payment.findOneAndUpdate(
      { byUser: user._id, status: "pending" },
      {
        status: "failed",
      },
      { new: true, sort: { createdAt: -1 } },
    );

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
    });
  } catch (err: Error) {
    console.error("Confirm Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Confirmation failed" },
      { status: 500 },
    );
  }
}
