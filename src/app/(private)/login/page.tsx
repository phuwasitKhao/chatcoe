"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const { status } = useSession();

  // แก้ไขในไฟล์ Login Page
  useEffect(() => {
    console.log("Session status:", status);
    if (status === "authenticated") {
      router.push("/chat/new");
    }
  }, [status, router]);

  useEffect(() => {
    console.log("Session status:", status);
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

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/chat" });
    } catch (error) {
      console.log(error);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-grow">
      <div className="flex justify-center items-center h-screen">
        <div className="w-[400px] shadow-xl p-10 mt-5 rounded-xl">
          <h3 className="text-3xl">Login Page</h3>
          <hr className="my-3" />
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-200 border py-2 px-3 rounded text-lg my-2"
              placeholder="Enter your email"
            />
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-200 border py-2 px-3 rounded text-lg my-2"
              placeholder="Enter your password"
            />
            <button
              type="submit"
              className="bg-green-500 text-white border py-2 px-3 rounded text-lg my-2"
            >
              Sign In
            </button>
          </form>
          <hr className="my-3" />
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c0-.99.1-1.95.27-2.85h-4.92v5.71h2.99c-.12.66-.29 1.29-.53 1.87-.25.58-.55 1.13-.92 1.63-.37.5-.8.95-1.29 1.34-.49.39-1.03.72-1.62.97-.59.26-1.21.45-1.87.57-.66.12-1.35.18-2.07.18-.72 0-1.41-.06-2.07-.18-.66-.12-1.28-.31-1.87-.57-.59-.25-1.13-.58-1.62-.97-.49-.39-.92-.84-1.29-1.34-.37-.5-.67-1.05-.92-1.63-.24-.58-.41-1.21-.53-1.87h-3v5.71h1.5v2.85h-1.5v2.86h-3v2.85h5.71v-2.85h-1.5v-2.86h1.5v-5.71h1.5v2.85h1.5v2.86h-1.5v5.71h5.71v-2.85h-1.5v-2.86h1.5v-5.71zm-4.92-5.71h3v-2.86h-3zm5.71-2.85v2.86h2.86v-2.86zm-2.86-1.43v2.86h2.86v-2.86zm2.86-2.86v2.86h2.85v-2.86zm2.85-1.43v2.86h2.85v-2.86zm-5.71 5.71v2.86h2.85v-2.86zm0 2.86h2.85v2.86h-2.85zm2.85 2.86v2.86h2.85v-2.86zm5.71-2.86v2.86h2.86v-2.86zm2.85-5.71v2.86h2.85v-2.86zm0 2.85v2.86h2.86v-2.86zm-5.71-2.85v2.86h2.85v-2.86z" />
            </svg>
            Sign In with Google
          </button>
          <hr className="my-3" />
          <div className="flex items-center justify-between">
            <p>
              Go back to{" "}
              <Link href="/" className="text-red-400 hover:underline">
                Homepage
              </Link>
            </p>
            <p>
              Go to{" "}
              <Link href="/register" className="text-blue-500 hover:underline">
                Register
              </Link>{" "}
              Page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
