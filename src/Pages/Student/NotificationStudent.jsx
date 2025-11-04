import React, { useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import NotificationCard from "../../Components/NotificationCard";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Notification from "../../assets/NotificationIcon.svg";
import Search from "../../assets/Search.svg";

export default function NotificationProf() {
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [filterOption, setFilterOption] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`transition-all duration-300 ${
          isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"
        }`}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* content of NOTIFICATION*/}
        <div className="text-[#465746] p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img src={Notification} alt="Notification" className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">Notification</h1>
            </div>
            <div className='flex justify-between'>
              <div className="text-sm sm:text-base lg:text-lg">
                <span>Account Notification</span>
              </div>
              <div className="flex text-sm sm:text-base lg:text-lg">
                <span> 2nd Semester 2024 - 2025  </span>
                <img src={ArrowDown} alt="ArrowDown" className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Filter and Search - Responsive Layout */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6">
            {/* Filter dropdown */}
            <div className="relative sm:flex-initial filter-dropdown">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full sm:w-auto font-bold px-4 py-2.5 bg-white rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] active:border-[#00874E] transition-all duration-200 text-sm sm:text-base sm:min-w-[160px] cursor-pointer touch-manipulation"
              >
                <span>{filterOption}</span>
                <img
                  src={ArrowDown}
                  alt=""
                  className={`ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Filter Dropdown SELECTIONS */}
              {open && (
                <div className="absolute top-full mt-2 bg-white rounded-md w-full sm:min-w-[200px] shadow-xl border border-gray-200 z-20 overflow-hidden">
                  {["All", "Unread", "Read", "Newest"].map((filter) => (
                    <button
                      key={filter}
                      className={`block px-4 py-2.5 w-full text-left hover:bg-gray-100 active:bg-gray-200 text-sm sm:text-base transition-colors duration-150 cursor-pointer touch-manipulation ${
                        filterOption === filter ? 'bg-gray-50 font-semibold' : ''
                      }`}
                      onClick={() => {
                        setFilterOption(filter);
                        setOpen(false);
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search bar */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 sm:h-12 rounded-md px-4 py-2.5 pr-12 shadow-md outline-none bg-white text-sm sm:text-base border-2 border-transparent focus:border-[#00874E] transition-colors"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <img
                  src={Search}
                  alt="Search"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </button>
            </div>
          </div>

          {/* Notification Cards */}
          <div className="space-y-4 sm:space-y-5">
            <NotificationCard
              title="New Account Created"
              description="An account for John Doe has been successfully created."
              date="September 27, 2025"
              isRead={false}
            />
            <NotificationCard
              title="Password Changed"
              description="Jane Doe changed their password successfully."
              date="September 25, 2025"
              isRead={true}
            />
            <NotificationCard
              title="Profile Updated"
              description="Mary Smith has updated her profile information."
              date="September 24, 2025"
              isRead={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}