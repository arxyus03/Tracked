import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Analytics from '../../assets/Analytics(Light).svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import Search from "../../assets/Search.svg";
import Pie from '../../assets/Pie(Light).svg';
import Details from '../../assets/Details(Light).svg';

export default function AnalyticsProf() {
  const [isOpen, setIsOpen] = useState(true);
  const [openSubject, setOpenSubject] = useState(false);
  const [openSection, setOpenSection] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* content of CLASS MANAGEMENT*/}
        <div className="p-5 text-[#465746]">

          {/* "Header" of CLASS MANAGEMENT */}
          <div className="flex">
            <img src={Analytics} alt="Analytics" className='color-[#465746] h-7 w-7 mr-5 mt-1' />
            <p className="font-bold text-[1.5rem]"> Analytics </p>
          </div>

          <div className="flex text-[1.125rem]">
            <span> Student Performance </span>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          <div className="flex flex-col lg:flex-row mt-5 gap-4 justify-between items-center">
            
            {/* Filter BUTTON */}
            <div className="flex flex-wrap gap-2">
              {/* Subject Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setOpenSubject(!openSubject);
                    setOpenSection(false); // close the other one
                  }}
                  className="flex w-80 items-center font-bold px-3 py-2 bg-[#fff] rounded-md cursor-pointer shadow-md">
                  Subject
                  <img src={ArrowDown} alt="ArrowDown" className="ml-50 h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                </button>

                {/* Subject Dropdown SELECTIONS */}
                {openSubject && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-80 shadow-lg border border-gray-200 z-10">
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100"
                      onClick={() => {
                        setSelectedFilter("Math");
                        setOpenSubject(false);
                      }}
                    >
                      Math
                    </button>
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100"
                      onClick={() => {
                        setSelectedFilter("Science");
                        setOpenSubject(false);
                      }}
                    >
                      Science
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Search Button */}
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

          {/* Analytics PIE CHART section*/}
          <div className='bg-[#fff] rounded-lg shadow-md mt-5 p-5'>
        
            <div className='flex items-center'> 
              <img src={Pie} alt="Pie" className="h-8 w-8 mr-3" />
              <p className='text-[1.125rem] font-bold'> Activity Overview </p>

              {/* Section Filter Dropdown */}
              <div className="flex flex-wrap gap-2 mt-3 ml-auto">
                <div className="relative">
                  <button
                    onClick={() => {
                      setOpenSection(!openSection);
                      setOpenSubject(false);
                    }}
                    className="flex w-80 items-center font-bold px-3 py-2 bg-[#D4D4D4] rounded-md cursor-pointer shadow-md"
                  >
                    Section
                    <img 
                      src={ArrowDown} 
                      alt="ArrowDown" 
                      className="ml-50 h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7" 
                    />
                  </button>

                  {/* Section Dropdown SELECTIONS */}
                  {openSection && (
                    <div className="absolute top-full mt-1 bg-white rounded-md w-80 shadow-lg border border-gray-200 z-10">
                      <button 
                        className="block px-3 py-2 w-full text-left hover:bg-gray-100"
                        onClick={() => {
                          setSelectedFilter("All Sections");
                          setOpenSection(false);
                        }}
                      >
                        All Sections
                      </button>
                      <button 
                        className="block px-3 py-2 w-full text-left hover:bg-gray-100"
                        onClick={() => {
                          setSelectedFilter("Section A");
                          setOpenSection(false);
                        }}
                      >
                        Section A
                      </button>
                    </div>
                  )}
                </div>
                
              </div>
            </div>

            <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />
                
            
            {/* CREATED TASK overview and PIE CHART*/}
            <div className='flex mt-5'>
              {/* CREATED TASK */}
              <div className='bg-[#D4D4D4] p-5 rounded-md text-[1.125rem] w-80 h-120'>
                <p className='font-bold mb-3'>Created Task</p>

                <div className='flex justify-between'>
                  <span>Quizzes:</span>
                  <span>X</span>
                </div>

                <div className='flex justify-between'>
                  <span>Assignment:</span>
                  <span>X</span>
                </div>

                <div className='flex justify-between'>
                  <span>Activities:</span>
                  <span>X</span>
                </div>

                <div className='flex justify-between'>
                  <span>Projects:</span>
                  <span>X</span>
                </div>

                <hr className="my-2 border-[#465746] opacity-50" />

                <div className='flex justify-between font-bold'>
                  <span>Total Created Task:</span>
                  <span>X</span>
                </div>
              </div>

              <div className=" bg-[#D4D4D4] ml-5 rounded-md text-[1.125rem] items-center gap-6 w-295">
                
                {/* PIE CHART */}
                <div className="flex flex-col items-center mt-5">
                  <div>
                    <svg width="400" height="400" viewBox="0 0 32 32">  {/* className='bg-[#fff] */}
                      {/* Circle base */}
                      <circle r="16" cx="16" cy="16" fill="transparent" />

                      {/* COMPLETED, PENDING, MISSED */}
                      {[
                        { value: 12, color: "#00A15D", offset: 25 },                      // Completed
                        { value: 5, color: "#F59E0B", offset: 25 - (12 / 20) * 88 },      // Pending
                        { value: 3, color: "#EF4444", offset: 25 - ((12 + 5) / 20) * 88 } // Missed
                      ].map((seg, i) => (
                        <circle
                          key={i}
                          r="14"
                          cx="16"
                          cy="16"
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth="2.5"
                          strokeDasharray={`${(seg.value / 20) * 88} ${88 - (seg.value / 20) * 88}`}
                          strokeDashoffset={seg.offset}
                        />
                      ))}

                      {/* TEXT INSIDE PIE CHART */}
                      <text x="16" y="15" textAnchor="middle" fontSize=".125rem" fontWeight="bold" color='#465746' fill="#465746">
                        SECTION X:
                      </text>

                      <text x="16" y="18" textAnchor="middle" fontSize=".125rem" fill="#465746">
                        Overall
                      </text>

                    </svg>
                  </div>

                  {/* COMPLETED PENDING MISSED */}
                  <div className="flex gap-6 mt-5">
                    {[
                      { label: "Completed", value: 12, color: "#00A15D" },
                      { label: "Pending", value: 5, color: "#F59E0B" },
                      { label: "Missed", value: 3, color: "#EF4444" }
                    ]
                    
                    .map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: item.color }}> </span>
                        <span> {item.label}: </span>
                        <span className="font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>



              </div>


            </div>
            
            {/* ACTIVITY LIST */}
            <div className='bg-[#D4D4D4] p-5 rounded-md mt-5'>
              <p className='font-bold mb-3 text-[1.125rem]'> Quizzes </p>
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
                  <tr>
                    <td className="p-2">Quiz 1</td>
                    <td className="p-2">Algebra Basics</td>
                    <td className="p-2">28</td>
                    <td className="p-2">2</td>
                    <td className="p-2">Sept 25, 2025</td>
                  </tr>
                  <tr>
                    <td className="p-2">Quiz 2</td>
                    <td className="p-2">Geometry</td>
                    <td className="p-2">27</td>
                    <td className="p-2">3</td>
                    <td className="p-2">Oct 2, 2025</td>
                  </tr>
                  <tr>
                    <td className="p-2">Quiz 3</td>
                    <td className="p-2">Trigonometry</td>
                    <td className="p-2">29</td>
                    <td className="p-2">1</td>
                    <td className="p-2">Oct 10, 2025</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* Analytics PIE CHART section*/}
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
                    <td className="px-4 py-2">
                      <img src={Details} alt="Details" className="w-5 h-5" />
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-100">
                    <td className="px-4 py-2">2</td>
                    <td className="px-4 py-2">2025-002</td>
                    <td className="px-4 py-2">Jane Doe</td>
                    <td className="px-4 py-2">11</td>
                    <td className="px-4 py-2">3</td>
                    <td className="px-4 py-2">6</td>
                    <td className="px-4 py-2">0</td>
                    <td className="px-4 py-2">
                      <img src={Details} alt="Details" className="w-5 h-5" />
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-100">
                    <td className="px-4 py-2">3</td>
                    <td className="px-4 py-2">2025-003</td>
                    <td className="px-4 py-2">Mark Lee</td>
                    <td className="px-4 py-2">10</td>
                    <td className="px-4 py-2">5</td>
                    <td className="px-4 py-2">4</td>
                    <td className="px-4 py-2">2</td>
                    <td className="px-4 py-2">
                      <img src={Details} alt="Details" className="w-5 h-5" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>


          </div>
        </div>

      </div>
    </div>
  )
}
