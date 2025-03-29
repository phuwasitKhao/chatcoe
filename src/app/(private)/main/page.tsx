"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import TypewriterLoop from "@/components/share/typewriter/TypewritterLoop";
import Image from "next/image";
import logo from "@public/chatcoe.svg";
const MainPage = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignup = () => {
    router.push("/register");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center overflow-y-auto">
      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6">
          <Image src={logo} alt="ChatCane Logo" width={76} height={76} />
        </div>
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">ChatCoE</h1>
        <TypewriterLoop />

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 w-full max-w-md  mx-auto">
          <Button
            onClick={handleLogin}
            className=" py-4 text-lg w-36 rounded-xl bg-black text-white hover:bg-gray-800"
          >
            Login
          </Button>
          <Button
            onClick={handleSignup}
            variant="secondary"
            className="w-36 py-4 text-lg rounded-xl border-gray-300 hover:bg-gray-200"
          >
            Sign Up
          </Button>
        </div>
      </section>

      {/* FEATURE SECTION */}
      {/* <section className=" py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <FeatureCard
            icon="🔒"
            title="Authentication"
            description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium."
          />
          <FeatureCard
            icon="⚙️"
            title="Developer First"
            description="Dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          />
        </div>
      </section> */}

      {/* Optional blinking cursor style */}
      <style jsx>{`
        .blinking-cursor {
          font-weight: 100;
          font-size: 1rem;
          color: #333;
          animation: blink 0.7s infinite;
        }
        @keyframes blink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          99% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// Feature card component
// function FeatureCard({
//   icon,
//   title,
//   description,
// }: {
//   icon: string;
//   title: string;
//   description: string;
// }) {
//   return (
//     <div className="flex items-start space-x-4">
//       <div className="text-3xl">{icon}</div>
//       <div>
//         <h4 className="text-lg font-semibold mb-1">{title}</h4>
//         <p className="text-sm text-muted-foreground">{description}</p>
//       </div>
//     </div>
//   );
// }

export default MainPage;
