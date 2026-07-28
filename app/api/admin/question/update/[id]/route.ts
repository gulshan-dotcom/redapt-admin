import { NextResponse } from "next/server";
import { Types } from "mongoose";
import connectMongo from "@/lib/connectMongo";
import { Question } from "@/models/Question.model";

type UpdateQuestionBody = {
  question?: string;
  options?: string[];
  correct?: number;
  explanation?: string;
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();

    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid question id" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as UpdateQuestionBody;

    const questionDoc = await Question.findById(id);

    if (!questionDoc) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    // If options are updated, validate them
    if (body.options) {
      if (!Array.isArray(body.options) || body.options.length < 2) {
        return NextResponse.json(
          { success: false, message: "At least 2 options are required" },
          { status: 400 }
        );
      }

      // If correct exists, validate with new options
      if (
        body.correct !== undefined &&
        (body.correct < 0 || body.correct >= body.options.length)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Correct index must match options length",
          },
          { status: 400 }
        );
      }

      questionDoc.options = body.options;
    }

    // If correct updated without options
    if (
      body.correct !== undefined &&
      !body.options &&
      (body.correct < 0 || body.correct >= questionDoc.options.length)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Correct index must match existing options length",
        },
        { status: 400 }
      );
    }

    if (body.question !== undefined) {
      questionDoc.question = body.question;
    }

    if (body.correct !== undefined) {
      questionDoc.correct = body.correct;
    }

    if (body.explanation !== undefined) {
      questionDoc.explanation = body.explanation;
    }

    await questionDoc.save();

    return NextResponse.json({
      success: true,
      data: questionDoc,
    });
  } catch (err) {
    console.error("Update Question Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
