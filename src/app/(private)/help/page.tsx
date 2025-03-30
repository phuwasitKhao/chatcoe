"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight} from "lucide-react";

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
        <div className="min-h-screen p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header Section */}
            <header className="text-center mb-16 pt-8">
              <h1 className="text-5xl font-bold text-purple-900 mb-6">Help Center</h1>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Welcome to the RAG Chatbot Help Page! Here's everything you need to get started and make the most of your experience.
              </p>
            </header>
    
            {/* Card Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 ">
              {/* About Card */}
              <div className="bg-gradient-to-b from-purple-50 to-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-purple-900 ml-4">About the RAG Chatbot</h2>
                </div>
                <p className="text-gray-700">
                  The RAG Chatbot helps you find relevant information by retrieving documents and generating human-like responses
                  tailored to your needs.
                </p>
              </div>
    
              {/* How to Use Card */}
              <div className="bg-gradient-to-b from-purple-50 to-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-purple-900 ml-4">How to Use</h2>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">1</span>
                    Type your question or request into the chat input box.
                  </li>
                  <li className="flex items-center">
                    <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">2</span>
                    Press <kbd className="bg-gray-200 px-2 py-1 rounded text-sm inline-flex items-center ml-2 mr-2">
                        <ArrowRight className="w-5 h-5" />
                    </kbd> or click the Send button.
                  </li>
                  <li className="flex items-center">
                    <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">3</span>
                    The chatbot will analyze your request and respond info.
                  </li>
                </ul>
              </div>
            </div>
    
            {/* FAQ Section */}
            <section className="bg-gradient-to-b from-purple-50 to-white rounded-xl shadow-lg p-8 mb-16">
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-purple-900 ml-4">Frequently Asked Questions</h2>
              </div>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">What is RAG?</h3>
                  <p className="text-gray-700">
                    RAG stands for Retrieval-Augmented Generation. It combines searching documents and generating answers to provide accurate, context-aware responses.
                  </p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Can I ask anything?</h3>
                  <p className="text-gray-700">
                    Absolutely! You can ask a wide range of questions. Just keep in mind the chatbot responds based on what it's been trained or connected to.
                  </p>
                </div>
              </div>
            </section>
    
            {/* Contact Section */}
            <section className="bg-gradient-to-b from-purple-50 to-white rounded-xl shadow-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-purple-900 mb-3">Contact Us</h2>
              <p className="text-gray-700">
                Need help? Reach out to us at{" "}
                <a
                  href="mailto:support@ragchatbot.com"
                  className="text-purple-800 font-medium hover:text-purple-600 transition"
                >
                  support@ragchatbot.com
                </a>
              </p>
            </section>
          </div>
        </div>
      );
    };

export default AboutPage