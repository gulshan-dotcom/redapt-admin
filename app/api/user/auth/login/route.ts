import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectMongo from "@/lib/connectMongo";
import { User } from "@/models/User.model";

// interface GoogleUser {
//   email: string;
//   name: string;
//   picture: string;
//   sub?: string;
// }

interface tempUserInfoBody {
  email: string;
  name: string;
  picture: string;
}

export async function POST(req: Request) {
  try {
    // const { googleAccessToken } = await req.json();

    // if (!googleAccessToken) {
    //   return NextResponse.json(
    //     { success: false, message: "Missing googleAccessToken" },
    //     { status: 400 }
    //   );
    // }

    // const userInfoRes = await fetch(
    //   "https://www.googleapis.com/oauth2/v3/userinfo",
    //   {
    //     headers: {
    //       Authorization: `Bearer ${googleAccessToken}`,
    //     },
    //   }
    // );

    // if (!userInfoRes.ok) {
    //   return NextResponse.json(
    //     { success: false, message: "Failed to fetch Google user info" },
    //     { status: 401 }
    //   );
    // }

    // const googleUser: GoogleUser = await userInfoRes.json();
    // const { email, name, picture } = googleUser;
    
    const body = (await req.json()) as tempUserInfoBody;

    const { email, name, picture } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email not found from Google" },
        { status: 400 }
      );
    }

    await connectMongo();

    let user = await User.findOne({ email });

    if (!user) {
      const baseId = email.split("@")[0];
      const cleaned = baseId.replace(/[^a-zA-Z]/g, "");
      const userId = cleaned || `user${Date.now()}`;

      user = await User.create({
        email,
        name,
        userId,
        image: picture,
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        userId: user.userId,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      success: true,
      token,
      expiry: Date.now() + 1000 * 60 * 60 * 24 * 30,
      user,
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
