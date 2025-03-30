"use client";

import { Plus, type LucideIcon } from "lucide-react";

import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="pb-2">History</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild tooltip={item.title}>
              <Link
                href={item.url}
                className="flex items-center gap-2 w-full border rounded-lg  py-5 hover:bg-muted transition shadow-sm"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <p className="text-xs">{item.title}</p>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
