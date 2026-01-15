import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../assets/Burger.svg';
import ProfilePhoto from '../assets/ProfilePhoto.svg';
import LogOut from "../assets/LogOut(Dark).svg";
import Profile from "../assets/Profile(Dark).svg";
import AccountSettings from "../assets/Settings(Light).svg";
import LightModeIcon from "../assets/LightMode(white).svg";
import DarkModeIcon from "../assets/DarkMode(white).svg";

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
  const [isDarkMode, setIsDarkMode] = useState(false); // Changed to false for light mode default

  // Initialize theme on component mount
  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Update localStorage
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    // Toggle dark class on root element
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const shouldShowId = userRole === "Student" || userRole === "Professor";

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

  const getGradientStyle = () => {
    // Light mode colors with yellow gradient for Student role
    const lightStartColor = "#ffffff"; // White for light mode
    const lightEndColor = "#f3f4f6"; // Light gray for gradient
    
    // Dark mode colors
    const darkStartColor = "#23232C";
    
    if (isDarkMode) {
      switch(userRole) {
        case "Professor":
          return {
            background: `linear-gradient(90deg, ${darkStartColor} 0%, rgba(37, 99, 235, 0.5) 100%)`
          };
        case "Student":
          return {
            background: `linear-gradient(90deg, ${darkStartColor} 0%, rgba(202, 138, 4, 0.5) 100%)`
          };
        case "Admin":
        case "Super Admin":
          return {
            background: `linear-gradient(90deg, ${darkStartColor} 0%, rgba(55, 65, 81, 0.5) 100%)`
          };
        default:
          return {
            background: `linear-gradient(90deg, ${darkStartColor} 0%, rgba(31, 41, 55, 0.5) 100%)`
          };
      }
    } else {
      // Light mode gradient - now includes yellow gradient for Student role
      switch(userRole) {
        case "Professor":
          return {
            background: `linear-gradient(90deg, ${lightStartColor} 0%, rgba(59, 130, 246, 0.2) 100%)`,
            borderBottom: "1px solid #e5e7eb"
          };
        case "Student":
          return {
            background: `linear-gradient(90deg, ${lightStartColor} 0%, rgba(250, 204, 21, 0.2) 100%)`,
            borderBottom: "1px solid #e5e7eb"
          };
        case "Admin":
        case "Super Admin":
          return {
            background: `linear-gradient(90deg, ${lightStartColor} 0%, rgba(107, 114, 128, 0.2) 100%)`,
            borderBottom: "1px solid #e5e7eb"
          };
        default:
          return {
            background: `linear-gradient(90deg, ${lightStartColor} 0%, ${lightEndColor} 100%)`,
            borderBottom: "1px solid #e5e7eb"
          };
      }
    }
  };

  const getTextColor = () => {
    return isDarkMode ? "#FFFFFF" : "#1f2937"; // White for dark, dark gray for light
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "#FFFFFF/50" : "#6b7280"; // Light gray for light mode
  };

  const getUserIdColor = () => {
    return isDarkMode ? "#00A15D" : "#059669"; // Slightly different green for light mode
  };

  const getDropdownBgColor = () => {
    return isDarkMode ? "#15151C" : "#ffffff";
  };

  const getDropdownBorderColor = () => {
    return isDarkMode ? "#23232C" : "#e5e7eb";
  };

  const getDropdownTextColor = () => {
    return isDarkMode ? "#FFFFFF" : "#1f2937";
  };

  const getHoverBgColor = () => {
    return isDarkMode ? "rgba(0, 161, 93, 0.1)" : "rgba(5, 150, 105, 0.1)";
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
    <div style={getGradientStyle()}>
      <div className="flex items-center justify-between px-2 sm:px-4 py-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <img
            src={Menu}
            alt="Menu"
            className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer flex-shrink-0"
            style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
            onClick={() => setIsOpen(prev => !prev)}
          />

          <div className="flex flex-wrap items-center text-xs sm:text-base md:text-lg">
            <p className="mr-2 font-bold" style={{ color: getTextColor() }}>{weekday}</p>
            <p className="mr-2 hidden sm:block" style={{ color: getSecondaryTextColor() }}>|</p>
            <p className="mr-1 font-medium" style={{ color: getTextColor() }}>{fullDate}{","}</p>
            <p className="mr-2 font-medium" style={{ color: getTextColor() }}>{year}</p>
            <p className="mr-2 hidden sm:block" style={{ color: getSecondaryTextColor() }}>|</p>
            <p className="font-medium" style={{ color: getTextColor() }}>{currentTime}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 mr-1">
          {/* Dark/Light Mode Button - Moved to left side of user name */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 rounded-full opacity-80 hover:opacity-100 transition-opacity duration-200 cursor-pointer flex items-center justify-center"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <img
              src={isDarkMode ? LightModeIcon : DarkModeIcon}
              alt={isDarkMode ? "Light Mode" : "Dark Mode"}
              className="h-4 w-4 sm:h-5 sm:w-5" // Made smaller
              style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
            />
          </button>

          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-3 sm:gap-2 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <img
                src={ProfilePhoto}
                alt="Profile Photo"
                className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 rounded-full"
                style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
              />
              <div className="hidden md:flex flex-col items-start">
                <p className="text-sm sm:text-base md:text-md font-medium leading-tight hidden lg:block"
                   style={{ color: getTextColor() }}>
                  {userName || "Loading..."}
                </p>
                {shouldShowId && userId && (
                  <p className="text-sm sm:text-base md:text-xs font-medium leading-tight hidden lg:block"
                     style={{ color: getUserIdColor() }}>
                    {userId}
                  </p>
                )}
                {userRole === "Admin" && (
                  <p className="text-sm sm:text-base md:text-xs font-medium leading-tight hidden lg:block"
                     style={{ color: getUserIdColor() }}>
                    Administrator
                  </p>
                )}
              </div>
            </div>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 rounded-lg shadow-lg z-50"
                   style={{ 
                     backgroundColor: getDropdownBgColor(),
                     borderColor: getDropdownBorderColor(),
                     borderWidth: '1px'
                   }}>
                {(userRole === "Student" || userRole === "Professor") && (
                  <>
                    <button 
                      onClick={handleProfile}
                      className="w-full px-4 py-3 text-left text-sm sm:text-base hover:transition-colors duration-200 cursor-pointer font-medium flex items-center gap-2 rounded-lg"
                      style={{ 
                        color: getDropdownTextColor(),
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = getHoverBgColor();
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <img src={Profile} alt="Profile" className="h-4 w-4 sm:h-5 sm:w-5" 
                           style={isDarkMode ? {} : { filter: 'invert(0.5)' }} />
                      Profile
                    </button>

                    <button 
                      onClick={handleAccountSettings}
                      className="w-full px-4 py-3 text-left text-sm sm:text-base hover:transition-colors duration-200 cursor-pointer font-medium flex items-center gap-2 rounded-lg"
                      style={{ 
                        color: getDropdownTextColor(),
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = getHoverBgColor();
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <img src={AccountSettings} alt="AccountSettings" className="h-4 w-4 sm:h-5 sm:w-5" 
                           style={isDarkMode ? {} : { filter: 'invert(0.5)' }} />
                      Account Settings
                    </button>
                  </>
                )}

                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm sm:text-base hover:transition-colors duration-200 cursor-pointer font-medium flex items-center gap-2 rounded-lg"
                  style={{ 
                    color: getDropdownTextColor(),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = getHoverBgColor();
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <img src={LogOut} alt="Logout" className="h-4 w-4 sm:h-5 sm:w-5" 
                       style={isDarkMode ? {} : { filter: 'invert(0.5)' }} />
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