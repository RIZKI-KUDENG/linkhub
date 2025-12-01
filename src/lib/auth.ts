import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { Adapter, AdapterUser } from "next-auth/adapters"; // Import Adapter type

// 1. Definisikan adapter secara terpisah agar bisa di-extend
const prismaAdapter = PrismaAdapter(prisma);

export const authOptions: NextAuthOptions = {
  // 2. Override fungsi createUser
  adapter: {
    ...prismaAdapter,
    createUser: async (data: AdapterUser) => {
      // Logic generate username dipindah ke sini
      const base = data.name?.toLowerCase().replace(/\s+/g, "") ?? "user";
      let username = base;
      let counter = 1;

      // Cek ketersediaan username
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${base}${counter++}`;
      }

      // Tambahkan username ke data yang akan dibuat
      return prisma.user.create({
        data: {
          ...data,
          username,
          theme: data.theme ?? "default",
        },
      });
    },
  } as Adapter,

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
    // 3. HAPUS callback signIn karena logika sudah dipindah ke adapter
    // (Callback signIn dihapus atau biarkan default jika tidak ada logic lain)

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

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.username = token.username ?? null;
      session.user.bio = token.bio as string | null;
      session.user.theme = (token.theme as string) || "default";
      return session;
    },
  },
};