"use client";
import React, { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, PlusCircle } from "lucide-react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import "@/app/(private)/chat/chat.css";
import { Bot } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

interface Message {
  text: string;
  isUser: boolean;
  elapsedTime?: number;
}

export default function Chat() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const chatId = params?.id as string;

  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputLocked, setInputLocked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<any[]>([]);

  // // ตรวจสอบการล็อกอิน
  // useEffect(() => {
  //     if (status === "loading") return;
  //     if (status === "unauthenticated") {
  //         router.push("/login");
  //     }
  // }, [status, router]);

  // useEffect(() => {
  //     if (!chatId && status === "authenticated") {
  //         loadChats();
  //     }
  // }, [chatId, status]);

  // useEffect(() => {
  //     if (chatId && status === "authenticated") {
  //         fetchMessages();
  //     }
  // }, [chatId, status]);

  // useEffect(() => {
  //     if (messagesRef.current) {
  //         messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  //     }
  // }, [messages]);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (!chatId && status === "authenticated") {
      loadChats();
    } else if (chatId && status === "authenticated") {
      fetchMessages();
    }
  }, [chatId, status, session]);

  useEffect(() => {
    console.log("Current chatId:", chatId);

    if (!chatId && status === "authenticated") {
      console.log("No chatId provided, checking for existing chats");

      const loadChats = async () => {
        try {
          const userId = session?.user?.id || "anonymous";
          const response = await fetch(`/api/v1/chat/stream?userId=${userId}`);
          const data = await response.json();

          if (data.chats && data.chats.length > 0) {
            const latestChat = data.chats[0];
            console.log(
              "Found existing chat, redirecting to:",
              latestChat._id || latestChat.id
            );
            router.push(`/chat/${latestChat._id || latestChat.id}`);
          } else {
            createNewChat(session, router, setIsLoading);
            console.log("No existing chats found, staying on this page");
          }
        } catch (error) {
          console.error("Error loading chats:", error);
        }
      };

      loadChats();
    } else if (chatId) {
      fetchMessages();
    }
  }, [chatId, status, session]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const userId = session?.user?.id || "anonymous";
      const response = await fetch(`/api/v1/chat/stream?userId=${userId}`);
      const data = await response.json();

      if (data.chats && data.chats.length > 0) {
        setChats(data.chats);

        router.push(`/chat/${data.chats[0]._id || data.chats[0].id}`);
      } else {
        createNewChat(session, router, setIsLoading);
      }
    } catch (error) {
      console.error("Error loading chats:", error);

      createNewChat(session, router, setIsLoading);
    } finally {
      setIsLoading(false);
    }
  };

  // const createNewChat = async () => {
  //   if (isLoading) {
  //     console.log("Already creating chat, please wait");
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     const response = await fetch("/api/v1/chat/stream", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         ownerId: session?.user?.id || "anonymous",
  //         title: "New Chat",
  //       }),
  //     });

  //     const data = await response.json();
  //     console.log("Created chat:", data);
  //     if (data.id || data._id) {
  //       router.push(`/chat/${data.id || data._id}`);
  //     } else {
  //       console.error("No chat ID returned from API");
  //     }
  //   } catch (error) {
  //     console.error("Error creating new chat:", error);
  //   }
  // };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/chat/messages?chatId=${chatId}`);
      const data = await response.json();

      console.log("Fetched messages response:", {
        status: response.status,
        chatId: chatId,
        data: data,
      });

      if (data.messages && data.messages.length > 0) {
        const formattedMessages = data.messages.map(
          (msg: { content: string; senderId: string }) => ({
            text: msg.content,
            isUser: msg.senderId !== "bot",
          })
        );

        setMessages(formattedMessages);
      } else {
        console.log("No messages found for chatId:", chatId);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const typeBotResponse = (response: string) => {
    let idx = 0;
    const start = Date.now();
    setIsGenerating(true);

    typingIntervalRef.current = setInterval(() => {
      if (idx <= response.length) {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            text: response.slice(0, idx),
            isUser: false,
          };
          return newMessages;
        });
        idx++;
      } else {
        clearInterval(typingIntervalRef.current!);
        typingIntervalRef.current = null;

        const end = Date.now();
        const duration = (end - start) / 1000;

        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            elapsedTime: duration,
          };
          return updated;
        });

        setIsGenerating(false);
      }
    }, 30);
  };

  const sendMessage = async (e) => {
    // ป้องกันการรีเฟรชหน้าเริ่มต้น
    if (e && e.preventDefault) {
      e.preventDefault();
    }
  
    const userInput = inputRef.current?.value.trim();
    console.log("Sending message:", userInput, "to chat:", chatId);
  
    if (!userInput || inputLocked) {
      console.log("Cannot send: empty input or input locked");
      return;
    }
  
    // เพิ่มข้อความผู้ใช้ลงใน UI
    setMessages((prev) => [...prev, { text: userInput, isUser: true }]);
    setInputLocked(true);
    setIsGenerating(true);
    setStartTime(Date.now());
    setElapsedTime(null);
  
    if (inputRef.current) inputRef.current.value = "";
  
    // แสดงไฟ loading
    setMessages((prev) => [
      ...prev,
      {
        text: `<span class="animate-dots">
              <span></span><span></span><span></span>
            </span>`,
        isUser: false,
      },
    ]);
  
    try {
      let currentChatId = chatId;
      
      // ถ้าไม่มี chatId ให้สร้างแชทใหม่ก่อน
      if (!currentChatId) {
        console.log("Creating new chat...");
        const createResponse = await fetch("/api/v1/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ownerId: session?.user?.id || "anonymous",
            title: userInput.substring(0, 30),
          }),
        });
        
        if (!createResponse.ok) {
          throw new Error(`Failed to create chat: ${createResponse.status}`);
        }
        
        const chatData = await createResponse.json();
        currentChatId = chatData.id || chatData._id;
        
        console.log("New chat created with ID:", currentChatId);
        
        // อัปเดต URL แบบ client-side โดยไม่มีการรีเฟรชหน้า
        if (currentChatId) {
          router.push(`/chat/${currentChatId}`, undefined, { shallow: true });
        } else {
          throw new Error("Failed to get chat ID from new chat");
        }

        if (isGenerating) {
          console.log("Already generating response, ignoring new message");
          return;
        }

        console.log("Created new chat with ID:", newChatId);

        setMessages((prev) => [...prev, { text: userInput, isUser: true }]);
        setInputLocked(true);
        setIsGenerating(true);
        setStartTime(Date.now());
        setElapsedTime(null);

        if (inputRef.current) inputRef.current.value = "";

        setMessages((prev) => [
          ...prev,
          {
            text: `<span class="animate-dots">
                  <span></span><span></span><span></span>
                </span>`,
            isUser: false,
          },
        ]);

        // const response = await fetch("/api/v1/chat", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     message: userInput,
        //     chatId: newChatId,
        //     userId: session?.user?.id || "anonymous",
        //   }),
        // });

        const response = await fetch("/api/v1/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userInput,
            chatId: chatId,
            userId: session?.user?.id || "anonymous",
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const botText = data.completion || "";

        // เปลี่ยนเส้นทางไปยังแชทใหม่โดยไม่โหลดหน้าใหม่
        // router.push(`/chat/${newChatId}`, { scroll: false });

        typeBotResponse(botText);
      } catch (error) {
        console.error("Error handling message with new chat:", error);
        setMessages((prev) => [
          ...prev,
          { text: "ไม่สามารถสร้างแชทใหม่หรือส่งข้อความได้", isUser: false },
        ]);
        setIsGenerating(false);
        setInputLocked(false);
      }
      
      // ส่งข้อความ
      console.log(`Sending message to chat ID: ${currentChatId}`);
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: userInput
            }
          ],
          chatId: currentChatId,
          userId: session?.user?.id || "anonymous",
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // รับข้อมูลการตอบกลับ
      const data = await response.json();
      console.log("Response received:", data);
      
      // อัปเดต UI ด้วยคำตอบ
      const botText = data.completion || "";
      typeBotResponse(botText);
      
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1), // ลบข้อความ loading
        { text: `เกิดข้อผิดพลาด: ${error.message}`, isUser: false },
      ]);
    } finally {
      setIsGenerating(false);
      setInputLocked(false);
    }
  };

  
  const handleKeyPress = (event: React.KeyboardEvent) => {
    console.log("Key pressed:", event.key);
    if (event.key === "Enter" && !inputLocked) {
      console.log("Enter pressed, sending message");
      sendMessage();
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        กำลังโหลด...
      </div>
    );
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-125px)] flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <Button
          onClick={() => createNewChat(session, router, setIsLoading)}
          variant="outline"
          className="flex items-center"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          แชทใหม่
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center overflow-hidden ">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col justify-center items-center">
            <h1 className="text-2xl sm:text-xl font-semibold mt-8">
              มีอะไรให้ช่วยหรือไม่
            </h1>
          </div>
        )}

        {messages.length > 0 && (
          <div
            ref={messagesRef}
            className="w-full xl:w-2/3 h-full overflow-y-auto p-4"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`my-6 flex ${
                  msg.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-xl text-sm break-words max-w-[70%] ${msg.isUser
                    ? "text-white bg-purple-900"
                    : "text-gray-800 bg-white"
                    }`}
                >
                  {msg.isUser ? (
                    msg.text
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Bot className="w-4 h-4" />
                          <span>CoE Assistant</span>
                        </div>

                        {msg.elapsedTime && (
                          <div className="text-xs text-muted-foreground mb-1">
                            ดำเนินการเสร็จสิ้น ใช้เวลาทั้งหมด{" "}
                            {msg.elapsedTime.toFixed(2)} วินาที
                          </div>
                        )}
                      </div>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="w-full xl:w-2/3 relative flex items-center bg-white rounded-full px-4   bottom-4">
          <Input
            placeholder="จะทำอะไรให้ดี?"
            ref={inputRef}
            disabled={inputLocked}
            onKeyDown={handleKeyPress}
            className="rounded-xl"
          />
          <Button
            variant="default"
            onClick={sendMessage}
            disabled={inputLocked}
            className="ml-2 px-3 py-2 rounded-xl"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          {/* <Input
                        placeholder="ต้องการสอบถามอะไร?"
                        ref={inputRef}
                        disabled={inputLocked}
                        onKeyDown={(e) => {
                            console.log("Key down:", e.key);
                            if (e.key === "Enter" && !inputLocked) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        className="rounded-xl"
                    />
                    <Button
                        variant="default"
                        onClick={() => {
                            console.log("Send button clicked");
                            sendMessage();
                        }}
                        disabled={inputLocked}
                        className="ml-2 px-3 py-2 rounded-xl"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Button> */}
        </div>
      </div>
    </div>
  );
}

export const createNewChat = async (
  session: any,
  router: any,
  setIsLoading: (v: boolean) => void
) => {
  // ตั้งค่า loading เป็น true
  setIsLoading(true);
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
    console.log("Created chat:", data);
    if (data.id || data._id) {
      router.push(`/chat/${data.id || data._id}`);
    } else {
      console.error("No chat ID returned from API");
    }
  } catch (error) {
    console.error("Error creating new chat:", error);
  } finally {
    setIsLoading(false);
  }
};
