import { useState } from "react";
import { Link } from 'react-router-dom';

import Dashboard from '../assets/Dashboard.svg';
import Subjects from '../assets/Subjects.svg';
import Analytics from '../assets/Analytics.svg';
import ClassManagement from '../assets/ClassManagement.svg';
import Announcement from '../assets/Announcement.svg';
import Report from '../assets/Report.svg';
import AccountRequest from '../assets/AccountRequest.svg';
import Blank from '../assets/Blank.png';
import Import from '../assets/Import.svg';
import Notification from '../assets/Notification.svg';
import Profile from '../assets/Profile.svg';
import AccountSettings from '../assets/Settings.svg';
import LogOut from '../assets/LogOut.svg';
import Close from '../assets/Cross.svg';
import TextLogo from "../assets/New-FullWhite-TrackEdLogo.svg";

export default function Sidebar({ role, isOpen: isOpenProp, setIsOpen: setIsOpenProp }) {
  const [localOpen, setLocalOpen] = useState(true);
  const isControlled = typeof isOpenProp !== "undefined" && typeof setIsOpenProp === "function";
  const isOpen = isControlled ? isOpenProp : localOpen;
  const setIsOpen = isControlled ? setIsOpenProp : setLocalOpen;

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
      { label: "My Classes", icon: Subjects },
      { label: "Attendance", icon: Analytics },
    ],

    admin: [
      { label: "", icon: Blank },
      { label: "User Management", icon: ClassManagement },
      { label: "Report", icon: Report },
      { label: "Account Request", icon: AccountRequest },
      { label: "Import", icon: Import },
    ],
    
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#00874E] border-r-2 border-[#acacac] select-none z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 w-[300px]" : "-translate-x-full w-[300px]"
        }`}
      >
        {/* SIDEBAR content */}

        <div className="p-5 flex flex-col h-full">
          {/* SIDEBAR CLOSE BUTTON */}
          <div className="flex items-center justify-between">
            <img src={TextLogo} alt="TrackEDLogo" className="h-12 w-auto mx-auto mb-4 cursor-pointer"/>
          </div>

          <hr className="border-[#DBDBDB] rounded border-1" />

          {/* SIDEBAR Array value 1 */}
          <Link to="/UserManagement">
            <div className="flex mt-10 px-4 py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer">
              <img src={menus[role][1].icon} alt="Dashboard" className="mr-5" />
              <p className="text-[#FFFFFF] text-[1.125rem]"> {menus[role][1].label} </p>
            </div>
          </Link>

          {/* SIDEBAR Array value 2 */}
          <Link to="/Report">
            <div className="flex mt-3 px-4 py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer">
              <img src={menus[role][2].icon} alt="Subjects" className="mr-5" />
              <p className="text-[#FFFFFF] text-[1.125rem]"> {menus[role][2].label} </p>
            </div>
          </Link>

          {/* SIDEBAR Array value 3 */}
          <Link to="/AccountRequest">
            <div className="flex mt-3 px-4 py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer">
              <img src={menus[role][3].icon} alt="Analytics" className="mr-5" />
              <p className="text-[#FFFFFF] text-[1.125rem]"> {menus[role][3].label} </p>
            </div>
          </Link>

          {/* SIDEBAR Array value 4 */}
          <Link to="/Import">
            <div className="flex mt-3 mb-30 px-4 py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer">
              <img src={menus[role][4].icon} alt="Imports" className="mr-5" />
              <p className="text-[#FFFFFF] text-[1.125rem]"> {menus[role][4].label} </p>
            </div>
          </Link>

          {role !== "admin" && (
            <>
              <hr className="border-[#DBDBDB] rounded border-1" />

              <div className="flex mt-10 px-4 py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer">
                <img src={Notification} alt="Notification" className="mr-5" />
                <p className="text-[#FFFFFF] text-[1.125rem]">Notification</p>
              </div>

              <div className="flex mt-3 px-4 py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer">
                <img src={Profile} alt="Profile" className="mr-5" />
                <p className="text-[#FFFFFF] text-[1.125rem]">Profile</p>
              </div>

              <div className="flex mt-3 mb-60 px-4 py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer">
                <img src={AccountSettings} alt="Settings" className="mr-5" />
                <p className="text-[#FFFFFF] text-[1.125rem]">Account Settings</p>
              </div>
            </>
          )}

          {/* SIDEBAR Log Out */}
          <div className="mt-auto">
            <Link to="/Login">
              <div className="flex px-4 py-3 hover:bg-[#00A15D] hover:rounded-xl cursor-pointer">
                <img src={LogOut} alt="Logout" className="mr-5" />
                <p className="text-[#FFFFFF] text-[1.125rem]">Log out</p>
              </div>
            </Link>
          </div>
          
        </div>
      </aside>
    </>
  );
}
