import { NextRequest, NextResponse } from "next/server";
import { utapi } from "@/app/api/uploadthing/core";
import { User } from "@/models/User.model";
import connectMongo from "@/lib/connectMongo";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploaded = await utapi.uploadFiles(file);

    if (uploaded.error) {
      return NextResponse.json(
        { error: uploaded.error.message },
        { status: 500 },
      );
    }

    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Unauthorized (no user email)" },
        { status: 401 },
      );
    }

    await connectMongo();

    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { image: uploaded.data?.ufsUrl } },
      { new: true },
    );

    return NextResponse.json({
      success: true,
      url: uploaded.data?.ufsUrl,
      user,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
