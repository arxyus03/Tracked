import React, { useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Analytics from "../../assets/Analytics(Light).svg";
import UserIcon from "../../assets/UserIcon(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";

export default function AnalyticsIndividualInfo() {
  const [isOpen, setIsOpen] = useState(false);

  const student = { id: "202210718", name: "Lastname, Firstname M.I." };

  const submittedActivities = [
    { task: "Activity 1", title: "Mockup Design", date: "January 5, 2025", points: 10 },
    { task: "Activity 2", title: "UX Research", date: "January 12, 2025", points: 15 },
  ];

  const missedActivities = [
    { task: "Activity 3", title: "Wireframe Submission", date: "January 20, 2025", points: 10 },
  ];

  const attendance = {
    present: 35,
    late: 5,
    absent: 2,
    total: 42,
  };

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* PAGE CONTENT */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8 text-[#465746]">
          {/* HEADER */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img 
                src={Analytics} 
                alt="Analytics" 
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3" 
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">
                Analytics
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-sm sm:text-base lg:text-lg">
              Individual Student Information
            </p>
            <Link to="/AnalyticsProf" className="lg:hidden">
              <img 
                src={BackButton} 
                alt="BackButton" 
                className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 cursor-pointer" 
              />
            </Link>
          </div>

          <hr className="border-[#465746]/30 mb-4 sm:mb-5" />

          {/* STUDENT INFO */}
          <div className="flex items-center bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5 gap-3 sm:gap-4">
            <img 
              src={UserIcon} 
              alt="User" 
              className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" 
            />
            <div>
              <p className="text-xs sm:text-sm lg:text-base">
                Student No: {student.id}
              </p>
              <p className="font-bold text-base sm:text-lg lg:text-xl">
                {student.name}
              </p>
            </div>
          </div>

          {/* DOWNLOAD BUTTON */}
          <div className="flex justify-end mb-4 sm:mb-5">
            <button className="font-bold px-4 sm:px-5 py-2 bg-white rounded-md shadow-md hover:border-[#00874E] hover:border-2 text-xs sm:text-sm lg:text-base transition-all">
              Download
            </button>
          </div>

          {/* SUBMITTED ACTIVITIES */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5">
            <p className="font-bold text-[#00874E] mb-3 text-base sm:text-lg lg:text-xl">
              Submitted Activities
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />
            
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <div className="overflow-hidden rounded-lg border border-gray-300">
                  <table className="min-w-full text-left border-collapse text-xs sm:text-sm lg:text-base">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 sm:p-3 font-bold">Task</th>
                        <th className="p-2 sm:p-3 font-bold">Title</th>
                        <th className="p-2 sm:p-3 font-bold whitespace-nowrap">Submission Date</th>
                        <th className="p-2 sm:p-3 text-center font-bold">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submittedActivities.map((a, i) => (
                        <tr key={i} className="hover:bg-gray-50 border-t border-gray-200">
                          <td className="p-2 sm:p-3 whitespace-nowrap">{a.task}</td>
                          <td className="p-2 sm:p-3">{a.title}</td>
                          <td className="p-2 sm:p-3 whitespace-nowrap">{a.date}</td>
                          <td className="p-2 sm:p-3 text-center">{a.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* MISSED ACTIVITIES */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5">
            <p className="font-bold text-red-500 mb-3 text-base sm:text-lg lg:text-xl">
              Missed Activities
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />
            
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <div className="overflow-hidden rounded-lg border border-gray-300">
                  <table className="min-w-full text-left border-collapse text-xs sm:text-sm lg:text-base">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 sm:p-3 font-bold">Task</th>
                        <th className="p-2 sm:p-3 font-bold">Title</th>
                        <th className="p-2 sm:p-3 font-bold whitespace-nowrap">Due Date</th>
                        <th className="p-2 sm:p-3 text-center font-bold">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missedActivities.map((a, i) => (
                        <tr key={i} className="hover:bg-gray-50 border-t border-gray-200">
                          <td className="p-2 sm:p-3 whitespace-nowrap">{a.task}</td>
                          <td className="p-2 sm:p-3">{a.title}</td>
                          <td className="p-2 sm:p-3 whitespace-nowrap">{a.date}</td>
                          <td className="p-2 sm:p-3 text-center">{a.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ATTENDANCE */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-6 sm:mb-8 lg:mb-10">
            <p className="font-bold mb-3 sm:mb-4 text-base sm:text-lg lg:text-xl">
              Attendance
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />
            <Link to={"/AnalyticsAttendanceInfo"}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center text-xs sm:text-sm lg:text-base">
                <div className="p-2 sm:p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                  <p className="font-semibold text-green-600 mb-1 sm:mb-2">Present</p>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {attendance.present}
                  </span>
                </div>
                <div className="p-2 sm:p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                  <p className="font-semibold text-yellow-500 mb-1 sm:mb-2">Late</p>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {attendance.late}
                  </span>
                </div>
                <div className="p-2 sm:p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                  <p className="font-semibold text-red-500 mb-1 sm:mb-2">Absent</p>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {attendance.absent}
                  </span>
                </div>
                <div className="p-2 sm:p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                  <p className="font-semibold text-gray-700 mb-1 sm:mb-2">Total Held</p>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {attendance.total}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}