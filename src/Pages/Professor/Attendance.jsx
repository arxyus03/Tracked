import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ClassManagementLight from '../../assets/ClassManagement(Light).svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Search from '../../assets/Search.svg';

export default function Attendance() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);  

  return (
    <div>
      <Sidebar role="teacher" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen} userName="Jane Doe" />

        <div className="p-5 text-[#465746]">
          {/* "Header" of ATTENDANCE */}
          <div className="flex">
            <img src={ClassManagementLight} alt="ClassManagement" className='h-7 w-7 mr-5 mt-1' />
            <p className="font-bold text-[1.5rem]"> Class Management </p>
          </div>

          <div className="flex items-center justify-between text-[1.125rem]">
            <div className="flex space-x-3">
              <span>SUBJECTCODE:</span>
              <span>Attendance</span>
            </div>

            <div className="flex items-center space-x-3 mr-5">
              <span>Section:</span>
              <span>A</span>
              <Link to={"/SubjectDetails"}>
                <img src={BackButton} alt="ClassManagement" className="h-7 w-7 cursor-pointer" />
              </Link>
            </div>
          </div>

          <hr className="opacity-60-[#465746] rounded-1 mt-5" />

          {/* ATTENDANCE content */}

          {/* Search and History Button */}
          <div className="flex justify-between items-center mt-5">
            {/* Search input with icon inside */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-[400px] h-9 sm:h-10 lg:h-11 rounded-md pl-3 pr-10 shadow-md outline-none text-[#465746] bg-white text-xs sm:text-sm"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#465746]"
              >
                <img
                  src={Search}
                  alt="Search"
                  className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7"
                />
              </button>
            </div>

            <Link to={"/AttendanceHistory"}>
              <button className="font-bold px-3 py-2 bg-white rounded-md shadow-md hover:border-[#00874E] hover:border-2 text-[1.125rem] whitespace-nowrap cursor-pointer ml-3">
                History
              </button>
            </Link>
          </div>

          {/* ATTENDANCE TABLE */}
          <div className="rounded-md overflow-hidden shadow-md p-5 mt-5 bg-[#fff] text-[1.125rem]">
            <table className="table-auto w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="px-4 py-2">No.</th>
                  <th className="px-4 py-2">Student No.</th>
                  <th className="px-4 py-2">Full Name</th>
                  <th className="px-2 py-2 text-[#EF4444] text-center w-20">Absent</th>
                  <th className="px-2 py-2 text-[#767EE0] text-center w-20">Late</th>
                  <th className="px-2 py-2 text-[#00A15D] text-center w-20">Present</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { no: 1, studentNo: "2023001", name: "Alice Cruz" },
                  { no: 2, studentNo: "2023002", name: "John Dela Cruz" },
                  { no: 3, studentNo: "2023003", name: "Maria Santos" },
                  { no: 4, studentNo: "2023004", name: "Mark Reyes" },
                  { no: 5, studentNo: "2023005", name: "Sophia Lim" },
                ]

                .map((student) => (
                  <tr key={student.no} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{student.no}</td>
                    <td className="px-4 py-2">{student.studentNo}</td>
                    <td className="px-4 py-2">{student.name}</td>

                    {/* Absent */}
                    <td className="px-2 py-2 w-20">
                      <div className="flex justify-center items-center">
                        <input
                          type="radio"
                          name={`attendance-${student.no}`}
                          className="appearance-none w-7 h-7 border-2 border-[#EF4444] rounded-md checked:bg-[#EF4444]"
                        />
                      </div>
                    </td>

                    {/* Late */}
                    <td className="px-2 py-2 w-20">
                      <div className="flex justify-center items-center">
                        <input
                          type="radio"
                          name={`attendance-${student.no}`}
                          className="appearance-none w-7 h-7 border-2 border-[#767EE0] rounded-md checked:bg-[#767EE0]"
                        />
                      </div>
                    </td>

                    {/* Present */}
                    <td className="px-2 py-2 w-20">
                      <div className="flex justify-center items-center">
                        <input
                          type="radio"
                          name={`attendance-${student.no}`}
                          className="appearance-none w-7 h-7 border-2 border-[#00A15D] rounded-md checked:bg-[#00A15D]"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* EDIT, MARK ALL, SAVE Buttons */}
          <div className="flex justify-end space-x-3 mt-5">
            <button className="px-4 py-2 bg-[#979797] text-[#fff] font-bold rounded-md hover:border-2 hover:border-[#007846]">
              Mark All as Present
            </button>
            <button className="px-4 py-2 bg-[#00A15D] text-[#fff] font-bold rounded-md hover:border-2 hover:border-[#007846]">
              Save
            </button>
          </div>

          </div>


        </div>
      </div>
    </div>
  )
}
