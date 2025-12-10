import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../assets/Burger.svg';
import ProfilePhoto from '../assets/ProfilePhoto.svg';
import LogOut from "../assets/LogOut(Dark).svg";
import Profile from "../assets/Profile(Dark).svg";
import AccountSettings from "../assets/Settings(Light).svg";

function Header({ setIsOpen }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const [weekday, setWeekday] = useState("");
  const [fullDate, setFullDate] = useState("");
  const [year, setYear] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Update date and time
    const updateDateTime = () => {
      const today = new Date();
      setWeekday(today.toLocaleDateString("en-US", { weekday: "long" }));
      setFullDate(today.toLocaleDateString("en-US", { month: "long", day: "numeric" }));
      setYear(today.getFullYear());
      setCurrentTime(today.toLocaleTimeString("en-US", { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
    };

    updateDateTime();
    const timeInterval = setInterval(updateDateTime, 60000);

    // Get user data from localStorage
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        
        if (user.fullName) {
          setUserName(user.fullName);
        } else if (user.firstname && user.lastname) {
          setUserName(`${user.firstname} ${user.lastname}`);
        } else if (user.firstname) {
          setUserName(user.firstname);
        } else {
          setUserName("User");
        }

        setUserId(user.id || "");
        setUserRole(user.role || "");
      }
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
    }

    return () => clearInterval(timeInterval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shouldShowId = userRole === "Student" || userRole === "Professor";

  // Get navigation paths based on role
  const getNavigationPaths = () => {
    if (userRole === "Professor") {
      return {
        profile: "/ProfileProf",
        accountSettings: "/AccountSettingProf"
      };
    } else if (userRole === "Student") {
      return {
        profile: "/ProfileStudent",
        accountSettings: "/AccountSetting"
      };
    }
    return {
      profile: "/#",
      accountSettings: "/#"
    };
  };

  const paths = getNavigationPaths();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsDropdownOpen(false);
    navigate("/Login");
  };

  const handleProfile = () => {
    setIsDropdownOpen(false);
    if (paths.profile !== "/#") {
      navigate(paths.profile);
    }
  };

  const handleAccountSettings = () => {
    setIsDropdownOpen(false);
    if (paths.accountSettings !== "/#") {
      navigate(paths.accountSettings);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between px-2 sm:px-4 py-3">
        {/* Left side - Menu and date */}
        <div className="flex items-center gap-2 sm:gap-4">
          <img
            src={Menu}
            alt="Menu"
            className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer flex-shrink-0"
            onClick={() => setIsOpen(prev => !prev)}
          />

          <div className="flex flex-wrap items-center text-xs sm:text-base md:text-lg">
            <p className="text-[#FFFFFF] mr-2 font-bold">{weekday}</p>
            <p className="text-[#FFFFFF]/50 mr-2 hidden sm:block">|</p>
            <p className="text-[#FFFFFF] mr-1 font-medium">{fullDate}{","}</p>
            <p className="text-[#FFFFFF] mr-2 font-medium">{year}</p>
            <p className="text-[#FFFFFF]/50 mr-2 hidden sm:block">|</p>
            <p className="text-[#FFFFFF] font-medium">{currentTime}</p>
          </div>
        </div>

        {/* Right side - Profile dropdown */}
        <div className="flex items-center gap-2 sm:gap-4 mr-1">
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-3 sm:gap-2 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <img
                src={ProfilePhoto}
                alt="Profile Photo"
                className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 rounded-full"
              />
              <div className="hidden md:flex flex-col items-start">
                <p className="text-[#FFFFFF] text-sm sm:text-base md:text-md font-medium leading-tight hidden lg:block">
                  {userName || "Loading..."}
                </p>
                {shouldShowId && userId && (
                  <p className="text-[#00A15D] text-sm sm:text-base md:text-xs font-medium leading-tight hidden lg:block">
                    {userId}
                  </p>
                )}
                {userRole === "Admin" && (
                  <p className="text-[#00A15D] text-sm sm:text-base md:text-xs font-medium leading-tight hidden lg:block">
                    Administrator
                  </p>
                )}
              </div>
            </div>
            
            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-[#15151C] rounded-lg shadow-lg border border-[#23232C] z-50">
                {(userRole === "Student" || userRole === "Professor") && (
                  <>
                    <button 
                      onClick={handleProfile}
                      className="rounded-lg w-full px-4 py-3 text-left text-sm sm:text-base text-[#FFFFFF] border-2 border-transparent hover:border-[#00A15D] transition-colors duration-200 cursor-pointer font-medium flex items-center gap-2"
                    >
                      <img src={Profile} alt="Profile" className="h-4 w-4 sm:h-5 sm:w-5" />
                      Profile
                    </button>

                    <button 
                      onClick={handleAccountSettings}
                      className="rounded-lg w-full px-4 py-3 text-left text-sm sm:text-base text-[#FFFFFF] border-2 border-transparent hover:border-[#00A15D] transition-colors duration-200 cursor-pointer font-medium flex items-center gap-2"
                    >
                      <img src={AccountSettings} alt="AccountSettings" className="h-4 w-4 sm:h-5 sm:w-5" />
                      Account Settings
                    </button>
                  </>
                )}

                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm sm:text-base text-[#FFFFFF] border-2 border-transparent hover:border-[#00A15D] transition-colors duration-200 cursor-pointer font-medium flex items-center gap-2 rounded-lg"
                >
                  <img src={LogOut} alt="Logout" className="h-4 w-4 sm:h-5 sm:w-5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;