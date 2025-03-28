import { NextRequest, NextResponse } from "next/server";
import { createCompletion } from "@/app/api/v1/chat/llm";
// import { error } from "console";
export async function POST(req: NextRequest) {
    const body = await req.json();
    const {message} = body;
    console.log(message);
    const completion = await createCompletion(message);
    if (!completion) {
        console.log("Generate Error")
        return NextResponse.json(
            { error: "Failed to generate completion" },
            { status: 500 },
        )
    }else{
        return NextResponse.json({ completion });
    }
}