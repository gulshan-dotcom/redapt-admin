import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import { Chapter } from "@/models/Chapter.model";
import { Series } from "@/models/Series.model";
import { IChapter } from "@/types/Chapter";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    const body = await req.json();

    const update: Partial<IChapter> = {};

    const fields: (keyof IChapter)[] = [
      "title",
      "details",
      "media",
      "type",
      "for",
      "isTrending",
      "cover",
      "author",
      "isDownloadable",
      "toc",
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        update[field] = body[field];
      }
    }

    // Special case: series provided but category missing
    if (body.series && !body.category) {
      const series = await Series.findById(body.series).select("category");
      if (!series) {
        return NextResponse.json(
          { success: false, message: "Invalid series" },
          { status: 400 }
        );
      }
      update.series = body.series;
      update.category = series.category;
    }

    if (body.category) {
      update.category = body.category;
    }

    const chapter = await Chapter.findByIdAndUpdate(
      params.id,
      { $set: update },
      { new: true }
    );

    if (!chapter) {
      return NextResponse.json(
        { success: false, message: "Chapter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, chapter });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Chapter update failed" },
      { status: 500 }
    );
  }
}
