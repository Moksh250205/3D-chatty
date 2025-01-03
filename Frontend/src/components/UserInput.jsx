import React, { useState } from 'react';
import { ChevronRight, Mic, MicOff } from 'lucide-react';

const UserInput = ({ setInput, handleSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setInput(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      console.log('User pressed Enter:', inputValue);
      setInputValue('');
      handleSubmit();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log('Speech recognized:', transcript);
    setInputValue(transcript);
    setInput(transcript);
    setIsListening(false);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-2xl p-3 bg-gradient-to-r from-white/30 to-white/10 backdrop-blur-xl border border-white/40 rounded-full shadow-lg shadow-black/20 hover:shadow-black/30 transition-shadow duration-300 flex items-center space-x-3">
      <input
        type="text"
        className="w-full bg-transparent border-none outline-none text-white text-lg placeholder-gray-300 px-5"
        placeholder="Type your message here..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={handleMicClick}
        className={`bg-transparent border-none text-white p-2 rounded-full ${
          isListening ? 'bg-red-500/70' : 'hover:bg-white/20'
        } transition duration-300`}
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </button>
      <button
        onClick={() => {
          setInputValue('');
          handleSubmit();
        }}
        className="bg-transparent border-none text-white p-2 rounded-full hover:bg-white/20 transition duration-300"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default UserInput;
