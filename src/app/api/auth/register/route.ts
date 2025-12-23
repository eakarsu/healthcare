import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Demo practice ID - new users will be added to this practice to see demo data
const DEMO_PRACTICE_ID = 'practice-1'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  practiceName: z.string().min(2),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Parse name into first and last name
    const nameParts = name.split(' ')
    const firstName = nameParts[0] || 'New'
    const lastName = nameParts.slice(1).join(' ') || 'User'

    // Create user in the demo practice so they can see demo data
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: 'RECEPTIONIST',
        practiceId: DEMO_PRACTICE_ID,
        isActive: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: { id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}` }
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
