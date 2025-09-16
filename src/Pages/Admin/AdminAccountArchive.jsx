import React from 'react'
import { Link } from 'react-router-dom';
import { useState } from "react";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import BackButton from '../../assets/BackButton(Light).svg';
import Archive from '../../assets/Archive(Light).svg';
import Unarchive from '../../assets/Unarchive.svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import Search from '../../assets/Search.svg';

export default function AdminAccountArchive() {
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="min-h-screen bg-gray-300">
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[250px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* main content of ADMIN ACCOUNT ARCHIVE */}
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
        
          {/* "Header" */}
          <div className="flex flex-col sm:flex-row item-start sm:items-center mb-2 sm:mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <img 
                src={Archive} 
                alt="Archive" 
                className="h-7 w-7 sm:h-6 sm:w-7 md:h-7 md:w-7 mr-3 sm:mr-3 mt-0.5 ml-2"
              />
              <h1 className="font-bold text-xl sm:text-base md:text-xl lg:text-xl text-[#465746]">
                Archives
              </h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm sm:text-sm md:text-base lg:text-base text-[#465746] mb-4 sm:mb-5 ml-2">
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
              <span className="mb-0 sm:mb-0">Accounts Archived</span>
              <Link to="/UserManagement" className="sm:hidden">
                <img src={BackButton} alt="BackButton" className="h-6 w-6" />
              </Link>
            </div>
            <Link to="/UserManagementProfessorAccounts" className="hidden sm:block">
              <img src={BackButton} alt="BackButton" className="h-6 w-6 sm:h-7 sm:w-7" />
            </Link>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mb-6" />

          {/* BUTTONS */}
          <div className="flex flex-col lg:flex-row mt-4 sm:mt-5 text-sm sm:text-sm md:text-base lg:text-base text-[#465746] gap-4 lg:justify-between lg:items-center">
            {/* Filter and Backup BUTTONS */}
            <div className="flex flex-wrap gap-2">
              
             {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center font-bold px-3 py-2 bg-[#fff] rounded-md w-32 sm:w-36 md:w-44 lg:w-40 shadow-md hover:border-[#00874E] hover:border-2 text-xs sm:text-sm cursor-pointer"
                >
                  Filter
                  <img src={ArrowDown} alt="ArrowDown" className="ml-2 h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                </button>

                {open && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-32 sm:w-36 md:w-44 lg:w-40 shadow-lg border border-gray-200 z-10">
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("Students");
                        setOpen(false);
                      }}
                    >
                      Students
                    </button>
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("Professor");
                        setOpen(false);
                      }}
                    >
                      Professor
                    </button>
                  </div>
                )}
              </div>

              <button className="font-bold px-3 py-2 bg-[#fff] rounded-md shadow-md hover:border-[#00874E] hover:border-2 text-xs sm:text-sm cursor-pointer">
                Backup
              </button>
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
                  <img 
                    src={Search} 
                    alt="Search"
                    className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account Archive Main Content */}
          {/* Account Request Table */}
          <div className="mt-5">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3 text-xs sm:text-sm md:text-base lg:text-lg min-w-[600px]">
                {/* Table Header */}
                <thead>
                  <tr className="text-[#465746] font-bold">
                    <th className="py-2 px-2 sm:px-3">No.</th>
                    <th className="py-2 px-2 sm:px-3">Student/Professor No.</th>
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
                    <td className="py-2 px-2 sm:px-3 font-bold text-[#FF6666]">Deactivated</td>
                    <td className="py-2 px-2 sm:px-3 rounded-r-lg">
                      <img 
                        onClick={() => setShowPopup(true)} 
                        src={Unarchive} 
                        alt="Unarchive" 
                        className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 cursor-pointer" 
                      />
                    </td>
                  </tr>

                  <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-100">
                    <td className="py-2 px-2 sm:px-3 rounded-l-lg">2</td>
                    <td className="py-2 px-2 sm:px-3">2025002</td>
                    <td className="py-2 px-2 sm:px-3">Brian Santos</td>
                    <td className="py-2 px-2 sm:px-3 break-all sm:break-normal">brian@example.com</td>
                    <td className="py-2 px-2 sm:px-3 font-bold text-[#FF6666]">Deactivated</td>
                    <td className="py-2 px-2 sm:px-3 rounded-r-lg">
                      <img 
                        onClick={() => setShowPopup(true)} 
                        src={Unarchive} 
                        alt="Unarchive" 
                        className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 cursor-pointer" 
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {/* Card 1 */}
              <div className="bg-white rounded-lg shadow p-4 text-[#465746]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">No. 1 | Student/Professor No.</p>
                    <p className="font-semibold text-sm">2025001</p>
                  </div>
                  <div className="flex gap-2">
                    <img 
                      onClick={() => setShowPopup(true)} 
                      src={Unarchive} 
                      alt="Unarchive" 
                      className="h-5 w-5 cursor-pointer" 
                    />
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
                    <p className="font-bold text-sm text-[#FF6666]">Deactivated</p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-lg shadow p-4 text-[#465746]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">No. 2 | Student/Professor No.</p>
                    <p className="font-semibold text-sm">2025002</p>
                  </div>
                  <div className="flex gap-2">
                    <img 
                      onClick={() => setShowPopup(true)} 
                      src={Unarchive} 
                      alt="Unarchive" 
                      className="h-5 w-5 cursor-pointer" 
                    />
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
              <Popup 
                setOpen={setShowPopup} 
                message="Are you sure you want to Restore this account?" 
                confirmText="Restore" 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}