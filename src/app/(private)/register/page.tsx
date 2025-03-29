"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Terminal } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import logo from "@public/chatcoe.svg";
import Image from "next/image";
import Register from "@public/register.svg";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: session } = useSession();
  if (session) redirect("/chat");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Password do not match!");
      return;
    }

    if (!name || !email || !password || !confirmPassword) {
      setError("Please complete all inputs.");
      return;
    }

    const resCheckUser = await fetch("http://localhost:3000/api/usercheck", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const { user } = await resCheckUser.json();

    if (user) {
      setError("User already exists.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (res.ok) {
        const form = e.target as HTMLFormElement;
        setError("");
        setSuccess("User registration successfully!");
        form.reset();
      } else {
        console.log("User registration failed.");
      }
    } catch (error) {
      console.log("Error during registration: ", error);
    }
  };

  return (
    <div className="flex h-screen ">
      {/* Left side */}
      <div className="w-1/2 flex items-center justify-end">
        <div className="max-w-sm w-full px-8 py-10">
          <div className="text-4xl font-bold mb-6 flex items-center">
            Register
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
              <label className="block text-gray-700 my-1">Username</label>
              <input
                type="text"
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 mb-2"
                placeholder="Enter your name"
              />
              <label className="block text-gray-700 my-1">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 mb-2"
                placeholder="Enter your email"
              />
              <label className="block text-gray-700 my-1">Password</label>
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 mb-2"
                placeholder="Enter your password"
              />
              <label className="block text-gray-700 my-1">
                Confirm Password
              </label>
              <input
                type="password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 mb-2"
                placeholder="Confirm your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#5A0157] hover:bg-[#442943] text-white py-2 px-4 rounded-3xl transition-all duration-300"
            >
              Register
            </button>
          </form>

          <div className="flex items-center justify-between mt-4">
            <Link
              href="/login"
              className="text-2xl text-[#1D1A43] hover:underline "
            >
              <IoIosArrowBack />
            </Link>
            <Link
              className="text-sm text-[#1D1A43] hover:underline"
              href="/login"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="w-1/2 flex items-center justify-start">
      <div className="text-center p-6">
        <Image
          src={Register}
          alt="Register Image"
          width={500}
          height={500}
        />
        </div>
      </div>

      {/* Fixed Alert Container in the Bottom Right */}
      <div className="fixed bottom-4 right-4 space-y-4 z-50">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <div>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </div>
          </Alert>
        )}
        {success && (
          <Alert>
            <Terminal className="h-4 w-4" />
            <div>
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
