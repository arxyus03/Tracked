import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Profile from "../../assets/Profile.svg";
import BackButton from "../../assets/BackButton.svg";
import CopyIcon from "../../assets/Copy.svg";

export default function ProfileProf() {
  const [isOpen, setIsOpen] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme detection
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Check initial theme
    handleThemeChange();
    
    // Listen for theme changes
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
            const response = await fetch(
              `https://tracked.6minds.site/Professor/DashboardProfDB/get_class_count.php?id=${userIdFromStorage}`
            );

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
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const copyToClipboard = (text) => {
    if (!text || text === "N/A") return;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed: ', err);
      }
      document.body.removeChild(textArea);
    });
  };

  // Theme-based colors
  const getBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getCardBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-white" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-white/80" : "text-gray-600";
  };

  const getLabelTextColor = () => {
    return isDarkMode ? "text-white/70" : "text-gray-600";
  };

  const getDividerColor = () => {
    return isDarkMode ? "border-white/30" : "border-gray-200";
  };

  const getSectionDividerColor = () => {
    return isDarkMode ? "border-white/10" : "border-gray-100";
  };

  const getTooltipBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-800";
  };

  const getCopyButtonHoverColor = () => {
    return isDarkMode ? "hover:bg-[#767EE0]/20" : "hover:bg-[#767EE0]/10";
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${getBackgroundColor()}`}>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div
          className={`transition-all duration-300 ${
            isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"
          }`}
        >
          <Header
            setIsOpen={setIsOpen}
            isOpen={isOpen}
            userName="Loading..."
          />
          <div className="p-4 sm:p-5 md:p-6 lg:p-8">
            <div className={`p-4 rounded-lg shadow-md text-center ${getCardBackgroundColor()}`}>
              <p className={getSecondaryTextColor()}>Loading profile data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getBackgroundColor()}`}>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`transition-all duration-300 ${
          isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"
        }`}
      >
        <Header
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          userName={
            userData
              ? `${userData.tracked_firstname} ${userData.tracked_lastname}`
              : "Loading..."
          }
        />

        {/* content of ADMIN USER MANAGEMENT PROFESSOR ACCOUNT DETAILS */}
        <div className={`p-4 sm:p-5 md:p-6 lg:p-8 ${getTextColor()}`}>
          {/* "Header" */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img
                src={Profile}
                alt="Profile"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-2"
                style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
              />
              <h1 className={`font-bold text-xl lg:text-2xl ${getTextColor()}`}>
                Profile
              </h1>
            </div>
            <p className={`text-sm lg:text-base ${getSecondaryTextColor()}`}>
              Account Details
            </p>
          </div>

          <hr className={`${getDividerColor()} mb-4`} />

          {/* Content */}
          <div className={`p-4 sm:p-5 rounded-lg space-y-5 md:space-y-6 shadow-md ${getCardBackgroundColor()}`}>
            {/* Professor Information Section */}
            <div>
              <h2 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Professor Information</h2>
              <div className="space-y-3">
                {/* First Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <span className={`font-medium ${getLabelTextColor()}`}>First Name :</span>
                  <span className={getTextColor()}>{userData?.tracked_firstname || "N/A"}</span>
                </div>

                {/* Middle Initial */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <span className={`font-medium ${getLabelTextColor()}`}>Middle Initial :</span>
                  <span className={getTextColor()}>
                    {userData?.tracked_middlename
                      ? `${userData.tracked_middlename}`
                      : "N/A"}
                  </span>
                </div>

                {/* Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <span className={`font-medium ${getLabelTextColor()}`}>Last Name :</span>
                  <span className={getTextColor()}>{userData?.tracked_lastname || "N/A"}</span>
                </div>

                {/* Sex */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <span className={`font-medium ${getLabelTextColor()}`}>Sex :</span>
                  <span className={getTextColor()}>{userData?.tracked_gender || "N/A"}</span>
                </div>

                {/* Date of Birth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <span className={`font-medium ${getLabelTextColor()}`}>Date of Birth :</span>
                  <span className={getTextColor()}>{formatDate(userData?.tracked_bday)}</span>
                </div>

                {/* Professor ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <span className={`font-medium ${getLabelTextColor()}`}>Professor ID :</span>
                  <span className={getTextColor()}>{userData?.tracked_ID || "N/A"}</span>
                </div>

                {/* CVSU Email Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <span className={`font-medium ${getLabelTextColor()}`}>CVSU Email Address :</span>
                  <span className={getTextColor()}>{userData?.tracked_email || "N/A"}</span>
                </div>

                {/* Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <span className={`font-medium ${getLabelTextColor()}`}>Phone Number :</span>
                  <span className={getTextColor()}>{userData?.tracked_phone || "N/A"}</span>
                </div>

                {/* Temporary Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm items-center">
                  <span className={`font-medium ${getLabelTextColor()}`}>Temporary Password :</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isDarkMode ? 'text-[#767EE0]' : 'text-[#6366f1]'}`}>
                      {userData?.temporary_password || "N/A"}
                    </span>
                    {userData?.temporary_password && userData.temporary_password !== "N/A" && (
                      <button
                        onClick={() => copyToClipboard(userData.temporary_password)}
                        className={`relative group p-1 rounded transition-colors cursor-pointer ${getCopyButtonHoverColor()}`}
                        title="Copy password"
                      >
                        <img 
                          src={CopyIcon} 
                          alt="Copy" 
                          className={`w-4 h-4 ${copied ? 'opacity-50' : ''}`} 
                          style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                        />
                        {/* Tooltip */}
                        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap ${getTooltipBackgroundColor()}`}>
                          {copied ? 'Copied!' : 'Copy to clipboard'}
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className={getSectionDividerColor()} />

            {/* Professional Information Section */}
            <div>
              <h2 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Professional Information</h2>
              <div className="space-y-3">
                {/* Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <span className={`font-medium ${getLabelTextColor()}`}>Department :</span>
                  <span className={getTextColor()}>{userData?.tracked_program || "N/A"}</span>
                </div>

                {/* Subject Handled */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <span className={`font-medium ${getLabelTextColor()}`}>Subject Handled :</span>
                  <span className={getTextColor()}>
                    {userData?.handled_subjects && userData.handled_subjects.length > 0 
                      ? userData.handled_subjects.join(", ")  
                      : "No subjects assigned"}
                  </span>
                </div>
              </div>
            </div>

            <hr className={getSectionDividerColor()} />

            {/* Account Information Section */}
            <div>
              <h2 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <span className={`font-medium ${getLabelTextColor()}`}>Date Created :</span>
                  <span className={getTextColor()}>{formatDate(userData?.created_at)}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <span className={`font-medium ${getLabelTextColor()}`}>Last Update :</span>
                  <span className={getTextColor()}>{formatDate(userData?.updated_at)}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <span className={`font-medium ${getLabelTextColor()}`}>Account Status :</span>
                  <span
                    className={`font-semibold ${
                      userData?.tracked_Status === "Active"
                        ? "text-[#00A15D]"
                        : "text-[#A15353]"
                    }`}
                  >
                    {userData?.tracked_Status || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}