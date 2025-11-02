import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import ClassManagementLight from '../../assets/ClassManagement(Light).svg';
import BackButton from '../../assets/BackButton(Light).svg';

export default function UserManagement_ProfessorAccountDetails() {
  const [isOpen, setIsOpen] = useState(false);  
  const [popupType, setPopupType] = useState(null);

  return (
    <div>
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`
        transition-all duration-300
        ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}
      `}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* content of ADMIN USER MANAGEMENT PROFESSOR ACCOUNT DETAILS */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* "Header" */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={ClassManagementLight}
                alt="ClassManagement"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                User Management
              </h1>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>Professor Account Details</span>
              <Link to="/UserManagementProfessorAccounts">
                <img
                  src={BackButton}
                  alt="BackButton"
                  className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 hover:opacity-70 transition-opacity sm:hidden"
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Content */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl space-y-5 sm:space-y-6 shadow-md text-[#465746]">
            {/* Professor Information Section */}
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                Professor Information
              </h2>
              <div className="space-y-3 sm:space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Professor Name:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">
                    Firstname Middlename Middle Initial Lastname
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Faculty ID (ID Number):
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">202210718</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    CVSU Email Address:
                  </span>
                  <span className="sm:col-span-2 text-[#465746] break-all sm:break-normal">
                    Lastname@cvsu.edu.ph
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Phone Number:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">09606584521</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Age:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">X</span>
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                Professional Information
              </h2>
              <div className="space-y-3 sm:space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Department:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">
                    Information Technology (IT)
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Subject Handled:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">ITEC100A, ITEC200A</span>
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                Account Information
              </h2>
              <div className="space-y-3 sm:space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Date Created:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">September 3, 2025</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Last Login:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">September 3, 2025</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Account Status:
                  </span>
                  <span className="sm:col-span-2 font-bold text-green-600">Active</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 sm:pt-5 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Reset Password */}
                <button 
                  onClick={() => setPopupType("reset")} 
                  className="font-bold text-white py-2.5 px-4 sm:px-6 bg-[#00874E] rounded-md shadow-md text-center hover:bg-[#006F3A] text-sm sm:text-base w-full sm:w-auto transition-colors duration-200 cursor-pointer"
                >
                  Reset Password
                </button>

                {/* Disable Account */}
                <button 
                  onClick={() => setPopupType("disable")}  
                  className="font-bold text-white py-2.5 px-4 sm:px-6 bg-[#FF6666] rounded-md shadow-md text-center hover:bg-[#E55555] text-sm sm:text-base w-full sm:w-auto transition-colors duration-200 cursor-pointer"
                >
                  Disable Account
                </button>
              </div>
            </div>

            {/* Popup */}
            {popupType === "reset" && (
              <Popup 
                setOpen={() => setPopupType(null)} 
                message="Do you really want to reset this password?" 
                confirmText="Reset" 
                buttonColor="#00874E" 
                hoverColor="#006F3A" 
              />
            )}

            {popupType === "disable" && (
              <Popup 
                setOpen={() => setPopupType(null)} 
                message="Are you sure you want to disable this account?" 
                confirmText="Disable" 
                buttonColor="#FF6666" 
                hoverColor="#C23535" 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}