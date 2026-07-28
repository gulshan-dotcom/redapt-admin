// models/user.model.ts
import { Schema, model, models } from "mongoose";
import { SubscriptionPlan } from "@/enums";
import { IUser } from "@/types/User";

const numericSubscriptionPlans = Object.values(SubscriptionPlan).filter(
  (v): v is number => typeof v === "number"
);

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
    subscription: {
      plan: {
        type: Number,
        enum: numericSubscriptionPlans,
        default: SubscriptionPlan.FREE,
      },
      expiresOn: Date,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "Chapter" }],
    image: String,
    joinedSeries: { type: Schema.Types.ObjectId, ref: "Series" },
    profileLevel: { type: Number, default: 1 },
    questionsAttempted: [
      {
        question: { type: Schema.Types.ObjectId, ref: "Question" },
        answered: Number,
      },
    ],
    correctAnsStreak: { type: Number, default: 0 }, //you can use this to identify also update it's values in each api call
  },
  { timestamps: true }
);

export const User =
  models.User || model<IUser>("User", UserSchema);

