import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json(
      { error: 'Posts yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { content, author } = await request.json()
    
    if (!content || !author) {
      return NextResponse.json(
        { error: 'Content ve author gerekli' },
        { status: 400 }
      )
    }
    
    const post = await prisma.post.create({
      data: {
        content,
        author
      }
    })
    
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Post create error:', error)
    return NextResponse.json(
      { error: 'Post oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
