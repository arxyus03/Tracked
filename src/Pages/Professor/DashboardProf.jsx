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
  const [isOpen, setIsOpen] = useState(true);

  return (

    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* content of PROFESSOR DASHBOARD*/}
        <div className="p-5">

          {/* "Header" of PROFESSOR DASHBOARD */}
          <div className="flex">
            <img src={Dashboard} alt="Dashboard" className='color-[#465746] h-7 w-7 mr-5 mt-1' />
            <p className="font-bold text-[1.5rem] text-[#465746]">Dashboard</p>
          </div>

          <div className="flex text-[1.125rem] text-[#465746]">
            <span>Welcome back,</span>
            <span className="font-bold ml-1 mr-1"> Prof. Jane! </span>
            <span>Let’s see how your students are doing.</span>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          {/* main content of PROFESSOR ADMIN */}

          {/* WIDGETS */}
          <div className='flex items-center mt-5'>

            <div className='flex gap-2 w-275 '>
              {/* Widgets ACTIVE ACCOUNTS */}
              <div className='bg-[#fff] h-40 w-90 rounded-xl p-5 text-[#465746] shadow-md'> 
                <div className='font-bold text-[1.5rem]'>
                  <p className='mb-2'> Class Handled </p>
                  <div className='flex justify-between'>
                    <div className='flex justify-center items-center bg-[#a7aef9] h-20 w-20 rounded-xl border-2 border-[#4951AA]'>
                      <img src={ClassHandled} alt="ClassHandled" className="h-12 w-12" />
                    </div>
                    <p className=' pt-8 text-[2rem]'> X </p>
                  </div>
                </div>
              </div>

              <div className='bg-[#fff] h-40 w-90 rounded-xl p-5 text-[#465746] shadow-md'> 
                <div className='font-bold text-[1.5rem]'>
                  <p className='mb-2'> Activities to Grade </p>
                  <div className='flex justify-between'>
                    <div className='flex justify-center items-center bg-[#ffb1b1] h-20 w-20 rounded-xl border-2 border-[#FF6666]'>
                      <img src={ActivitiesToGrade} alt="ActivitiesToGrade" className="h-12 w-12" />
                    </div>
                    <p className=' pt-8 text-[2rem]'> X </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        <div className="bg-[#FFFFFF] text-[#465746] text-[1.125rem] rounded-xl shadow-md mt-5 p-5">
          {/* Header: Name */}
          <div className="flex items-center">
            <img src={ID} alt="ID" className="h-5 w-5 mr-3" />
            <p className="font-bold">Prof. Jane</p>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 my-2" />

          {/* Info rows */}
          <div className="pl-8 space-y-2">
            <div className="flex">
              <span className="font-bold w-40">Faculty Number:</span>
              <span>202210715</span>
            </div>
            <div className="flex">
              <span className="font-bold w-40">CvSU Email:</span>
              <span>jane@cvsu.edu.ph</span>
            </div>
            <div className="flex">
              <span className="font-bold w-40">Handled Subject:</span>
              <span>ITEC110, ITEC111</span>
            </div>
            <div className="flex">
              <span className="font-bold w-40">Department:</span>
              <span>Information Technology</span>
            </div>
          </div>
        </div>

        {/* Student Attendance Details Card */}
        <Link to={"/AnalyticsProf"}>
          <div className="bg-[#FFFFFF] text-[#465746] text-[1.125rem] rounded-xl shadow-md mt-5 p-3 hover:border-2 hover:border-[#00874E]">
            <div className="flex items-center">
              <img src={Pie} alt="Pie" className="h-8 w-8 mr-3" />
              <p className="font-bold">Student Attendance Details</p>
              <img src={Details} alt="Details" className="h-8 w-8 ml-auto mr-2" />
            </div>
          </div>
        </Link>

        {/* Archive Subjects Card */}
        <Link to={"/AnalyticsProf"}>
          <div className="bg-[#FFFFFF] text-[#465746] text-[1.125rem] rounded-xl shadow-md mt-5 p-3 hover:border-2 hover:border-[#00874E]">
            <div className="flex items-center">
              <img src={Archive} alt="Archive" className="h-8 w-8 mr-3" />
              <p className="font-bold"> Archive Subjects </p>
              <img src={Details} alt="Details" className="h-8 w-8 ml-auto mr-2" />
            </div>
          </div>
        </Link>

      </div>

      </div>
    </div>
  )
}
