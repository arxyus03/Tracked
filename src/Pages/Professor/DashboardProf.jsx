import React from 'react'
import { useState } from "react";
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

export default function DashboardProf() {
  const [isOpen, setIsOpen] = useState(false);

  return (

    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* content of PROFESSOR DASHBOARD*/}
        <div className="p-3 sm:p-4 md:p-5 lg:p-5 xl:p-5">

          {/* "Header" of PROFESSOR DASHBOARD */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 sm:mb-4">
            <div className='flex items-center mb-2 sm:mb-0'>
              <img
                src={Dashboard}
                alt="Dashboard"
                className='h-5 w-5 sm:h-6 sm:w-7 md:h-7 md:w-7 mr-3 sm:mr-3 mt-0.5 ml-2'
              />
              <h1 className="font-bold text-xl sm:text-xl md:text-xl lg:text-[1.5rem] text-[#465746]">
                Dashboard
              </h1>
            </div>

          </div>

          <div className="text-sm sm:text-base md:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5 ml-2">
            <span>Welcome back,</span>
            <span className="font-bold ml-1 mr-1">Prof. Jane!</span>
            <span>Let’s see how your students are doing.</span>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          {/* main content of PROFESSOR ADMIN */}

          {/* WIDGETS */}
          <div className='flex items-center mt-5'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4 lg:gap-6 w-full max-w-7xl'>

              {/* Widgets ACTIVE ACCOUNTS */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 text-[#465746] shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'> Class Handled </h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#a7aef9] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#4951AA]'>
                      <img
                        src={ClassHandled}
                        alt="ClassHandled"
                        className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      X
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 text-[#465746] shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'> Activities to Grade </h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#ffb1b1] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#FF6666]'>
                      <img 
                        src={ActivitiesToGrade}
                        alt="ActivitiesToGrade"
                        className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      X
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        <div className="bg-[#FFFFFF] text-[#465746] text-sm sm:text-base lg:text-[1.125rem] rounded-lg sm:rounded-xl shadow-md mt-5 p-4 sm:p-5">
          {/* Header: Name */}
          <div className="flex items-center">
            <img 
              src={ID}
              alt="ID"
              className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3"
            />
            <p className="font-bold text-sm sm:text-base lg:text-[1.125rem]">Prof. Jane</p>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 my-2 sm:my-3" />

          {/* Info rows */}
          <div className="pl-4 sm:pl-8 space-y-1 sm:space-y-2">
            <div className="flex flex-col sm:flex-row">
              <span className="font-bold text-xs sm:text-sm lg:text-base w-full sm:w-40 mb-1 sm:mb-0">Faculty Number:</span>
              <span className="text-xs sm:text-sm lg:text-base">202210715</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-bold text-xs sm:text-sm lg:text-base w-full sm:w-40 mb-1 sm:mb-0">CvSU Email:</span>
              <span className="text-xs sm:text-sm lg:text-base break-all sm:break-normal">jane@cvsu.edu.ph</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-bold text-xs sm:text-sm lg:text-base w-full sm:w-40 mb-1 sm:mb-0">Handled Subject:</span>
              <span className="text-xs sm:text-sm lg:text-base">ITEC110, ITEC111</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-bold text-xs sm:text-sm lg:text-base w-full sm:w-40 mb-1 sm:mb-0">Department:</span>
              <span className="text-xs sm:text-sm lg:text-base">Information Technology</span>
            </div>
          </div>
        </div>

        {/* Student Attendance Details Card */}
        <Link to={"/AnalyticsProf"}>
          <div className="bg-[#FFFFFF] text-[#465746] text-sm sm:text-base lg:text-[1.125rem] rounded-lg sm:rounded-xl shadow-md mt-5 p-3 sm:p-4 hover:border-2 hover:border-[#00874E] transition-all duration-200">
            <div className="flex items-center">
              <img
                src={Pie}
                alt="Pie"
                className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3"
              />
              <p className="font-bold text-sm sm:text-base lg:text-[1.125rem] flex-1">
                Student Attendance Details
              </p>
              <img 
                src={Details}
                alt="Details"
                className="h-6 w-6 sm:h-8 sm:w-8 ml-2 sm:ml-auto sm:mr-2"
              />
            </div>
          </div>
        </Link>

        {/* Archive Subjects Card */}
        <Link to={"/AnalyticsProf"}>
          <div className="bg-[#FFFFFF] text-[#465746] text-sm sm:text-base lg:text-[1.125rem] rounded-lg sm:rounded-xl shadow-md mt-5 p-3 sm:p-4 hover:border-2 hover:border-[#00874E] transition-all duration-200">
            <div className="flex items-center">
              <img 
                src={Archive}
                alt="Archive"
                className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3"
              />
              <p className="font-bold text-sm sm:text-base lg:text-[1.125rem] flex-1"> 
                Archive Subjects
              </p>
              <img 
                src={Details}
                alt="Details"
                className="h-6 w-6 sm:h-8 sm:w-8 ml-2 sm:ml-auto sm:mr-2"
              />
            </div>
          </div>
        </Link>

      </div>

      </div>
    </div>
  )
}
