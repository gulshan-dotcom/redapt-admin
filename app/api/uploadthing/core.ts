import { createUploadthing, type FileRouter } from "uploadthing/next";
import { User } from "@/models/User.model";
import connectMongo from "@/lib/connectMongo";
import { UploadThingError } from "uploadthing/server";
const f = createUploadthing();
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
  .middleware(async ({ req }) => {
      const userEmail = req.headers.get("x-user-email");

      if (!userEmail) {
        throw new UploadThingError("Unauthorized (no user email)");
      }

      return { userEmail };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("File uploaded successfully:", file.ufsUrl);
      await connectMongo();
      const user = await User.findOneAndUpdate(
        { email: metadata.userEmail },
        { $set: { image: file.ufsUrl } },
        { new: true },
      );

      console.log(user)
      
      return { avatarUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;