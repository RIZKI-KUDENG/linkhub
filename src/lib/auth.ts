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
    // Generate username
    async signIn({ user }) {
      if (!user) return true;
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username ?? null;
        token.bio = user.bio ?? null;
        token.theme = user.theme ?? "default";
      }
      if (trigger === "update" && session?.user) {
        return { ...token, ...session.user };
      }

      return token;
    },

    // SIMPAN username ke session
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.username = token.username ?? null;
      session.user.bio = token.bio as string | null;
      session.user.theme = (token.theme as string) || "default";
      return session;
    },
  },
};
