import React, { useState, useRef, useContext } from "react";
import { Canvas } from "@react-three/fiber";
import { ChevronLeft } from "lucide-react";
import { gsap } from "gsap";
import axios from "axios";
import { Experience } from "../components/Experience";
import UserInput from "../components/UserInput";
import ChatComponent from "../components/ChatComponent";
import { useGSAP } from "@gsap/react";
import { AnimationContext } from "../context/AnimationContext";

const timeOuts = {
    Bashful: 10,
    StandingGreeting: 3,
    FlyingKiss: 5,
    Clap: 3,
    BellyDance: 20,
    SillyDance: 7,
    Kiss: 8,
    Thinking: 8,
    Agreeing: 3, 
    Singing: 18, 
    Upset: 30, 
};

export const Home = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [input, setInput] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [currentSpeech, setCurrentSpeech] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const chevronRef = useRef(null);
    const avatarRef = useRef(null);
    const [animation, setAnimation] = useContext(AnimationContext);

    useGSAP(() => {
        setAnimation('Idle'); 
        if (chevronRef.current) {
            if (isChatOpen) {
                gsap.to(chevronRef.current, {
                    x: -300,
                    duration: 0.5,
                    ease: "power3.out",
                });
            } else {
                gsap.to(chevronRef.current, {
                    x: 0,
                    duration: 0.5,
                    ease: "power3.in",
                });
            }
        }
    }, [isChatOpen]);

    const toggleChat = () => setIsChatOpen(!isChatOpen);

    const handleSubmit = async () => {
        if (!input.trim()) return;

        const updatedChatHistory = [
            ...chatHistory,
            { role: "user", parts: [{ text: input }] },
        ];

        setChatHistory(updatedChatHistory);

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/gemini`, {
                prompt: input
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setChatHistory(prevHistory => [
                ...prevHistory,
                { role: "model", parts: [{ text: response.data.message }] },
            ]);

            setInput("");

            // Handle animation and speech
            setAnimation({
                name: response.data.function,
                timeOut: timeOuts[response.data.function],
            });

            // Start speaking animation with the response message
            setCurrentSpeech(response.data.message);
            setIsSpeaking(true);

            // Play audio if available
            if (response.data.audioUrl) {
                const audio = new Audio(response.data.audioUrl);
                audio.play()
                    .then(() => console.log('Audio is playing'))
                    .catch((error) => console.error('Error playing audio:', error));
            }

        } catch (error) {
            console.error("Error generating response:", error);
        }
    };

    const handleSpeechEnd = () => {
        setIsSpeaking(false);
        setCurrentSpeech("");
    };

    return (
        <div>
            <img src="/Background.jpg" className="fixed blur-[2px] h-dvh w-dvw" alt="bgImage" />

            <div className="fixed h-dvh w-dvw">
                <Canvas shadows camera={{ position: [0, 1, 8.5], fov: 15 }}>
                    <color attach="forest" args={["#ececec"]} />
                    <Experience 
                        speechText={currentSpeech}
                        isSpeaking={isSpeaking}
                        onSpeechEnd={handleSpeechEnd}
                    />
                </Canvas>

                <UserInput setInput={setInput} input={input} handleSubmit={handleSubmit} />

                <ChatComponent isOpen={isChatOpen} messages={chatHistory} />

                <button
                    ref={chevronRef}
                    onClick={toggleChat}
                    className="fixed top-1/2 right-0 z-50 transform -translate-y-1/2 bg-white/20 backdrop-blur-lg p-2 rounded-l-xl border border-white/10"
                >
                    <ChevronLeft
                        size={24}
                        className={`${isChatOpen ? "rotate-180" : ""} transition-transform`}
                    />
                </button>
            </div>
        </div>
    );
};