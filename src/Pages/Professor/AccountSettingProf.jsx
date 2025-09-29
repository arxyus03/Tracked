import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import ClassManagementLight from '../../assets/ClassManagement(Light).svg';
import Settings from '../../assets/Settings(Light).svg';

export default function AccountSettingProf() {
  const [isOpen, setIsOpen] = useState(false);  
  const [popupType, setPopupType] = useState(null);

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* content of ACCOUNT SETTINGS*/}
        <div className="p-3 sm:p-4 md:p-5 lg:p-5 xl:p-5">

          {/* "Header" of ACCOUNT SETTINGS */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 sm:mb-4">
            <div className='flex items-center mb-2 sm:mb-0'>
              <img 
                src={Settings} 
                alt="Settings" 
                className='h-7 w-7 sm:h-6 sm:w-7 md:h-7 md:w-7 mr-3 sm:mr-3 mt-0.5 ml-2' 
              />
              <p className="font-bold text-xl sm:text-xl md:text-xl lg:text-[1.5rem] text-[#465746]">
                Account Settings
              </p>
            </div>
          </div>

          <div className="text-sm sm:text-base md:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5 ml-2">
            <span>Update your Information</span>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          {/* Content */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mt-5'>
            
            {/* UPDATE ACCOUNT INFORMATION CARD */}
            <div className="bg-white rounded-md shadow-md p-4 sm:p-5 md:p-6 space-y-4">
              <p className="text-base sm:text-lg font-bold text-[#465746]">Update Account Information</p>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 text-[#465746]">Email Address:</label>
                <input 
                  type="email" 
                  placeholder="JaneDoe@CvSU.edu.ph" 
                  className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]" 
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 text-[#465746]">Phone Number:</label>
                <input 
                  type="number" 
                  placeholder="09085536971" 
                  className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 text-[#465746]">Password:</label>
                <input 
                  type="password" 
                  placeholder="•••••••" 
                  className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                />
              </div>

              <button className="w-full sm:w-auto bg-[#00A15D] text-white font-bold py-2 px-6 sm:px-8 rounded-md hover:bg-green-800 transition-colors text-sm sm:text-base cursor-pointer">
                Submit
              </button>
            </div>

            {/* CHANGE PASSWORD CARD */}
            <div className="bg-white rounded-md shadow-md p-4 sm:p-5 md:p-6 space-y-4">
              <p className="text-base sm:text-lg font-bold text-[#465746]">Change Password</p>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 text-[#465746]">Current Password:</label>
                <input 
                  type="password" 
                  placeholder="•••••••" 
                  className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 text-[#465746]">New Password:</label>
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 text-[#465746]">Re-Enter New Password:</label>
                <input 
                  type="password" 
                  placeholder="•••••••" 
                  className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                />
              </div>

              <button className="w-full sm:w-auto bg-[#00A15D] text-white font-bold py-2 px-6 sm:px-8 rounded-md hover:bg-green-800 transition-colors text-sm sm:text-base cursor-pointer">
                Submit
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}