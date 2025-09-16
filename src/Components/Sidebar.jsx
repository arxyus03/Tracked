import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Dashboard from "../assets/Dashboard.svg";
import Subjects from "../assets/Subjects.svg";
import Analytics from "../assets/Analytics.svg";
import ClassManagement from "../assets/ClassManagement.svg";
import Announcement from "../assets/Announcement.svg";
import Report from "../assets/Report.svg";
import AccountRequest from "../assets/AccountRequest.svg";
import Blank from "../assets/Blank.png";
import Import from "../assets/Import.svg";
import Notification from "../assets/Notification.svg";
import Profile from "../assets/Profile.svg";
import AccountSettings from "../assets/Settings.svg";
import LogOut from "../assets/LogOut.svg";
import Close from "../assets/Cross.svg";
import TextLogo from "../assets/New-FullWhite-TrackEdLogo.svg";

export default function Sidebar({
  role,
  isOpen: isOpenProp,
  setIsOpen: setIsOpenProp,
}) {
  const [localOpen, setLocalOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const isControlled =
    typeof isOpenProp !== "undefined" && typeof setIsOpenProp === "function";
  const isOpen = isControlled ? isOpenProp : localOpen;
  const setIsOpen = isControlled ? setIsOpenProp : setLocalOpen;

  // Check screen size and update mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);

      // Auto-close sidebar on mobile when screen resizes
      if (window.innerWidth < 1024 && isOpen) {
        // Only auto-close if we're on mobile and sidebar is open
        // You might want to keep it open on larger screens
      }
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup event listener
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isOpen, setIsOpen]);

  // Close sidebar when clicking outside (mobile only)
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isMobile && isOpen && !event.target.closest("aside")) {
        setIsOpen(false);
      }
    };

    if (isMobile && isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [isMobile, isOpen, setIsOpen]);

  const menus = {
    student: [
      { label: "", icon: Blank },
      { label: "Dashboard", icon: Dashboard },
      { label: "My Courses", icon: Subjects },
      { label: "Grades", icon: Analytics },
    ],

    teacher: [
      { label: "", icon: Blank },
      { label: "Dashboard", icon: Dashboard },
      { label: "ClassManagement", icon: Subjects },
      { label: "Analytics", icon: Analytics },
      { label: "Announcement", icon: Announcement },
    ],

    admin: [
      { label: "", icon: Blank },
      { label: "User Management", icon: ClassManagement },
      { label: "Report", icon: Report },
      { label: "Account Request", icon: AccountRequest },
      { label: "Import", icon: Import },
    ],
  };

  // Handle link click on mobile - close sidebar
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#00874E] select-none z-50 
          transform transition-transform duration-300 ease-in-out
          
          /* Mobile styles (default) */
          w-[250px] sm:w-[280px]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          
          /* Desktop styles */
          lg:w-[250px] xl:w-[250px] 2xl:w-[300px]
        `}
      >
        {/* SIDEBAR content */}

        {/* SIDEBAR for Admin */}
        {role == "admin" && (
          <div className="p-3 sm:p-3 flex flex-col h-full">
            {/* SIDEBAR HEADER with close button on mobile */}
            <div className="flex items-center justify-between mb-4">
              <img
                src={TextLogo}
                alt="TrackEDLogo"
                className="h-10 sm:h-10 lg:h-10 w-auto mx-auto cursor-pointer"
              />
            </div>

            <hr className="border-[#DBDBDB] opacity-20 rounded border-1" />

            {/* SIDEBAR Menu Items */}
            <nav className="flex flex-col mt-3 lg:mt-4 space-y-1 lg:space-y-2 gap-1 sm:gap-0">
              {/* SIDEBAR Array value 1 */}
              <Link to="/UserManagement" onClick={handleLinkClick}>
                <div className="flex px-3 lg:px-3 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl rounded-xl cursor-pointer transition-colors">
                  <img
                    src={menus[role][1].icon}
                    alt="Dashboard"
                    className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6"
                  />
                  <p className="text-[#FFFFFF] text-sm sm:text-base truncate">
                    {menus[role][1].label}
                    {/* USER MANAGEMENT */}
                  </p>
                </div>
              </Link>

              {/* SIDEBAR Array value 2 */}
              <Link to="/Report" onClick={handleLinkClick}>
                <div className="flex px-3 lg:px-3 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl rounded-xl cursor-pointer transition-colors">
                  <img
                    src={menus[role][2].icon}
                    alt="Subjects"
                    className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6"
                  />
                  <p className="text-[#FFFFFF] text-sm sm:text-base truncate">
                    {menus[role][2].label}
                    {/* REPORT */}
                  </p>
                </div>
              </Link>

              {/* SIDEBAR Array value 3 */}
              <Link to="/AccountRequest" onClick={handleLinkClick}>
                <div className="flex px-3 lg:px-3 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl rounded-xl cursor-pointer transition-colors">
                  <img
                    src={menus[role][3].icon}
                    alt="Analytics"
                    className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6"
                  />
                  <p className="text-[#FFFFFF] text-sm sm:text-base truncate">
                    {menus[role][3].label}
                    {/* ACCOUNT REQUEST */}
                  </p>
                </div>
              </Link>

              {/* SIDEBAR Array value 4 */}
              <Link to="/Import" onClick={handleLinkClick}>
                <div className="flex px-3 lg:px-3 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl rounded-xl cursor-pointer transition-colors">
                  <img
                    src={menus[role][4].icon}
                    alt="Imports"
                    className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6"
                  />
                  <p className="text-[#FFFFFF] text-sm sm:text-base truncate">
                    {menus[role][4].label}
                    {/* IMPORT */}
                  </p>
                </div>
              </Link>
            </nav>

            {role !== "admin" && (
              <>
                <hr className="border-[#DBDBDB] rounded border-1 mt-6 lg:mt-10" />

                <div className="flex flex-col mt-6 lg:mt-10 space-y-1 lg:space-y-3">
                  <div className="flex px-3 lg:px-4 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer transition-colors">
                    <img
                      src={Notification}
                      alt="Notification"
                      className="mr-3 lg:mr-5 w-5 h-5 lg:w-6 lg:h-6"
                    />
                    <p className="text-[#FFFFFF] text-sm lg:text-[1.125rem]">
                      Notification
                    </p>
                  </div>

                  <div className="flex px-3 lg:px-4 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer transition-colors">
                    <img
                      src={Profile}
                      alt="Profile"
                      className="mr-3 lg:mr-5 w-5 h-5 lg:w-6 lg:h-6"
                    />
                    <p className="text-[#FFFFFF] text-sm lg:text-[1.125rem]">
                      Profile
                    </p>
                  </div>

                  <div className="flex px-3 lg:px-4 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer transition-colors">
                    <img
                      src={AccountSettings}
                      alt="Settings"
                      className="mr-3 lg:mr-5 w-5 h-5 lg:w-6 lg:h-6"
                    />
                    <p className="text-[#FFFFFF] text-sm lg:text-[1.125rem]">
                      Account Settings
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* SIDEBAR Log Out */}
            <div className="mt-auto">
              <Link to="/Login" onClick={handleLinkClick}>
                <div className="flex px-3 lg:px-3 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl rounded-xl cursor-pointer transition-colors">
                  <img
                    src={LogOut}
                    alt="Logout"
                    className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6"
                  />
                  <p className="text-[#FFFFFF] text-sm sm:text-base truncate">
                    Log out
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* SIDEBAR for Teacher */}
        {role == "teacher" && (
          <div className="p-3 sm:p-3 flex flex-col h-full">
            {/* SIDEBAR HEADER with close button on mobile */}
            <div className="flex items-center justify-between mb-4">
              <img
                src={TextLogo}
                alt="TrackEDLogo"
                className="h-10 sm:h-10 lg:h-10 w-auto mx-auto cursor-pointer"
              />
            </div>

            <hr className="border-[#DBDBDB] opacity-20 rounded border-1" />

            {/* SIDEBAR Menu Items */}
            <nav className="flex flex-col mt-3 lg:mt-4 space-y-1 lg:space-y-2 gap-1 sm:gap-0">
              {/* SIDEBAR Array value 1 */}
              <Link to="/UserManagement" onClick={handleLinkClick}>
                <div className="flex px-3 lg:px-3 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl rounded-xl cursor-pointer transition-colors">
                  <img
                    src={menus[role][1].icon}
                    alt="Dashboard"
                    className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6"
                  />
                  <p className="text-[#FFFFFF] text-sm sm:text-base truncate">
                    {menus[role][1].label}
                  </p>
                </div>
              </Link>

              {/* SIDEBAR Array value 2 */}
              <Link to="/Report" onClick={handleLinkClick}>
                <div className="flex px-3 lg:px-3 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl rounded-xl cursor-pointer transition-colors">
                  <img
                    src={menus[role][2].icon}
                    alt="Subjects"
                    className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6"
                  />
                  <p className="text-[#FFFFFF] text-sm sm:text-base truncate">
                    {menus[role][2].label}
                  </p>
                </div>
              </Link>

              {/* SIDEBAR Array value 3 */}
              <Link to="/AccountRequest" onClick={handleLinkClick}>
                <div className="flex px-3 lg:px-3 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl rounded-xl cursor-pointer transition-colors">
                  <img
                    src={menus[role][3].icon}
                    alt="Analytics"
                    className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6"
                  />
                  <p className="text-[#FFFFFF] text-sm sm:text-base truncate">
                    {menus[role][3].label}
                  </p>
                </div>
              </Link>

              {/* SIDEBAR Array value 4 */}
              <Link to="/Import" onClick={handleLinkClick}>
                <div className="flex px-3 lg:px-3 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl rounded-xl cursor-pointer transition-colors">
                  <img
                    src={menus[role][4].icon}
                    alt="Imports"
                    className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6"
                  />
                  <p className="text-[#FFFFFF] text-sm sm:text-base truncate">
                    {menus[role][4].label}
                  </p>
                </div>
              </Link>
            </nav>

            {role !== "admin" && (
              <>
                <hr className="border-[#DBDBDB] rounded border-1 mt-6 lg:mt-10" />

                <div className="flex flex-col mt-6 lg:mt-10 space-y-1 lg:space-y-3">
                  <div className="flex px-3 lg:px-4 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer transition-colors">
                    <img
                      src={Notification}
                      alt="Notification"
                      className="mr-3 lg:mr-5 w-5 h-5 lg:w-6 lg:h-6"
                    />
                    <p className="text-[#FFFFFF] text-sm lg:text-[1.125rem]">
                      Notification
                    </p>
                  </div>

                  <div className="flex px-3 lg:px-4 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer transition-colors">
                    <img
                      src={Profile}
                      alt="Profile"
                      className="mr-3 lg:mr-5 w-5 h-5 lg:w-6 lg:h-6"
                    />
                    <p className="text-[#FFFFFF] text-sm lg:text-[1.125rem]">
                      Profile
                    </p>
                  </div>

                  <div className="flex px-3 lg:px-4 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer transition-colors">
                    <img
                      src={AccountSettings}
                      alt="Settings"
                      className="mr-3 lg:mr-5 w-5 h-5 lg:w-6 lg:h-6"
                    />
                    <p className="text-[#FFFFFF] text-sm lg:text-[1.125rem]">
                      Account Settings
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* SIDEBAR Log Out */}
            <div className="mt-auto">
              <Link to="/Login" onClick={handleLinkClick}>
                <div className="flex px-3 lg:px-3 py-2 lg:py-3 hover:bg-[#00A15D] hover:rounded-xl rounded-xl cursor-pointer transition-colors">
                  <img
                    src={LogOut}
                    alt="Logout"
                    className="mr-3 lg:mr-4 w-5 h-5 lg:w-6 lg:h-6"
                  />
                  <p className="text-[#FFFFFF] text-sm sm:text-base truncate">
                    Log out
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
