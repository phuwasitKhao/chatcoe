"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "./page.css";


const AboutPage = () => {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div>Loading...</div>;
    }
    return (
        <div className="help-page h-[calc(100vh-57px)] flex flex-col items-center justify-center p-4 bg-gray-100">
            <h1 className="text-3xl font-bold text-center ">Help</h1>
            <p className="mb-4">Welcome to the RAG Chatbot Help Page!</p>
            <section className="help-section">
                <h2 className="text-lg font-semibold">About the RAG Chatbot</h2>
                <p>The RAG Chatbot is designed to assist you with information and tasks by retrieving relevant documents and generating responses.</p>
            </section>
            <section className="help-section">
                <h2 className="text-lg font-semibold">How to Use</h2>
                <ul>
                    <li>Type your question or request into the chat input box.</li>
                    <li>Press Enter or click the Send button to submit your query.</li>
                    <li>The chatbot will process your request and provide a response based on the retrieved information.</li>
                </ul>
            </section>
            <section className="help-section">
                <h2 className="text-lg font-semibold">Frequently Asked Questions (FAQs)</h2>
                <h3 className=" font-semibold">What is RAG?</h3>
                <p>RAG stands for Retrieval-Augmented Generation, which is a type of chatbot that combines information retrieval and text generation to provide more accurate and contextually relevant responses.</p>
                <h3 className=" font-semibold">Can I ask anything?</h3>
                <p>Yes, you can ask a wide range of questions. However, the chatbot's responses are based on the information it has been trained on, so some questions may not be answered as accurately.</p>
            </section>
            <section className="help-section">
                <h2 className="text-lg font-semibold">Contact Us</h2>
                <p>If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:support@ragchatbot.com">support@ragchatbot.com</a>.</p>
            </section>
        </div>
    );
};

export default AboutPage