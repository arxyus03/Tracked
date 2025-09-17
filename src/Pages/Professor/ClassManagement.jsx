import React from 'react'
import { useState } from "react";
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ClassManagementIcon from '../../assets/ClassManagement(Light).svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import Archive from '../../assets/Archive(Light).svg';
import Add from '../../assets/Add(Light).svg';
import Book from '../../assets/ClassManagementSubject(Light).svg';



export default function ClassManagement() {
  const [isOpen, setIsOpen] = useState(true);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* content of CLASS MANAGEMENT*/}
        <div className="p-5">

          {/* "Header" of CLASS MANAGEMENT */}
          <div className="flex">
            <img src={ClassManagementIcon} alt="Dashboard" className='color-[#465746] h-7 w-7 mr-5 mt-1' />
            <p className="font-bold text-[1.5rem] text-[#465746]"> Class Management </p>
          </div>

          <div className="flex text-[1.125rem] text-[#465746]">
            <span> Academic Management </span>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          <div className="flex flex-col lg:flex-row mt-5 gap-4 justify-between items-center">
            
            {/* Filter BUTTON */}
            <div className="flex flex-wrap gap-2">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center font-bold px-3 py-2 bg-[#fff] rounded-md cursor-pointer shadow-md"
                >
                  Year Level
                  <img src={ArrowDown} alt="ArrowDown" className="ml-15 h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                </button>

                {/* Filter Dropdown SELECTIONS */}
                {open && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-4 shadow-lg border border-gray-200 z-10">

                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("1st Year");
                        setOpen(false);
                      }}
                    >
                      1st Year
                    </button>

                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("2nd Year");
                        setOpen(false);
                      }}
                    >
                      2nd Year
                    </button>

                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("3rd Year");
                        setOpen(false);
                      }}
                    >
                      3rd Year
                    </button>

                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter("4th Year");
                        setOpen(false);
                      }}
                    >
                      4th Year
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Add and Archive Buttons */}
            <div className="flex items-center gap-2">
              <Link to="/AdminAccountArchive">
                <button className="font-bold py-2 bg-[#fff] rounded-md w-12 shadow-md flex items-center justify-center hover:border-[#00874E] hover:border-2 cursor-pointer">
                  <img src={Archive} alt="Archive" className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                </button>
              </Link>
              <Link to="/AdminAccountArchive">
                <button className="font-bold py-2 bg-[#fff] rounded-md w-12 shadow-md flex items-center justify-center hover:border-[#00874E] hover:border-2 cursor-pointer">
                  <img src={Add} alt="Add" className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                </button>
              </Link>
            </div>
          </div>
          
          {/* 1ST SUBJECT CARD */}
          <div className="bg-[#874040] text-white text-[1.125rem] rounded-lg p-5 space-y-2 mt-5 hover:border-[#351111] hover:border-2 cursor-pointer shadow-md">

            <div className="flex items-center font-bold">
              <img
                src={Book}
                alt="Subject"
                className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 mr-2"
              />
              <p className="mr-1">Section:</p>
              <p className="text-[#fff]">X</p>

              <button className="ml-auto font-bold py-2 bg-white rounded-md w-12 shadow-md flex items-center justify-center hover:border-[#00874E] hover:border-2 cursor-pointer">
                <img src={Archive} alt="Archive" className="h-7 w-7" />
              </button>
            </div>

            {/* Subject details */}
            <div className="flex">
              <p className="mr-2 font-bold">Subject:</p>
              <p>ITEC200A CAPSTONE PROJECTS AND RESEARCH</p>
            </div>
            <div className="flex">
              <p className="mr-2 font-bold">Subject Code:</p>
              <p>AJ5610</p>
            </div>
          </div>

          {/* 2ND SUBJECT CARD */}
          <div className="bg-[#4951AA] text-white text-[1.125rem] rounded-lg p-5 space-y-2 mt-5 hover:border-[#191e54] hover:border-2 cursor-pointer shadow-md">

            <div className="flex items-center font-bold">
              <img
                src={Book}
                alt="Subject"
                className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 mr-2"
              />
              <p className="mr-1">Section:</p>
              <p className="text-[#fff]">X</p>

              <button className="ml-auto font-bold py-2 bg-white rounded-md w-12 shadow-md flex items-center justify-center hover:border-[#00874E] hover:border-2 cursor-pointer">
                <img src={Archive} alt="Archive" className="h-7 w-7" />
              </button>
            </div>

            {/* Subject details */}
            <div className="flex">
              <p className="mr-2 font-bold">Subject:</p>
              <p>ITEC200A CAPSTONE PROJECTS AND RESEARCH</p>
            </div>
            <div className="flex">
              <p className="mr-2 font-bold">Subject Code:</p>
              <p>AJ5610</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
