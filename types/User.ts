import { Types } from "mongoose";

interface IAttemptedQuestion {
  question: Types.ObjectId;
  answered: number;
}
import { SubscriptionPlan } from "@/enums";

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  userId: string;
  subscription: {
    plan: SubscriptionPlan;
    expiresOn?: Date | null;
  };
  likes: Types.ObjectId[];
  image?: string;
  joinedSeries?: Types.ObjectId;
  profileLevel: number;
  questionsAttempted: IAttemptedQuestion[];
  correctAnsStreak?: number;
  createdAt: Date;
  updatedAt: Date;
}