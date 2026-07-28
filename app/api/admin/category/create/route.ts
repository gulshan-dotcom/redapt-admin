import { NextRequest, NextResponse } from "next/server";
import { CreateCategoryBody } from "@/types/Body";
import { Category } from "@/models/Category.model";
import connectMongo from "@/lib/connectMongo";

export async function POST(req: NextRequest) {
  try {
    await connectMongo();

    const body = (await req.json()) as CreateCategoryBody;
    const { name, image } = body;

    if (!name || !image) {
      return NextResponse.json(
        { success: false, message: "Name and image are required" },
        { status: 400 }
      );
    }

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 409 }
      );
    }

    const category = await Category.create({
      name,
      image,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Category Error:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
