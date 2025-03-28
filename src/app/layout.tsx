"use client";
import { AuthProvider } from "./Providers";
import "./globals.css";
import React, { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>ChatCOE</title>
      </head>
      <body className="h-screen overflow-y-auto w-full z-0">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
