import React from 'react'
import { Link } from 'react-router-dom';

import Guide from '../../assets/Guide(Light).svg';

export default function Signup() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-[#465746]">

      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-3xl text-[1.125rem]">
        
        <div className="flex justify-end mb-2">
          <img src={Guide} alt="Guide" className="cursor-pointer" />
        </div>

        <h1 className="text-2xl font-black text-center">TrackED</h1>
        <p className="text-center mb-2 text-[0.875rem]">
          Cavite State University - Imus Campus
        </p>

        <hr className="my-4 border-dotted border-gray-300" />

        {/* Section Title */}
        <div className="flex items-center gap-2">
          <img src={Guide} alt="Guide" className="h-5 w-5" />
          <p className="font-semibold">Account Creation</p>
        </div>
        <p className="mb-6 ml-6 text-[0.875rem] text-gray-600">
          Make sure your Student Number is recorded in CVSU - Imus Campus.
        </p>

        {/* ID & Program */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-[0.875rem] mb-1">ID Number:</p>
            <input type="text" placeholder="202284596" required pattern="[0-9]*" inputMode="numeric" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"/>
          </div>
          <div>
            <p className="text-[0.875rem] mb-1">Program:</p>
            <input type="text" placeholder="Information Technology" disabled 
            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500"/>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-3 gap-4 mb-4">

          <div>
            <p className="text-[0.875rem] mb-1">Firstname:</p>
            <input type="text" placeholder="Firstname" required 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]" />
          </div>

          <div>
            <p className="text-[0.875rem] mb-1">Lastname:</p>
            <input type="text" placeholder="Lastname" required 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]" />
          </div>

          <div>
            <p className="text-[0.875rem] mb-1">Middle Initial:</p>
            <input type="text" placeholder="M.I" maxLength="1" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]" />
          </div>

        </div>

        {/* DOB & Phone */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-[0.875rem] mb-1">Date of Birth:</p>
            <input type="date" required 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]" />
          </div>

          <div>
            <p className="text-[0.875rem] mb-1">Phone Number:</p>
            <input type="text" placeholder="+63" required 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]" />
          </div>

        </div>

        {/* Email */}
        <div className="mb-4">
          <p className="text-[0.875rem] mb-1">CVSU Email Address:</p>
          <input type="email" placeholder="JaneDoe@cvsu.edu.ph" required 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]" />
        </div>

        {/* Password & Confirm */}
        <div className="grid grid-cols-2 gap-4 mb-6">

          <div>
            <p className="text-[0.875rem] mb-1">Password:</p>
            <input type="password" placeholder="Password" required 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]" />
          </div>

          <div>
            <p className="text-[0.875rem] mb-1">Confirm Password:</p>
            <input type="password" placeholder="Re-enter password" required 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]" />
          </div>

        </div>

        {/* Register Button */}
        <button type="submit" className="w-full bg-[#00A15D] hover:bg-green-700 text-white py-2 rounded font-bold mb-4">
          Register
        </button>

        {/* Login */}
        <div className="text-center text-sm">
          <span>Already have an account? </span>
          <Link to="/Login" className="text-[#00A15D] font-semibold cursor-pointer">
            Log In
          </Link>
        </div>

      </div>
      
    </div>
  )
}
