// utils/adminAuth.ts
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function verifyAdminToken(token: string | undefined) {
  if (!token) {
    return NextResponse.json({ message: "Unauthorized while verifying admin token" }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const payload = await jwtVerify(token, secret);

    return payload.payload;
  } catch (err) {
    console.log("Token verification error:", err);
    return NextResponse.json({ message: "Invalid token " }, { status: 401 });
  }
}
