import { NextResponse } from "next/server";
import { findUserByEmail } from "../../../../lib/models/user";
import { verifyPassword, signToken } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const user = await findUserByEmail(email.toLowerCase());
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ sub: user._id?.toString(), email: user.email, role: user.role });

    const res = NextResponse.json({ message: "ok" });
    // Set httpOnly cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });
    return res;
  } catch (err) {
    console.error("/api/auth/login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
