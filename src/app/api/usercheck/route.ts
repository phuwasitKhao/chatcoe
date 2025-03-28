// import { NextResponse } from 'next/server'
// import { connectMongoDB } from '../../../../lib/mongodb';
// import User from '../../../../models/user';

// export async function POST(req) {
//     try {

//         await connectMongoDB();
//         const { email } = await req.json();
//         const user = await User.findOne({ email }).select("_id");
//         console.log("User: ", user)

//         return NextResponse.json({ user })

//     } catch(error) {
//         console.error("Error: ", error);
//         return NextResponse.json({ message: "An error occured while registering the user." }, { status: 500 })
//     }
// }

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    await connectDB();
    
    const user = await User.findOne({ email });
    
    return NextResponse.json({ user: user ? true : false });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}