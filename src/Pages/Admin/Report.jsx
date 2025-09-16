import React from 'react'
import { useState } from "react";
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Search from "../../assets/Search.svg";
import Archive from "../../assets/Archive(Light).svg";
import ReportLight from '../../assets/Report(Light).svg';
import TotalAccountImported from '../../assets/TotalAccountImported.svg';
import StudentAccounts from '../../assets/StudentAccounts.svg';
import ProfessorAccounts from '../../assets/ProfessorAccounts.svg';
import ActiveAccounts from '../../assets/ActiveAccounts.svg';
import PendingAccounts from '../../assets/PendingAccounts.svg';
import DisabledAccounts from '../../assets/DisabledAccounts.svg';
import ArchiveRow from '../../assets/ArchiveRow(Light).svg';
import Details from '../../assets/Details(Light).svg';

export default function Report() {
  const [isOpen, setIsOpen] = useState(false);
  // const [open, setOpen] = useState(false); 
  const [studentFilterOpen, setStudentFilterOpen] = useState(false);
  const [professorFilterOpen, setProfessorFilterOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-300">
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[250px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* content of ADMIN REPORTS */}
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row item-start sm:items-center mb-2 sm:mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <img
                src={ReportLight}
                alt="Report"
                className='h-7 w-7 sm:h-6 sm:w-7 md:h-7 md:w-7 mr-3 sm:mr-3 mt-0.5 ml-2'
              />
              <h1 className="font-bold text-xl sm:text-xl md:text-xl lg:text-xl text-[#465746]">
                Reports
              </h1>
            </div>
          </div>

          <div className='text-sm sm:text-base md:text-base lg:text-base text-[#465746] mb-4 sm:mb-5 ml-2'>
            <span className="mb-0 sm:mb-0">
              TrackED reports
            </span>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-6" />

          {/* main content of ADMIN REPORTS */}
          {/* Widgets TOTAL, PROFESSOR, & STUDENT */}
          <div className='flex justify-center items-center mt-5'>
            <div className='grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-4 lg:gap-6 w-full max-w-7xl'>

              {/* Widgets TOTAL ACCOUNT CREATED */}
              <div className='bg-[#fff] h-24 sm:h-40 rounded-lg sm:rounded-xl p-2 sm:p-4 text-[#465746] shadow-md'> 
                <div className='font-bold text-[10px] sm:text-base lg:text-xl h-full flex flex-col'>
                  <p className='mb-1 sm:mb-2'> Accounts Imported </p>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#8DDEBC] h-8 w-8 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#00874E]'>
                      <img 
                        src={TotalAccountImported}
                        alt="TotalAccountsCreated"
                        className="h-4 w-4 sm:h-8 sm:w-8 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-sm sm:text-xl lg:text-2xl'>
                      X 
                    </p>
                  </div>
                </div>
              </div>

              {/* Widgets STUDENT ACCOUNTS */}
              <div className='bg-[#fff] h-24 sm:h-40 rounded-lg sm:rounded-xl p-2 sm:p-4 text-[#465746] shadow-md'> 
                <div className='font-bold text-[10px] sm:text-base lg:text-xl h-full flex flex-col'>
                  <p className='mb-1 sm:mb-2'> Student Accounts </p>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#ffd0b3] h-8 w-8 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#FFA600]'>
                      <img
                        src={StudentAccounts} 
                        alt="Student Accounts"
                        className="h-4 w-4 sm:h-8 sm:w-8 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-sm sm:text-xl lg:text-2xl'>
                      X
                    </p>
                  </div>
                </div>
              </div>

              {/* Widgets PROFESSOR ACCOUNTS */}
              <div className='bg-[#fff] h-24 sm:h-40 rounded-lg sm:rounded-xl p-2 sm:p-4 text-[#465746] shadow-md'> 
                <div className='font-bold text-[10px] sm:text-base lg:text-xl h-full flex flex-col'>
                  <p className='mb-1 sm:mb-2'> Professor Accounts </p>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#a7aef9] h-8 w-8 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#4951AA]'>
                      <img 
                        src={ProfessorAccounts}
                        alt="ProfessorAccounts"
                        className="h-4 w-4 sm:h-8 sm:w-8 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-sm sm:text-xl lg:text-2xl'>
                      X
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* STUDENT ACCOUNT */}
          {/* Widgets ACTIVE PENDING DISABLED */}
          <div className='flex justify-center items-center mt-5'>
            <div className='grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-4 lg:gap-6 w-full max-w-7xl'>

              {/* Widgets ACTIVE ACCOUNTS */}
              <div className='bg-[#fff] h-24 sm:h-40 rounded-lg sm:rounded-xl p-2 sm:p-4 text-[#465746] shadow-md'> 
                <div className='font-bold text-[10px] sm:text-base lg:text-xl h-full flex flex-col'>
                  <p className='mb-1 sm:mb-2'> Active Accounts </p>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#8DDEBC] h-8 w-8 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#00874E]'>
                      <img 
                        src={ActiveAccounts}
                        alt="Active Accounts"
                        className="h-4 w-4 sm:h-8 sm:w-8 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-sm sm:text-xl lg:text-2xl'>
                      X 
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-[#fff] h-24 sm:h-40 rounded-lg sm:rounded-xl p-2 sm:p-4 text-[#465746] shadow-md'> 
                <div className='font-bold text-[10px] sm:text-base lg:text-xl h-full flex flex-col'>
                  <p className='mb-1 sm:mb-2'> Pending Accounts </p>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#a7aef9] h-8 w-8 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#4951AA]'>
                      <img 
                        src={PendingAccounts} 
                        alt="Pending Accounts" 
                        className="h-4 w-4 sm:h-8 sm:w-8 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-sm sm:text-xl lg:text-2xl'>
                      X
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-[#fff] h-24 sm:h-40 rounded-lg sm:rounded-xl p-2 sm:p-4 text-[#465746] shadow-md'> 
                <div className='font-bold text-[10px] sm:text-base lg:text-xl h-full flex flex-col'>
                  <p className='mb-1 sm:mb-2'> Disabled Accounts </p>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#ffb1b1] h-8 w-8 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#FF6666]'>
                      <img 
                        src={DisabledAccounts}
                        alt="Disabled Accounts"
                        className="h-4 w-4 sm:h-8 sm:w-8 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-sm sm:text-xl lg:text-2xl'> 
                      X
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <p className="text-sm sm:text-base lg:text-lg text-[#465746] mt-5 font-bold">
            Student Accounts
          </p>
          {/* STUDENT BUTTONS */}
          <div className="flex flex-col lg:flex-row mt-4 sm:mt-5 text-sm sm:text-sm md:text-base lg:text-base text-[#465746] gap-4 lg:justify-between lg:items-center">
             
             {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setStudentFilterOpen(!studentFilterOpen)}
                  className="flex items-center font-bold px-3 py-2 bg-[#fff] rounded-md w-32 sm:w-36 md:w-44 lg:w-40 shadow-md hover:border-[#00874E] hover:border-2 text-xs sm:text-sm cursor-pointer"
                >
                  Filter
                  <img src={ArrowDown} alt="ArrowDown" className="ml-2 h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                </button>

                {studentFilterOpen && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-32 sm:w-36 md:w-44 lg:w-40 shadow-lg border border-gray-200 z-10">
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("Year");
                        setStudentFilterOpen(false);
                      }}
                    >
                      Year
                    </button>
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("Section");
                        setStudentFilterOpen(false);
                      }}
                    >
                      Section
                    </button>
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("Active");
                        setStudentFilterOpen(false);
                      }}
                    >
                      Active
                    </button>
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("Deactivated");
                        setStudentFilterOpen(false);
                      }}
                    >
                      Deactivated
                    </button>
                  </div>
                )}
              </div>

            {/* Search Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 lg:w-64 xl:w-80">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none text-[#465746] bg-white text-xs sm:text-sm"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#465746]">
                  <img src={Search} alt="Search" className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                </button>
              </div>
            </div>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          {/* STUDENT ACCOUNT Table */}
          <div className="mt-5">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3 text-xs sm:text-sm md:text-base lg:text-lg min-w-[600px]">
                {/* Table Header */}
                <thead>
                  <tr className="text-[#465746] font-bold">
                    <th className="py-2 px-2 sm:px-3">No.</th>
                    <th className="py-2 px-2 sm:px-3">Student No.</th>
                    <th className="py-2 px-2 sm:px-3">Full Name</th>
                    <th className="py-2 px-2 sm:px-3">Email</th>
                    <th className="py-2 px-2 sm:px-3">Year & Section</th>
                    <th className="py-2 px-2 sm:px-3">Status</th>
                    <th className="py-2 px-2 sm:px-3">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="text-[#465746]">
                  <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-100">
                    <td className="py-2 px-2 sm:px-3 rounded-l-lg">1</td>
                    <td className="py-2 px-2 sm:px-3">2025001</td>
                    <td className="py-2 px-2 sm:px-3">Alice Mendoza</td>
                    <td className="py-2 px-2 sm:px-3 break-all sm:break-normal">alice@example.com</td>
                    <td className="py-2 px-2 sm:px-3">First Year - A</td>
                    <td className="py-2 px-2 sm:px-3 font-bold text-[#00A15D]">Active</td>
                    <td className="py-2 px-2 sm:px-3 rounded-r-lg">
                      <div className="flex gap-2">
                        <img 
                          onClick={() => setShowPopup(true)} 
                          src={ArchiveRow} 
                          alt="Archive" 
                          className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 cursor-pointer" 
                        />
                        <Link to="/UserManagementStudentAccountDetails">
                          <img 
                            src={Details} 
                            alt="Details" 
                            className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" 
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>

                  <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-100">
                    <td className="py-2 px-2 sm:px-3 rounded-l-lg">2</td>
                    <td className="py-2 px-2 sm:px-3">2025002</td>
                    <td className="py-2 px-2 sm:px-3">Brian Santos</td>
                    <td className="py-2 px-2 sm:px-3 break-all sm:break-normal">brian@example.com</td>
                    <td className="py-2 px-2 sm:px-3">First Year - B</td>
                    <td className="py-2 px-2 sm:px-3 font-bold text-[#FF6666]">Deactivated</td>
                    <td className="py-2 px-2 sm:px-3 rounded-r-lg">
                      <div className="flex gap-2">
                        <img 
                          onClick={() => setShowPopup(true)} 
                          src={ArchiveRow} 
                          alt="Archive" 
                          className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 cursor-pointer" 
                        />
                        <Link to="/UserManagementStudentAccountDetails">
                          <img 
                            src={Details} 
                            alt="Details" 
                            className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" 
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Student */}
            <div className="sm:hidden space-y-3">
              {/* Card 1 */}
              <div className="bg-white rounded-lg shadow p-4 text-[#465746]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">No. 1 | Student No.</p>
                    <p className="font-semibold text-sm">2025001</p>
                  </div>
                  <div className="flex gap-2">
                    <img 
                      onClick={() => setShowPopup(true)} 
                      src={ArchiveRow} 
                      alt="Archive" 
                      className="h-5 w-5 cursor-pointer" 
                    />
                    <Link to="/UserManagementStudentAccountDetails">
                      <img 
                        src={Details} 
                        alt="Details" 
                        className="h-5 w-5" 
                      />
                    </Link>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-sm">Alice Mendoza</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm break-all">alice@example.com</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Year & Section</p>
                    <p className="text-sm">First Year - A</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-bold text-sm text-[#00A15D]">Active</p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-lg shadow p-4 text-[#465746]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">No. 2 | Student No.</p>
                    <p className="font-semibold text-sm">2025002</p>
                  </div>
                  <div className="flex gap-2">
                    <img 
                      onClick={() => setShowPopup(true)} 
                      src={ArchiveRow} 
                      alt="Archive" 
                      className="h-5 w-5 cursor-pointer" 
                    />
                    <Link to="/UserManagementStudentAccountDetails">
                      <img 
                        src={Details} 
                        alt="Details" 
                        className="h-5 w-5" 
                      />
                    </Link>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-sm">Brian Santos</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm break-all">brian@example.com</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Year & Section</p>
                    <p className="text-sm">First Year - B</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-bold text-sm text-[#FF6666]">Deactivated</p>
                  </div>
                </div>
              </div>
            </div>

             {/* Popup for Archive */}
            {showPopup && (
              <Popup setOpen={setShowPopup} />
            )}
          </div>

          {/* PROFESSOR ACCOUNT */}
          <p className="text-sm sm:text-base lg:text-lg text-[#465746] mt-5 font-bold"> Professor Accounts</p>
          
          {/* PROFESSOR BUTTONS */}
          <div className="flex flex-col lg:flex-row mt-4 sm:mt-5 text-sm sm:text-sm md:text-base lg:text-base text-[#465746] gap-4 lg:justify-between lg:items-center">
             {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfessorFilterOpen(!professorFilterOpen)}
                  className="flex items-center font-bold px-3 py-2 bg-[#fff] rounded-md w-32 sm:w-36 md:w-44 lg:w-40 shadow-md hover:border-[#00874E] hover:border-2 text-xs sm:text-sm cursor-pointer"
                >
                  Filter
                  <img src={ArrowDown} alt="ArrowDown" className="ml-2 h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                </button>

                {professorFilterOpen && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-32 sm:w-36 md:w-44 lg:w-40 shadow-lg border border-gray-200 z-10">
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("Year");
                        setProfessorFilterOpen(false);
                      }}
                    >
                      Year
                    </button>
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("Section");
                        setProfessorFilterOpen(false);
                      }}
                    >
                      Section
                    </button>
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("Active");
                        setProfessorFilterOpen(false);
                      }}
                    >
                      Active
                    </button>
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("Deactivated");
                        setProfessorFilterOpen(false);
                      }}
                    >
                      Deactivated
                    </button>
                  </div>
                )}
              </div>

            {/* Search Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 lg:w-64 xl:w-80">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none text-[#465746] bg-white text-xs sm:text-sm"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#465746]">
                  <img src={Search} alt="Search" className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                </button>
              </div>
            </div>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          {/* PROFESSOR ACCOUNT Table */}
          <div className="mt-5">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3 text-xs sm:text-sm md:text-base lg:text-lg min-w-[600px]">
                {/* Table Header */}
                <thead>
                  <tr className="text-[#465746] font-bold">
                    <th className="py-2 px-2 sm:px-3">No.</th>
                    <th className="py-2 px-2 sm:px-3">Professor No.</th>
                    <th className="py-2 px-2 sm:px-3">Full Name</th>
                    <th className="py-2 px-2 sm:px-3">Email</th>
                    <th className="py-2 px-2 sm:px-3">Status</th>
                    <th className="py-2 px-2 sm:px-3">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="text-[#465746]">
                  <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-100">
                    <td className="py-2 px-2 sm:px-3 rounded-l-lg">1</td>
                    <td className="py-2 px-2 sm:px-3">2025001</td>
                    <td className="py-2 px-2 sm:px-3">Alice Mendoza</td>
                    <td className="py-2 px-2 sm:px-3 break-all sm:break-normal">alice@example.com</td>
                    <td className="py-2 px-2 sm:px-3 font-bold text-[#00A15D]">Active</td>
                    <td className="py-2 px-2 sm:px-3 rounded-r-lg">
                      <div className="flex gap-2">
                        <img 
                          onClick={() => setShowPopup(true)} 
                          src={ArchiveRow} 
                          alt="Archive" 
                          className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 cursor-pointer" 
                        />
                        <Link to="/UserManagementProfessorAccountsDetails">
                          <img 
                            src={Details} 
                            alt="Details" 
                            className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" 
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>

                  <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-100">
                    <td className="py-2 px-2 sm:px-3 rounded-l-lg">2</td>
                    <td className="py-2 px-2 sm:px-3">2025002</td>
                    <td className="py-2 px-2 sm:px-3">Brian Santos</td>
                    <td className="py-2 px-2 sm:px-3 break-all sm:break-normal">brian@example.com</td>
                    <td className="py-2 px-2 sm:px-3 font-bold text-[#FF6666]">Deactivated</td>
                    <td className="py-2 px-2 sm:px-3 rounded-r-lg">
                      <div className="flex gap-2">
                        <img 
                          onClick={() => setShowPopup(true)} 
                          src={ArchiveRow} 
                          alt="Archive" 
                          className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 cursor-pointer" 
                        />
                        <Link to="/UserManagementProfessorAccountsDetails">
                          <img 
                            src={Details} 
                            alt="Details" 
                            className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" 
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Professor */}
            <div className="sm:hidden space-y-3">
              {/* Card 1 */}
              <div className="bg-white rounded-lg shadow p-4 text-[#465746]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">No. 1 | Professor No.</p>
                    <p className="font-semibold text-sm">2025001</p>
                  </div>
                  <div className="flex gap-2">
                    <img 
                      onClick={() => setShowPopup(true)} 
                      src={ArchiveRow} 
                      alt="Archive" 
                      className="h-5 w-5 cursor-pointer" 
                    />
                    <Link to="/UserManagementProfessorAccountsDetails">
                      <img 
                        src={Details} 
                        alt="Details" 
                        className="h-5 w-5" 
                      />
                    </Link>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-sm">Alice Mendoza</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm break-all">alice@example.com</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-bold text-sm text-[#00A15D]">Active</p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-lg shadow p-4 text-[#465746]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">No. 2 | Professor No.</p>
                    <p className="font-semibold text-sm">2025002</p>
                  </div>
                  <div className="flex gap-2">
                    <img 
                      onClick={() => setShowPopup(true)} 
                      src={ArchiveRow} 
                      alt="Archive" 
                      className="h-5 w-5 cursor-pointer" 
                    />
                    <Link to="/UserManagementProfessorAccountsDetails">
                      <img 
                        src={Details} 
                        alt="Details" 
                        className="h-5 w-5" 
                      />
                    </Link>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-sm">Brian Santos</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm break-all">brian@example.com</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-bold text-sm text-[#FF6666]">Deactivated</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Popup for Archive */}
            {showPopup && (
              <Popup setOpen={setShowPopup} />
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}