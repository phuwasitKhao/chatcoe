//chat/page.tsx
"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // if (status === "loading") return;

    // if (status === "unauthenticated") {
    //   router.push("/login");
    //   return;
    // }

    const loadChats = async () => {
      try {
        const userId = session?.user?.id || "anonymous";
        const response = await fetch(`/api/v1/chat/stream?userId=${userId}`);
        const data = await response.json();

        if (data.chats && data.chats.length > 0) {
          const latestChat = data.chats[0];
          router.push(`/chat/${latestChat._id || latestChat.id}`);
        } else {
          createNewChat();
        }
      } catch (error) {
        console.error("Error loading chats:", error);
        createNewChat();
      }
    };

    const createNewChat = async () => {
      try {
        const response = await fetch("/api/v1/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ownerId: session?.user?.id || "anonymous",
            title: "New Chat",
          }),
        });

        const data = await response.json();
        if (data.id || data._id) {
          router.push(`/chat/${data.id || data._id}`);
        }
      } catch (error) {
        console.error("Error creating new chat:", error);
      }
    };

    loadChats();
  }, [status, session, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      กำลังเตรียมแชท...
    </div>
  );
}
