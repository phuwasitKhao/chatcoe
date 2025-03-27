"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItemModel } from "@/components/share/layout/nav-items.model";
// import { useUser } from "@/lib/userContext";
// Interface for the NavbarItem

export default function NavDrawer({
  navItems,
  handleCloseNav,
}: {
  navItems?: NavItemModel[];
  handleCloseNav: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4">
      {navItems?.map((item, i) => {
        if (item.url === "/") {
          return (
            <div key = {i}
              className={
                `${pathname.indexOf(item.url) === 0 ? "active " : ""}` +
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all"
              }
            >
              {item.icon}
              {item.label}
            </div>
          );
        } else {
          return (
            <Link
              key={i}
              href={item.url}
              onClick={() => handleCloseNav()}
              className={
                `${pathname.indexOf(item.url) === 0 ? "active " : ""}` +
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted " +
                "[&.active]:bg-primary-active [&.active]:text-primary-active-foreground [&.active:hover]:bg-primary-active/90"
              }
            >
              {item.icon}
              {item.label}
            </Link>
          );
        }
      })}
    </nav>
  );
}