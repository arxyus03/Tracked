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
  const [localOpen, setLocalOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const isControlled = typeof isOpenProp !== "undefined" && typeof setIsOpenProp === "function";
  const isOpen = isControlled ? isOpenProp : localOpen;
  const setIsOpen = isControlled ? setIsOpenProp : setLocalOpen;

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 1024);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isMobile && isOpen && !event.target.closest("aside")) {
        setIsOpen(false);
      }
    };
    if (isMobile && isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [isMobile, isOpen, setIsOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isMobile && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobile, isOpen, setIsOpen]);

  // role menus
  const menus = {
    student: {
      main: [
        { label: "Dashboard", icon: Dashboard, path: "/Dashboard" },
        { label: "My Courses", icon: Subjects, path: "/MyCourses" },
        { label: "Grades", icon: Analytics, path: "/Grades" },
      ],
      extras: [
        { label: "Notification", icon: Notification, path: "/Notification" },
        { label: "Profile", icon: Profile, path: "/Profile" },
        { label: "Account Settings", icon: AccountSettings, path: "/AccountSetting" },
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
        { label: "Account Settings", icon: AccountSettings, path: "/AccountSettingProf" },
      ],
    },

    admin: {
      main: [
        { label: "User Management", icon: ClassManagement, path: "/UserManagement" },
        { label: "Report", icon: Report, path: "/Report" },
        { label: "Account Request", icon: AccountRequest, path: "/AccountRequest" },
        { label: "Import", icon: Import, path: "/Import" },
      ],
    },
  };

  const handleLinkClick = () => {
    if (isMobile) setIsOpen(false);
  };

  const navItemBase =
    "flex items-center px-4 py-4 rounded-lg hover:bg-[#00A15D] cursor-pointer select-none transition-colors duration-150";

  return (
    <>
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-[#00874E] border-r border-[#acacac] select-none z-50 shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        w-[60%] sm:w-[200px] xl:w-[280px] 2xl:w-[300px]`}
        role="navigation"
        aria-label="Main sidebar"
      >
        <div className="flex flex-col h-full p-4 safe-area pb-6">
          <div className="flex items-center justify-between">
            <img src={TextLogo} alt="TrackED Logo" className="h-10 w-auto" />
          </div>

          <hr className="border-[#DBDBDB] rounded border-1 opacity-40 my-4" />

          {/* main menus */}
          <nav className="flex-1 overflow-auto">
            <div className="flex flex-col gap-1">
              {menus[role]?.main?.map((item, index) => (
                <NavLink
                  key={`${item.label}-${index}`}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `${navItemBase} ${isActive ? "bg-[#00A15D]" : ""}`
                  }
                >
                  <img src={item.icon} alt={item.label} className="h-5 w-5 flex-shrink-0 mr-4" />

                  <p className="text-white text-[1.05rem] truncate whitespace-nowrap">{item.label}</p>
                </NavLink>
              ))}
            </div>

            {/* extras */}
            {menus[role]?.extras?.length > 0 && (
              <div className="mt-30 pt-4">
                <hr className="border-[#DBDBDB] rounded border-1 opacity-40 my-4" />
                {menus[role].extras.map((item, index) => (
                  <NavLink
                    key={`${item.label}-extra-${index}`}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${navItemBase} mt-2 ${isActive ? "bg-[#00A15D]" : ""}`
                    }
                  >
                    <img src={item.icon} alt={item.label} className="h-5 w-5 flex-shrink-0 mr-4" />
                    <p className="text-white text-[1.05rem] truncate whitespace-nowrap">{item.label}</p>
                  </NavLink>
                ))}
              </div>
            )}
          </nav>

          {/* logout area */}
          <div className="mt-4">
            <NavLink to="/Login" onClick={handleLinkClick} className={navItemBase}>
              <img src={LogOut} alt="Logout" className="h-5 w-5 flex-shrink-0 mr-4" />
              <p className="text-white text-[1.05rem] truncate whitespace-nowrap">Log out</p>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
