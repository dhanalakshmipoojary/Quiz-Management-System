import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: (decoded as any).sub,
        email: (decoded as any).email,
        role: (decoded as any).role,
      },
    });
  } catch (err) {
    console.error('/api/auth/me error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
