import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import ActivityCard from "../../Components/Activities";

import ClassManagementLight from '../../assets/ClassManagement(Light).svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Add from "../../assets/Add(Light).svg";


export default function SubjectDetails() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);  

  const students = [
    { id: 1, no: "2023001", name: "Alice Cruz" },
    { id: 2, no: "2023002", name: "John Dela Cruz" },
    { id: 3, no: "2023003", name: "Maria Santos" },
  ];

  return (
    <div>
      <Sidebar role="teacher" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen} userName="Jane Doe" />

        <div className="p-3 sm:p-4 md:p-5 lg:p-5 xl:p-5">
          {/* "Header" of SUBJECT DETAILS PROF */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 sm:mb-4">
            <div className='flex items-center mb-2 sm:mb-0'>
              <img 
                src={ClassManagementLight} 
                alt="ClassManagement" 
                className='h-7 w-7 sm:h-6 sm:w-7 md:h-7 md:w-7 mr-3 sm:mr-3 mt-0.5 ml-2' 
              />
              <p className="font-bold text-xl sm:text-xl md:text-xl lg:text-[1.5rem] text-[#465746]">
                Class Management
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5 ml-2">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECTCODE:</span>
              <span>Attendance</span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 sm:mr-5">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Section:</span>
                <span>A</span>
              </div>
              <Link to={"/SubjectDetails"} className="sm:hidden">
                <img 
                  src={BackButton} 
                  alt="Back" 
                  className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                />
              </Link>
            </div>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          {/* ATTENDANCE and ADD Button */}
          <div className="flex items-center justify-between w-full mt-4 sm:mt-5 gap-3">

            <Link to={"/Attendance"} className="flex-1 sm:flex-initial">
              <button className="px-4 sm:px-5 py-2 bg-white font-semibold text-sm sm:text-base rounded-md shadow-md hover:border-[#00874E] hover:border-2 cursor-pointer">
                ATTENDANCE
              </button>
            </Link>

            <button className="p-2 bg-[#fff] rounded-md shadow-md hover:border-[#00874E] hover:border-2 flex-shrink-0 cursor-pointer">
              <img src={Add} alt="Add" className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* ACTIVITY CARDS */}
          <div className="space-y-4 mt-4 sm:mt-5">
            <ActivityCard
              title="ACTIVITY 1"
              description="HTML & CSS Design layout"
              status="Not Graded"
              deadline="January 5, 2025"
              students={students}
            />
            <ActivityCard
              title="ACTIVITY 2"
              description="HTML & CSS Design layout"
              status="Not Graded"
              deadline="January 5, 2025"
              students={students}
            />
          </div>
          
        </div>
      </div>
    </div>
  )
}