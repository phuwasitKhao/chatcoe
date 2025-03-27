"use client";

import React from "react";
// import { useUser } from "@/lib/userContext";
// import { getCanSubmit } from "@/lib/allAPI/user";
import MainNavigationLayout from "@/components/share/layout/main-navigation-layout";
import { CalendarRange, Home, User } from "lucide-react";
import { NavItemModel } from "@/components/share/layout/nav-items.model";

export default function PageWithMainControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const {userToken} = useUser();
  // const [canSubmit, setCanSubmit] = useState(false);
  // const [error, setError] = useState(false);

  // useEffect(() => {
  //     const fetchData = async (token: string) => {
  //         const response = await getCanSubmit(token);

  //         switch (response.status) {
  //             case 200:
  //                 setCanSubmit(response.can_send)
  //                 console.log("response", response.can_send);

  //                 break;

  //             default:
  //                 setError(true);
  //                 break;
  //         }
  //     };

  //     if (userToken) {
  //         fetchData(userToken).then();
  //     }
  // }, [userToken]);

  // if (error) throw new Error("Error fetching data");

  // const test = canSubmit ? "" : "hidden";
  const navItems: NavItemModel[] = [
    { url: "/chat", label: "หน้าหลัก", icon: <Home className="h-4 w-4" /> },
    { url: "/history", label: "ประวัติแชท", icon: <CalendarRange className="h-4 w-4" /> },
    // {url: "/", label: "ส่งผล", icon: <CirclePlus className="h-4 w-4"/>},
    { url: "/about", label: "About", icon: <User className="h-4 w-4" /> },
  ];

  return (
    <MainNavigationLayout navItems={navItems}>
      <div>
        {children}
      </div>
    </MainNavigationLayout>
  );
}