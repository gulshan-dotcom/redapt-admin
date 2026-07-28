import { NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import { User } from "@/models/User.model";
import { Types } from "mongoose";
import { Series } from "@/models/Series.model";

export async function POST(req: Request) {
  try {
    await connectMongo();

    const userEmail = req.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await req.json()) as {
      seriesId: string;
    };

    if (!body.seriesId || !Types.ObjectId.isValid(body.seriesId)) {
      return NextResponse.json(
        { success: false, message: "Valid SeriesID is required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const seriesId = new Types.ObjectId(body.seriesId);

    await Series.updateOne(
      { _id: seriesId },
      { $addToSet: { joinedBy: user._id } },
    );

    user.joinedSeries = seriesId;
    await user.save();
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("LIKE CHAPTER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
