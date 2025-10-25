import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import ClassManagementLight from '../../assets/ClassManagement(Light).svg';
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
            const response = await fetch(`http://localhost/TrackEd/src/Pages/Professor/DashboardProfDB/getUserDataProf.php?id=${userIdFromStorage}`);
            
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

  // Get full name
  const getFullName = () => {
    if (!userData) return "Loading...";
    const { tracked_fname, tracked_lname, tracked_mi } = userData;
    return `${tracked_fname} ${tracked_mi ? tracked_mi + '.' : ''} ${tracked_lname}`;
  };

  // Check if there are handled subjects
  const hasHandledSubjects = userData?.handled_subjects && userData.handled_subjects.length > 0;

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
        <div className="p-3 sm:p-4 md:p-5 lg:p-5 xl:p-5">
          {/* "Header" */}
          <div className="flex flex-col sm:flex-row item-start sm:items-center mb-2 sm:mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <img
                src={ClassManagementLight}
                alt="ClassManagement"
                className="h-7 w-7 sm:h-6 sm:w-7 md:h-7 md:w-7 mr-3 sm:mr-3 mt-0.5 ml-2"
              />
              <h1 className="font-bold text-xl sm:text-xl md:text-xl lg:text-[1.5rem] text-[#465746]">
                Profile
              </h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm sm:text-base md:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5 ml-2">
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
              <span className="mb-0 sm:mb-0">
                Account Details
              </span>
              <Link to="/UserManagementProfessorAccounts" className="sm:hidden">
                <img src={BackButton} alt="BackButton" className="h-6 w-6" />
              </Link>
            </div>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mb-6" />

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
                  {/* Mobile: Stacked layout, Desktop: Grid layout */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-y-2 text-sm sm:text-base md:text-lg">
                    <div className="flex flex-col sm:contents">
                      <span className="font-medium sm:font-normal text-xs sm:text-base text-gray-600 sm:text-[#465746]">Professor Name:</span>
                      <span className="font-semibold sm:font-normal text-sm sm:text-base mb-2 sm:mb-0">
                        {getFullName()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-y-2 text-sm sm:text-base md:text-lg">
                    <div className="flex flex-col sm:contents">
                      <span className="font-medium sm:font-normal text-xs sm:text-base text-gray-600 sm:text-[#465746]">Faculty ID (ID Number):</span>
                      <span className="font-semibold sm:font-normal text-sm sm:text-base mb-2 sm:mb-0">
                        {userData?.tracked_ID || "N/A"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-y-2 text-sm sm:text-base md:text-lg">
                    <div className="flex flex-col sm:contents">
                      <span className="font-medium sm:font-normal text-xs sm:text-base text-gray-600 sm:text-[#465746]">CVSU Email Address:</span>
                      <span className="font-semibold sm:font-normal text-sm sm:text-base mb-2 sm:mb-0 break-all sm:break-normal">
                        {userData?.tracked_email || "N/A"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-y-2 text-sm sm:text-base md:text-lg">
                    <div className="flex flex-col sm:contents">
                      <span className="font-medium sm:font-normal text-xs sm:text-base text-gray-600 sm:text-[#465746]">Phone Number:</span>
                      <span className="font-semibold sm:font-normal text-sm sm:text-base mb-2 sm:mb-0">
                        {userData?.tracked_phone || "N/A"}
                      </span>
                    </div>
                  </div>
            
                </div>
              </div>

              <hr className="opacity-10 border-[#465746] rounded border-1 mb-6" />

              {/* Professional Information Section */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Professional Information</h2>
                <div className="space-y-3 sm:space-y-2">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-y-2 text-sm sm:text-base md:text-lg">
                    <div className="flex flex-col sm:contents">
                      <span className="font-medium sm:font-normal text-xs sm:text-base text-gray-600 sm:text-[#465746]">Department:</span>
                      <span className="font-semibold sm:font-normal text-sm sm:text-base mb-2 sm:mb-0">
                        {userData?.tracked_program || "N/A"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-y-2 text-sm sm:text-base md:text-lg">
                    <div className="flex flex-col sm:contents">
                      <span className="font-medium sm:font-normal text-xs sm:text-base text-gray-600 sm:text-[#465746]">Subject Handled:</span>
                      <span className="font-semibold sm:font-normal text-sm sm:text-base mb-2 sm:mb-0">
                        {hasHandledSubjects ? userData.handled_subjects.join(", ") : "No subjects assigned"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="opacity-10 border-[#465746] rounded border-1 mb-6" />

              {/* Account Information Section */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Account Information</h2>
                <div className="space-y-3 sm:space-y-2">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-y-2 text-sm sm:text-base md:text-lg">
                    <div className="flex flex-col sm:contents">
                      <span className="font-medium sm:font-normal text-xs sm:text-base text-gray-600 sm:text-[#465746]">Date Created:</span>
                      <span className="font-semibold sm:font-normal text-sm sm:text-base mb-2 sm:mb-0">
                        {formatDate(userData?.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-y-2 text-sm sm:text-base md:text-lg">
                    <div className="flex flex-col sm:contents">
                      <span className="font-medium sm:font-normal text-xs sm:text-base text-gray-600 sm:text-[#465746]">Last Update:</span>
                      <span className="font-semibold sm:font-normal text-sm sm:text-base mb-2 sm:mb-0">
                        {formatDate(userData?.updated_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-y-2 text-sm sm:text-base md:text-lg">
                    <div className="flex flex-col sm:contents">
                      <span className="font-medium sm:font-normal text-xs sm:text-base text-gray-600 sm:text-[#465746]">Account Status:</span>
                      <span className={`font-semibold text-sm sm:text-base mb-2 sm:mb-0 ${
                        userData?.tracked_Status === 'Active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {userData?.tracked_Status || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Reset Password */}
                  <button 
                    onClick={() => setPopupType("reset")} 
                    className="font-bold text-white py-2 px-4 bg-[#00874E] rounded-md shadow-md text-center border-2 border-transparent hover:bg-green-800 transition-colors duration-200 text-xs sm:text-sm lg:text-[1.125rem] w-full sm:w-auto transition-colors duration-200 cursor-pointer"
                  >
                    Reset Password
                  </button>

                  {/* Disable Account */}
                  <button 
                    onClick={() => setPopupType("disable")}  
                    className="font-bold text-white py-2 px-4 bg-[#00874E] rounded-md shadow-md text-center border-2 border-transparent hover:bg-green-800 transition-colors duration-200 text-xs sm:text-sm lg:text-[1.125rem] w-full sm:w-auto transition-colors duration-200 cursor-pointer"
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
          )}
        </div>
      </div>
    </div>
  );
}