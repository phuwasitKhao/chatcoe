import { NextRequest, NextResponse } from "next/server";
import { createStreamingCompletion } from "@/app/api/v1/chat/llm";
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { message } = body;
    console.log(message);
    const completion = await createStreamingCompletion(message);
    if (!completion) {
        console.log("Generate Error")
        return NextResponse.json(
            { error: "Failed to generate completion" },
            { status: 500 }
        )
    }

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
        async start(controller) {
            const onPart = async (part: any) => {
                if (part.choices && part.choices[0]?.delta?.content) {
                    const text = part.choices[0].delta.content;
                    controller.enqueue(encoder.encode(text));
                }
            };

            // Process the stream
            try {
                for await (const part of completion) {
                    await onPart(part);
                }
                controller.close();
            } catch (error) {
                console.error("Stream processing error:", error);
                controller.error(error);
            }
        },
    });
    return new Response(customStream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}