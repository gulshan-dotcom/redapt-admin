import { NextResponse } from "next/server";
import { Types } from "mongoose";
import connectMongo from "@/lib/connectMongo";

import { Comment } from "@/models/Comment.model";
import { User } from "@/models/User.model";
import { AddCommentBody } from "@/types/Body";
import { Question } from "@/models/Question.model";

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

    const body = (await req.json()) as AddCommentBody;
    const { chapterId, text } = body;

    if (!chapterId || !text?.trim()) {
      return NextResponse.json(
        { success: false, message: "chapterId and text are required" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json(
        { success: false, message: "Invalid chapterId" },
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

    const question = await Question.findById(chapterId);
    if (!question) {
      return NextResponse.json(
        { success: false, message: "question not found" },
        { status: 404 }
      );
    }

    // 1️⃣ Create comment
    const comment = await Comment.create({
      by: user._id,
      text: text.trim(),
    });

    // 2️⃣ Push comment into chapter
    question.comments.push(comment._id);
    await question.save();

    return NextResponse.json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
