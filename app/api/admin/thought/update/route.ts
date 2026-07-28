import { NextResponse } from "next/server";
import { Thought } from "@/models/Thought.model";
import connectMongo from "@/lib/connectMongo";
import { IThought } from "@/types/Thought";

interface ThoughtBody {
  title: string;
  desc: string;
}

export async function POST(req: Request) {
    
  try {
    await connectMongo();

    const body = (await req.json()) as ThoughtBody;

    const { title, desc } = body;

    // Basic validation
    if (!title || desc === undefined) {
      return NextResponse.json(
        { success: false, message: "title and desc are required" },
        { status: 400 }
      );
    }

    const thought : IThought[] = await Thought.find({})

    const newThought = await Thought.findByIdAndUpdate(thought[0]._id, {title, desc})

    return NextResponse.json({
      success: true,
      data: newThought,
    });
  } catch (err) {
    console.error("Create Question Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
