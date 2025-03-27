"use client";

import "./globals.css";
import React, { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";

// import ไฟล์ Context ของคุณ
// import { UserContextProvider } from "./userState";

// import ส่วนประกอบอื่น ๆ


// import useUser เพื่อเรียกค่าภายใน Layout ได้


interface LayoutProps {
  children: ReactNode;
}



/**
 * แยก Component ย่อยสำหรับส่วน “Content” ภายใน Layout
 * เพื่อให้โค้ดอ่านง่าย และเห็นชัดเจนว่าถูกห่อด้วย Provider
 */
// function LayoutContent({ children }: { children: ReactNode }) {
//   // เรียก user จาก Context
//   const { user } = useUser();
//   const router = useRouter();

//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <SidebarProvider>
//         <AppSidebar />

//         <main className="flex-1 h-screen">
//           {/* ตัวอย่างเงื่อนไข ถ้าไม่มี user ให้แสดง Logo + Avatar */}
//           {user && (
//             <div className="sticky top-0  bg-background w-full pr-2  border-b flex items-center justify-between bg-white " >
//               <SidebarTrigger />
//               <img
//                 src="https://scontent.fkkc4-2.fna.fbcdn.net/v/t1.15752-9/485169210_646095441540595_4536175206696792204_n.png?_nc_cat=107&ccb=1-7&_nc_sid=9f807c&_nc_ohc=DKTs2RquwQwQ7kNvgErUP79&_nc_oc=AdlYuUpl8PcqQlULdLA6ZA40xwKmZqFMk-DI_skPPgSfz-SEDmgcwWWba-_Mz5N5RTyibsFLCCNvxEBB2NkP-Z0v&_nc_zt=23&_nc_ht=scontent.fkkc4-2.fna&oh=03_Q7cD1wEEOqV49pxDZexZ89dtuM6RuIomtVLJ2lkezNkpz1LpxQ&oe=6807A75C"
//                 alt="ChatCane Logo"
//                 className="h-14 py-2 cursor-pointer"
//                 onClick={() => router.push("/")}
//               />
//               <Avatar className="h-8 w-8 rounded-full ">
//                 <AvatarImage src="/avatars/shadcn.jpg" alt="logo" />
//                 <AvatarFallback className="rounded-lg">CN</AvatarFallback>
//               </Avatar>
//             </div>
//           )}


//           <div className="flex flex-col h-screen p-2">{children}</div>
//         </main>
//       </SidebarProvider>

//     </div>
//   );
// }

/**
 * Layout หลัก
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>ChatCane</title>
      </head>
      <body className="h-screen overflow-y-auto w-full z-0">
        <ThemeProvider>
          {/* <UserContextProvider> */}
          {children}
          {/* </UserContextProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
