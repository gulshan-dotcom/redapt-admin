import connectMongo from "@/lib/connectMongo";
import { Payment } from "@/models/Payment.model";
import { User } from "@/models/User.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, paymentStatus, userId } = body;

    if (!paymentId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing paymentId or userId" },
        { status: 400 },
      );
    }

    await connectMongo();

    const updatedPayment = await Payment.findOneAndUpdate(
      { byUser: userId, status: "pending" },
      {
        paymentId: paymentId,
        status: paymentStatus === "paid" ? "completed" : "failed",
      },
      { new: true, sort: { createdAt: -1 } },
    );

    const expiresOn =
      updatedPayment.plan === 1
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : updatedPayment.plan === 2
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 40 * 24 * 60 * 60 * 1000);

    if (paymentStatus === "paid" && updatedPayment) {
      const user = await User.findById(userId);
      console.log("User found:", updatedPayment.forPlan);
      if (user) {
        user.subscription = {
          plan: updatedPayment.forPlan,
          expiresOn,
        };
        await user.save();
      }
    }

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
