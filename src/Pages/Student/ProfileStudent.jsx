import React, { useState, useEffect } from 'react';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Profile from '../../assets/Profile.svg';
import BackButton from '../../assets/BackButton(Light).svg';
import CopyIcon from '../../assets/Copy(Light).svg';

export default function ProfileStudent() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Added theme state

  // Listen for theme changes
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
      setIsOpen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const userIdFromStorage = user.id;
          
          if (userIdFromStorage) {
            const userResponse = await fetch(`https://tracked.6minds.site/Student/DashboardStudentDB/get_student_info.php?id=${userIdFromStorage}`);
            const subjectsResponse = await fetch(`https://tracked.6minds.site/Student/SubjectsDB/get_student_classes.php?student_id=${userIdFromStorage}`);
            
            if (userResponse.ok && subjectsResponse.ok) {
              const userData = await userResponse.json();
              const subjectsData = await subjectsResponse.json();
              
              if (userData.success) {
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getYearLevel = () => {
    if (!userData?.tracked_yearandsec) return "N/A";
    const yearChar = userData.tracked_yearandsec.charAt(0);
    const yearNum = parseInt(yearChar);
    if (!isNaN(yearNum)) {
      const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
      return yearLevels[yearNum - 1] || `${yearNum}th Year`;
    }
    return userData.tracked_yearandsec;
  };

  const getSection = () => {
    if (!userData?.tracked_yearandsec) return "N/A";
    const section = userData.tracked_yearandsec.substring(1);
    return section || "N/A";
  };

  const copyToClipboard = (text) => {
    if (!text || text === "N/A") return;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
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

  // Theme-based style functions
  const getBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getCardBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/80" : "text-gray-600";
  };

  const getLabelTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/70" : "text-gray-600";
  };

  const getDividerColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/30" : "border-gray-300";
  };

  const getInnerDividerColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/10" : "border-gray-200";
  };

  const getTooltipBackground = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-800";
  };

  return (
    <div className={`min-h-screen ${getBackgroundColor()}`}>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header 
          setIsOpen={setIsOpen} 
          isOpen={isOpen} 
          userName={userData ? `${userData.tracked_firstname} ${userData.tracked_lastname}` : "Loading..."} 
        />

        <div className={`p-4 sm:p-5 md:p-6 lg:p-8 ${getTextColor()}`}>
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img 
                src={Profile} 
                alt="Profile" 
                className="h-7 w-7 sm:h-8 sm:w-8 mr-2 sm:mr-3"
                style={!isDarkMode ? { filter: 'invert(0.5)' } : {}}
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">Profile</h1>
            </div>
            <p className={`text-sm sm:text-base lg:text-lg ${getSecondaryTextColor()}`}>
              Account Details
            </p>
          </div>

          <hr className={`${getDividerColor()} mb-5 sm:mb-6`} />

          {loading ? (
            <div className={`${getCardBackgroundColor()} p-6 rounded-lg shadow-md text-center`}>
              <p className={`${getSecondaryTextColor()}`}>Loading profile data...</p>
            </div>
          ) : (
            <div className={`${getCardBackgroundColor()} p-4 sm:p-5 md:p-6 rounded-lg space-y-5 md:space-y-6 shadow-md`}>
              {/* Student Information */}
              <div>
                <h2 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Student Information</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>First Name :</span>
                    <span className={`text-sm ${getTextColor()}`}>{userData?.tracked_firstname || "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Middle Initial :</span>
                    <span className={`text-sm ${getTextColor()}`}>{userData?.tracked_middlename ? `${userData.tracked_middlename}` : "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Last Name :</span>
                    <span className={`text-sm ${getTextColor()}`}>{userData?.tracked_lastname || "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Sex :</span>
                    <span className={`text-sm ${getTextColor()}`}>{userData?.tracked_gender || "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Date of Birth :</span>
                    <span className={`text-sm ${getTextColor()}`}>{formatDate(userData?.tracked_bday)}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Student ID :</span>
                    <span className={`text-sm ${getTextColor()}`}>{userData?.tracked_ID || "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>CVSU Email Address :</span>
                    <span className={`text-sm ${getTextColor()}`}>{userData?.tracked_email || "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Phone Number :</span>
                    <span className={`text-sm ${getTextColor()}`}>{userData?.tracked_phone || "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Program :</span>
                    <span className={`text-sm ${getTextColor()}`}>{userData?.tracked_program || "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Year Level :</span>
                    <span className={`text-sm ${getTextColor()}`}>{getYearLevel()}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Section :</span>
                    <span className={`text-sm ${getTextColor()}`}>{getSection()}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Temporary Password :</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#767EE0]">
                        {userData?.temporary_password || "N/A"}
                      </span>
                      {userData?.temporary_password && userData.temporary_password !== "N/A" && (
                        <button
                          onClick={() => copyToClipboard(userData.temporary_password)}
                          className="relative group p-1 rounded hover:bg-[#767EE0]/20 transition-colors cursor-pointer"
                          title="Copy password"
                        >
                          <img 
                            src={CopyIcon} 
                            alt="Copy" 
                            className={`w-4 h-4 ${copied ? 'opacity-50' : ''}`}
                            style={!isDarkMode ? { filter: 'invert(0.5)' } : {}} 
                          />
                          {/* Tooltip */}
                          <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 ${getTooltipBackground()} text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap`}>
                            {copied ? 'Copied!' : 'Copy to clipboard'}
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <hr className={`${getInnerDividerColor()}`} />

              {/* Academic Performance Information */}
              <div>
                <h2 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Academic Performance Information</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Subjects Enrolled :</span>
                    <div className={`text-sm ${getTextColor()}`}>
                      {userData?.enrolled_subjects && userData.enrolled_subjects.length > 0 
                        ? userData.enrolled_subjects.map((subject, index) => (
                            <div key={index} className="mb-1">
                              {subject.subject} ({subject.subject_code})
                            </div>
                          ))
                        : "No subjects enrolled"
                      }
                    </div>
                  </div>
                </div>
              </div>

              <hr className={`${getInnerDividerColor()}`} />

              {/* Account Information */}
              <div>
                <h2 className={`text-lg font-semibold mb-4 ${getTextColor()}`}>Account Information</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Date Created :</span>
                    <span className={`text-sm ${getTextColor()}`}>{formatDate(userData?.created_at)}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Last Update :</span>
                    <span className={`text-sm ${getTextColor()}`}>{formatDate(userData?.updated_at)}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <span className={`text-sm font-medium ${getLabelTextColor()}`}>Account Status :</span>
                    <span className={`text-sm font-semibold ${userData?.tracked_Status === "Active" ? "text-[#00A15D]" : "text-[#A15353]"}`}>
                      {userData?.tracked_Status || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}