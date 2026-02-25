import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { tag } = await request.json();
  if (!tag) return NextResponse.json({ error: 'tag required' }, { status: 400 });
  revalidateTag(tag);
  return NextResponse.json({ revalidated: true });
}
