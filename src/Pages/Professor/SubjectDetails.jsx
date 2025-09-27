import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import ActivityCard from "../../Components/Activities";

import ClassManagementLight from '../../assets/ClassManagement(Light).svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Add from "../../assets/Add(Light).svg";


export default function SubjectDetails() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);  

  const students = [
    { id: 1, no: "2023001", name: "Alice Cruz" },
    { id: 2, no: "2023002", name: "John Dela Cruz" },
    { id: 3, no: "2023003", name: "Maria Santos" },
  ];

  return (
    <div>
      <Sidebar role="teacher" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen} userName="Jane Doe" />

        <div className="p-5 text-[#465746]">
          {/* "Header" of SUBJECT DETAILS PROF */}
          <div className="flex">
            <img src={ClassManagementLight} alt="ClassManagement" className='h-7 w-7 mr-5 mt-1' />
            <p className="font-bold text-[1.5rem]"> Class Management </p>
          </div>

          <div className="flex items-center justify-between text-[1.125rem]">
            <div className="flex space-x-3">
              <span>SUBJECTCODE:</span>
              <span>Subject Name</span>
            </div>

            <div className="flex items-center space-x-3 mr-5">
              <span>Section:</span>
              <span>A</span>
              <Link to={"/ClassManagement"}>
                <img src={BackButton} alt="ClassManagement" className="h-7 w-7 cursor-pointer" />
              </Link>
            </div>
          </div>

          <hr className="opacity-60-[#465746] rounded-1 mt-5" />

          {/* ATTENDANCE and ADD Button */}
          <div className="flex items-center justify-between w-full mt-4">

            <Link to={"/Attendance"}>
              <button className="px-5 py-2 bg-white text-[#465746] font-semibold rounded-md shadow-md cursor-pointer">
                ATTENDANCE
              </button>
            </Link>

            <button className="p-2 bg-[#fff] rounded-md shadow-md cursor-pointer">
              <img src={Add} alt="Add" className="h-6 w-6" />
            </button>
          </div>

          {/* ACTIVITY CARDS */}
          <ActivityCard
            title="ACTIVITY 1"
            description="HTML & CSS Design layout"
            status="Not Graded"
            deadline="January 5, 2025"
            students={students}
          />
          <ActivityCard
            title="ACTIVITY 1"
            description="HTML & CSS Design layout"
            status="Not Graded"
            deadline="January 5, 2025"
            students={students}
          />
          
        </div>
      </div>
    </div>
  )
}
