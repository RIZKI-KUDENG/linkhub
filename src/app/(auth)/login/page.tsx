"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button onClick={() => signIn("google")}>Login Dengan Google</Button>
    </div>
  );
}
