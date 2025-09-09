import React from 'react'
import { Link } from 'react-router-dom';

import Guide from '../../assets/Guide(Light).svg';

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-[#465746]">
      <div className="bg-[#fff] p-10 rounded-lg shadow-md w-full max-w-md text-[1.125rem]">
        
        <div className="flex justify-end">
          <img src={Guide} alt="Guide" className="cursor-pointer" />
        </div>

        <h1 className="text-[1.5rem] font-black text-center">TrackED</h1>
        <p className="text-center mb-6 text-[0.875rem]">
          Cavite State University - Imus Campus
        </p>

        {/* ID Number */}
        <label className="block mb-1 text-[0.875rem] mt-10">ID Number:</label>
        <input type="text" placeholder="202284596" required pattern="[0-9]*" inputMode="numeric" className="w-full px-3 py-2 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
        />

        {/* Password */}
        <label className="block mb-1 text-[0.875rem]">Password:</label>
        <input type="password" placeholder="Password" required className="w-full px-3 py-2 border border-gray-300 rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-[#00A15D]"/>

        <p className="text-sm text-[#00A15D] cursor-pointer mb-4">
          Forgot Password?
        </p>

        {/* Button */}
        <button type="submit" className="w-full h-12 bg-[#00A15D] hover:bg-green-700 text-white py-2 rounded-md font-bold mt-5 text-[1.5rem]">
          Log In
        </button>

        {/* Register link */}
        <div className="text-center mt-4 text-sm">
          <span>Don’t have an account? </span>
          <Link to={"/Signup"}>
            <span className="text-[#00A15D] font-semibold cursor-pointer">
              Register Here
            </span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-gray-600">About Us</p>
    </div>
  );
}
