import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ClassManagementLight from "../../assets/ClassManagement(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";
import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Search from "../../assets/Search.svg";
import Details from "../../assets/Details(Light).svg";
import Kick from "../../assets/Kick.svg";
import KickWarningIcon from "../../assets/Warning(Red).svg"; // You can use a red warning icon

export default function SuperAdminAdminAccount() {
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showKickModal, setShowKickModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [professors, setProfessors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch professors from backend
  useEffect(() => {
    fetch("http://localhost/TrackEd/src/Pages/Admin/ProfessorAccountsDB/get_professors.php")
      .then((res) => res.json())
      .then((data) => setProfessors(data))
      .catch((err) => console.error(err));
  }, []);

  // Pagination setup
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProfessors = professors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(professors.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleKickClick = (prof) => {
    setSelectedAdmin(prof);
    setShowKickModal(true);
  };

  const confirmKick = () => {
    console.log("Kicking admin:", selectedAdmin);
    
    setShowKickModal(false);
    setSelectedAdmin(null);
  };

  return (
    <div>
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`transition-all duration-300 ${
          isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"
        }`}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* content of ADMIN USER MANAGEMENT PROFESSOR ACCOUNT LIST */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* "Header" */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={ClassManagementLight}
                alt="ClassManagement"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                User Management
              </h1>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>Admin Account Administration</span>
              <Link to="/UserManagement">
                <img
                  src={BackButton}
                  alt="BackButton"
                  className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 hover:opacity-70 transition-opacity sm:hidden"
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row text-[#465746] gap-3 sm:gap-4 sm:justify-between sm:items-center">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center justify-between font-bold px-3 sm:px-4 py-2 bg-[#fff] rounded-md w-28 sm:w-36 lg:w-40 shadow-md border-2 border-transparent hover:border-[#00874E] text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer"
                >
                  <span>Filter</span>
                  <img
                    src={ArrowDown}
                    alt="ArrowDown"
                    className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ml-2"
                  />
                </button>

                {open && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-28 sm:w-36 lg:w-40 shadow-lg border border-gray-200 z-10">
                    {["All", "Active", "Deactivated"].map((f) => (
                      <button
                        key={f}
                        className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                        onClick={() => {
                          setSelectedFilter(f);
                          setOpen(false);
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="font-bold px-3 sm:px-4 py-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer">
                Backup
              </button>
            </div>

            {/* Search and Archive Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1 sm:max-w-xs lg:max-w-md">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none text-[#465746] bg-white text-xs sm:text-sm border-2 border-transparent focus:border-[#00874E] transition-all duration-200"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#465746]">
                  <img
                    src={Search}
                    alt="Search"
                    className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 sm:mt-5">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3 text-xs sm:text-sm lg:text-base">
                <thead>
                  <tr className="text-[#465746] font-bold">
                    <th className="py-2 px-2 sm:px-3">Admin No.</th>
                    <th className="py-2 px-2 sm:px-3">Full Name</th>
                    <th className="py-2 px-2 sm:px-3">Email</th>
                    <th className="py-2 px-2 sm:px-3">Status</th>
                    <th className="py-2 px-2 sm:px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[#465746]">
                  {currentProfessors.map((prof, index) => (
                    <tr
                      key={prof.tracked_ID}
                      className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-3 px-2 sm:px-3 rounded-l-lg">{prof.tracked_ID}</td>
                      <td className="py-3 px-2 sm:px-3">
                        {prof.tracked_fname} {prof.tracked_mi} {prof.tracked_lname}
                      </td>
                      <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">
                        {prof.tracked_email}
                      </td>
                      <td
                        className={`py-3 px-2 sm:px-3 font-bold ${
                          prof.tracked_Status === "Active"
                            ? "text-[#00A15D]"
                            : "text-[#FF6666]"
                        }`}
                      >
                        {prof.tracked_Status}
                      </td>
                      <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleKickClick(prof)}
                            className="hover:opacity-70 transition-opacity"
                          >
                            <img
                              src={Kick}
                              alt="Kick"
                              className="h-5 w-5 sm:h-6 sm:w-6"
                            />
                          </button>
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {currentProfessors.map((prof, i) => (
                <div
                  key={prof.tracked_ID}
                  className="bg-white rounded-lg shadow p-4 text-[#465746]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        No. {indexOfFirst + i + 1} | Admin No.
                      </p>
                      <p className="font-semibold text-sm">{prof.tracked_ID}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleKickClick(prof)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <img src={Kick} alt="Kick" className="h-5 w-5" />
                      </button>
                      <Link to="/SuperAdminAdminAccountDetails">
                        <img src={Details} alt="Details" className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium text-sm">
                        {prof.tracked_fname} {prof.tracked_lname}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm break-all">{prof.tracked_email}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p
                        className={`font-bold text-sm ${
                          prof.tracked_Status === "Active"
                            ? "text-[#00A15D]"
                            : "text-[#FF6666]"
                        }`}
                      >
                        {prof.tracked_Status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap justify-center mt-5 sm:mt-6 gap-2">
              {/* Previous Button */}
              {currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-md bg-white text-[#465746] hover:bg-gray-100 font-medium text-xs sm:text-sm transition-colors duration-200"
                >
                  Previous
                </button>
              )}

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
                        currentPage === pageNum
                          ? "bg-[#00874E] text-white"
                          : "bg-white text-[#465746] hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return (
                    <span key={pageNum} className="px-2 py-1.5 sm:py-2 text-[#465746]">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              {/* Next Button */}
              {currentPage < totalPages && (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-md bg-white text-[#465746] hover:bg-gray-100 font-medium text-xs sm:text-sm transition-colors duration-200"
                >
                  Next
                </button>
              )}
            </div>

            {/* Kick Confirmation POPUP */}
            {showKickModal && selectedAdmin && (
              <div
                className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowKickModal(false);
                    setSelectedAdmin(null);
                  }
                }}
                role="dialog"
                aria-modal="true"
              >
                <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
                  <div className="text-center">
                    {/* Warning Icon */}
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                      <img 
                        src={KickWarningIcon} 
                        alt="Warning" 
                        className="h-8 w-8" 
                      />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      Kick Admin?
                    </h3>
                    
                    <div className="mt-4 mb-6">
                      <p className="text-sm text-gray-600 mb-3">
                        Are you sure you want to kick this admin account? This action cannot be undone.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4 text-left">
                        <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                          {selectedAdmin.tracked_fname} {selectedAdmin.tracked_lname}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          ID: {selectedAdmin.tracked_ID}
                        </p>
                        <p className="text-sm text-gray-600">
                          Email: {selectedAdmin.tracked_email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          setShowKickModal(false);
                          setSelectedAdmin(null);
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmKick}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                      >
                        Kick
                      </button>
                    </div>
                  </div>
                </div>

                <style>{`
                  .overlay-fade { animation: overlayFade .18s ease-out both; }
                  @keyframes overlayFade { from { opacity: 0 } to { opacity: 1 } }

                  .modal-pop {
                    transform-origin: top center;
                    animation: popIn .22s cubic-bezier(.2,.8,.2,1) both;
                  }
                  @keyframes popIn {
                    from { opacity: 0; transform: translateY(-8px) scale(.98); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                  }
                `}</style>  
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}