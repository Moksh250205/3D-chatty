import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from '@gsap/react';
import { User, Bot } from 'lucide-react';

const ChatComponent = ({ messages = [], isOpen }) => {
  const chatRef = useRef(null);
  const messagesRefs = useRef([]);

  messagesRefs.current = [];

  const addToRefs = (el) => {
    if (el && !messagesRefs.current.includes(el)) {
      messagesRefs.current.push(el);
    }
  };

  useGSAP(() => {
    if (messagesRefs.current.length > 0) {
      const lastMessage = messagesRefs.current[messagesRefs.current.length - 1];
      
      gsap.fromTo(
        lastMessage,
        { 
          x: '100%', 
          opacity: 0 
        },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.3,
          ease: "power2.out"
        }
      );
    }
  }, [messages.length]);

  useGSAP(() => {
    if (chatRef.current) {
      if (isOpen) {
        gsap.to(chatRef.current, {
          x: 0,
          duration: 0.5,
          ease: "power3.out",
        });
      } else {
        gsap.to(chatRef.current, {
          x: "100%",
          duration: 0.5,
          ease: "power3.in",
        });
      }
    }
  }, [isOpen]);

  return (
    <div
      ref={chatRef}
      className="fixed top-0 right-0 h-screen w-[300px] bg-white/20 backdrop-blur-lg shadow-lg border border-white/10 rounded-l-xl p-4 overflow-y-auto z-40 translate-x-full"
    >
      <h2 className="text-xl font-semibold text-white mb-4">Chat</h2>
      <div className="space-y-4">
        {messages.map((message, index) => ( 
          <div
            key={index}
            ref={addToRefs}
            className={`flex items-start space-x-2 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "AI" && (
              <Bot size={24} className="text-blue-300 mt-1" />
            )}
            <div
              className={`max-w-[250px] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-white/30 text-gray-800"
                  : "bg-gray-800/50 text-white"
              }`}
            >
              {message.parts && message.parts.length > 0 ? message.parts[0].text : ""}
            </div>
            {message.role === "user" && (
              <User size={24} className="text-white" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatComponent;