import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/models/user';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ _id: existing._id, email: existing.email }, { status: 200 });
    }

    // Create a public user with a random password (hashed)
    const randomPwd = Math.random().toString(36).slice(2, 10);
    const pwdHash = await hashPassword(randomPwd);

    const user = await createUser({ email, passwordHash: pwdHash, role: 'public' });

    return NextResponse.json({ _id: user._id, email: user.email }, { status: 201 });
  } catch (err) {
    console.error('/api/public/users POST error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
