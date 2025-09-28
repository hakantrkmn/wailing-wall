import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const post = await prisma.post.update({
      where: { id },
      data: { clickCount: { increment: 1 } },
    })
    return NextResponse.json(post)
  } catch {
    return NextResponse.json({ error: 'Click increment failed' }, { status: 500 })
  }
}
