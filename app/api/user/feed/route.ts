import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectMongo";
import { Types } from "mongoose";
import { User } from "@/models/User.model";
import { Chapter } from "@/models/Chapter.model";
import "@/models/Category.model";
import "@/models/Series.model";
import { Series } from "@/models/Series.model";

export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    const email = req.headers.get("x-user-email");

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    let topCategories: Types.ObjectId[] = [];

    if (user.likes?.length) {
      const categoryAgg = await Chapter.aggregate([
        { $match: { _id: { $in: user.likes } } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 3 },
      ]);

      topCategories = categoryAgg.map((c) => c._id);
    }

    let personalizedChapters = topCategories.length
      ? await Chapter.find({
          category: { $in: topCategories },
        })
          .sort({ updatedAt: -1 })
          .limit(10)
          .populate("category")
          .lean()
      : [];

    if (personalizedChapters.length < 10) {
      const needed = 10 - personalizedChapters.length;

      const existingIds = personalizedChapters.map((ch) => ch._id);

      const topLikedChapters = await Chapter.aggregate([
        {
          $match: {
            _id: { $nin: existingIds },
          },
        },
        { $sort: { likes: -1, updatedAt: -1 } },
        { $limit: needed },
      ]);

      if (topLikedChapters.length) {
        const populatedTopLiked = await Chapter.populate(topLikedChapters, {
          path: "category",
        });

        personalizedChapters = [...personalizedChapters, ...populatedTopLiked];
      }
    }

    const trendingChapters = await Chapter.find({
      isTrending: true,
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("category")
      .lean();

    const series = await Series.find({}).lean();

    const available = await Chapter.find({for : user.subscription.plan}).sort({ updatedAt: -1 })
      .limit(10)

    return NextResponse.json({
      success: true,
      data: {
        personalized: personalizedChapters,
        trending: trendingChapters,
        series,
        available
      },
    });
  } catch (err) {
    console.error("Feed error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
