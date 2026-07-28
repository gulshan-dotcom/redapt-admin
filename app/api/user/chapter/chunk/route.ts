import { NextResponse } from "next/server";
import { Chapter } from "@/models/Chapter.model";
import connectMongo from "@/lib/connectMongo";

const LIMIT = 15;

export async function GET(req: Request) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const skip = (page - 1) * LIMIT;

    const [chapters, total] = await Promise.all([
      Chapter.find()
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(LIMIT)
        .lean(),

      Chapter.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        page,
        limit: LIMIT,
        hasMore: skip + chapters.length < total,
        chapters,
      },
    });
  } catch (err) {
    console.error("Latest Chapters Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
