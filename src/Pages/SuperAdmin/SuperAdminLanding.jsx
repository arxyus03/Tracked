import React from 'react'
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Search from "../../assets/Search.svg";
import SuperAdmin from '../../assets/SuperAdminIcon(Light).svg';
import ArchiveRow from '../../assets/ArchiveRow(Light).svg';
import Details from '../../assets/Details(Light).svg';
import Student from '../../assets/Student(Light).svg';
import Professor from '../../assets/Professor(Light).svg';

export default function SuperAdminLanding() {
  const [isOpen, setIsOpen] = useState(false);
  const [adminFilterOpen, setAdminFilterOpen] = useState(false);
  const [studentFilterOpen, setStudentFilterOpen] = useState(false);
  const [professorFilterOpen, setProfessorFilterOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  
  // State for account data
  const [adminCount, setAdminCount] = useState(0);
  const [professorCount, setProfessorCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [admins, setAdmins] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Base URL for API calls
  const baseUrl = "https://tracked.6minds.site/SuperAdmin/SuperAdminDB";

  // Fetch all data on component mount
  useEffect(() => {
    fetchUserCounts();
    fetchAdmins();
    fetchProfessors();
    fetchStudents();
  }, []);

  const fetchUserCounts = async () => {
    try {
      const response = await fetch(`${baseUrl}/get_superadmin_user_counts.php`);
      const data = await response.json();
      console.log("User counts:", data);
      setAdminCount(data.Admins || 0);
      setProfessorCount(data.Professors || 0);
      setStudentCount(data.Students || 0);
    } catch (error) {
      console.error("Error fetching user counts:", error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${baseUrl}/get_superadmin_admins.php`);
      const data = await response.json();
      console.log("Admins:", data);
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessors = async () => {
    try {
      const response = await fetch(`${baseUrl}/get_superadmin_professors.php`);
      const data = await response.json();
      console.log("Professors:", data);
      setProfessors(data);
    } catch (error) {
      console.error("Error fetching professors:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${baseUrl}/get_superadmin_students.php`);
      const data = await response.json();
      console.log("Students:", data);
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    return status === 'Active' ? 'text-[#00A15D]' : 'text-[#FF6666]';
  };

  // Function to get display name - using actual column names from your database
  const getDisplayName = (user) => {
    return `${user.tracked_firstname} ${user.tracked_lastname}`;
  };

  // Function to get email - using actual column name
  const getEmail = (user) => {
    return user.tracked_email;
  };

  // Function to get year and section for students
  const getYearSection = (student) => {
    return student.tracked_yearandsec || 'N/A';
  };

  if (loading) {
    return (
      <div>
        <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 flex justify-center items-center">
            <div className="text-[#465746]">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="superadmin" isOpen={isOpen} setIsOpen={setIsOpen} />
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

          {/* Account Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
            {/* Admin Accounts Card */}
            <div className="bg-[#FFFFFF] rounded-lg sm:rounded-xl shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 p-4 sm:p-5 lg:p-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <img
                  src={SuperAdmin}
                  alt="Admin"
                  className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-3 sm:mr-4"
                />
                <h2 className="font-bold text-base sm:text-lg lg:text-xl text-[#465746]">
                  Admin Accounts
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-bold text-sm sm:text-base lg:text-lg text-[#465746] mb-1 sm:mb-0">
                  Total Admin Accounts:
                </p>
                <p className="font-bold text-sm sm:text-base lg:text-lg text-[#00874E] sm:ml-2">
                  {adminCount}
                </p>
              </div>
            </div>

            {/* Professor Accounts Card */}
            <div className="bg-[#FFFFFF] rounded-lg sm:rounded-xl shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 p-4 sm:p-5 lg:p-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <img
                  src={Professor}
                  alt="Professor"
                  className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-3 sm:mr-4"
                />
                <h2 className="font-bold text-base sm:text-lg lg:text-xl text-[#465746]">
                  Professor Accounts
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-bold text-sm sm:text-base lg:text-lg text-[#465746] mb-1 sm:mb-0">
                  Total Professor Accounts:
                </p>
                <p className="font-bold text-sm sm:text-base lg:text-lg text-[#00874E] sm:ml-2">
                  {professorCount}
                </p>
              </div>
            </div>

            {/* Student Accounts Card */}
            <div className="bg-[#FFFFFF] rounded-lg sm:rounded-xl shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 p-4 sm:p-5 lg:p-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <img
                  src={Student}
                  alt="Student"
                  className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-3 sm:mr-4"
                />
                <h2 className="font-bold text-base sm:text-lg lg:text-xl text-[#465746]">
                  Student Accounts
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-bold text-sm sm:text-base lg:text-lg text-[#465746] mb-1 sm:mb-0">
                  Total Student Accounts:
                </p>
                <p className="font-bold text-sm sm:text-base lg:text-lg text-[#00874E] sm:ml-2">
                  {studentCount}
                </p>
              </div>
            </div>
          </div>

          {/* ADMIN ACCOUNT */}
          <p className="text-sm sm:text-base lg:text-lg text-[#465746] mb-4 font-bold">Admin Accounts</p>

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
                    onClick={() => setAdminFilterOpen(false)}
                  >
                    Active
                  </button>
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => setAdminFilterOpen(false)}
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
                <tbody className="text-[#465746]">
                  {admins.length > 0 ? (
                    admins.map((admin, index) => (
                      <tr key={admin.tracked_ID} className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-3 px-2 sm:px-3 rounded-l-lg">{index + 1}</td>
                        <td className="py-3 px-2 sm:px-3">{admin.tracked_ID}</td>
                        <td className="py-3 px-2 sm:px-3">{getDisplayName(admin)}</td>
                        <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">{getEmail(admin)}</td>
                        <td className={`py-3 px-2 sm:px-3 font-bold ${getStatusColor(admin.tracked_Status)}`}>
                          {admin.tracked_Status}
                        </td>
                        <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                          <div className="flex gap-2">
                            <img 
                              onClick={() => setShowPopup(true)} 
                              src={ArchiveRow} 
                              alt="Archive" 
                              className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                            />
                            <Link to={`/SuperAdminAdminAccountDetails?id=${admin.tracked_ID}`}>
                              <img 
                                src={Details} 
                                alt="Details" 
                                className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 transition-opacity" 
                              />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-[#465746]">
                        No admin accounts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Admin */}
            <div className="md:hidden space-y-3">
              {admins.length > 0 ? (
                admins.map((admin, index) => (
                  <div key={admin.tracked_ID} className="bg-white rounded-lg shadow p-4 text-[#465746]">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">No. {index + 1} | Admin No.</p>
                        <p className="font-semibold text-sm">{admin.tracked_ID}</p>
                      </div>
                      <div className="flex gap-2">
                        <img 
                          onClick={() => setShowPopup(true)} 
                          src={ArchiveRow} 
                          alt="Archive" 
                          className="h-5 w-5 cursor-pointer" 
                        />
                        <Link to={`/SuperAdminAdminAccountDetails?id=${admin.tracked_ID}`}>
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
                        <p className="font-medium text-sm">{getDisplayName(admin)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm break-all">{getEmail(admin)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className={`font-bold text-sm ${getStatusColor(admin.tracked_Status)}`}>
                          {admin.tracked_Status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-4 text-[#465746] text-center">
                  No admin accounts found
                </div>
              )}
            </div>

            {/* Popup for Archive */}
            {showPopup && (
              <Popup setOpen={setShowPopup} />
            )}
          </div>

          <hr className="border-[#465746]/30 my-5 sm:my-6" />

          {/* STUDENT ACCOUNT */}
          <p className="text-sm sm:text-base lg:text-lg text-[#465746] mb-4 font-bold">Student Accounts</p>

          {/* STUDENT BUTTONS */}
          <div className="flex flex-col sm:flex-row text-[#465746] gap-3 sm:gap-4 sm:justify-between sm:items-center">           
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
                    onClick={() => setStudentFilterOpen(false)}
                  >
                    Year
                  </button>
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => setStudentFilterOpen(false)}
                  >
                    Section
                  </button>
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => setStudentFilterOpen(false)}
                  >
                    Active
                  </button>
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => setStudentFilterOpen(false)}
                  >
                    Deactivated
                  </button>
                </div>
              )}
            </div>

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
                <tbody className="text-[#465746]">
                  {students.length > 0 ? (
                    students.map((student, index) => (
                      <tr key={student.tracked_ID} className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-3 px-2 sm:px-3 rounded-l-lg">{index + 1}</td>
                        <td className="py-3 px-2 sm:px-3">{student.tracked_ID}</td>
                        <td className="py-3 px-2 sm:px-3">{getDisplayName(student)}</td>
                        <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">{getEmail(student)}</td>
                        <td className="py-3 px-2 sm:px-3">{getYearSection(student)}</td>
                        <td className={`py-3 px-2 sm:px-3 font-bold ${getStatusColor(student.tracked_Status)}`}>
                          {student.tracked_Status}
                        </td>
                        <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                          <div className="flex gap-2">
                            <img 
                              onClick={() => setShowPopup(true)} 
                              src={ArchiveRow} 
                              alt="Archive" 
                              className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                            />
                            <Link to={`/SuperAdminStudentAccountDetails?id=${student.tracked_ID}`}>
                              <img 
                                src={Details} 
                                alt="Details" 
                                className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 transition-opacity" 
                              />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-4 text-center text-[#465746]">
                        No student accounts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Student */}
            <div className="md:hidden space-y-3">
              {students.length > 0 ? (
                students.map((student, index) => (
                  <div key={student.tracked_ID} className="bg-white rounded-lg shadow p-4 text-[#465746]">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">No. {index + 1} | Student No.</p>
                        <p className="font-semibold text-sm">{student.tracked_ID}</p>
                      </div>
                      <div className="flex gap-2">
                        <img 
                          onClick={() => setShowPopup(true)} 
                          src={ArchiveRow} 
                          alt="Archive" 
                          className="h-5 w-5 cursor-pointer" 
                        />
                        <Link to={`/SuperAdminStudentAccountDetails?id=${student.tracked_ID}`}>
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
                        <p className="font-medium text-sm">{getDisplayName(student)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm break-all">{getEmail(student)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Year & Section</p>
                        <p className="text-sm">{getYearSection(student)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className={`font-bold text-sm ${getStatusColor(student.tracked_Status)}`}>
                          {student.tracked_Status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-4 text-[#465746] text-center">
                  No student accounts found
                </div>
              )}
            </div>
          </div>

          <hr className="border-[#465746]/30 my-5 sm:my-6" />

          {/* PROFESSOR ACCOUNT */}
          <p className="text-sm sm:text-base lg:text-lg text-[#465746] mb-4 font-bold">Professor Accounts</p>
          
          {/* PROFESSOR BUTTONS */}
          <div className="flex flex-col sm:flex-row text-[#465746] gap-3 sm:gap-4 sm:justify-between sm:items-center">
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
                    onClick={() => setProfessorFilterOpen(false)}
                  >
                    Active
                  </button>
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => setProfessorFilterOpen(false)}
                  >
                    Deactivated
                  </button>
                </div>
              )}
            </div>

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
                <tbody className="text-[#465746]">
                  {professors.length > 0 ? (
                    professors.map((professor, index) => (
                      <tr key={professor.tracked_ID} className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-3 px-2 sm:px-3 rounded-l-lg">{index + 1}</td>
                        <td className="py-3 px-2 sm:px-3">{professor.tracked_ID}</td>
                        <td className="py-3 px-2 sm:px-3">{getDisplayName(professor)}</td>
                        <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">{getEmail(professor)}</td>
                        <td className={`py-3 px-2 sm:px-3 font-bold ${getStatusColor(professor.tracked_Status)}`}>
                          {professor.tracked_Status}
                        </td>
                        <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                          <div className="flex gap-2">
                            <img 
                              onClick={() => setShowPopup(true)} 
                              src={ArchiveRow} 
                              alt="Archive" 
                              className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                            />
                            <Link to={`/SuperAdminProfAccountDetails?id=${professor.tracked_ID}`}>
                              <img 
                                src={Details} 
                                alt="Details" 
                                className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 transition-opacity" 
                              />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-[#465746]">
                        No professor accounts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Professor */}
            <div className="md:hidden space-y-3">
              {professors.length > 0 ? (
                professors.map((professor, index) => (
                  <div key={professor.tracked_ID} className="bg-white rounded-lg shadow p-4 text-[#465746]">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">No. {index + 1} | Professor No.</p>
                        <p className="font-semibold text-sm">{professor.tracked_ID}</p>
                      </div>
                      <div className="flex gap-2">
                        <img 
                          onClick={() => setShowPopup(true)} 
                          src={ArchiveRow} 
                          alt="Archive" 
                          className="h-5 w-5 cursor-pointer" 
                        />
                        <Link to={`/SuperAdminProfAccountDetails?id=${professor.tracked_ID}`}>
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
                        <p className="font-medium text-sm">{getDisplayName(professor)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm break-all">{getEmail(professor)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className={`font-bold text-sm ${getStatusColor(professor.tracked_Status)}`}>
                          {professor.tracked_Status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-4 text-[#465746] text-center">
                  No professor accounts found
                </div>
              )}
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