import { IThought } from "@/types/Thought";
import { Schema, model, models } from "mongoose";

const ThoughtSchema = new Schema<IThought>(
  {
    title: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Thought =
  models.Thought || model<IThought>("Thought", ThoughtSchema);

