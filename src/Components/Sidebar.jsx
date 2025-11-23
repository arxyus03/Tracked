import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import Dashboard from "../assets/Dashboard.svg";
import Subjects from "../assets/Subjects.svg";
import Analytics from "../assets/Analytics.svg";
import ClassManagement from "../assets/ClassManagement.svg";
import Announcement from "../assets/Announcement.svg";
import Report from "../assets/Report.svg";
import AccountRequest from "../assets/AccountRequest.svg";
import Import from "../assets/Import.svg";
import Notification from "../assets/Notification.svg";
import Profile from "../assets/Profile.svg";
import AccountSettings from "../assets/Settings.svg";
import LogOut from "../assets/LogOut.svg";
import TextLogo from "../assets/New-FullWhite-TrackEdLogo.svg";

export default function Sidebar({ role = "student", isOpen: isOpenProp, setIsOpen: setIsOpenProp }) {
  const [localOpen, setLocalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isControlled = typeof isOpenProp !== "undefined" && typeof setIsOpenProp === "function";
  const isOpen = isControlled ? isOpenProp : localOpen;
  const setIsOpen = isControlled ? setIsOpenProp : setLocalOpen;

  // Check screen size and set initial state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-open on desktop, auto-close on mobile (only if uncontrolled)
      if (!isControlled) {
        setLocalOpen(!mobile);
      }
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isControlled]);

  // Handle outside clicks on mobile only
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isMobile && isOpen && !event.target.closest("aside") && !event.target.closest("button[data-sidebar-toggle]")) {
        setIsOpen(false);
      }
    };
    
    if (isMobile && isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [isMobile, isOpen, setIsOpen]);

  // Handle escape key on mobile only
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isMobile && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobile, isOpen, setIsOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isOpen]);

  // Role menus
  const menus = {
    student: {
      main: [
        { label: "Dashboard", icon: Dashboard, path: "/DashboardStudent" },
        { label: "Subjects", icon: Subjects, path: "/Subjects" },
        { label: "Analytics", icon: Analytics, path: "/AnalyticsStudent" },
      ],
      extras: [
        { label: "Notification", icon: Notification, path: "/NotificationStudent" },
        { label: "Profile", icon: Profile, path: "/ProfileStudent" },
        { label: "Account Setting", icon: AccountSettings, path: "/AccountSetting" },
      ],
    },
    teacher: {
      main: [
        { label: "Dashboard", icon: Dashboard, path: "/DashboardProf" },
        { label: "Class Management", icon: ClassManagement, path: "/ClassManagement" },
        { label: "Analytics", icon: Analytics, path: "/AnalyticsProf" },
        { label: "Announcement", icon: Announcement, path: "/Announcement" },
      ],
      extras: [
        { label: "Notification", icon: Notification, path: "/NotificationProf" },
        { label: "Profile", icon: Profile, path: "/ProfileProf" },
        { label: "Account Setting", icon: AccountSettings, path: "/AccountSettingProf" },
      ],
    },
    admin: {
      main: [
        { label: "User Management", icon: ClassManagement, path: "/UserManagement" },
        { label: "Report", icon: Report, path: "/Report" },
        { label: "Import", icon: Import, path: "/Import" },
      ],
    },
    superadmin: {
      main: [
        { label: "User Management", icon: ClassManagement, path: "/SuperAdminAccountList" },
        { label: "Import", icon: Import, path: "/SuperAdminLanding" },
      ],
    },
  };

  const handleLinkClick = () => {
    if (isMobile) setIsOpen(false);
  };

  const navItemBase =
    "flex items-center px-4 py-3 rounded-lg hover:bg-[#00A15D] cursor-pointer select-none transition-colors duration-150";

  return (
    <>
      {/* Backdrop overlay for mobile only */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#00874E] select-none z-50 shadow-xl transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        w-[75%] max-w-[280px] sm:w-[240px] lg:w-[250px] xl:w-[270px] 2xl:w-[290px]`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo section */}
          <div className="flex-shrink-0 p-4 pb-3">
            <div className="flex justify-center">
              <img src={TextLogo} alt="TrackED Logo" className="h-10" />
            </div>
            <hr className="border-[#DBDBDB] rounded border-1 opacity-40 mt-4" />
          </div>

          {/* Main navigation - scrollable */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4">
            <div className="flex flex-col gap-1 py-2">
              {menus[role]?.main?.map((item, index) => (
                <NavLink
                  key={`${item.label}-${index}`}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `${navItemBase} ${isActive ? "bg-[#00A15D]" : ""}`
                  }
                >
                  <img src={item.icon} alt="icons" className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="text-white text-sm sm:text-[1rem] truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Extra menu items */}
            {menus[role]?.extras?.length > 0 && (
              <div className="pt-2 pb-2">
                <hr className="border-[#DBDBDB] rounded border-1 opacity-40 my-3" />
                <div className="flex flex-col gap-1">
                  {menus[role].extras.map((item, index) => (
                    <NavLink
                      key={`${item.label}-extra-${index}`}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `${navItemBase} ${isActive ? "bg-[#00A15D]" : ""}`
                      }
                    >
                      <img src={item.icon} alt="" className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="text-white text-sm sm:text-[1rem] truncate">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Logout section - fixed at bottom */}
          <div className="flex-shrink-0 p-4 pt-2 border-t border-[#DBDBDB]/20">
            <NavLink 
              to="/Login" 
              onClick={handleLinkClick} 
              className={navItemBase}
            >
              <img src={LogOut} alt="" className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="text-white text-sm sm:text-[1rem] truncate">Log out</span>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}