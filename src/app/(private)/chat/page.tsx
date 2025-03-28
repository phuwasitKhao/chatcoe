// "use client";
// import React, { useRef, useState, useEffect } from "react";
// import ReactMarkdown from "react-markdown";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ArrowRight } from "lucide-react";
// import remarkGfm from "remark-gfm";
// import remarkMath from "remark-math";
// import remarkBreaks from "remark-breaks";
// import rehypeKatex from "rehype-katex";
// import rehypeRaw from "rehype-raw";
// import "katex/dist/katex.min.css";
// import "@/app/(private)/chat/chat.css";
// import { Bot } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { useRouter, useParams } from "next/navigation";

// interface Message {
//   text: string;
//   isUser: boolean;
//   elapsedTime?: number;
// }

// export default function Chat() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const params = useParams();
//   const chatId = params?.id as string;

//   const messagesRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputLocked, setInputLocked] = useState(false);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [startTime, setStartTime] = useState<number | null>(null);
//   const [elapsedTime, setElapsedTime] = useState<number | null>(null);
//   const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [chats, setChats] = useState<any[]>([]);

//   // ตรวจสอบการล็อกอิน
//   useEffect(() => {
//     if (status === "loading") return;
//     if (status === "unauthenticated") {
//       router.push("/login");
//     }
//   }, [status, router]);

//   // ถ้าไม่มี chatId แต่ล็อกอินแล้ว ให้โหลดรายการแชทเพื่อตรวจสอบ
//   useEffect(() => {
//     if (!chatId && status === "authenticated") {
//       loadChats();
//     }
//   }, [chatId, status]);

//   // โหลดข้อความแชทเมื่อมี chatId
//   useEffect(() => {
//     if (chatId && status === "authenticated") {
//       fetchMessages();
//     }
//   }, [chatId, status]);

//   // เลื่อนไปที่ข้อความล่าสุด
//   useEffect(() => {
//     if (messagesRef.current) {
//       messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const loadChats = async () => {
//     try {
//       setIsLoading(true);
//       const userId = session?.user?.id || "anonymous";
//       const response = await fetch(`/api/v1/chat/chats?userId=${userId}`);
//       const data = await response.json();

//       if (data.chats && data.chats.length > 0) {
//         setChats(data.chats);
//         // ให้ไปที่แชทแรกสุด หรือจะสร้างใหม่ก็ได้
//         router.push(`/chat/${data.chats[0].id}`);
//       } else {
//         // ถ้าไม่มีแชทเลย ให้สร้างใหม่
//         createNewChat();
//       }
//     } catch (error) {
//       console.error("Error loading chats:", error);
//       // ถ้าเกิดข้อผิดพลาด ให้สร้างแชทใหม่
//       createNewChat();
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (status === "loading") {
//     return <div>Loading...</div>;
//   }

//   const createNewChat = async () => {
//     try {
//       const response = await fetch('/api/v1/chat/chats', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ownerId: session?.user?.id || 'anonymous',
//           title: 'New Chat',
//         }),
//       });

//       const data = await response.json();
//       if (data.id) {
//         router.push(`/chat/${data.id}`);
//       }
//     } catch (error) {
//       console.error('Error creating new chat:', error);
//     }
//   };

//   // ดึงประวัติข้อความ
//   const fetchMessages = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`/api/v1/chat/messages?chatId=${chatId}`);
//       const data = await response.json();

//       if (data.messages && data.messages.length > 0) {
//         const formattedMessages = data.messages.map((msg: any) => ({
//           text: msg.content,
//           isUser: msg.senderId !== 'bot',
//         }));

//         setMessages(formattedMessages);
//       }
//     } catch (error) {
//       console.error('Error fetching messages:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const typeBotResponse = (response: string) => {
//     let idx = 0;
//     const start = Date.now();
//     setIsGenerating(true);

//     typingIntervalRef.current = setInterval(() => {
//       if (idx <= response.length) {
//         setMessages((prev) => {
//           const newMessages = [...prev];
//           newMessages[newMessages.length - 1] = {
//             text: response.slice(0, idx),
//             isUser: false,
//           };
//           return newMessages;
//         });
//         idx++;
//       } else {
//         clearInterval(typingIntervalRef.current!);
//         typingIntervalRef.current = null;

//         const end = Date.now();
//         const duration = (end - start) / 1000;

//         // บันทึกเวลาในข้อความสุดท้าย
//         setMessages((prev) => {
//           const updated = [...prev];
//           const last = updated[updated.length - 1];
//           updated[updated.length - 1] = {
//             ...last,
//             elapsedTime: duration,
//           };
//           return updated;
//         });

//         setIsGenerating(false);
//       }
//     }, 30);
//   };

//   const sendMessage = async () => {
//     const userInput = inputRef.current?.value.trim();
//     if (!userInput || inputLocked || !chatId) return;

//     setMessages((prev) => [...prev, { text: userInput, isUser: true }]);
//     setInputLocked(true);
//     setIsGenerating(true);
//     setStartTime(Date.now());
//     setElapsedTime(null);

//     if (inputRef.current) inputRef.current.value = "";

//     setMessages((prev) => [
//       ...prev,
//       {
//         text: `<span class="animate-dots">
//           <span></span><span></span><span></span>
//         </span>`,
//         isUser: false,
//       },
//     ]);

//     try {
//       const response = await fetch("/api/v1/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           message: userInput,
//           chatId: chatId,
//           userId: session?.user?.id || "anonymous",
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`API error: ${response.status}`);
//       }

