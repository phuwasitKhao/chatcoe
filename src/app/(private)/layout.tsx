"use client";

import React from "react";

import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/share/layout/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "../api/uploadthing/core";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import Image from "next/image";
import Logo from "@public/chatcoe.svg";
export default function PageWithMainControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // 🔥 หน้าที่ไม่ต้องมี layout เลย
  const noLayoutRoutes = ["/login", "/register", "/main"];

  // ✅ ถ้าอยู่ใน route ที่ไม่ต้องแสดง layout → return แค่ children
  if (noLayoutRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-fit z-50">
        <div className="sticky top-0 w-full pl-4 border-b py-3 flex items-center mx-auto  ">
          <SidebarTrigger className="justify-center" />
          <div className="flex justify-center items-center w-full">
            {/* <Image
              src={Logo}
              alt="ChatCane Logo"
              width={32}
              height={32}
              onClick={() => router.push("/chat")}
            /> */}
          </div>
        </div>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        {children}
      </main>
    </SidebarProvider>
  );
}
