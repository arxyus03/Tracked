import React, { useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Analytics from "../../assets/Analytics(Light).svg";
import UserIcon from "../../assets/UserIcon(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";

export default function AnalyticsAttendanceInfo() {
  const [isOpen, setIsOpen] = useState(false);

  const student = {
    id: "202210718",
    name: "Lastname, Firstname M.I.",
  };

  const attendance = {
    absentDates: ["August 1, 2025", "August 3, 2025"],
    lateDates: ["August 5, 2025", "August 8, 2025"],
    present: 35,
    late: 5,
    absent: 2,
    total: 42,
  };

  const missedActivities = [
    { task: "Activity 1", title: "Mockup Design", date: "January 5, 2025", points: 10 },
    { task: "Activity 2", title: "UI Concept", date: "January 12, 2025", points: 15 },
  ];

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`transition-all duration-300 ${
          isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"
        }`}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* PAGE CONTENT */}
        <div className="p-5 text-[#465746]">
          {/* HEADER */}
          <div className="flex items-center mb-5">
            <img src={Analytics} alt="Analytics" className="h-7 w-7 mr-3" />
            <p className="font-bold text-[1.5rem]">Analytics</p>
          </div>

          <div className="flex items-center justify-between ml-2 mb-4">
            <p> Individual Student Attendance Record </p>
            <Link to="/AnalyticsIndividualInfo">
              <img src={BackButton} alt="BackButton" className="h-6 w-6 sm:h-7 sm:w-7" />
            </Link>
          </div>

          <hr className="opacity-60 border-[#465746] mb-5" />

          {/* STUDENT INFO */}
          <div className="flex items-center bg-white p-5 rounded-md shadow mb-5 gap-4">
            <img src={UserIcon} alt="User" className="w-8 h-8" />
            <div>
              <p className="text-sm">Student No: {student.id}</p>
              <p className="font-bold text-lg">{student.name}</p>
            </div>
          </div>

          {/* ATTENDANCE DATES */}
          <div className="bg-white p-5 rounded-lg shadow mb-5">
            <p className="font-bold text-[#00874E] mb-3">Attendance Details</p>
            <hr className="mb-3" />

            <div className="overflow-hidden rounded-lg border border-gray-300">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">Date Absent</th>
                    <th className="p-3">Date Late</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.absentDates.map((absent, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-3">{absent}</td>
                      <td className="p-3">
                        {attendance.lateDates[i] || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTALS */}
          <div className="bg-white p-5 rounded-lg shadow mb-10">
            <p className="font-bold mb-3">Attendance Summary</p>
            <hr className="mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="font-semibold text-green-600">Present</p>
                <span>{attendance.present}</span>
              </div>
              <div>
                <p className="font-semibold text-yellow-500">Late</p>
                <span>{attendance.late}</span>
              </div>
              <div>
                <p className="font-semibold text-red-500">Absent</p>
                <span>{attendance.absent}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Total Days</p>
                <span>{attendance.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
