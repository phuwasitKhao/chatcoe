"use client";

import React from "react";
// import { useUser } from "@/lib/userContext";
// import { getCanSubmit } from "@/lib/allAPI/user";
// import MainNavigationLayout from "@/components/share/layout/main-navigation-layout";
// import { CalendarRange, Home, User } from "lucide-react";
// import { NavItemModel } from "@/components/share/layout/nav-items.model";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/share/layout/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

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
      <main className="w-full h-fit">
        <div className="sticky top-0 w-full pr-2  border-b flex items-center justify-between bg-white ">
          <SidebarTrigger />
          <img
            src="https://scontent.fkkc4-2.fna.fbcdn.net/v/t1.15752-9/485169210_646095441540595_4536175206696792204_n.png?_nc_cat=107&ccb=1-7&_nc_sid=9f807c&_nc_ohc=DKTs2RquwQwQ7kNvgErUP79&_nc_oc=AdlYuUpl8PcqQlULdLA6ZA40xwKmZqFMk-DI_skPPgSfz-SEDmgcwWWba-_Mz5N5RTyibsFLCCNvxEBB2NkP-Z0v&_nc_zt=23&_nc_ht=scontent.fkkc4-2.fna&oh=03_Q7cD1wEEOqV49pxDZexZ89dtuM6RuIomtVLJ2lkezNkpz1LpxQ&oe=6807A75C"
            alt="ChatCane Logo"
            className="h-14 py-2 cursor-pointer"
            onClick={() => router.push("/")}
          />
          <Avatar className="h-8 w-8 rounded-full ">
            <AvatarImage src="/avatars/shadcn.jpg" alt="logo" />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