//       const data = await response.json();
//       const botText = data.completion || "";
//       typeBotResponse(botText);
//     } catch (error) {
//       console.error("Error sending message:", error);
//       setMessages((prev) => [
//         ...prev,
//         { text: "ไม่สามารถติดต่อกับ Chatbot ได้", isUser: false },
//       ]);
//       setIsGenerating(false);
//     } finally {
//       setInputLocked(false);
//     }
//   };

//   const handleKeyPress = (event: React.KeyboardEvent) => {
//     console.log("Key pressed:", event.key);
//     if (event.key === "Enter" && !inputLocked) {
//       console.log("Enter pressed, sending message");
//       sendMessage();
//     }
//   };

//   if (isLoading && messages.length === 0) {
//     return <div className="flex justify-center items-center h-screen">กำลังโหลดข้อมูล...</div>;
//   }

//   return (
//     <div className="w-full h-screen flex flex-col items-center justify-center pb-20">
//       {messages.length === 0 && (
//         <h1 className="text-2xl sm:text-xl font-semibold mb-8">
//           มีอะไรให้ช่วยหรือไม่
//         </h1>
//       )}

//       {messages.length > 0 && (
//         <div
//           ref={messagesRef}
//           className="w-full xl:w-2/3 h-full overflow-y-auto p-4"
//         >
//           {messages.map((msg, idx) => (
//             <div
//               key={idx}
//               className={`my-6 flex ${msg.isUser ? "justify-end" : "justify-start"
//                 }`}
//             >
//               <div
//                 className={`px-4 py-2 rounded-xl text-sm break-words max-w-[70%] ${msg.isUser
//                   ? "text-white bg-purple-900"
//                   : "text-gray-800 bg-white"
//                   }`}
//               >
//                 {msg.isUser ? (
//                   msg.text
//                 ) : (
//                   <div className="flex flex-col gap-1">
//                     <div className='flex items-center gap-1'>
//                       <div className="flex items-center gap-2 text-muted-foreground mb-1">
//                         <Bot className="w-4 h-4" />
//                         <span>CoE Assistant</span>
//                       </div>

//                       {msg.elapsedTime && (
//                         <div className="text-xs text-muted-foreground mb-1">
//                           ดำเนินการเสร็จสิ้น ใช้เวลาทั้งหมด {msg.elapsedTime.toFixed(2)} วินาที
//                         </div>
//                       )}
//                     </div>
//                     <ReactMarkdown
//                       remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
//                       rehypePlugins={[rehypeKatex, rehypeRaw]}
//                     >
//                       {msg.text}
//                     </ReactMarkdown>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <div className="w-full xl:w-2/3 relative flex items-center bg-white rounded-full px-4 py-2">
//         <Input
//           placeholder="จะทำอะไรให้ดี?"
//           ref={inputRef}
//           disabled={inputLocked}
//           onKeyDown={handleKeyPress}
//           className="rounded-xl"
//         />
//         <Button
//           variant="default"
//           onClick={sendMessage}
//           disabled={inputLocked}
//           className="ml-2 px-3 py-2 rounded-xl"
//         >
//           <ArrowRight className="w-5 h-5" />
//         </Button>
//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

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
        const response = await fetch('/api/v1/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ownerId: session?.user?.id || 'anonymous',
            title: 'New Chat',
          }),
        });

        const data = await response.json();
        if (data.id || data._id) {
          router.push(`/chat/${data.id || data._id}`);
        }
      } catch (error) {
        console.error('Error creating new chat:', error);
      }
    };

    loadChats();
  }, [status, session, router]);

  return <div className="flex justify-center items-center h-screen">กำลังเตรียมแชท...</div>;
}