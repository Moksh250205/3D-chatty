import React, { useContext, useState } from 'react';
import { AnimationContext } from '../context/AnimationContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Calendar, Users } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import axios from 'axios'; 
import {  userDataContext } from '../context/UserContext';

const Register = ({setisRegister}) => {
  const [userData, setUserData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    age: '', 
    gender: '' 
  });
  const formRef = React.useRef(null);
  const [animation, setAnimation] = useContext(AnimationContext);
  const {user, setUser} = useContext(userDataContext); 
  const navigate = useNavigate();  

  useGSAP(() => {
    gsap.to(".form-input", {
      duration: 0.8,
      opacity: 1,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.3
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });

    gsap.to(e.target, {
      duration: 0.3,
      borderColor: "#269977", 
      scale: 1.05,
      ease: "power1.out"
    });
  };

  const handleBlur = (e) => {
    gsap.to(e.target, {
      duration: 0.3,
      borderColor: "#ccc",
      scale: 1,
      ease: "power1.out"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, userData); 
      localStorage.setItem('token', response.data.token); 
      localStorage.setItem('user', JSON.stringify(response.data.user)); 
      setUser(response.data.user); 
      navigate('/home'); 
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    }

    gsap.to(formRef.current, {
      scale: 1.02,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  };

  const inputBaseClass = "form-input relative flex items-center p-4 bg-white/10 text-gray-700 placeholder-gray-400 rounded-lg focus-within:bg-white/20 transition-all duration-300 border border-gray-700 backdrop-blur-md";
  const iconClass = "absolute left-3 h-5 w-5 text-gray-700";
  const inputClass = "w-full pl-10 text-gray-700 bg-transparent border-none outline-none focus:ring-0 placeholder-gray-400";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col w-[380px] space-y-5 p-8 rounded-xl shadow-2xl border border-gray-700 bg-transparent backdrop-blur-md"
    >
      <h2 className="text-3xl font-semibold text-gray-700 text-center mb-2">Register</h2>
      
      <div className={inputBaseClass}>
        <User className={iconClass} />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={userData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={inputClass}
        />
      </div>

      <div className={inputBaseClass}>
        <Calendar className={iconClass} />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={userData.age}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          min="0"
          max="150"
          className={inputClass}
        />
      </div>

      <div className={`${inputBaseClass} !p-3`}>
        <Users className={iconClass} />
        <select
          name="gender"
          value={userData.gender}
          onChange={handleChange}
          required
          className={`${inputClass} ml-7 py-1`}
        >
          <option value="" className="bg-gray-800">Select Gender</option>
          <option value="male" className="bg-gray-800">Male</option>
          <option value="female" className="bg-gray-800">Female</option>
          <option value="prefer-not-to-say" className="bg-gray-800">Prefer not to say</option>
        </select>
      </div>

      <div className={inputBaseClass}>
        <Mail className={iconClass} />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={userData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={inputClass}
        />
      </div>

      <div className={inputBaseClass}>
        <Lock className={iconClass} />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={userData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="mt-4 py-4 px-6 bg-gray-900 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.98] border border-gray-700"
      >
        Create Account
      </button>

      <p className="text-gray-700 text-sm text-center">
        Already have an account? 
        <button onClick={() => {
          setisRegister(false); 
        }} className="text-gray-400 hover:text-gray-700 transition-all duration-300 ml-1">Sign in</button>
      </p>
    </form>
  );
};

export default Register;
