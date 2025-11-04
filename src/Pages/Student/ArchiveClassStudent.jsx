import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Subject from '../../assets/Subjects(Light).svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import ArchiveRow from "../../assets/Unarchive.svg";
import DeleteIcon from "../../assets/Delete.svg";

export default function ArchivedClasses() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const [cardColor, setCardColor] = useState("#ffffff");

  const [archivedClasses, setArchivedClasses] = useState([
    {
      code: "GNED09",
      title: "Rizal: Life & Work",
      instructor: "Prof. Maria Santos",
      archivedAt: "July 12, 2025",
    },
    {
      code: "ITEC95",
      title: "Qualitative Research Methods",
      instructor: "Dr. Allan Reyes",
      archivedAt: "June 28, 2025",
    },
    {
      code: "ITEC101A",
      title: "IT Elective 1",
      instructor: "Prof. Liza Gomez",
      archivedAt: "December 20, 2024",
    },
  ]);

  const handleDelete = (code) => {
    if (window.confirm(`Delete ${code}? This action cannot be undone.`)) {
      setArchivedClasses((prev) => prev.filter((cls) => cls.code !== code));
    }
  };

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />

        {/* Page Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8 text-[#465746]">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={Subject}
                alt="Subjects"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">
                Archived Classes
              </h1>
            </div>
            <div className="flex justify-between">
              <div className="text-sm sm:text-base lg:text-lg">
                <span>List of archived classes</span>
              </div>
              <div className="flex text-sm sm:text-base lg:text-lg">
                <span>2nd Semester 2024 - 2025</span>
                <img
                  src={ArrowDown}
                  alt="ArrowDown"
                  className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Archived Class Cards */}
          {archivedClasses.map((cls) => (
            <div
              key={cls.code}
              className="text-[#465746] text-lg h-35 p-5 mt-5 rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200"
              style={{ backgroundColor: cardColor }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold">{cls.code}:</span>
                  <span className="ml-2">{cls.title}</span>
                </div>

                <div className="flex gap-3">
                  {/* Archive indicator */}
                  <div className="flex bg-[#D4D4D4] h-12 w-12 rounded-md justify-center items-center border-2 border-transparent hover:scale-105 transition-all duration-200">
                    <img
                      src={ArchiveRow}
                      className="h-8 w-8"
                      alt="Archived"
                      title="Archived"
                    />
                  </div>

                  {/* Delete button */}
                  <div
                    onClick={() => handleDelete(cls.code)}
                    className="flex bg-[#D4D4D4] h-12 w-12 rounded-md justify-center items-center border-2 border-transparent hover:bg-red-200 hover:scale-105 transition-all duration-200 cursor-pointer"
                    title="Delete"
                  >
                    <img src={DeleteIcon} className="h-7 w-7" alt="Delete" />
                  </div>
                </div>
              </div>

              <div className="mt-2 text-base">
                <span className="font-bold">Instructor:</span>
                <span className="ml-2">{cls.instructor}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-bold">Archived on:</span>
                <span className="ml-2">{cls.archivedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
