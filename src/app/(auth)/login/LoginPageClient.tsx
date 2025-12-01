"use client";

import { motion } from "framer-motion";
import LoginButton from "./LoginButton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";


export default function LoginPageClient() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#F5D547] blur-[160px] opacity-20 rounded-full -top-32 -left-20"></div>
      <div className="absolute w-[400px] h-[400px] bg-indigo-600 blur-[180px] opacity-[0.12] rounded-full bottom-0 right-0"></div>

      {/* Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[20px_20px] opacity-20"></div>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-10 bg-white/6 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl"
      >
        <Link href='/' className="hover:bg-white/10 rounded-full transition text-white/70 hover:text-white">
        <ArrowLeft size={20} />
        </Link>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-center space-y-2 mb-6"
        >
          <h1 className="text-3xl font-bold text-white">Selamat Datang</h1>
          <p className="text-white/60 text-sm">
            Kelola semua link kamu dalam satu halaman estetik.
          </p>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20   rounded-full  flex items-center justify-center">
            <span className="text-4xl"><Image
            src='/logo.jpg'
            width={150}
            height={150}
            alt="Logo"
            className=" rounded-full"
            /></span>
          </div>
        </motion.div>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="flex justify-center"
        >
          <LoginButton />
        </motion.div>
      </motion.div>
    </div>
  );
}
