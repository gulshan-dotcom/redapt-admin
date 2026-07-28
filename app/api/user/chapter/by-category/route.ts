import { NextResponse } from "next/server";
import { Types } from "mongoose";
import connectMongo from "@/lib/connectMongo";
import { Chapter } from "@/models/Chapter.model";

interface Params {
  params: {
    categoryId: string;
  };
}

export async function GET(_: Request, { params }: Params) {
  try {
    await connectMongo();

    const { categoryId } = params;

    if (!Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { success: false, message: "Invalid category id" },
        { status: 400 }
      );
    }

    const chapters = await Chapter.find({
      category: categoryId,
    })
      .populate("category")
      .populate("series")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        count: chapters.length,
        chapters,
      },
    });
  } catch (err) {
    console.error("Get Chapters By Category Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
