"use client";

import React, { useState, useEffect } from "react";

// อาเรย์ของข้อความที่ต้องการแสดง
const phrases = [
    "Experience the future of communication.",
    "Connect with your loved ones seamlessly.",
    "Create amazing memories every day.",
    "Innovate your daily routine with cutting-edge AI."
];

export default function TypewriterLoop() {
    // เก็บ index ของข้อความปัจจุบัน
    const [loopNum, setLoopNum] = useState(0);
    // เก็บข้อความที่กำลังจะแสดง
    const [text, setText] = useState("");
    // เก็บ index ของตัวอักษรที่พิมพ์/ลบ
    const [charIndex, setCharIndex] = useState(0);
    // true = กำลังพิมพ์, false = กำลังลบ
    const [isTyping, setIsTyping] = useState(true);

    // กำหนดความเร็วในการพิมพ์/ลบ (หน่วยเป็นมิลลิวินาที)
    const typingSpeed = 90;    // เร็วในการพิมพ์
    const deletingSpeed = 30;   // เร็วในการลบ
    const pauseTime = 2000;     // เวลาหยุดพักหลังพิมพ์จบหรือหลังลบหมด

    useEffect(() => {
        // ถ้าประโยคปัจจุบันเป็น undefined ให้ข้ามป้องกัน error
        if (!phrases[loopNum]) return;

        let timer: NodeJS.Timeout;

        if (isTyping) {
            // กำลังพิมพ์
            if (charIndex < phrases[loopNum].length) {
                // พิมพ์ตัวอักษรเพิ่มทีละตัว
                timer = setTimeout(() => {
                    setText((prev) => prev + phrases[loopNum][charIndex]);
                    setCharIndex(charIndex + 1);
                }, typingSpeed);
            } else {
                // พิมพ์จบทั้งประโยคแล้ว → รอสักครู่แล้วค่อยลบ
                timer = setTimeout(() => {
                    setIsTyping(false);
                }, pauseTime);
            }
        } else {
            // กำลังลบ
            if (text.length > 0) {
                // ลบตัวอักษรทีละตัว
                timer = setTimeout(() => {
                    setText(text.slice(0, -1));
                }, deletingSpeed);
            } else {
                // ลบจนหมด → ไปยังประโยคถัดไป
                setIsTyping(true);
                setCharIndex(0);
                setLoopNum((prev) => (prev + 1) % phrases.length); // วนลูป
            }
        }

        return () => clearTimeout(timer);
    }, [text, isTyping, charIndex, loopNum]);

    return (
        <div className="text-xl text-gray-700">
            {text}
            <span className="blinking-cursor">|</span>
        </div>
    );
}
