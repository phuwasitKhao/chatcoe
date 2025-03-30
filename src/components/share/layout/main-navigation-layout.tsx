import Link from "next/link";
import { HeartPulse, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React, { useState } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import NavDrawer from "@/components/share/layout/nav-drawer";
import Navbar from "@/components/share/layout/navbar";
import { NavItemModel } from "@/components/share/layout/nav-items.model";
import { ThemeSwitcher } from "@/components/theme/theme-switcher"
export default function MainNavigationLayout({
    children,
    navItems,
    showBreadcrumb = false,
    showNavbar = true,
}: {
    children: React.ReactNode;
    navItems?: NavItemModel[];
    showBreadcrumb?: boolean;
    showNavbar?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-muted/40 relative">
            <div className="hidden border-r bg-background md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <div className="flex items-center gap-2 font-semibold">
                            <span className="">Logo</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <NavDrawer
                            navItems={navItems}
                            handleCloseNav={() => setIsOpen(false)}
                        ></NavDrawer>
                    </div>
                </div>
            </div>
            <div className="flex flex-col h-dvh overflow-scroll">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background p-4 sm:h-[60px] sm:px-6">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="outline" className="md:hidden">
                                <PanelLeft className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="sm:max-w-xs">
                            <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 font-semibold"
                                >
                                    <HeartPulse className="h-6 w-6" />
                                    <span className="">ChatCoE</span>
                                </Link>
                            </div>
                            <div className="flex-1">
                                <NavDrawer
                                    navItems={navItems}
                                    handleCloseNav={() => setIsOpen(false)}
                                ></NavDrawer>
                            </div>
                        </SheetContent>
                    </Sheet>
                    {showBreadcrumb && (
                        <Breadcrumb className="hidden md:flex">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="#">Dashboard</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="#">Products</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Edit Product</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    )}
                    <div className="flex w-full justify-end items-center">
                        <ThemeSwitcher />
                    </div>
                </header>
                <main className="box-border flex flex-col gap-4 ">
                    {children}
                    {showNavbar && <Navbar navItems={navItems}></Navbar>}
                </main>
            </div>
        </div>
    );
}