import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    console.log("env value", process.env.DATABASE_URL)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const date = searchParams.get('date')
    
    const skip = (page - 1) * limit
    
    const where = date ? {
      createdAt: {
        gte: new Date(date + 'T00:00:00.000Z'),
        lt: new Date(new Date(date + 'T00:00:00.000Z').getTime() + 24 * 60 * 60 * 1000)
      }
    } : {}
    
    const posts = await prisma.post.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json(
      { error: 'Error loading posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { content, author } = await request.json()
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }
    
    const post = await prisma.post.create({
      data: {
        content,
        author: author || 'Anonymous'
      }
    })
    
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Post create error:', error)
    return NextResponse.json(
      { error: 'Error creating post' },
      { status: 500 }
    )
  }
}
