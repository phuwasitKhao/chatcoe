"use client";
import React from "react";
import MainPage from "@/app/(private)/main/page";

export default function LandingPage() {



  return (
    <main>
      <MainPage />
        {/* <div style={trapezoidStyle}></div>
      <div className="flex flex-col lg:grid lg:grid-cols-2 lg:py-0">
        <div className="flex flex-col h-screen justify-center items-center gap-3 z-10">
          <div className="w-full text-center py-2">
            <Link href={{
              pathname: "https://oauth.kku.ac.th/authorize",
              query: {
                response_type: "code",
                client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
                redirect_uri: loginRedirectURL + "/auth"
              }
            }}>
              <Button className={"h-12 text-xl "}>
                Sign-in with KKU account
              </Button>
            </Link>
          </div>
        </div>
      </div> */}
    </main>
  );
}