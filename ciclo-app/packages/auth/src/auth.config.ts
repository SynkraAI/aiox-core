import type { NextAuthConfig } from 'next-auth'
import type { UserRole } from '@ciclo/database'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@ciclo/database'

/**
 * NextAuth.js v5 configuration for Ciclo das Estações.
 * Providers: Credentials (email/password) + Google OAuth.
 * Strategy: JWT with role in token.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          return null
        }

        if (!user.isActive || user.isDeleted) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async signIn({ user, account }) {
      // For OAuth (Google), check if the user account is active
      if (account?.provider !== 'credentials') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email ?? '' },
        })

        if (existingUser && (!existingUser.isActive || existingUser.isDeleted)) {
          return false
        }
      }

      return true
    },

    async jwt({ token, user, account, trigger }) {
      // On initial sign-in, add role and id to token
      if (user) {
        // For OAuth, look up the existing user or the one just created
        if (account?.provider !== 'credentials') {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email ?? '' },
          })
          if (dbUser) {
            token.role = dbUser.role
            token.id = dbUser.id
            token.isActive = dbUser.isActive
          }
        } else {
          token.role = (user as { role: UserRole }).role
          token.id = user.id
          token.isActive = true
        }
      }

      // On session update, refresh role from DB
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.isActive = dbUser.isActive
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },

  events: {
    async createUser({ user }) {
      // When a Google user is created via OAuth, they get USER role by default
      // The Prisma schema default handles this automatically
      // Log for audit trail
      console.log(`[AUTH] New user created: ${user.email} with role USER`)
    },
  },
}
