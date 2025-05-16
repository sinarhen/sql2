import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "./db/drizzle/schema";
import { eq } from "drizzle-orm";

import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next"
import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
  
  
declare module "next-auth" {
    interface Session {
      user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role: "admin" | "lecturer" | "student";
      }
    }
  
    interface User {
      id: string;
      name?: string | null;
      email?: string | null;
      role: "admin" | "lecturer" | "student";
    }
  }
  
  declare module "next-auth/jwt" {
    interface JWT {
      id: string;
      role: "admin" | "lecturer" | "student";
    }
  }
  
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email),
          });

          if (!user) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!passwordMatch) {
            return null;
          }

          console.log("LOGGED IN", user)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt(payload) {
      if (payload.session?.user) {
        payload.token.role = payload.session.user.role;
        payload.token.id = payload.session.user.id;
      }
      return payload.token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "lecturer" | "student";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
} 

export function auth(
    ...args:
      | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
      | [NextApiRequest, NextApiResponse]
      | []
  ) {
    return getServerSession(...args, authOptions)
  }
