import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const res = NextResponse.json({ message: 'Logged out' });
  res.cookies.delete('token');
  return res;
}
