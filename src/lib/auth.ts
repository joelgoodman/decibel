import { AuthKit } from '@workos-inc/authkit'
import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const authKit = new AuthKit(process.env.WORKOS_CLIENT_ID!, {
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  apiHostname: 'api.workos.com',
})

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  cookies().set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return token
}

export async function getSession(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value

  if (!token) return null

  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as { userId: string; role: string }
  } catch {
    return null
  }
}

export async function signIn(email: string) {
  try {
    const { user } = await authKit.createUser({
      email,
      emailVerified: true,
    })

    let dbUser = await prisma.user.findUnique({
      where: { email },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email,
          role: 'SUBSCRIBER',
        },
      })
    }

    const magicLink = await authKit.createMagicLink({
      email,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      expiresInMinutes: 30,
    })

    return { success: true, magicLink }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: 'Failed to create magic link' }
  }
}

export async function verifySession(token: string) {
  try {
    const { user } = await authKit.verifySession(token)

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    })

    if (!dbUser) {
      throw new Error('User not found')
    }

    return { success: true, user: dbUser }
  } catch (error) {
    console.error('Session verification error:', error)
    return { success: false, error: 'Invalid session' }
  }
}

export function hasRole(session: { role: string } | null, allowedRoles: string[]) {
  return session && allowedRoles.includes(session.role)
}