"use client";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  BadgeHelp,
  SearchSlash,
  LucideIcon,
  Brain,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { useUserData } from "@/hooks/useUserdata";
import { useSession } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { createNewChat } from "@/app/(private)/chat/[chatId]/page";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [],
  projects: [
    {
      name: "Help",
      url: "/help",
      icon: BadgeHelp,
    },
    {
      name: "About",
      url: "/about",
      icon: SearchSlash,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const { userData, loading } = useUserData();
  const [chatItems, setChatItems] = useState<
    { title: string; url: string; icon?: LucideIcon }[]
  >([]);
  const handleNewChat = async () => {
    await createNewChat(session, router, setIsLoading);
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(
            `/api/v1/chat/chats?userId=${session.user.id}`
          );
          if (response.ok) {
            const data = await response.json();
            const chats = data.chats || [];

            const formatted = chats.map((chat: any) => ({
              title: chat.title || "แชทไม่มีชื่อ",
              url: `/chat/${chat._id || chat.id}`,
              icon: Brain, // หรือใช้ไอคอนอื่นที่คุณต้องการ
            }));

            setChatItems(formatted);
          }
        } catch (error) {
          console.error("Error loading chat history:", error);
        }
      }
    };

    if (status === "authenticated") {
      fetchChatHistory();
    }
  }, [session, status]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <NavUser
          user={
            userData
              ? {
                  name: userData.name,
                  email: userData.email,
                  avatar: userData.avatar || "/avatars/default.jpg",
                }
              : loading
              ? { name: "กำลังโหลด...", email: "", avatar: "" }
              : {
                  name: "ยังไม่ได้เข้าสู่ระบบ",
                  email: "",
                  avatar: "/avatars/default.jpg",
                }
          }
        />

        <Select>
          <SidebarGroupLabel>Chat</SidebarGroupLabel>
          <SidebarMenuButton asChild>
            <Link
              href="/chat/new"
              className="flex items-center gap-2 w-full border rounded-lg py-5 hover:bg-muted transition shadow-sm"
              onClick={handleNewChat}
            >
              <Plus className="h-4 w-4" />
              <p className="text-xs font-medium">New Chat</p>
            </Link>
          </SidebarMenuButton>
          <SidebarGroupLabel>Model</SidebarGroupLabel>

          <Select defaultValue="lama3">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Model</SelectLabel>
                <SelectItem value="lama3">Lama3</SelectItem>
                <SelectItem value="chatgpt4o" disabled>
                  ChatGpt4o4gPlus
                </SelectItem>
                <SelectItem value="deepseek" disabled>
                  Deepseek
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Select>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={chatItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavProjects projects={data.projects} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
