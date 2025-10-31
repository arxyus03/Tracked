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
        className={`transition-all duration-300 ${
          isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"
        }`}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* PAGE CONTENT */}
        <div className="p-5 text-[#465746]">
          {/* header */}
          <div className="flex items-center mb-5">
            <img src={Analytics} alt="Analytics" className="h-7 w-7 mr-3" />
            <p className="font-bold text-[1.5rem]">Analytics</p>
          </div>

          <div className="flex items-center justify-between ml-2 mb-4">
            <p> Individual Student Information </p>
            <Link to="/AnalyticsProf" className="hidden sm:block">
              <img src={BackButton} alt="BackButton" className="h-6 w-6 sm:h-7 sm:w-7" />
            </Link>
          </div>

          <hr className="opacity-60 border-[#465746] mb-5" />
          

          {/* STUDENT INFO */}
          <div className="flex items-center bg-white p-5 rounded-md shadow mb-5 gap-4">
            <img src={UserIcon} alt="Details" className="w-8 h-8" />
            <div>
              <p className="text-sm">Student No: {student.id}</p>
              <p className="font-bold text-lg">{student.name}</p>
            </div>
          </div>

          {/* DOWNLOAD BUTTON */}
          <div className="flex justify-end mb-5">
            <button className="font-bold px-5 py-2 bg-white rounded-md shadow hover:border-[#00874E] hover:border-2 text-sm sm:text-base">
              Download
            </button>
          </div>

          {/* SUBMITTED ACTIVITIES */}
          <div className="bg-white p-5 rounded-md shadow mb-5">
            <p className="font-bold text-[#00874E] mb-3">Submitted Activities</p>
            <hr className="mb-3" />
            <div className="overflow-hidden rounded-lg border border-gray-300">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3">Task</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Submission Date</th>
                    <th className="p-3 text-center">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedActivities.map((a, i) => (
                    <tr key={i} className="hover:bg-gray-50 border-t border-gray-200">
                      <td className="p-3">{a.task}</td>
                      <td className="p-3">{a.title}</td>
                      <td className="p-3">{a.date}</td>
                      <td className="p-3 text-center">{a.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MISSED ACTIVITIES */}
          <div className="bg-white p-5 rounded-md shadow mb-5">
            <p className="font-bold text-red-500 mb-3">Missed Activities</p>
            <hr className="mb-3" />
            <div className="overflow-hidden rounded-lg border border-gray-300">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3">Task</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3 text-center">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {missedActivities.map((a, i) => (
                    <tr key={i} className="hover:bg-gray-50 border-t border-gray-200">
                      <td className="p-3">{a.task}</td>
                      <td className="p-3">{a.title}</td>
                      <td className="p-3">{a.date}</td>
                      <td className="p-3 text-center">{a.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ATTENDANCE */}
          <div className="bg-white p-5 rounded-md shadow mb-10">
            <p className="font-bold mb-3">Attendance</p>
            <hr className="mb-3" />
            <Link to={"/AnalyticsAttendanceInfo"}>
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
                  <p className="font-semibold text-gray-700">Total Held</p>
                  <span>{attendance.total}</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
