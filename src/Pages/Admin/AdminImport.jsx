import React from 'react'
import { useState } from "react";
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Search from "../../assets/Search.svg";
import ArchiveRow from '../../assets/ArchiveRow(Light).svg';
import Details from '../../assets/Details(Light).svg';
import Import from '../../assets/Import(Light).svg';


export default function AdminImport() {
  const [isOpen, setIsOpen] = useState(true);
  const [open, setOpen] = useState(false); 
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div>
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* content of ADMIN REPORTS */}
        <div className="p-6">
        
          <div className="flex">
            <img src={Import} alt="Import" className='color-[#465746] h-7 w-7 mr-5 mt-1' />
            <p className="font-bold text-[1.5rem] text-[#465746]"> Import </p>
          </div>

          <p className="text-[1.125rem] text-[#465746]"> Import Databases for TrackED</p>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          {/* main content of ADMIN REPORTS */}

          <div className='flex justify-center items-center mt-5'>

          </div>

          {/* BUTTONS */}
          <div className="flex mt-5 text-[1.125rem] text-[#465746] justify-between items-center">
            {/* FilterBUTTON */}
            <div className="flex">
              <button
                onClick={() => setOpen(!open)}
                className="flex font-bold px-3 py-2 bg-[#fff] rounded-md w-40 shadow-md hover:border-[#00874E] hover:border-2"
              >
                Filter
                <img src={ArrowDown} alt="ArrowDown" className="ml-15 h-7 w-7" />
              </button>

              <button className="font-bold py-2 bg-[#fff] rounded-md w-50 shadow-md text-center ml-2 hover:border-[#00874E] hover:border-2">
                Import Database
              </button>

              <button className="font-bold py-2 bg-[#fff] rounded-md w-50 shadow-md text-center ml-2 hover:border-[#00874E] hover:border-2">
                Backup
              </button>
            </div>

            {/* Search and Archive Buttons */}
            <div className="flex items-center">
              <div className="relative w-80">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none text-[#465746] bg-white"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#465746]">
                  <img src={Search} alt="Search" className="h-7 w-7" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Dropdown */}
          {open && (
            <div className="absolute mt-1 bg-white rounded-md w-40 shadow-md z-30">
              <button className="block px-3 py-2 w-full text-left hover:bg-gray-100">
                Year
              </button>
              <button className="block px-3 py-2 w-full text-left hover:bg-gray-100">
                Section
              </button>
              <button className="block px-3 py-2 w-full text-left hover:bg-gray-100">
                Active
              </button>
              <button className="block px-3 py-2 w-full text-left hover:bg-gray-100">
                Deactivated
              </button>
            </div>
          )}

          {/* STUDENT ACCOUNT Table */}
          <div className="mt-5 ">
            <table className="w-full text-left border-separate border-spacing-y-3 text-[1.125rem]">

              {/* Table Header */}
              <thead>
                <tr className="text-[#465746] font-bold">
                  <th className="py-2 px-3">No.</th>
                  <th className="py-2 px-3">ID No.</th>
                  <th className="py-2 px-3">Full Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3"> </th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="text-[#465746]">

                <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-100">
                  <td className="py-2 px-3 rounded-l-lg">1</td>
                  <td className="py-2 px-3">2025001</td>
                  <td className="py-2 px-3">Alice Mendoza</td>
                  <td className="py-2 px-3">alice@example.com</td>
                  <td className="py-2 px-3">First Year - A</td>
                  <td className="py-2 px-3 font-bold text-[#00A15D]">Active</td>
                  <td className="py-2">
                    <img onClick={() => setShowPopup(true)} src={ArchiveRow} alt="Archive" className=" h-7 w-7 cursor-pointer" />
                  </td>
                  <td className="py-2 rounded-r-lg">
                    <Link to="/UserManagementStudentAccountDetails">
                      <img src={Details} alt="Details" className=" h-7 w-7 " />
                    </Link>
                  </td>
                </tr>

                <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-100">
                  <td className="py-2 px-3 rounded-l-lg">2</td>
                  <td className="py-2 px-3">2025002</td>
                  <td className="py-2 px-3">Brian Santos</td>
                  <td className="py-2 px-3">brian@example.com</td>
                  <td className="py-2 px-3">First Year - B</td>
                  <td className="py-2 px-3 font-bold text-[#FF6666]"> Deactivated </td>
                  <td className="py-2">
                    <img onClick={() => setShowPopup(true)} src={ArchiveRow} alt="Archive" className=" h-7 w-7 cursor-pointer" />
                  </td>
                  <td className="py-2 rounded-r-lg">
                    <Link to="/UserManagementStudentAccountDetails">
                      <img src={Details} alt="Details" className=" h-7 w-7" />
                    </Link>
                  </td>
                </tr>

              </tbody>
            </table>
              {/* Popup for Archive */}
            {showPopup && (
              <Popup setOpen={setShowPopup} />
            )}
          </div>
          
        </div>

      </div>
    </div>
  )
}
