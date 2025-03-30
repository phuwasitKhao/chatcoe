"use client";
import React from "react";
import { LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

interface Project {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavProjectsProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export function NavProjects({ projects, onProjectClick }: NavProjectsProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const handleProjectClick = (project: Project) => {
    if (onProjectClick) {
      onProjectClick(project);
    } else {
      router.push(project.url);
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <button
                onClick={() => handleProjectClick(item)}
                className="flex items-center gap-2"
              >
                {item.icon && <item.icon className="w-5 h-5" />}
                <span>{item.name}</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
