"use client";
import React, { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import "@/app/(private)/chat/chat.css";
import { Bot} from "lucide-react";
// import { useSession } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Message {
  text: string;
  isUser: boolean;
  elapsedTime?: number; // เพิ่มเพื่อเก็บเวลาเฉพาsะแต่ละข้อความ
}


export default function Chat() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ ย้ายขึ้นมาบนสุดก่อนเงื่อนไขใดๆ
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputLocked, setInputLocked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }

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

        // บันทึกเวลาเฉพาะในข้อความสุดท้าย
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

  const sendMessage = async () => {
    const userInput = inputRef.current?.value.trim();
    if (!userInput || inputLocked) return;

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

    try {
      const response = await fetch(
          `http://localhost:5001/chatbot_full?user_input=${encodeURIComponent(userInput)}`,
          { method: "GET" }
      );
      const data = await response.json();

      let botText = data.response;
      botText = botText.replace(/(\d+)\.\s/g, "$1\\. ");
      botText = botText.replace(/^\*\s*เฉลย/m, "* **เฉลย**");

      typeBotResponse(botText);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [
        ...prev,
        { text: "ไม่สามารถติดต่อกับ Chatbot ได้.", isUser: false },
      ]);
      setIsGenerating(false);
    } finally {
      setInputLocked(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !inputLocked) {
      sendMessage();
    }
  };

  return (
      <div className="w-full h-screen flex flex-col items-center justify-center pb-20">
        {messages.length === 0 && (
            <h1 className="text-2xl sm:text-xl font-semibold mb-8">
              มีอะไรให้ช่วยหรือไม่
            </h1>
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
                        className={`px-4 py-2 rounded-xl text-sm break-words max-w-[70%] ${
                            msg.isUser
                                ? "text-white bg-purple-900"
                                : "text-gray-800 bg-white"
                        }`}
                    >
                      {msg.isUser ? (
                          msg.text
                      ) : (

                          <div className="flex flex-col gap-1">
                            <div className='flex items-center gap-1'>
                              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Bot className="w-4 h-4" />
                                <span>CoE Assistant</span>
                              </div>

                              {msg.elapsedTime && (
                                  <div className="text-xs text-muted-foreground mb-1">
                                    ดำเนินการเสร็จสิ้น ใช้เวลาทั้งหมด {msg.elapsedTime.toFixed(2)} วินาที
                                  </div>
                              )}
                            </div>
                            <ReactMarkdown

                            >
                              {msg.text}
                            </ReactMarkdown>;



                          </div>
                      )}

                    </div>
                  </div>
              ))}
            </div>
        )}

        <div className="w-full xl:w-2/3 relative flex items-center bg-white rounded-full px-4 py-2">
          <Input
              placeholder="จะทำอะไรให้ดี?"
              ref={inputRef}
              disabled={inputLocked}
              onKeyPress={handleKeyPress}
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
        </div>
      </div>
  );
}
