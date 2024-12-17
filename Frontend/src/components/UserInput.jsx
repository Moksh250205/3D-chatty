import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react'; 

const UserInput = ({ setInput, handleSubmit }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setInput(value); 
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      console.log("User pressed Enter:", inputValue);
      setInputValue(''); 
      handleSubmit(); 
    }
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
        onClick={() => {setInputValue(''); 
            handleSubmit()}}
        className="bg-transparent border-none text-white p-2 rounded-full hover:bg-white/20 transition duration-300"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};


export default UserInput;
