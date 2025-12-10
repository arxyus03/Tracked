import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Lottie from "lottie-react";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import AdminStudentAccountStatus from "../../Components/AdminStudentAccountStatus";
import AdminStudentAccountBackup from "../../Components/AdminStudentAccountBackup";
import AdminStudentAccountRestore from "../../Components/AdminStudentAccountRestore";

import ClassManagementLight from "../../assets/ClassManagement(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";
import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Search from "../../assets/Search.svg";
import Details from "../../assets/Details(Light).svg";
import BackupIcon from "../../assets/Backup(Light).svg";
import RestoreIcon from "../../assets/Restore(Light).svg";
import loadingAnimation from "../../assets/system-regular-716-spinner-three-dots-loop-expand.json";

export default function UserManagementStudentAccounts() {
  const [isOpen, setIsOpen] = useState(true);
  const [open, setOpen] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  // Backup/restore modal states
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [backupModalContent, setBackupModalContent] = useState(null);
  const [restoreModalContent, setRestoreModalContent] = useState(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Year filter state
  const [yearOpen, setYearOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("All");

  // Get section from URL parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedSection = queryParams.get('section') || 'All';

  const defaultLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch students data
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    setLoading(true);
    fetch("https://tracked.6minds.site/Admin/StudentAccountsDB/get_students.php")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStudents(data);
        } else if (data.success && data.student) {
          setStudents([data.student]);
        } else if (data.success && Array.isArray(data.students)) {
          setStudents(data.students);
        } else {
          setStudents([]);
          setError("Failed to load students data");
        }
      })
      .catch((err) => {
        setStudents([]);
        setError("Network error. Please check if the server is running.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Backup students data
  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const response = await fetch("https://tracked.6minds.site/Admin/StudentAccountsDB/backup_students.php?download=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const filename = `students_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setBackupModalContent({
          type: 'success',
          title: 'Backup Successful',
          message: `Backup created and downloaded to your computer!`,
          filename: filename
        });
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Backup failed');
      }
    } catch (error) {
      setBackupModalContent({
        type: 'error',
        title: 'Backup Failed',
        message: error.message || 'Network error during backup.'
      });
    } finally {
      setIsBackingUp(false);
      setShowBackupModal(true);
    }
  };

  // Initiate restore process
  const handleRestore = async () => {
    setRestoreModalContent({
      type: 'confirmation',
      title: 'Confirm Restore',
      message: 'Are you sure you want to restore student accounts from the latest backup?',
      confirmText: 'Restore',
      cancelText: 'Cancel'
    });
    setShowRestoreModal(true);
  };

  const confirmRestore = async () => {
    setIsRestoring(true);
    setShowRestoreModal(false);
    
    try {
      const response = await fetch("https://tracked.6minds.site/Admin/StudentAccountsDB/restore_students.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setRestoreModalContent({
          type: 'success',
          title: 'Restore Successful',
          message: `Students restored successfully!`,
          filename: data.filename
        });
        fetchStudents();
      } else {
        setRestoreModalContent({
          type: 'error',
          title: 'Restore Failed',
          message: data.message
        });
      }
    } catch (error) {
      setRestoreModalContent({
        type: 'error',
        title: 'Network Error',
        message: 'Network error during restore.'
      });
    } finally {
      setIsRestoring(false);
      setShowRestoreModal(true);
    }
  };

  const closeBackupModal = () => {
    setShowBackupModal(false);
    setBackupModalContent(null);
  };

  const closeRestoreModal = () => {
    setShowRestoreModal(false);
    setRestoreModalContent(null);
  };

  // Filter students based on selected criteria
  const filteredStudents = students.filter(stud => {
    if (selectedFilter !== "All" && stud.tracked_Status !== selectedFilter) {
      return false;
    }

    if (selectedYear !== "All") {
      const studentYear = stud.tracked_yearandsec?.charAt(0);
      const selectedYearNumber = selectedYear.charAt(0);
      if (studentYear !== selectedYearNumber) {
        return false;
      }
    }

    if (selectedSection !== "All") {
      const studentSection = stud.tracked_yearandsec?.substring(1);
      if (studentSection !== selectedSection) {
        return false;
      }
    }

    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${stud.tracked_firstname} ${stud.tracked_middlename} ${stud.tracked_lastname}`.toLowerCase();
      const studentId = stud.tracked_ID?.toLowerCase();
      const email = stud.tracked_email?.toLowerCase();
      const yearSection = stud.tracked_yearandsec?.toLowerCase();

      if (!fullName.includes(searchLower) && 
          !studentId.includes(searchLower) && 
          !email.includes(searchLower) &&
          !yearSection.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Pagination setup
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleStatusChange = (stud) => {
    setSelectedStudent(stud);
    setShowArchiveModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedStudent) return;

    const newStatus = selectedStudent.tracked_Status === "Active" ? "Deactivate" : "Active";
    
    try {
      const response = await fetch("https://tracked.6minds.site/Admin/StudentAccountsDB/update_student_status.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent.tracked_ID,
          newStatus: newStatus
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.success) {
        setStudents(prevStudents => 
          prevStudents.map(stud => 
            stud.tracked_ID === selectedStudent.tracked_ID 
              ? { ...stud, tracked_Status: newStatus }
              : stud
          )
        );
      } else {
        alert(`Failed to update student status: ${data.message}`);
      }
    } catch (error) {
      alert(`Network error: ${error.message}.`);
    } finally {
      setShowArchiveModal(false);
      setSelectedStudent(null);
    }
  };

  // Toggle button component
  const StatusToggleButton = ({ status, onClick }) => {
    const isActive = status === "Active";
    
    return (
      <button
        onClick={onClick}
        className={`cursor-pointer inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none ${
          isActive ? 'bg-[#00A15D]' : 'bg-[#FF6666]'
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
            isActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    );
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

        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <img
                  src={ClassManagementLight}
                  alt="ClassManagement"
                  className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
                />
                <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                  User Management
                </h1>
              </div>
              
              <Link to="/UserManagementStudentSections" className="flex items-center text-[#465746] hover:text-[#00874E] transition-colors duration-200">
                <img
                  src={BackButton}
                  alt="BackButton"
                  className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 hover:opacity-70 transition-opacity"
                />
              </Link>
            </div>
            <div className="text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>Student Account Administration</span>
            </div>
            
            <div className="mt-2 text-md sm:text-base text-[#465746] font-medium">
              <span className="font-bold">Section: {selectedSection}</span>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col justify-center items-center py-12">
              <div className="w-24 h-24 mb-4">
                <Lottie 
                  {...defaultLottieOptions}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <p className="text-[#465746] text-lg font-medium">Loading students...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
              <button
                onClick={fetchStudents}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && (
            <>
              {/* Action Controls */}
              <div className="flex flex-col text-[#465746] gap-3 sm:gap-4">
                {/* Backup/Restore Buttons */}
                <div className="flex justify-end gap-2 sm:gap-3 w-full">
                  <button 
                    onClick={handleBackup}
                    disabled={isBackingUp}
                    className={`font-bold px-3 sm:px-4 py-2 bg-[#4CAF50] text-white rounded-md shadow-md border-2 border-transparent hover:bg-[#45a049] hover:border-[#00874E] text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer flex items-center justify-center min-w-[100px] sm:min-w-[110px] ${
                      isBackingUp ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isBackingUp ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2">
                          <Lottie 
                            {...defaultLottieOptions}
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                        Backing up...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <img 
                          src={BackupIcon} 
                          alt="Backup" 
                          className="h-4 w-4 sm:h-5 sm:w-5 mr-2" 
                        />
                        Backup
                      </div>
                    )}
                  </button>

                  <button 
                    onClick={handleRestore}
                    disabled={isRestoring}
                    className={`font-bold px-3 sm:px-4 py-2 bg-[#4CAF50] text-white rounded-md shadow-md border-2 border-transparent hover:bg-[#45a049] hover:border-[#00874E] text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer flex items-center justify-center min-w-[100px] sm:min-w-[110px] ${
                      isRestoring ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isRestoring ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2">
                          <Lottie 
                            {...defaultLottieOptions}
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                        Restoring...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <img 
                          src={RestoreIcon} 
                          alt="Restore" 
                          className="h-4 w-4 sm:h-5 sm:w-5 mr-2" 
                        />
                        Restore
                      </div>
                    )}
                  </button>
                </div>

                {/* Filter Dropdowns */}
                <div className="flex justify-end gap-2 sm:gap-3 w-full">
                  <div className="relative">
                    <button
                      onClick={() => setOpen(!open)}
                      className="flex items-center justify-between font-bold px-3 sm:px-4 py-2 bg-[#fff] rounded-md w-28 sm:w-36 lg:w-40 h-9 sm:h-10 lg:h-11 shadow-md border-2 border-transparent hover:border-[#00874E] text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer"
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
                        {["All", "Active", "Deactivate"].map((f) => (
                          <button
                            key={f}
                            className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                            onClick={() => {
                              setSelectedFilter(f);
                              setOpen(false);
                              setCurrentPage(1);
                            }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setYearOpen(!yearOpen)}
                      className="flex items-center justify-between font-bold px-3 sm:px-4 py-2 bg-[#fff] rounded-md w-28 sm:w-36 lg:w-40 h-9 sm:h-10 lg:h-11 shadow-md border-2 border-transparent hover:border-[#00874E] text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer"
                    >
                      <span>Year: {selectedYear}</span>
                      <img
                        src={ArrowDown}
                        alt="ArrowDown"
                        className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ml-2"
                      />
                    </button>

                    {yearOpen && (
                      <div className="absolute top-full mt-1 bg-white rounded-md w-28 sm:w-36 lg:w-40 shadow-lg border border-gray-200 z-10">
                        {["All", "1st", "2nd", "3rd", "4th"].map((year) => (
                          <button
                            key={year}
                            className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                            onClick={() => {
                              setSelectedYear(year);
                              setYearOpen(false);
                              setCurrentPage(1);
                            }}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search by name, student ID, email, or year and section..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none text-[#465746] bg-white text-xs sm:text-sm border-2 border-transparent focus:border-[#00874E] transition-all duration-200"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {searchTerm && (
                      <button
                        onClick={handleClearSearch}
                        className="text-gray-500 hover:text-[#465746] mr-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <button className="text-gray-500 hover:text-[#465746]">
                      <img
                        src={Search}
                        alt="Search"
                        className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Students Table */}
              <div className="mt-4 sm:mt-5">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3 text-xs sm:text-sm lg:text-base">
                    <thead>
                      <tr className="text-[#465746] font-bold">
                        <th className="py-2 px-2 sm:px-3">Student ID No.</th>
                        <th className="py-2 px-2 sm:px-3">Full Name</th>
                        <th className="py-2 px-2 sm:px-3">Email</th>
                        <th className="py-2 px-2 sm:px-3">Year And Section</th>
                        <th className="py-2 px-2 sm:px-3">Status</th>
                        <th className="py-2 px-2 sm:px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#465746]">
                      {currentStudents.map((stud) => (
                        <tr
                          key={stud.tracked_ID}
                          className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="py-3 px-2 sm:px-3 rounded-l-lg">{stud.tracked_ID}</td>
                          <td className="py-3 px-2 sm:px-3">
                            {stud.tracked_firstname} {stud.tracked_middlename} {stud.tracked_lastname}
                          </td>
                          <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">
                            {stud.tracked_email}
                          </td>
                          <td className="py-3 px-2 sm:px-3">
                            {stud.tracked_yearandsec}
                          </td>
                          <td
                            className={`py-3 px-2 sm:px-3 font-bold ${
                              stud.tracked_Status === "Active"
                                ? "text-[#00A15D]"
                                : "text-[#FF6666]"
                            }`}
                          >
                            {stud.tracked_Status}
                          </td>
                          <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                            <div className="flex gap-2">
                              <StatusToggleButton 
                                status={stud.tracked_Status}
                                onClick={() => handleStatusChange(stud)}
                              />
                              <Link 
                                to={`/UserManagementStudentAccountDetails?id=${stud.tracked_ID}`}
                              >
                                <img
                                  src={Details}
                                  alt="Details"
                                  className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 transition-opacity duration-200"
                                />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Cards */}
                <div className="lg:hidden space-y-3">
                  {currentStudents.map((stud, i) => (
                    <div
                      key={stud.tracked_ID}
                      className="bg-white rounded-lg shadow p-4 text-[#465746]"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            No. {indexOfFirst + i + 1} | Student ID No.
                          </p>
                          <p className="font-semibold text-sm">{stud.tracked_ID}</p>
                        </div>
                        <div className="flex gap-2">
                          <StatusToggleButton 
                            status={stud.tracked_Status}
                            onClick={() => handleStatusChange(stud)}
                          />
                          <Link 
                            to={`/UserManagementStudentAccountDetails?id=${stud.tracked_ID}`}
                          >
                            <img src={Details} alt="Details" className="h-5 w-5 hover:opacity-70" />
                          </Link>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Full Name</p>
                          <p className="font-medium text-sm">
                            {stud.tracked_firstname} {stud.tracked_middlename} {stud.tracked_lastname}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm break-all">{stud.tracked_email}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Year and Section</p>
                          <p className="text-sm">{stud.tracked_yearandsec}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <p
                            className={`font-bold text-sm ${
                              stud.tracked_Status === "Active"
                                ? "text-[#00A15D]"
                                : "text-[#FF6666]"
                            }`}
                          >
                            {stud.tracked_Status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* No results message */}
                {currentStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm || selectedFilter !== "All" || selectedYear !== "All" 
                      ? "No students found matching the current filters." 
                      : "No students found."}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap justify-center mt-5 sm:mt-6 gap-2">
                    {currentPage > 1 && (
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-md bg-white text-[#465746] hover:bg-gray-100 font-medium text-xs sm:text-sm transition-colors duration-200"
                      >
                        Previous
                      </button>
                    )}

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

                    {currentPage < totalPages && (
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-md bg-white text-[#465746] hover:bg-gray-100 font-medium text-xs sm:text-sm transition-colors duration-200"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Modal Components */}
          <AdminStudentAccountStatus
            show={showArchiveModal}
            student={selectedStudent}
            onClose={() => {
              setShowArchiveModal(false);
              setSelectedStudent(null);
            }}
            onConfirm={confirmStatusChange}
          />

          <AdminStudentAccountBackup
            show={showBackupModal}
            content={backupModalContent}
            onClose={closeBackupModal}
          />

          <AdminStudentAccountRestore
            show={showRestoreModal}
            content={restoreModalContent}
            onClose={closeRestoreModal}
            onConfirm={confirmRestore}
          />
        </div>
      </div>
    </div>
  );
}