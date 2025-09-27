import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import AnnouncementIcon from "../../assets/Announcement(Light).svg";
import Search from "../../assets/Search.svg";
import Add from "../../assets/Add(Light).svg";

// Import your ActivityCard component
import ActivityCard from "../../Components/ActivityCard";

export default function Announcement() {
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Sidebar */}
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"} `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />
        
        {/* Page content */}
        <div className="p-3 sm:p-4 md:p-5 lg:p-5 xl:p-5">
          {/* Page title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 sm:mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <img
                src={AnnouncementIcon}
                alt="Announcement"
                className="h-7 w-7 sm:h-6 sm:w-7 md:h-7 md:w-7 mr-3 sm:mr-3 mt-0.5 ml-2"
              />
              <h1 className="font-bold text-xl sm:text-xl md:text-xl lg:text-[1.5rem] text-[#465746]">
                Announcement
              </h1>
            </div>
          </div>

          {/* Subtitle */}
          <div className="text-sm sm:text-base md:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5 ml-2">
            <span>Post a class Announcement</span>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          {/* Filter + Action buttons */}
          <div className="flex flex-row mt-4 sm:mt-5 justify-between items-center">
            {/* Filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center font-bold px-3 py-2 bg-[#fff] rounded-md cursor-pointer shadow-md hover:border-[#00874E] hover:border-2 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[140px]"
              >
                <span className="flex-1 text-left">Filter</span>
                <img
                  src={ArrowDown}
                  alt="ArrowDown"
                  className="ml-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-6 lg:w-6"
                />
              </button>

              {/* Dropdown options */}
              {open && (
                <div className="absolute top-full mt-1 bg-white rounded-md w-full sm:w-48 shadow-lg border border-gray-200 z-10">
                  {["All", "Unread", "Read", "Newest"].map((option) => (
                    <button
                      key={option}
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add + Search */}
            <div className="flex items-center gap-3">
              {/* Add button */}
              <button className="font-bold py-2 bg-[#fff] rounded-md w-10 sm:w-12 h-10 sm:h-12 shadow-md flex items-center justify-center hover:border-[#00874E] hover:border-2 cursor-pointer">
                <img
                  src={Add}
                  alt="Add"
                  className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                />
              </button>

              {/* Search bar */}
              <div className="relative flex-1 lg:w-64 xl:w-80">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none bg-white text-xs sm:text-sm"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <img
                    src={Search}
                    alt="Search"
                    className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Activity Cards Section */}
          <div className="mt-6 space-y-4">
            <ActivityCard
              subject="GNED09"
              title="New Activity"
              postedBy="Prof. LastName, FirstName MI"
              datePosted="August 10, 2025"
              deadline="August 17, 2025 | 11:59pm"
              instructions="Mockup Instruction"
            />
            <ActivityCard
              subject="COMP101"
              title="Lab Exercise"
              postedBy="Prof. Doe, John A."
              datePosted="August 11, 2025"
              deadline="August 18, 2025 | 11:59pm"
              instructions="Complete the lab exercise and submit your outputs."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
