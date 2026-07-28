import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { SubscriptionPlan } from "@/enums";
import connectMongo from "@/lib/connectMongo";
import { CreateSeriesBody } from "@/types/Body";
import { Series } from "@/models/Series.model";

export async function POST(req: NextRequest) {
  try {
    await connectMongo();

    const body = (await req.json()) as CreateSeriesBody;
    const { title, description, cover, category, for: plan } = body;

    // required fields
    if (!title || !description || !cover || !category) {
      return NextResponse.json(
        {
          success: false,
          message: "title, description, cover and category are required",
        },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(category)) {
      return NextResponse.json(
        { success: false, message: "Invalid category id" },
        { status: 400 }
      );
    }

    const series = await Series.create({
      title,
      description,
      cover,
      category,
      for: plan ?? SubscriptionPlan.FREE,
      chapters: [],
      joinedBy: [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Series created successfully",
        data: series,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Series Error:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
