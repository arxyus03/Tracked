import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import ClassManagementLight from '../../assets/ClassManagement(Light).svg';
import Settings from '../../assets/Settings(Light).svg';

export default function AccountSettingProf() {
  const [isOpen, setIsOpen] = useState(true);  
  const [popupType, setPopupType] = useState(null);

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* content of CLASS MANAGEMENT*/}
        <div className="p-5 text-[#465746]">

          {/* "Header" of CLASS MANAGEMENT */}
          <div className="flex">
            <img src={Settings} alt="Settings" className='color-[#465746] h-7 w-7 mr-5 mt-1' />
            <p className="font-bold text-[1.5rem]"> Account Settings </p>
          </div>

          <div className="flex text-[1.125rem]">
            <span> Update your Information </span>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          {/* Content */}

          <div className='flex gap-5'>
            {/* UPDATE ACCOUNT INFORMATION CARD */}
            <div className="bg-white rounded-md shadow-md p-6 space-y-4 mt-5 w-190">
              <p className="text-lg font-bold">Update Account Information</p>

              <div>
                <label className="block text-sm font-medium mb-1">Email Address:</label>
                <input type="email" placeholder="JaneDoe@CvSU.edu.ph" className="w-170 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number:</label>
                <input type="number" placeholder="09085536971" className="w-170 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password:</label>
                <input type="password" placeholder="•••••••" className="w-170 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"/>
              </div>

              <button className="w-50 bg-[#00A15D] text-white font-bold py-2 px-4 rounded-md hover:bg-green-800">
                Submit
              </button>
            </div>

            {/* NEW PASSWORD CARD */}
            <div className="bg-white rounded-md shadow-md p-6 space-y-4 mt-5 w-190">
              <p className="text-lg font-bold">Change Password</p>

              <div>
                <label className="block text-sm font-medium mb-1">Current Password:</label>
                <input type="password" placeholder="•••••••" className="w-170 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"/>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1"> New Password:</label>
                <input type="text" placeholder="Password" className="w-170 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"/>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1"> Re-Enter New Password:</label>
                <input type="password" placeholder="•••••••" className="w-170 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"/>
              </div>

              <button className="w-50 bg-[#00A15D] text-white font-bold py-2 px-4 rounded-md hover:bg-green-800">
                Submit
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
