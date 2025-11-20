import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Generate username di sini
    async signIn({ user }) {
      if (!user) return true;

      // cek apakah user sudah punya username
      const existing = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (existing?.username) return true;

      // generate username unik
      const base = user.name?.toLowerCase().replace(/\s+/g, "") ?? "user";
      let username = base;
      let counter = 1;

      while (await prisma.user.findFirst({ where: { username } })) {
        username = `${base}${counter++}`;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { username },
      });

      return true;
    },

    // SIMPAN username & id ke JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username ?? null;
      }

      return token;
    },

    // SIMPAN username ke session
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.username = token.username ?? null;
      return session;
    },
  },
};
