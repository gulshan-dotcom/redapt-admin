import { Types } from "mongoose";

export interface IComment {
  _id: Types.ObjectId;
  by:  Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}