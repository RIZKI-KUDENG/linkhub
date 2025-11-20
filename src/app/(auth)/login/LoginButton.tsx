"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function LoginButton(){
    const [loading, setIsloading] = useState(false)
    const handleLogin = async () => {
        setIsloading(true)
        await signIn("google", { callbackUrl: "/dashboard" })
    }

    return (
        <Button onClick={handleLogin} disabled={loading} size={"lg"}>
            {loading ? "memproses..." : "Login Dengan Google"}
        </Button>
    )
}