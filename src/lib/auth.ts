import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions : NextAuthOptions = {
    adapter: PrismaAdapter(prisma),

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    session: {
        strategy: "jwt"
    },
   callbacks: {
    async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    async session({ session, token }) {
      session.user.id = token.sub!;
      return session;
    },
  }
}
