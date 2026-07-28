import { Schema, model, models } from "mongoose";
import { IAdmin } from "@/types/Admin";

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: "admin",
  }
);

export const Admin =
  models.Admin || model<IAdmin>("Admin", AdminSchema);