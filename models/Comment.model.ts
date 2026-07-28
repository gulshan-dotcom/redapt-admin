import { IComment } from "@/types/Comment";
import { Schema, model, models } from "mongoose";

const CommentSchema = new Schema<IComment>(
  {
    by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export const Comment =
  models.Comment || model<IComment>("Comment", CommentSchema);
