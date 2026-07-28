import { NextResponse } from "next/server";
import { User } from "@/models/User.model";
import { Question } from "@/models/Question.model";
import { STREAK_THRESHOLD, MAX_LEVEL } from "@/lib/levels";
import connectMongo from "@/lib/connectMongo";

export async function POST(req: Request) {
  try {
const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Unauthorized (no user email)" },
        { status: 401 }
      );
    }

    await connectMongo();

    const body = await req.json();
    const { questionId, Answer, iscorrect} = body;
    

    if (!questionId || Answer === undefined || iscorrect === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const questionExists = await Question.findById(questionId);
    if (!questionExists) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let currentStreak = user.correctAnsStreak || 0;
    let currentLevel = user.profileLevel || 1;
    let levelUpgraded = false;

    if (iscorrect) {
      currentStreak += 1;

      if (currentStreak >= STREAK_THRESHOLD && currentLevel < MAX_LEVEL) {
        currentLevel += 1;
        currentStreak = 0; // reset streak for the next level progress
        levelUpgraded = true;
      }
    } else {
      currentStreak = 0;
    }

    user.correctAnsStreak = currentStreak;
    user.profileLevel = currentLevel;

    user.questionsAttempted.push({
      question: questionId,
      answered: Answer,
    });

    await user.save();

    return NextResponse.json({
      success: true,
      levelUpgraded,
    });
  } catch (err) {
    console.error("Get Chapter Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
