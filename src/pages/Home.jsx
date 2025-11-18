import React, { useState } from 'react';

import { FcGoogle } from 'react-icons/fc';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/config/firebase';
import { useNavigate } from 'react-router-dom';
const Home = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login attempt:', { username, password });
  };

  const handleGoogleLogin = async () => {
    console.log('Google login clicked');
    try {
      // Use signInWithPopup with explicit popup mode
      const result = await signInWithPopup(auth, provider);
      console.log('Google login successful:', result);
      if (result.user) {
        navigate('/dashboard');
      }
      // result.user.email, displayName, photoURL...
    } catch (error) {
      // Handle specific Firebase errors
      console.log('Login error:', error);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-x-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(19, 16, 35, 0.6) 0%, rgba(19, 16, 35, 0.9) 100%), url("https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop")`,
        }}
      />

      {/* Content */}
      <div className="relative h-full items-center justify-center flex ">
        <div className="flex flex-col items-end justify-center w-full h-full">
          <div className="w-full md:w-[50%] min-h-full bg-[#131022]/30 items-center justify-center flex backdrop-blur-sm">
            {/* Login Card */}
            <div className="flex flex-col gap-8 w-[80%] rounded-lg border border-[#330df2]/20 bg-[#131022]/70 p-8 shadow-2xl shadow-[#330df2]/10 backdrop-blur-sm">
              {/* Header */}
              <div className="flex flex-col gap-2 text-center ">
                <h1 className="text-4xl font-black leading-tight tracking-tight text-white whitespace-nowrap">
                  LOGIN
                </h1>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-3 h-12 px-5 rounded bg-white text-gray-700 font-semibold transition-all hover:bg-gray-100 hover:shadow-lg"
              >
                <FcGoogle size={24} />
                <span>Sign in with Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
