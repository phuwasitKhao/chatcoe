"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import Signin from "@public/Login.svg";
import logo from "@public/chatcoe.svg";
import Image from "next/image";
import { FaHome } from "react-icons/fa";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/chat");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/chat",
    });
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Left side */}
      <div className="w-1/2 flex items-center justify-end">
        <div className="text-center p-6">
          <Image
            src={Signin}
            width={600}
            height={600}
            alt="Login illustration"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="w-1/2 flex items-center justify-start">
        <div className="max-w-sm w-full px-8 py-10">
          <div className="text-4xl font-bold mb-6 flex items-center">
            Sign In
            <Image
              src={logo}
              alt="ChatCane Logo"
              width={24}
              height={24}
              className="ml-2"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#5A0157] hover:bg-[#442943] text-white py-2 px-4 rounded transition-all duration-300"
            >
              Log in
            </button>
          </form>

          <div className="flex items-center justify-between mt-4">
            <Link href="/" className="text-xl text-gray-500 hover:underline">
              <FaHome />
            </Link>
            <Link
              href="/register"
              className="text-sm text-[#1D1A43] hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
