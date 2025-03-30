// import { NextResponse } from 'next/server'
// import { connectMongoDB } from '../../../../lib/mongodb';
// import User from '../../../../models/user';
// import bcrypt from 'bcryptjs'

// export async function POST(req) {
//     try {

//         const { name, email, password } = await req.json();
//         const hashedPassword = await bcrypt.hash(password, 10);

//         await connectMongoDB();
//         await User.create({ name, email, password: hashedPassword });

//         return NextResponse.json({ message: "User registered." }, { status: 201 })

//     } catch {
//         return NextResponse.json({ message: "An error occured while registering the user." }, { status: 500 })

//     }
// }


import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    await connectDB();
    
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }
    
    const hashedPassword = await hash(password, 10);
    
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await newUser.save();
    
    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}