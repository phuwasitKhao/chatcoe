"use client";
import React from 'react'
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { NavItemModel } from "@/components/share/layout/nav-items.model";
import { signOut } from 'next-auth/react'


export default function Navbar(
    {navItems}: { navItems?: NavItemModel[] }) {
    const pathname = usePathname();
    return (
        <nav className={"md:hidden fixed bottom-0 left-0 p-2 z-10 w-full bg-card border-t shadow-2xl"}>
            <ul className="flex">
                {navItems?.map((item, index) => (
                    <li key={index} className={"flex-1"}>
                        <Link
                            href={item.url}
                            className={
                                `${pathname.indexOf(item.url) === 0 ? "active " : ""}` +
                                "text-sm flex flex-col items-center justify-center p-2 rounded-lg hover:bg-muted hover:text-primary " +
                                "[&.active]:bg-primary-active [&.active]:text-primary-active-foreground [&.active:hover]:bg-primary-active/90"
                            }
                        >
                            {item.icon} {item.short_label ?? item.label}
                        </Link>
                    </li>
                ))}
                <li>
                <button 
                  onClick={() => signOut()} 
                  className='bg-gray-800 text-white hover:bg-black px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out'
                >
                  Logout
                </button>
                </li>
            </ul>
        </nav>
    );
}