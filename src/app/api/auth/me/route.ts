import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRuntimeToken } from '@/lib/runtime-api-auth'

export async function GET(request: NextRequest) {
  const token = verifyRuntimeToken(request.headers.get('authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: token.sub } })
  if (!user?.isActive) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role, practiceId: user.practiceId } })
}
