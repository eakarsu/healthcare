import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { issueRuntimeToken } from '@/lib/runtime-api-auth'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user?.isActive || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  return NextResponse.json({
    token: issueRuntimeToken(user.id),
    user: { id: user.id, email: user.email, role: user.role, practiceId: user.practiceId },
  })
}
