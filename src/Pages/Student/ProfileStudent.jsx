import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import Profile from '../../assets/Profile(Dark).svg';
import BackButton from '../../assets/BackButton(Light).svg';

export default function ProfileStudent() {
  const [isOpen, setIsOpen] = useState(false);  
  const [popupType, setPopupType] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock Data (Front-end Only)
  const mockUserData = {
    tracked_fname: "Maria Angela",
    tracked_lname: "Santos",
    tracked_mi: "R",
    tracked_ID: "2021-105432",
    tracked_email: "maria.santos@cvsu.edu.ph",
    tracked_phone: "09171234567",
    tracked_course: "Bachelor of Science in Information Technology",
    tracked_program: "College of Computer Studies",
    tracked_year: "3rd Year",
    tracked_section: "BSIT 3-2",
    tracked_subjects: [
      "Web Systems and Technologies",
      "System Integration and Architecture",
      "Information Assurance and Security",
      "Mobile Application Development"
    ],
    tracked_tasks_completed: 18,
    tracked_tasks_pending: 4,
    tracked_tasks_missed: 2,
    tracked_Status: "Active",
    created_at: "2023-08-15",
    updated_at: "2025-01-10"
  };

  // Simulate Data Loading
  useEffect(() => {
    setTimeout(() => {
      setUserData(mockUserData);
      setLoading(false);
    }, 1000);
  }, []);

  // Format Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Get Full Name
  const getFullName = () => {
    if (!userData) return "Loading...";
    const { tracked_fname, tracked_lname, tracked_mi } = userData;
    return `${tracked_fname} ${tracked_mi ? tracked_mi + '.' : ''} ${tracked_lname}`;
  };

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`transition-all duration-300 ${
          isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"
        }`}
      >
        <Header 
          setIsOpen={setIsOpen} 
          isOpen={isOpen} 
          userName={userData ? `${userData.tracked_fname} ${userData.tracked_lname}` : "Loading..."} 
        />

        {/* Content of STUDENT ACCOUNT DETAILS */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={Profile}
                alt="Profile"
                className="h-7 w-7 sm:h-8 sm:w-8 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Profile
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              Account Details
            </p>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {loading ? (
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md text-center text-[#465746]">
              <p>Loading profile data...</p>
            </div>
          ) : (
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg space-y-4 sm:space-y-5 md:space-y-6 mt-4 sm:mt-5 shadow-md text-[#465746]">

              {/* Student Information Section */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Student Information</h2>
                <div className="space-y-3 sm:space-y-2">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Student Name:</span>
                    <span className="font-semibold">{getFullName()}</span>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Student Number (ID Number):</span>
                    <span className="font-semibold">{userData?.tracked_ID}</span>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">CVSU Email Address:</span>
                    <span className="font-semibold break-all">{userData?.tracked_email}</span>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Phone Number:</span>
                    <span className="font-semibold">{userData?.tracked_phone}</span>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Course:</span>
                    <span className="font-semibold">{userData?.tracked_course}</span>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Year Level:</span>
                    <span className="font-semibold">{userData?.tracked_year}</span>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Section:</span>
                    <span className="font-semibold">{userData?.tracked_section}</span>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Department:</span>
                    <span className="font-semibold">{userData?.tracked_program}</span>
                  </div>
                </div>
              </div>

              <hr className="opacity-10 border-[#465746] mb-6" />

              {/* Academic Information Section */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Academic Information</h2>
                <div className="space-y-3 sm:space-y-2">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Subjects Enrolled:</span>
                    <span className="font-semibold">
                      {userData?.tracked_subjects?.length > 0
                        ? userData.tracked_subjects.join(", ")
                        : "No subjects enrolled"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Tasks Completed:</span>
                    <span className="font-semibold">{userData?.tracked_tasks_completed}</span>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Tasks Pending:</span>
                    <span className="font-semibold">{userData?.tracked_tasks_pending}</span>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Tasks Missed:</span>
                    <span className="font-semibold">{userData?.tracked_tasks_missed}</span>
                  </div>
                </div>
              </div>

              <hr className="opacity-10 border-[#465746] mb-6" />

              {/* Account Information Section */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Account Information</h2>
                <div className="space-y-3 sm:space-y-2">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Date Created:</span>
                    <span className="font-semibold">{formatDate(userData?.created_at)}</span>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Last Update:</span>
                    <span className="font-semibold">{formatDate(userData?.updated_at)}</span>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Account Status:</span>
                    <span
                      className={`font-semibold ${
                        userData?.tracked_Status === "Active" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {userData?.tracked_Status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button 
                    onClick={() => setPopupType("reset")} 
                    className="font-bold text-white py-2 px-4 bg-[#00874E] rounded-md shadow-md text-center hover:bg-green-800 transition-colors text-sm sm:text-base cursor-pointer"
                  >
                    Reset Password
                  </button>

                  <button 
                    onClick={() => setPopupType("disable")}  
                    className="font-bold text-white py-2 px-4 bg-[#00874E] rounded-md shadow-md text-center hover:bg-green-800 transition-colors text-sm sm:text-base cursor-pointer"
                  >
                    Disable Account
                  </button>
                </div>
              </div>

              {/* Popup Components */}
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
          )}
        </div>
      </div>
    </div>
  );
}
