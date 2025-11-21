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
            const userResponse = await fetch(`https://tracked.6minds.site/Student/DashboardStudentDB/get_student_info.php?id=${userIdFromStorage}`);
            
            // Fetch enrolled subjects
            const subjectsResponse = await fetch(`https://tracked.6minds.site/Student/SubjectsDB/get_student_classes.php?student_id=${userIdFromStorage}`);
            
            if (userResponse.ok && subjectsResponse.ok) {
              const userData = await userResponse.json();
              const subjectsData = await subjectsResponse.json();
              
              if (userData.success) {
                // Add enrolled subjects to user data
                const userWithSubjects = {
                  ...userData.user,
                  enrolled_subjects: subjectsData.success ? subjectsData.classes : []
                };
                setUserData(userWithSubjects);
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

  // Extract year level from tracked_yearandsec (e.g., "4D" -> "4th Year")
  const getYearLevel = () => {
    if (!userData?.tracked_yearandsec) return "N/A";
    
    // Extract the first character (the year number)
    const yearChar = userData.tracked_yearandsec.charAt(0);
    const yearNum = parseInt(yearChar);
    
    if (!isNaN(yearNum)) {
      const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
      return yearLevels[yearNum - 1] || `${yearNum}th Year`;
    } else {
      return userData.tracked_yearandsec;
    }
  };

  // Extract section from tracked_yearandsec (e.g., "4D" -> "D")
  const getSection = () => {
    if (!userData?.tracked_yearandsec) return "N/A";
    
    // Get everything except the first character (the section letter)
    const section = userData.tracked_yearandsec.substring(1);
    return section || "N/A";
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
          userName={userData ? `${userData.tracked_firstname} ${userData.tracked_lastname}` : "Loading..."} 
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

                  {/* Student ID */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Student ID :</span>
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

                  {/* Program */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Program :</span>
                    <span>{userData?.tracked_program || "N/A"}</span>
                  </div>

                  {/* Year Level */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Year Level :</span>
                    <span>{getYearLevel()}</span>
                  </div>

                  {/* Section */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Section :</span>
                    <span>{getSection()}</span>
                  </div>

                  {/* Temporary Password - UPDATED */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Temporary Password :</span>
                    <span className="font-semibold">{userData?.temporary_password || "N/A"}</span>
                  </div>
                </div>
              </div>

              <hr className="opacity-10 border-[#465746] mb-6" />

              {/* Academic Performance Information Section */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Academic Performance Information</h2>
                  <div className="space-y-3 sm:space-y-2">
                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                      <span className="font-medium text-gray-600">Subjects Enrolled :</span>
                      <span>
                        {userData?.enrolled_subjects && userData.enrolled_subjects.length > 0 
                          ? userData.enrolled_subjects.map((subject, index) => (
                              <div key={index} className="mb-1">
                                {subject.subject} ({subject.subject_code})
                              </div>
                            ))
                          : "No subjects enrolled"
                        }
                      </span>
                    </div>
                  </div>
              </div>

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
                    <span
                      className={`font-semibold ${
                        userData?.tracked_Status === "Active" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {userData?.tracked_Status || "N/A"}
                    </span>
                  </div>
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