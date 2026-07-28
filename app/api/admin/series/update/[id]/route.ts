import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import { Series } from "@/models/Series.model";
import { ISeries } from "@/types/Series";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    const body = await req.json();

    const update: Partial<ISeries> = {};

    if (body.title) update.title = body.title;
    if (body.description) update.description = body.description;
    if (body.cover) update.cover = body.cover;
    if (body.for !== undefined) update.for = body.for;
    if (body.category !== undefined) update.category = body.category;

    if (Array.isArray(body.chapters)) {
      // sort by order (serial no)
      update.chapters = body.chapters.sort(
        (
          a: {
            content: string; // Chapter or Question ID
            contentModel: "Chapter" | "Question";
            order: number;
          },
          b: {
            content: string; // Chapter or Question ID
            contentModel: "Chapter" | "Question";
            order: number;
          }
        ) => a.order - b.order
      );
    }

    const series = await Series.findByIdAndUpdate(
      params.id,
      { $set: update },
      { new: true }
    );

    if (!series) {
      return NextResponse.json(
        { success: false, message: "Series not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, series });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Series update failed" },
      { status: 500 }
    );
  }
}
