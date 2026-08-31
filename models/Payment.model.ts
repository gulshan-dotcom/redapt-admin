import { Schema, model, models } from "mongoose";
import { IPayment } from "@/types/Payment";

const PaymentSchema = new Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: Number,
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    forPlan: {
      type: Number,
      required: true,
    },
    byUser: {
      type: Schema.Types.ObjectId, ref: "User", required: true
    }
  },
  {
    timestamps: true,
    collection: "payments",
  }
);

export const Payment =
  models.Payment || model<IPayment>("Payment", PaymentSchema);