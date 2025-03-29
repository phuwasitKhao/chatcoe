"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageCircle, ArrowLeft } from "lucide-react";

export default function ChatHistoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    interface Chat {
        _id?: string;
        id?: string;
        title?: string;
        updatedAt?: string;
        createdAt?: string;
    }

    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        
        // แสดงข้อมูล session เพื่อการ debug
        console.log("Session data:", session);
        

        fetchChats();
    }, [status, router]);

    const fetchChats = async () => {
        try {
            setLoading(true);
            const userId = session?.user?.id || "anonymous";
            console.log("Fetching chats for user:", userId);
            
            const response = await fetch(`/api/v1/chat/chats?userId=${userId}`);
            console.log("Response status:", response.status);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Chats data:", data);
            setChats(data.chats || []);
        } catch (error) {
            console.error("Error fetching chats:", error);
        } finally {
            setLoading(false);
        }
    };

    const createNewChat = async () => {
        try {
            const userId = session?.user?.id || "anonymous";
            console.log("Creating new chat for user:", userId);
            
            if (!userId || userId === "anonymous") {
                console.error("Invalid user ID");
                return;
            }
            
            const response = await fetch('/api/v1/chat/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ownerId: userId,
                    title: 'New Chat',
                }),
            });
            
            console.log("API response status:", response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error("API error:", errorData);
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Created chat:", data);
            
            if (data._id) {
                router.push(`/chat/${data._id}`);
            } else if (data.id) {
                router.push(`/chat/${data.id}`);
            } else {
                console.error("No chat ID returned from API");
            }
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    กลับ
                </Button>
                <h1 className="text-2xl font-bold">ประวัติการแชท</h1>
                <Button onClick={createNewChat} className="bg-purple-900 hover:bg-purple-800">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    เริ่มการสนทนาใหม่
                </Button>
            </div>

            <div className="space-y-4">
                {chats.length > 0 ? (
                    chats.map((chat) => (
                        <Link
                            key={chat._id || chat.id}
                            href={`/chat/${chat._id || chat.id}`}
                            className="block p-4 border rounded-lg hover:bg-gray-50 transition"
                        >
                            <div className="flex items-center">
                                <MessageCircle className="text-purple-700 mr-3" />
                                <div>
                                    <div className="font-medium">{chat.title || 'แชทไม่มีชื่อ'}</div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(chat.updatedAt || chat.createdAt || Date.now()).toLocaleString('th-TH')}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        ยังไม่มีประวัติการแชท คลิกปุ่ม  &quot; เริ่มการสนทนาใหม่ &quot; เพื่อเริ่มต้น
                    </div>
                )}
            </div>
        </div>
    );
}