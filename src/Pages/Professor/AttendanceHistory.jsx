import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import AttendanceCard from "../../Components/AttendanceCard";

import ClassManagementLight from '../../assets/ClassManagement(Light).svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Search from '../../assets/Search.svg';

export default function AttendanceHistory() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const attendanceData = [
    
    {
      date: "August 8, 2025",
      students: [
        { no: 1, studentNo: "2023001", name: "Alice Cruz", status: "Absent" },
        { no: 2, studentNo: "2023002", name: "John Dela Cruz", status: "Present" },
        { no: 3, studentNo: "2023003", name: "Maria Santos", status: "Absent" },
        { no: 4, studentNo: "2023004", name: "Mark Reyes", status: "Present" },
        { no: 5, studentNo: "2023005", name: "Sophia Lim", status: "Present" },
      ],
    },

    {
      date: "August 9, 2025",
      students: [
        { no: 1, studentNo: "2023010", name: "Lucas Tan", status: "Present" },
        { no: 2, studentNo: "2023011", name: "Angela Yu", status: "Absent" },
        { no: 3, studentNo: "2023012", name: "Henry Ong", status: "Present" },
      ],
    },
  ];

  return (
    <div>
      <Sidebar role="teacher" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen} userName="Jane Doe" />

        <div className="p-3 sm:p-4 md:p-5 lg:p-5 xl:p-5">
          {/* Header of ATTENDANCE HISTORY */}
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
              <span>Attendance History</span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 sm:mr-5">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Section:</span>
                <span>A</span>
              </div>
              <Link to={"/Attendance"} className="sm:hidden">
                <img 
                  src={BackButton} 
                  alt="Back" 
                  className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                />
              </Link>
            </div>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          {/* Search & Download */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-4 sm:mt-5 gap-3">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 sm:h-10 lg:h-11 rounded-md pl-3 pr-10 shadow-md outline-none text-[#465746] bg-white text-xs sm:text-sm"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#465746]"
              >
                <img src={Search} alt="Search" className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button className="font-bold px-4 sm:px-5 py-2 bg-white rounded-md shadow-md hover:border-[#00874E] hover:border-2 text-sm sm:text-base lg:text-[1.125rem] whitespace-nowrap cursor-pointer">
                Download
              </button>
            </div>
          </div>

          {/* Attendance Cards */}
          <div className="space-y-4 mt-4 sm:mt-5">
            {attendanceData.map((record, index) => (
              <AttendanceCard key={index} date={record.date} students={record.students} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}