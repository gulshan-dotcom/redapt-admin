import { NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import { User } from "@/models/User.model";
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

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    await Series.updateOne(
      { _id: user.joinedSeries },
      { $pull: { joinedBy: user._id } },
    );

    console.log("hardly tring to remove the series fro joined")

    user.joinedSeries = null;
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
