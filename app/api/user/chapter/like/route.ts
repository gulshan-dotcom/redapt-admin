import { NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import { User } from "@/models/User.model";
import { Chapter } from "@/models/Chapter.model";
import { Types } from "mongoose";

interface LikeChapterBody {
  chapterId: string;
}

export async function POST(req: Request) {
  try {
    await connectMongo();

    const userEmail = req.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as LikeChapterBody;

    if (!body.chapterId || !Types.ObjectId.isValid(body.chapterId)) {
      return NextResponse.json(
        { success: false, message: "Valid chapterId is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const chapterId = new Types.ObjectId(body.chapterId);

    const alreadyLiked = user.likes.some(
      (id: Types.ObjectId) => id.toString() === chapterId.toString()
    );

    if (alreadyLiked) {
      await User.updateOne(
        { _id: user._id },
        { $pull: { likes: chapterId } }
      );

      await Chapter.updateOne(
        { _id: chapterId },
        { $inc: { likes: -1 } }
      );

      return NextResponse.json({
        success: true,
        liked: false,
        message: "Chapter unliked",
      });
    } else {
      // LIKE
      await User.updateOne(
        { _id: user._id },
        { $addToSet: { likes: chapterId } }
      );

      await Chapter.updateOne(
        { _id: chapterId },
        { $inc: { likes: 1 } }
      );

      return NextResponse.json({
        success: true,
        liked: true,
        message: "Chapter liked",
      });
    }
  } catch (error) {
    console.error("LIKE CHAPTER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
