import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongo from "@/lib/connectMongo";
import { User } from "@/models/User.model";
import { Comment } from "@/models/Comment.model";
import { Chapter } from "@/models/Chapter.model";

export async function POST(req: NextRequest) {
  await connectMongo();

  const userEmail = req.headers.get("x-user-email");
  if (!userEmail) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { commentId, chapterId } = await req.json();

  if (!commentId || !chapterId) {
    return NextResponse.json(
      { success: false, message: "commentId and chapterId are required" },
      { status: 400 }
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(commentId) ||
    !mongoose.Types.ObjectId.isValid(chapterId)
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid IDs" },
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

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return NextResponse.json(
      { success: false, message: "Comment not found" },
      { status: 404 }
    );
  }

  // 🔐 Ownership check
  if (comment.by.toString() !== user._id.toString()) {
    return NextResponse.json(
      { success: false, message: "You can only delete your own comment" },
      { status: 403 }
    );
  }

  // 🧹 Remove comment reference from chapter
  await Chapter.findByIdAndUpdate(chapterId, {
    $pull: { comments: comment._id },
  });

  // 🗑️ Delete comment
  await Comment.findByIdAndDelete(comment._id);

  return NextResponse.json({
    success: true,
    message: "Comment removed successfully",
  });
}
