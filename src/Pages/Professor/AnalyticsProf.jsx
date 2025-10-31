import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import ActivityOverview from "../../Components/ActivityOverview"; // <- new component

import Analytics from '../../assets/Analytics(Light).svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import Search from "../../assets/Search.svg";
import Details from '../../assets/Details(Light).svg';

export default function AnalyticsProf() {
  const [isOpen, setIsOpen] = useState(true);
  const [openSubject, setOpenSubject] = useState(false);
  const [openSection, setOpenSection] = useState(false);

  // parent controls selectedFilter so ActivityOverview and table stay synced
  const [selectedFilter, setSelectedFilter] = useState("");

  // ---------- DATA ----------
  const quizzesList = [
    { id: 1, task: "Quiz 1", title: "Algebra Basics", submitted: 28, missing: 2, deadline: "Sept 25, 2025" },
    { id: 2, task: "Quiz 2", title: "Geometry", submitted: 27, missing: 3, deadline: "Oct 2, 2025" },
    { id: 3, task: "Quiz 3", title: "Trigonometry", submitted: 29, missing: 1, deadline: "Oct 10, 2025" },
    { id: 4, task: "Quiz 4", title: "Calculus Intro", submitted: 25, missing: 4, deadline: "Oct 20, 2025" }
  ];
  const assignmentsList = [
    { id: 1, task: "Assign 1", title: "Essay 1", submitted: 20, missing: 8, deadline: "Sept 30, 2025" }
  ];
  const activitiesList = [
    { id: 1, task: "Activity 1", title: "Group Work", submitted: 22, missing: 6, deadline: "Oct 1, 2025" },
    { id: 2, task: "Activity 2", title: "In-class Task", submitted: 18, missing: 10, deadline: "Oct 8, 2025" }
  ];
  const projectsList = [
    { id: 1, task: "Project 1", title: "Final Project", submitted: 15, missing: 5, deadline: "Nov 1, 2025" }
  ];
  // ------------------------------------------------------------

  const displayedList = selectedFilter === 'Assignment'
    ? assignmentsList
    : selectedFilter === 'Activities'
    ? activitiesList
    : selectedFilter === 'Projects'
    ? projectsList
    : quizzesList;

  const displayedLabel = selectedFilter === '' ? 'Quizzes' : selectedFilter;

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        <div className="p-5 text-[#465746]">
          <div className="flex">
            <img src={Analytics} alt="Analytics" className='color-[#465746] h-7 w-7 mr-5 mt-1' />
            <p className="font-bold text-[1.5rem]"> Analytics </p>
          </div>

          <div className="flex text-[1.125rem]">
            <span> Student Performance </span>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          <div className="flex flex-col lg:flex-row mt-5 gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <button
                  onClick={() => { setOpenSubject(!openSubject); setOpenSection(false); }}
                  className="flex w-80 items-center font-bold px-3 py-2 bg-[#fff] rounded-md cursor-pointer shadow-md">
                  Subject
                  <img src={ArrowDown} alt="ArrowDown" className="ml-50 h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                </button>
                {openSubject && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-80 shadow-lg border border-gray-200 z-10">
                    <button className="block px-3 py-2 w-full text-left hover:bg-gray-100" onClick={() => { setOpenSubject(false); }}>
                      Math
                    </button>
                    <button className="block px-3 py-2 w-full text-left hover:bg-gray-100" onClick={() => { setOpenSubject(false); }}>
                      Science
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 lg:w-64 xl:w-80">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none bg-white text-xs sm:text-sm"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover">
                  <img src={Search} alt="Search" className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                </button>
              </div>
            </div>
          </div>

          {/* ActivityOverview component (separated) */}
          <ActivityOverview
            quizzesList={quizzesList}
            assignmentsList={assignmentsList}
            activitiesList={activitiesList}
            projectsList={projectsList}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />

          {/* ACTIVITY LIST */}
          <div className='bg-[#fff] p-5 rounded-md mt-5 shadow-md'>
            <p className='font-bold mb-3 text-[1.125rem]'>{displayedLabel}</p>
            <table className="w-full border-collapse text-[1.125rem]">
              <thead>
                <tr>
                  <th className="text-left p-2">Task</th>
                  <th className="text-left p-2">Title</th>
                  <th className="text-left p-2 text-[#00A15D]">Submitted</th>
                  <th className="text-left p-2 text-[#FF6666]">Missing</th>
                  <th className="text-left p-2">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {displayedList.map(item => (
                  <tr key={item.id}>
                    <td className="p-2">{item.task}</td>
                    <td className="p-2">{item.title}</td>
                    <td className="p-2">{item.submitted}</td>
                    <td className="p-2">{item.missing}</td>
                    <td className="p-2">{item.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Student Attendance Tracking (unchanged below here) */}
          <div className='bg-[#fff] rounded-lg shadow-md mt-5 p-5'>
            <p className='text-[1.125rem] font-bold'> Student Attendance Tracking </p>
            <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />
            <div className="overflow-x-auto mt-5">
              <table className="min-w-full border-collapse rounded-md overflow-hidden shadow-md">
                <thead className="text-left">
                  <tr>
                    <th className="px-4 py-2">No.</th>
                    <th className="px-4 py-2">Student No.</th>
                    <th className="px-4 py-2">Student Name</th>
                    <th className="px-4 py-2 text-[#00A15D]">Present</th>
                    <th className="px-4 py-2 text-[#FF6666]">Absent</th>
                    <th className="px-4 py-2 text-[#00A15D]">Submitted</th>
                    <th className="px-4 py-2 text-[#FF6666]">Missed</th>
                    <th className="px-4 py-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-100">
                    <td className="px-4 py-2">1</td>
                    <td className="px-4 py-2">2025-001</td>
                    <td className="px-4 py-2">John Smith</td>
                    <td className="px-4 py-2">12</td>
                    <td className="px-4 py-2">2</td>
                    <td className="px-4 py-2">5</td>
                    <td className="px-4 py-2">1</td>
                    <Link to={"/AnalyticsIndividualInfo"}>
                      <td className="px-4 py-2">
                        <img src={Details} alt="Details" className="w-5 h-5" />
                      </td>
                    </Link>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="px-4 py-2">2</td>
                    <td className="px-4 py-2">2025-002</td>
                    <td className="px-4 py-2">Jane Doe</td>
                    <td className="px-4 py-2">11</td>
                    <td className="px-4 py-2">3</td>
                    <td className="px-4 py-2">6</td>
                    <td className="px-4 py-2">0</td>
                    <Link to={"/AnalyticsIndividualInfo"}>
                      <td className="px-4 py-2">
                        <img src={Details} alt="Details" className="w-5 h-5" />
                      </td>
                    </Link>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="px-4 py-2">3</td>
                    <td className="px-4 py-2">2025-003</td>
                    <td className="px-4 py-2">Mark Lee</td>
                    <td className="px-4 py-2">10</td>
                    <td className="px-4 py-2">5</td>
                    <td className="px-4 py-2">4</td>
                    <td className="px-4 py-2">2</td>
                    <Link to={"/AnalyticsIndividualInfo"}>
                      <td className="px-4 py-2">
                        <img src={Details} alt="Details" className="w-5 h-5" />
                      </td>
                    </Link>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
