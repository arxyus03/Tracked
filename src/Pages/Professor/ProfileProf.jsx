import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import Profile from '../../assets/Profile(Dark).svg';
import BackButton from '../../assets/BackButton(Light).svg';

export default function ProfileProf() {
  const [isOpen, setIsOpen] = useState(false);  
  const [popupType, setPopupType] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from database
    const fetchUserData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const userIdFromStorage = user.id;
          
          if (userIdFromStorage) {
            // Fetch complete user data from database
            const response = await fetch(`https://tracked.6minds.site/Professor/DashboardProfDB/get_class_count.php?id=${userIdFromStorage}`);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.success) {
                setUserData(data.user);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}`}
      >
        <Header 
          setIsOpen={setIsOpen} 
          isOpen={isOpen} 
          userName={userData ? `${userData.tracked_fname} ${userData.tracked_lname}` : "Loading..."} 
        />

        {/* content of ADMIN USER MANAGEMENT PROFESSOR ACCOUNT DETAILS */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* "Header" */}
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

          {/* Content */}
          {loading ? (
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md text-center text-[#465746]">
              <p>Loading profile data...</p>
            </div>
          ) : (
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg space-y-4 sm:space-y-5 md:space-y-6 mt-4 sm:mt-5 shadow-md text-[#465746]">
              {/* Professor Information Section */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Professor Information</h2>
                <div className="space-y-3 sm:space-y-2">
                  {/* First Name */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">First Name :</span>
                    <span>{userData?.tracked_firstname || "N/A"}</span>
                  </div>

                  {/* Middle Initial */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Middle Initial :</span>
                    <span>{userData?.tracked_middlename ? `${userData.tracked_middlename}` : "N/A"}</span>
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Last Name :</span>
                    <span>{userData?.tracked_lastname || "N/A"}</span>
                  </div>

                  {/* Sex */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Sex :</span>
                    <span>{userData?.tracked_gender || "N/A"}</span>
                  </div>

                  {/* Date of Birth */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Date of Birth :</span>
                    <span>{formatDate(userData?.tracked_bday)}</span>
                  </div>

                  {/* Professor ID */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Professor ID :</span>
                    <span>{userData?.tracked_ID || "N/A"}</span>
                  </div>

                  {/* CVSU Email Address */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">CVSU Email Address :</span>
                    <span>{userData?.tracked_email || "N/A"}</span>
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Phone Number :</span>
                    <span>{userData?.tracked_phone || "N/A"}</span>
                  </div>

                  {/* Temporary Password */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Temporary Password :</span>
                    <span className="font-semibold">{userData?.temporary_password || "N/A"}</span>
                  </div>
                </div>
              </div>

              <hr className="opacity-10 border-[#465746] rounded border-1 mb-6" />

              {/* Professional Information Section */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Professional Information</h2>
                <div className="space-y-3 sm:space-y-2">
                  {/* Department - Left empty as requested */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Department :</span>
                    <span>{userData?.tracked_program || "N/A"}</span>
                  </div>
                  
                  {/* Subject Handled */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Subject Handled :</span>
                    <span>
                      {userData?.handled_subjects && userData.handled_subjects.length > 0 
                        ? userData.handled_subjects.join(", ") 
                        : "No subjects assigned"}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="opacity-10 border-[#465746] rounded border-1 mb-6" />

              {/* Account Information Section */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Account Information</h2>
                <div className="space-y-3 sm:space-y-2">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Date Created :</span>
                    <span>{formatDate(userData?.created_at)}</span>
                  </div>
                  
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Last Update :</span>
                    <span>{formatDate(userData?.updated_at)}</span>
                  </div>
                  
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Account Status :</span>
                    <span className={`font-semibold ${
                      userData?.tracked_Status === 'Active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {userData?.tracked_Status || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {/* <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4"> */}
                  {/* Reset Password */}
                  {/* <button 
                    onClick={() => setPopupType("reset")} 
                    className="font-bold text-white py-2 px-4 bg-[#00874E] rounded-md shadow-md text-center border-2 border-transparent hover:bg-green-800 transition-colors duration-200 text-xs sm:text-sm lg:text-[1.125rem] w-full sm:w-auto transition-colors duration-200 cursor-pointer"
                  >
                    Reset Password
                  </button> */}

                  {/* Disable Account */}
                  {/* <button 
                    onClick={() => setPopupType("disable")}  
                    className="font-bold text-white py-2 px-4 bg-[#00874E] rounded-md shadow-md text-center border-2 border-transparent hover:bg-green-800 transition-colors duration-200 text-xs sm:text-sm lg:text-[1.125rem] w-full sm:w-auto transition-colors duration-200 cursor-pointer"
                  >
                    Disable Account
                  </button>
                </div>
              </div> */}

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
          )}
        </div>
      </div>
    </div>
  );
}