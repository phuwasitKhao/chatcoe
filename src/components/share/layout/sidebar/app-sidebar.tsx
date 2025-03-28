"use client";

import * as React from "react";
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,

    GalleryVerticalEnd,

    BadgeHelp,
    Settings2,
    SquareTerminal,
    SearchSlash
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

import {
    Sidebar,
    SidebarContent, SidebarFooter, SidebarGroupLabel,
    SidebarHeader,

    // SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
// import { useUser } from "@/app/userState";

// This is sample data.
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
        {
            title: "Playground",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: "History",
                    url: "#",
                },
                {
                    title: "Starred",
                    url: "#",
                },
                {
                    title: "Settings",
                    url: "#",
                },
            ],
        },
        {
            title: "Models",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "Genesis",
                    url: "#",
                },
                {
                    title: "Explorer",
                    url: "#",
                },
                {
                    title: "Quantum",
                    url: "#",
                },
            ],
        },
        {
            title: "Documentation",
            url: "#",
            icon: BookOpen,
            items: [
                {
                    title: "Introduction",
                    url: "#",
                },
                {
                    title: "Get Started",
                    url: "#",
                },
                {
                    title: "Tutorials",
                    url: "#",
                },
                {
                    title: "Changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
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

    // const { user  } = useUser();

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <NavUser user={{ name: 'Nawamin Onkhwan', email: 'nawamin.o@kkumail.com', avatar: "/avatars/shadcn.jpg" }} />
                <Select>
                    <SidebarGroupLabel>Model</SidebarGroupLabel>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Model</SelectLabel>
                            <SelectItem value="apple">Lama3</SelectItem>
                            <SelectItem value="banana">ChatGpt4o4gPlus</SelectItem>
                            <SelectItem value="blueberry">Deepseek</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                {/*<NavProjects projects={data.projects} />*/}
            </SidebarContent>
            <SidebarFooter>
                <NavProjects projects={data.projects} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
