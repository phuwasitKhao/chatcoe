"use client";

import React, { useEffect, useState } from "react";
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    GalleryVerticalEnd,
    BadgeHelp,
    Settings2,
    SquareTerminal,
    SearchSlash, LucideIcon, Brain
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { useUserData } from "@/hooks/useUserdata";
import { useSession } from "next-auth/react";
import {
    Sidebar,
    SidebarContent, SidebarFooter, SidebarGroupLabel,
    SidebarHeader,

    // SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
// import { useUser } from "@/app/userState";


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
    navMain: [

    ],
    projects: [
        {
            name: "Setting",
            url: "#",
            icon: Settings2,
        },
        {
            name: "Help",
            url: "/help",
            icon: BadgeHelp,
        },
        {
            name: "About",
            url: "/about",
            icon: SearchSlash,
        }
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session, status } = useSession();
    const { userData, loading } = useUserData();
    const [chatItems, setChatItems] = useState<
        { title: string; url: string; icon?: LucideIcon }[]
    >([]);

    useEffect(() => {
        const fetchChatHistory = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/v1/chat/chats?userId=${session.user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        const chats = data.chats || [];

                        const formatted = chats.map((chat: any) => ({
                            title: chat.title || "แชทไม่มีชื่อ",
                            url: `/chat/${chat._id || chat.id}`,
                            icon: Brain , // หรือใช้ไอคอนอื่นที่คุณต้องการ
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
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <NavUser
                    user={
                        userData
                            ? {
                                name: userData.name,
                                email: userData.email,
                                avatar: userData.avatar || '/avatars/default.jpg'
                            }
                            : loading
                                ? { name: 'กำลังโหลด...', email: '', avatar: '' }
                                : { name: 'ยังไม่ได้เข้าสู่ระบบ', email: '', avatar: '/avatars/default.jpg' }
                    }
                />
                <Select>
                    <SidebarGroupLabel>Model</SidebarGroupLabel>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Model</SelectLabel>
                            <SelectItem value="lama3">Lama3</SelectItem>
                            <SelectItem value="chatgpt4o">ChatGpt4o4gPlus</SelectItem>
                            <SelectItem value="deepseek">Deepseek</SelectItem>
                        </SelectGroup>
                    </SelectContent>
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
