import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { UserJWTPayload } from "@/types/jwt";

export async function verifyJWT(token: string): Promise<UserJWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify<UserJWTPayload>(token, secret);
    if (!payload.userId || !payload.email) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
    !pathname.startsWith("/api/admin/auth") &&
    !pathname.startsWith("/admin/login")
  ) {
    console.log("Admin middleware triggered for path:", pathname);
    const token = request.cookies.get("adminToken")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const adminPayload = await verifyJWT(token);

    if (!adminPayload) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // User

  if (
    pathname.startsWith("/api/user") &&
    !pathname.startsWith("/api/user/auth/login") &&
    !pathname.startsWith("/api/user/payment/confirm")
  ) {
    let userEmail = "";

    // 1. JWT check
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = await verifyJWT(token);
      if (payload) {
        userEmail = payload.email;
      }
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-email", userEmail);
    const internalReqsecret = request.headers.get("x-internal-secret");
    if (internalReqsecret === process.env.INTERNAL_API_SECRET) {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // 3. Final decision
    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Unauthorized by middleWare" },
        { status: 401 }
      );
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/user/:path*",
    "/api/user/:path*",
  ],
};
