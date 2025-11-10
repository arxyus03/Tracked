import React from 'react'
import { useState } from "react";
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Search from "../../assets/Search.svg";
import SuperAdmin from '../../assets/SuperAdminIcon(Light).svg';
import ArchiveRow from '../../assets/ArchiveRow(Light).svg';
import Details from '../../assets/Details(Light).svg';

export default function SuperAdminLanding() {
  const [isOpen, setIsOpen] = useState(false);
  const [adminFilterOpen, setAdminFilterOpen] = useState(false);
  const [studentFilterOpen, setStudentFilterOpen] = useState(false);
  const [professorFilterOpen, setProfessorFilterOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  
  return (
    <div>
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* content of ADMIN REPORTS */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">

          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={SuperAdmin}
                alt="SuperAdmin"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Super Admin
              </h1>
            </div>
            <div className="text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>TrackED Account List</span>
            </div>
          </div>

          <hr className="border-[#465746]/30 my-5 sm:my-6" />

          {/* ADMIN ACCOUNT */}
          <p className="text-sm sm:text-base lg:text-lg text-[#465746] mb-4 font-bold"> Admin Accounts</p>

          {/* ADMIN BUTTONS */}
          <div className="flex flex-col sm:flex-row text-[#465746] gap-3 sm:gap-4 sm:justify-between sm:items-center">           
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAdminFilterOpen(!adminFilterOpen)}
                className="flex items-center justify-between font-bold px-3 sm:px-4 py-2 bg-[#fff] rounded-md w-full sm:w-40 lg:w-44 shadow-md border-2 border-transparent hover:border-[#00874E] text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer"
              >
                <span>Filter</span>
                <img src={ArrowDown} alt="ArrowDown" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ml-2" />
              </button>

              {adminFilterOpen && (
                <div className="absolute top-full mt-1 bg-white rounded-md w-full sm:w-40 lg:w-44 shadow-lg border border-gray-200 z-10">
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setAdminFilterOpen(false);
                    }}
                  >
                    Active
                  </button>
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setAdminFilterOpen(false);
                    }}
                  >
                    Deactivated
                  </button>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="relative flex-1 sm:max-w-xs lg:max-w-md">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none text-[#465746] bg-white text-xs sm:text-sm border-2 border-transparent focus:border-[#00874E] transition-all duration-200"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#465746]">
                <img src={Search} alt="Search" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </button>
            </div>
          </div>

          {/* ADMIN ACCOUNT Table */}
          <div className="mt-4 sm:mt-5">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3 text-xs sm:text-sm lg:text-base">
                {/* Table Header */}
                <thead>
                  <tr className="text-[#465746] font-bold">
                    <th className="py-2 px-2 sm:px-3">No.</th>
                    <th className="py-2 px-2 sm:px-3">Admin No.</th>
                    <th className="py-2 px-2 sm:px-3">Full Name</th>
                    <th className="py-2 px-2 sm:px-3">Email</th>
                    <th className="py-2 px-2 sm:px-3">Status</th>
                    <th className="py-2 px-2 sm:px-3">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="text-[#465746]">
                  <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-2 sm:px-3 rounded-l-lg">1</td>
                    <td className="py-3 px-2 sm:px-3">2025001</td>
                    <td className="py-3 px-2 sm:px-3">Alice Mendoza</td>
                    <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">alice@example.com</td>
                    <td className="py-3 px-2 sm:px-3 font-bold text-[#00A15D]">Active</td>
                    <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                      <div className="flex gap-2">
                        <img 
                          onClick={() => setShowPopup(true)} 
                          src={ArchiveRow} 
                          alt="Archive" 
                          className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                        />
                        <Link to="/SuperAdminAdminAccountDetails">
                          <img 
                            src={Details} 
                            alt="Details" 
                            className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 transition-opacity" 
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>

                  <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-2 sm:px-3 rounded-l-lg">2</td>
                    <td className="py-3 px-2 sm:px-3">2025002</td>
                    <td className="py-3 px-2 sm:px-3">Brian Santos</td>
                    <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">brian@example.com</td>
                    <td className="py-3 px-2 sm:px-3 font-bold text-[#FF6666]">Deactivated</td>
                    <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                      <div className="flex gap-2">
                        <img 
                          onClick={() => setShowPopup(true)} 
                          src={ArchiveRow} 
                          alt="Archive" 
                          className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                        />
                        <Link to="/SuperAdminAdminAccountDetails">
                          <img 
                            src={Details} 
                            alt="Details" 
                            className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 transition-opacity" 
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Admin */}
            <div className="md:hidden space-y-3">
              {/* Card 1 */}
              <div className="bg-white rounded-lg shadow p-4 text-[#465746]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">No. 1 | Admin No.</p>
                    <p className="font-semibold text-sm">2025001</p>
                  </div>
                  <div className="flex gap-2">
                    <img 
                      onClick={() => setShowPopup(true)} 
                      src={ArchiveRow} 
                      alt="Archive" 
                      className="h-5 w-5 cursor-pointer" 
                    />
                    <Link to="/SuperAdminAdminAccountDetails">
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
                    <p className="text-xs text-gray-500 mb-1">No. 2 | Admin No.</p>
                    <p className="font-semibold text-sm">2025002</p>
                  </div>
                  <div className="flex gap-2">
                    <img 
                      onClick={() => setShowPopup(true)} 
                      src={ArchiveRow} 
                      alt="Archive" 
                      className="h-5 w-5 cursor-pointer" 
                    />
                    <Link to="/SuperAdminAdminAccountDetails">
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

          <hr className="border-[#465746]/30 my-5 sm:my-6" />

          <p className="text-sm sm:text-base lg:text-lg text-[#465746] mb-4 font-bold">
            Student Accounts
          </p>

          {/* STUDENT BUTTONS */}
          <div className="flex flex-col sm:flex-row text-[#465746] gap-3 sm:gap-4 sm:justify-between sm:items-center">           
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setStudentFilterOpen(!studentFilterOpen)}
                className="flex items-center justify-between font-bold px-3 sm:px-4 py-2 bg-[#fff] rounded-md w-full sm:w-40 lg:w-44 shadow-md border-2 border-transparent hover:border-[#00874E] text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer"
              >
                <span>Filter</span>
                <img src={ArrowDown} alt="ArrowDown" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ml-2" />
              </button>

              {studentFilterOpen && (
                <div className="absolute top-full mt-1 bg-white rounded-md w-full sm:w-40 lg:w-44 shadow-lg border border-gray-200 z-10">
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setStudentFilterOpen(false);
                    }}
                  >
                    Year
                  </button>
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setStudentFilterOpen(false);
                    }}
                  >
                    Section
                  </button>
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setStudentFilterOpen(false);
                    }}
                  >
                    Active
                  </button>
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setStudentFilterOpen(false);
                    }}
                  >
                    Deactivated
                  </button>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="relative flex-1 sm:max-w-xs lg:max-w-md">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none text-[#465746] bg-white text-xs sm:text-sm border-2 border-transparent focus:border-[#00874E] transition-all duration-200"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#465746]">
                <img src={Search} alt="Search" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </button>
            </div>
          </div>

          {/* STUDENT ACCOUNT Table */}
          <div className="mt-4 sm:mt-5">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3 text-xs sm:text-sm lg:text-base">
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
                  <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-2 sm:px-3 rounded-l-lg">1</td>
                    <td className="py-3 px-2 sm:px-3">2025001</td>
                    <td className="py-3 px-2 sm:px-3">Alice Mendoza</td>
                    <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">alice@example.com</td>
                    <td className="py-3 px-2 sm:px-3">First Year - A</td>
                    <td className="py-3 px-2 sm:px-3 font-bold text-[#00A15D]">Active</td>
                    <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                      <div className="flex gap-2">
                        <img 
                          onClick={() => setShowPopup(true)} 
                          src={ArchiveRow} 
                          alt="Archive" 
                          className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                        />
                        <Link to="/SuperAdminStudentAccountDetails">
                          <img 
                            src={Details} 
                            alt="Details" 
                            className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 transition-opacity" 
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>

                  <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-2 sm:px-3 rounded-l-lg">2</td>
                    <td className="py-3 px-2 sm:px-3">2025002</td>
                    <td className="py-3 px-2 sm:px-3">Brian Santos</td>
                    <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">brian@example.com</td>
                    <td className="py-3 px-2 sm:px-3">First Year - B</td>
                    <td className="py-3 px-2 sm:px-3 font-bold text-[#FF6666]">Deactivated</td>
                    <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                      <div className="flex gap-2">
                        <img 
                          onClick={() => setShowPopup(true)} 
                          src={ArchiveRow} 
                          alt="Archive" 
                          className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                        />
                        <Link to="/SuperAdminStudentAccountDetails">
                          <img 
                            src={Details} 
                            alt="Details" 
                            className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 transition-opacity" 
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Student */}
            <div className="md:hidden space-y-3">
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
                    <Link to="/SuperAdminStudentAccountDetails">
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
                    <Link to="/SuperAdminStudentAccountDetails">
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

          <hr className="border-[#465746]/30 my-5 sm:my-6" />

          {/* PROFESSOR ACCOUNT */}
          <p className="text-sm sm:text-base lg:text-lg text-[#465746] mb-4 font-bold">Professor Accounts</p>
          
          {/* PROFESSOR BUTTONS */}
          <div className="flex flex-col sm:flex-row text-[#465746] gap-3 sm:gap-4 sm:justify-between sm:items-center">
             {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfessorFilterOpen(!professorFilterOpen)}
                  className="flex items-center justify-between font-bold px-3 sm:px-4 py-2 bg-[#fff] rounded-md w-full sm:w-40 lg:w-44 shadow-md border-2 border-transparent hover:border-[#00874E] text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer"
                >
                  <span>Filter</span>
                  <img src={ArrowDown} alt="ArrowDown" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ml-2" />
                </button>

                {professorFilterOpen && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-full sm:w-40 lg:w-44 shadow-lg border border-gray-200 z-10">
                    <button 
                      className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setProfessorFilterOpen(false);
                      }}
                    >
                      Active
                    </button>
                    <button 
                      className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setProfessorFilterOpen(false);
                      }}
                    >
                      Deactivated
                    </button>
                  </div>
                )}
              </div>

            {/* Search Button */}
            <div className="relative flex-1 sm:max-w-xs lg:max-w-md">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none text-[#465746] bg-white text-xs sm:text-sm border-2 border-transparent focus:border-[#00874E] transition-all duration-200"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#465746]">
                <img src={Search} alt="Search" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </button>
            </div>
          </div>

          {/* PROFESSOR ACCOUNT Table */}
          <div className="mt-4 sm:mt-5">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3 text-xs sm:text-sm lg:text-base">
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
                  <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-2 sm:px-3 rounded-l-lg">1</td>
                    <td className="py-3 px-2 sm:px-3">2025001</td>
                    <td className="py-3 px-2 sm:px-3">Alice Mendoza</td>
                    <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">alice@example.com</td>
                    <td className="py-3 px-2 sm:px-3 font-bold text-[#00A15D]">Active</td>
                    <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                      <div className="flex gap-2">
                        <img 
                          onClick={() => setShowPopup(true)} 
                          src={ArchiveRow} 
                          alt="Archive" 
                          className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                        />
                        <Link to="/SuperAdminProfAccountDetails">
                          <img 
                            src={Details} 
                            alt="Details" 
                            className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 transition-opacity" 
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>

                  <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-2 sm:px-3 rounded-l-lg">2</td>
                    <td className="py-3 px-2 sm:px-3">2025002</td>
                    <td className="py-3 px-2 sm:px-3">Brian Santos</td>
                    <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">brian@example.com</td>
                    <td className="py-3 px-2 sm:px-3 font-bold text-[#FF6666]">Deactivated</td>
                    <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                      <div className="flex gap-2">
                        <img 
                          onClick={() => setShowPopup(true)} 
                          src={ArchiveRow} 
                          alt="Archive" 
                          className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                        />
                        <Link to="/SuperAdminProfAccountDetails">
                          <img 
                            src={Details} 
                            alt="Details" 
                            className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 transition-opacity" 
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Professor */}
            <div className="md:hidden space-y-3">
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
                    <Link to="/SuperAdminProfessorAccountDetails">
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
                    <Link to="/SuperAdminProfAccountDetails">
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