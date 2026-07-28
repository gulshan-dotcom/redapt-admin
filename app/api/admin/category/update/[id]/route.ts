import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import { Category } from "@/models/Category.model";
import { CreateCategoryBody } from "@/types/Body";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();

    const body = (await req.json()) as CreateCategoryBody;
    const { name, image } = body;

    if (!name && !image) {
      return NextResponse.json(
        { success: false, message: "Nothing to update" },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndUpdate(
      params.id,
      { $set: { name, image } },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true,category });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "Category update failed" },
      { status: 500 }
    );
  }
}
