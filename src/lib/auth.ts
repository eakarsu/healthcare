import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AzureADProvider from 'next-auth/providers/azure-ad'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { createAuditLog } from './audit'

// Demo practice ID - new users will be added to this practice to see demo data
const DEMO_PRACTICE_ID = 'practice-1'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
      practiceId: string
      providerId?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    practiceId: string
    providerId?: string
    firstName: string
    lastName: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      tenantId: process.env.AZURE_AD_TENANT_ID || 'common',
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { provider: true },
        })

        if (!user) {
          throw new Error('Invalid credentials')
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error('Account is locked. Please try again later.')
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error('Account is disabled')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          // Increment failed login attempts
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLogins: user.failedLogins + 1,
              lockedUntil: user.failedLogins >= 4
                ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
                : null,
            },
          })
          throw new Error('Invalid credentials')
        }

        // Reset failed logins on successful login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLogins: 0,
            lockedUntil: null,
            lastLogin: new Date(),
            lastActivity: new Date(),
          },
        })

        // Create audit log for login
        await createAuditLog({
          userId: user.id,
          action: 'LOGIN',
          entity: 'User',
          entityId: user.id,
        })

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          practiceId: user.practiceId,
          providerId: user.provider?.id,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth sign-ins (Google, Microsoft)
      if (account?.provider === 'google' || account?.provider === 'azure-ad') {
        try {
          const email = user.email
          if (!email) return false

          // Check if user exists
          let dbUser = await prisma.user.findUnique({
            where: { email },
          })

          if (!dbUser) {
            // Create new user in demo practice
            const nameParts = (user.name || 'New User').split(' ')
            const firstName = nameParts[0] || 'New'
            const lastName = nameParts.slice(1).join(' ') || 'User'

            dbUser = await prisma.user.create({
              data: {
                email,
                firstName,
                lastName,
                password: '', // OAuth users don't have passwords
                role: 'RECEPTIONIST',
                practiceId: DEMO_PRACTICE_ID,
                isActive: true,
              },
            })

            await createAuditLog({
              userId: dbUser.id,
              action: 'USER_CREATED',
              entity: 'User',
              entityId: dbUser.id,
              details: { provider: account.provider },
            })
          }

          // Update last login
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { lastLogin: new Date(), lastActivity: new Date() },
          })

          await createAuditLog({
            userId: dbUser.id,
            action: 'LOGIN',
            entity: 'User',
            entityId: dbUser.id,
            details: { provider: account.provider },
          })

          return true
        } catch (error) {
          console.error('OAuth sign-in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // For OAuth logins, fetch user from database
      if (account?.provider === 'google' || account?.provider === 'azure-ad') {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email || '' },
          include: { provider: true },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.practiceId = dbUser.practiceId
          token.providerId = dbUser.provider?.id
          token.firstName = dbUser.firstName
          token.lastName = dbUser.lastName
        }
      } else if (user) {
        const u = user as unknown as { id: string; role: string; practiceId: string; providerId?: string; firstName: string; lastName: string }
        token.id = u.id
        token.role = u.role
        token.practiceId = u.practiceId
        token.providerId = u.providerId
        token.firstName = u.firstName
        token.lastName = u.lastName
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.practiceId = token.practiceId
        session.user.providerId = token.providerId
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes - HIPAA compliant
  },
  jwt: {
    maxAge: 15 * 60, // 15 minutes
  },
}

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth()
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Forbidden')
  }
  return session
}

// Update last activity timestamp
export async function updateLastActivity(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastActivity: new Date() },
    })
  } catch (error) {
    console.error('Failed to update last activity:', error)
  }
}
