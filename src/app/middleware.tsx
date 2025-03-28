// src/middleware.ts

import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const url = request.nextUrl.clone();

  // กำหนดหน้าที่ไม่ต้องการป้องกัน
  const publicPaths = ["/login", "/register"];

  if (!token && !publicPaths.includes(url.pathname)) {
    // หากผู้ใช้ไม่ได้เข้าสู่ระบบและพยายามเข้าถึงหน้าที่ไม่ใช่หน้าสาธารณะ
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
