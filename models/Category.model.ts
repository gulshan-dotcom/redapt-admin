import { ICategory } from "@/types/Category";
import { Schema, model, models } from "mongoose";

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export const Category =
  models.Category || model<ICategory>("Category", CategorySchema);

