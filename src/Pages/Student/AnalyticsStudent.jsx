import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import ActivityOverviewStudent from "../../Components/ActivityOverviewStudent";

import Analytics from '../../assets/Analytics(Light).svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import Search from "../../assets/Search.svg";
import Details from '../../assets/Details(Light).svg';
import Check from '../../assets/CheckTable.svg';

export default function AnalyticsStudent() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubject, setOpenSubject] = useState(false);
  const [openSection, setOpenSection] = useState(false);

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
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        <div className="text-[#465746] p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img src={Analytics} alt="Subjects" className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">Subjects</h1>
            </div>
            <div className='flex justify-between'>
              <div className="text-sm sm:text-base lg:text-lg">
                <span>Enrolled Subjects</span>
              </div>
              <div className="flex text-sm sm:text-base lg:text-lg">
                <span> 2nd Semester 2024 - 2025  </span>
                <img src={ArrowDown} alt="ArrowDown" className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-4 sm:mb-5" />

          {/* Filter and Search Section */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 justify-between items-stretch lg:items-center mb-4 sm:mb-5">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
              <div className="relative w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
                <button
                  onClick={() => { setOpenSubject(!openSubject); setOpenSection(false); }}
                  className="flex w-full items-center justify-between font-bold px-3 py-2 sm:py-2.5 bg-[#fff] rounded-md cursor-pointer shadow-md text-sm sm:text-base text-[#465746]">
                  <span>Subject</span>
                  <img 
                    src={ArrowDown} 
                    alt="ArrowDown" 
                    className="h-4 w-4 sm:h-5 sm:w-5 ml-2" 
                  />
                </button>
                {openSubject && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-full shadow-lg border border-gray-200 z-10">
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-sm sm:text-base text-[#465746]" 
                      onClick={() => { setOpenSubject(false); }}>
                      Math
                    </button>
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-sm sm:text-base text-[#465746]" 
                      onClick={() => { setOpenSubject(false); }}>
                      Science
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="relative w-full lg:w-64 xl:w-80">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none bg-white text-xs sm:text-sm text-[#465746]"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <img src={Search} alt="Search" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </button>
            </div>
          </div>

          {/* ActivityOverview component */}
          <ActivityOverviewStudent
            quizzesList={quizzesList}
            assignmentsList={assignmentsList}
            activitiesList={activitiesList}
            projectsList={projectsList}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />


          {/* ACTIVITY LIST */}
          <div className="bg-[#fff] p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mt-4 sm:mt-5 text-[#465746]">
            <p className="font-bold mb-3 sm:mb-4 text-base sm:text-lg lg:text-xl">
              {displayedLabel}
            </p>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <table className="min-w-full border-collapse text-xs sm:text-sm lg:text-base">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-2 sm:p-3 font-bold">Task</th>
                      <th className="text-left p-2 sm:p-3 font-bold">Title</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-[#00A15D]">Submitted</th>
                      <th className="text-left p-2 sm:p-3 font-bold text-[#FF6666]">Missing</th>
                      <th className="text-left p-2 sm:p-3 font-bold">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedList.map(item => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2 sm:p-3 whitespace-nowrap">{item.task}</td>
                        <td className="p-2 sm:p-3">{item.title}</td>
                        <td className="p-2 sm:p-3 text-[#00A15D]"> <img src={Check} /> </td>
                        <td className="p-2 sm:p-3 text-[#FF6666]"></td>
                        <td className="p-2 sm:p-3 whitespace-nowrap">{item.deadline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Student Attendance Tracking */}
          <div className="bg-[#fff] rounded-lg sm:rounded-xl shadow-md mt-4 sm:mt-5 p-4 sm:p-5 text-[#465746]">
            <p className="text-base sm:text-lg lg:text-xl font-bold">
              Attendance:
            </p>
            <p> Note: Students with 
            <span className='text-[#FF6666] font-bold'> 3 accumulated absences </span>
            will be dropped from the course. 
            <span className='text-[#767EE0] font-bold'> 3 late arrivals </span>
            are equivalent to one absent. </p>
            <hr className="border-[#465746]/30 my-3 sm:my-4" />
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <table className="min-w-full border-collapse text-xs sm:text-sm lg:text-base">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold">Subject</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#00A15D]">Present</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#767EE0]">Late</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#FF6666]">Absent</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold whitespace-nowrap">Total of Class Held</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-3">Subject 1</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#00A15D]">20</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#767EE0]">0</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FF6666]">0</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">20</td>

                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <Link to={"/AttendanceHistoryStudent"}>
                          <img src={Details} alt="Details" className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:opacity-70" />
                        </Link>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-3">Subject 2 
                        <span className=' ml-5 font-bold text-[#FF6666]'>Warning:</span> <span> You have 1 Absent </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#00A15D]">19</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#767EE0]">0</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FF6666]">1 </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">20</td>

                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <Link to={"/AttendanceHistoryStudent"}>
                          <img src={Details} alt="Details" className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:opacity-70" />
                        </Link>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-3">Subject 3</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#00A15D]">17</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#767EE0]">2</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FF6666]">0</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">20</td>

                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <Link to={"/AttendanceHistoryStudent"}>
                          <img src={Details} alt="Details" className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:opacity-70" />
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}