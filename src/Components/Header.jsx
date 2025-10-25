import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../assets/MenuLine(Light).svg';
import Notification from '../assets/NotificationIcon.svg';
import ProfilePhoto from '../assets/ProfilePhoto.svg';
import LogOut from "../assets/LogOut.svg";
import Profile from "../assets/ClassManagement(Light).svg";
import AccountSettings from "../assets/Settings(Light).svg";
// import LogOut from "../assets/LogOut(dark).svg";
// import AccountSettings from "../assets/Settings(dark).svg";

function Header({ setIsOpen }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const [weekday, setWeekday] = useState("");
  const [fullDate, setFullDate] = useState("");
  const [year, setYear] = useState("");
  const [userName, setUserName] = useState("User");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const today = new Date();
    setWeekday(today.toLocaleDateString("en-US", { weekday: "long" }));
    setFullDate(today.toLocaleDateString("en-US", { month: "long", day: "numeric" }));
    setYear(today.getFullYear());

  // Pagkuha ng username sa Login.php localStorage
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);

        // Use fullName if available, otherwise construct from firstName and lastName
        if (user.fullName) {
          setUserName(user.fullName);
        } else if (user.firstName && user.lastName) {
          setUserName(`${user.firstName} ${user.lastName}`);
        } else if (user.firstName) {
          setUserName(user.firstName);
        }

        if (user.id){
          setUserId(user.id);
        }
        if (user.role) {
          setUserRole(user.role);
        }
      }
    } catch (error) {
    console.error("Error reading user from localStorage:", error);
    } 
  }, []);

  // Pag close ng dropdown when clickng outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if should display ID (Student or Professor only)
  const shouldShowId = userRole === "Student" || userRole === "Professor";

  // pag determine sa navigation paths based sa roles
  const getNavigationPaths = () => {
    if (userRole === "Professor") {
      return {
        notification: "/NotificationProf",
        profile: "/ProfileProf",
        accountSettings: "/AccountSettingProf"
      };
    } else if (userRole === "Student") {
      return {
        notification: "/NotificationStudent",
        profile: "/ProfileStudent",
        accountSettings: "/AccoutSetting"
      };
    }
    return {
      notification: "/#",
      profile: "/#",
      accountSettings: "/#"
    };
  };

  const paths = getNavigationPaths();

  const handleLogout = () => {
    // clears the user data from the localStorage
    localStorage.removeItem("user");

    // pag close ng dropdown
    setIsDropdownOpen(false);

    // navigation paputang login
    navigate("/Login");
  };
  const handleProfile = () => {
    setIsDropdownOpen(false);
    navigate(paths.profile);
  };

  const handleAccountSettings = () => {
    setIsDropdownOpen(false);
    navigate(paths.accountSettings);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNotificationClick = () => {
    navigate(paths.notification);
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-3">
        {/* Left: Menu + Date */}
        <div className="flex items-center gap-2 sm:gap-4">
          <img
            src={Menu}
            alt="Menu"
            className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer flex-shrink-0"
            onClick={() => setIsOpen(prev => !prev)}
          />

          <div className="flex flex-wrap items-center text-xs sm:text-base md:text-lg">
            <p className="text-[#465746] font-bold mr-2">{weekday}</p>
            <p className="text-[#465746] mr-2 hidden sm:block">|</p>
            <p className="text-[#465746] mr-1">{fullDate}{","}</p>
            <p className="text-[#465746]">{year}</p>
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-4 mt-0 sm:mt-0 mr-1">
          {/* notification para lang sa students and prof */}
          {(userRole === "Student" || userRole === "Professor") && (
            <div 
              className="flex items-center gap-2 sm:gap-3 relative cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleNotificationClick}
            >
              <div className="relative">
                <img 
                  src={Notification}
                  alt="Notification"
                  className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" 
                />
                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 bg-[#00874E] text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  x
                </div>
              </div>
              <p className="text-[#465746] font-medium text-sm sm:text-base">New</p>
            </div>
          )}

          {/* dropdown start */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-3 sm:gap-2 cursor-pointer" onClick={toggleDropdown}>
              <img
                src={ProfilePhoto}
                alt="Profile Photo"
                className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 rounded-full"
              />
              <div className="hidden md:flex flex-col items-start">
                <p className="text-[#465746] text-sm sm:text-base md:text-md font-medium leading-tight hidden lg:block">
                  {userName}
                </p>
                {shouldShowId && userId && (
                  <p className="text-[#00A15D] text-sm sm:text-base md:text-xs font-medium leading-tight hidden lg:block">
                    {userId}
                  </p>
                )}
              </div>
            </div>
            
            {/* dropdown menu/s (if ever may idadagdag) */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {/* Show Profile and Account Settings only for Student and Professor */}
                {(userRole === "Student" || userRole === "Professor") && (
                  <>
                    <button 
                      onClick={handleProfile}
                      className="rounded-lg w-full px-4 py-3 text-left text-sm sm:text-base text-[#456746] border-2 border-transparent hover:border-[#00874E] transition-colors duration-200 cursor-pointer font-medium flex items-center gap-2"
                    >
                      <img
                        src={Profile}
                        alt="Profile"
                        className="h-4 w-4 sm:h-5 sm:w-5"
                      />
                      Profile
                    </button>

                    <button 
                      onClick={handleAccountSettings}
                      className="rounded-lg w-full px-4 py-3 text-left text-sm sm:text-base text-[#456746] border-2 border-transparent hover:border-[#00874E] transition-colors duration-200 cursor-pointer font-medium flex items-center gap-2"
                    >
                      <img
                        src={AccountSettings}
                        alt="AccountSettings"
                        className="h-4 w-4 sm:h-5 sm:w-5"
                      />
                      Account Settings
                    </button>
                  </>
                )}

                {/* Logout button for all roles */}
                <button 
                  onClick={handleLogout}
                  className={`w-full px-4 py-3 text-left text-sm sm:text-base text-[#456746] border-2 border-transparent hover:border-[#00874E] transition-colors duration-200 cursor-pointer font-medium flex items-center gap-2 ${
                    userRole === "Admin" ? "rounded-lg" : "rounded-lg"
                  }`}
                >
                  <img
                    src={LogOut}
                    alt="Logout"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className="mx-4 opacity-60 border-[#465746] rounded border-1" />
    </div>
  );
}

export default Header;
