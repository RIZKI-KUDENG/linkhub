import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    username?: string | null;
    bio?: string | null;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      username?: string | null;
      bio?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string | null;
    bio?: string | null;
  }
}
