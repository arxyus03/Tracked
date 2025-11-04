import React, { useState } from 'react'
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Dashboard from '../../assets/DashboardProf(Light).svg';
import ClassHandled from '../../assets/ClassHandled.svg';
import ActivitiesToGrade from '../../assets/ActivitiesToGrade.svg';
import ID from '../../assets/ID(Light).svg';
import Pie from '../../assets/Pie(Light).svg';
import Details from '../../assets/Details(Light).svg';
import Archive from '../../assets/Archive(Light).svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import CompletedActivities from '../../assets/CompletedActivities.svg';
import PendingTask from '../../assets/PendingTask.svg';
import TotalDaySpent from '../../assets/TotalDaySpent.svg';
import OverallSubmitted from '../../assets/OverallSubmitted.svg';
import OverallDaysAbsent from '../../assets/OverallDaysAbsent.svg';
import OverallMissed from '../../assets/OverallMissed.svg';

export default function DashboardStudent() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const [classesCount, setClassesCount] = useState(3);
  const [activitiesCount, setActivitiesCount] = useState(5);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />

        {/* Dashboard content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8 text-[#465746]">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img src={Dashboard} alt="Dashboard" className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">Dashboard</h1>
            </div>
            <div className='flex justify-between'>
              <div className="text-sm sm:text-base lg:text-lg">
                <span>Hi</span>
                <span className="font-bold ml-1 mr-1">{userName}!</span>
                <span>Ready to check your progress.</span>
              </div>
              <div className="flex text-sm sm:text-base lg:text-lg">
                <span> 2nd Semester 2024 - 2025  </span>
                <img src={ArrowDown} alt="ArrowDown" className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* WIDGETS */}
          <div className='flex justify-center items-center mt-5'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4 lg:gap-6 w-full max-w-7xl'>

              {/* Classes Widget */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'>Completed Activities</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#81ebbd] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#449844]'>
                      <img src={CompletedActivities} alt="CompletedActivities" className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"/>
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {classesCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Classes Widget */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'>Overall Submitted</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#81ebbd] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#449844]'>
                      <img src={OverallSubmitted} alt="OverallSubmitted" className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"/>
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {classesCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Activities Widget */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'>Overall Days Absent</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#ffb1b1] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#FF6666]'>
                      <img src={OverallDaysAbsent} alt="ActivitiesToGrade" className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"/>
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {loading ? "..." : activitiesCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Classes Widget */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'>Pending Task</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#a7aef9] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#4951AA]'>
                      <img src={PendingTask} alt="PendingTask" className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"/>
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {classesCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Classes Widget */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'>Total of Days Present</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#81ebbd] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#449844]'>
                      <img src={TotalDaySpent} alt="TotalDaySpent" className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"/>
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {classesCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Activities Widget */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'>Overall Missed</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#ffb1b1] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#FF6666]'>
                      <img src={OverallMissed} alt="ActivitiesToGrade" className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"/>
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {loading ? "..." : activitiesCount}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Student Info */}
          <div className="bg-[#FFFFFF] rounded-lg shadow-md mt-5 p-4 sm:p-5">
            <div className="flex items-center">
              <img src={ID} alt="ID" className="h-5 w-5 mr-2" />
              <p className="font-bold">{userName}</p>
            </div>

            <hr className="opacity-60 border-[#465746] rounded border-1 my-2" />

            <div className="pl-4 space-y-2">
              <p><span className="font-bold">Student ID:</span> 2025-12345</p>
              <p><span className="font-bold">Email:</span> johndoe@cvsu.edu.ph</p>
              <p><span className="font-bold">Course:</span> BS Computer Science</p>
              <p><span className="font-bold">Year Level:</span> 3rd Year</p>
            </div>
          </div>

          {/* Links */}
          <Link to={"/AnalyticsProf"}>
            <div className="bg-[#FFFFFF] rounded-lg shadow-md mt-5 p-3 sm:p-4 border-2 border-transparent hover:border-[#00874E] transition-all duration-200">
              <div className="flex items-center">
                <p className="font-bold flex-1 text-[#FF6666]">WARNING:</p>
                <p className="font-bold flex-1">You have a missing activity in GNED09</p>
                <img src={Details} alt="Details" className="h-6 w-6"/>
              </div>
            </div>
          </Link>

          <Link to={"/AnalyticsProf"}>
            <div className="bg-[#FFFFFF] rounded-lg shadow-md mt-5 p-3 sm:p-4 border-2 border-transparent hover:border-[#00874E] transition-all duration-200">
              <div className="flex items-center">
                <p className="font-bold flex-1 text-[#FF6666]">WARNING:</p>
                <p className="font-bold flex-1">You have a total of 1 Absent in GNED09</p>
                <img src={Details} alt="Details" className="h-6 w-6"/>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}
