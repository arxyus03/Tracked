import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ClassManagementLight from '../../assets/ClassManagement(Light).svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Search from '../../assets/Search.svg';

export default function Attendance() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);  

  return (
    <div>
      <Sidebar role="teacher" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen} userName="Jane Doe" />

        <div className="p-3 sm:p-4 md:p-5 lg:p-5 xl:p-5">
          {/* "Header" of ATTENDANCE */}
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

          {/* ATTENDANCE content */}

          {/* Search and History Button */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-4 sm:mt-5 gap-3">
            {/* Search input with icon inside */}
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
                <img
                  src={Search}
                  alt="Search"
                  className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7"
                />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link to={"/AttendanceHistory"}>
                <button className="font-bold px-4 sm:px-5 py-2 bg-white rounded-md shadow-md hover:border-[#00874E] hover:border-2 text-sm sm:text-base lg:text-[1.125rem] whitespace-nowrap cursor-pointer">
                  History
                </button>
              </Link>
            </div>
          </div>

          {/* ATTENDANCE TABLE */}
          <div className="rounded-md overflow-hidden shadow-md mt-4 sm:mt-5 bg-[#fff]">
            <div className="overflow-x-auto">
              <div className="p-3 sm:p-4 md:p-5">
                <table className="table-auto w-full border-collapse text-left min-w-[600px]">
                  <thead>
                    <tr className="text-xs sm:text-sm lg:text-[1.125rem]">
                      <th className="px-2 sm:px-4 py-2">No.</th>
                      <th className="px-2 sm:px-4 py-2">Student No.</th>
                      <th className="px-2 sm:px-4 py-2">Full Name</th>
                      <th className="px-2 py-2 text-[#EF4444] text-center w-16 sm:w-20">Absent</th>
                      <th className="px-2 py-2 text-[#767EE0] text-center w-16 sm:w-20">Late</th>
                      <th className="px-2 py-2 text-[#00A15D] text-center w-16 sm:w-20">Present</th>
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
                      <tr key={student.no} className="hover:bg-gray-50 text-xs sm:text-sm lg:text-base">
                        <td className="px-2 sm:px-4 py-2">{student.no}</td>
                        <td className="px-2 sm:px-4 py-2">{student.studentNo}</td>
                        <td className="px-2 sm:px-4 py-2">{student.name}</td>

                        {/* Absent */}
                        <td className="px-2 py-2 w-16 sm:w-20">
                          <div className="flex justify-center items-center">
                            <input
                              type="radio"
                              name={`attendance-${student.no}`}
                              className="appearance-none w-6 h-6 sm:w-7 sm:h-7 border-2 border-[#EF4444] rounded-md checked:bg-[#EF4444] cursor-pointer"
                            />
                          </div>
                        </td>

                        {/* Late */}
                        <td className="px-2 py-2 w-16 sm:w-20">
                          <div className="flex justify-center items-center">
                            <input
                              type="radio"
                              name={`attendance-${student.no}`}
                              className="appearance-none w-6 h-6 sm:w-7 sm:h-7 border-2 border-[#767EE0] rounded-md checked:bg-[#767EE0] cursor-pointer"
                            />
                          </div>
                        </td>

                        {/* Present */}
                        <td className="px-2 py-2 w-16 sm:w-20">
                          <div className="flex justify-center items-center">
                            <input
                              type="radio"
                              name={`attendance-${student.no}`}
                              className="appearance-none w-6 h-6 sm:w-7 sm:h-7 border-2 border-[#00A15D] rounded-md checked:bg-[#00A15D] cursor-pointer"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* EDIT, MARK ALL, SAVE Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-5">
                  <button className="w-full sm:w-auto px-4 py-2 bg-[#979797] text-[#fff] font-bold text-sm sm:text-base rounded-md hover:border-2 hover:border-[#007846] transition-all cursor-pointer">
                    Mark All as Present
                  </button>
                  <button className="w-full sm:w-auto px-4 py-2 bg-[#00A15D] text-[#fff] font-bold text-sm sm:text-base rounded-md hover:border-2 hover:border-[#007846] transition-all cursor-pointer">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}