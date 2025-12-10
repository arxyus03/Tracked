import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";

// Components
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

// Assets
import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Search from "../../assets/Search.svg";
import Import from "../../assets/Import(Light).svg";
import ArchiveWarningIcon from "../../assets/Warning(Yellow).svg";
import SuccessIcon from "../../assets/Success(Green).svg";
import ErrorIcon from "../../assets/Error(Red).svg";
import loadingAnimation from "../../assets/system-regular-716-spinner-three-dots-loop-expand.json";

export default function AdminImport() {
  // State variables
  const [isOpen, setIsOpen] = useState(true);
  const [open, setOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState({ type: "", title: "", message: "" });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from API
  const fetchUsers = () => {
    setIsLoading(true);
    fetch("https://tracked.6minds.site/Admin/AdminImportDB/get_users.php")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Invalid data format:", data);
          setUsers([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setUsers([]);
        setResultData({
          type: "error",
          title: "Fetch Error!",
          message: "Failed to load users. Please try again."
        });
        setShowResultModal(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Open import modal
  const handleImportDatabase = () => {
    setShowImportModal(true);
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['.sql', 'application/sql', 'text/sql', 'text/plain'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      const isSQLFile = file.name.endsWith('.sql') || 
                       validTypes.includes(file.type) ||
                       file.type === '';
      
      if (!isSQLFile) {
        setResultData({
          type: "error",
          title: "Invalid File Type!",
          message: "Please select a valid SQL file (.sql extension)."
        });
        setShowResultModal(true);
        return;
      }
      
      if (file.size > maxSize) {
        setResultData({
          type: "error",
          title: "File Too Large!",
          message: "Please select an SQL file smaller than 10MB."
        });
        setShowResultModal(true);
        return;
      }
      
      setImportFile(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Confirm import database
  const confirmImportDatabase = () => {
    if (!importFile) {
      setResultData({
        type: "error",
        title: "No File Selected!",
        message: "Please select an SQL file to import."
      });
      setShowResultModal(true);
      return;
    }

    setIsImporting(true);
    const formData = new FormData();
    formData.append("sqlFile", importFile);

    fetch("https://tracked.6minds.site/Admin/AdminImportDB/import_data.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setResultData({
            type: "success",
            title: "Import Successful!",
            message: data.message
          });
          fetchUsers(); // Refresh user list
        } else {
          setResultData({
            type: "error",
            title: "Import Failed!",
            message: data.message + (data.details ? `\n\nErrors: ${data.details.join(', ')}` : '')
          });
        }
        setShowResultModal(true);
      })
      .catch((err) => {
        console.error("Error importing database:", err);
        setResultData({
          type: "error",
          title: "Import Error!",
          message: "An error occurred while importing the database. Please try again."
        });
        setShowResultModal(true);
      })
      .finally(() => {
        setIsImporting(false);
        setShowImportModal(false);
        setImportFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };

  // Activate accounts handler
  const handleActivateAccounts = () => {
    const professorAndStudentUsers = users.filter(user => 
      user.user_Role === 'Professor' || user.user_Role === 'Student'
    );
    
    if (professorAndStudentUsers.length === 0) {
      setResultData({
        type: "error",
        title: "No Users Found!",
        message: "There are no Professor or Student accounts to activate. Please import data first."
      });
      setShowResultModal(true);
      return;
    }
    setShowActivateModal(true);
  };

  // Confirm account activation
  const confirmActivateAccounts = () => {
    setIsActivating(true);
    
    fetch("https://tracked.6minds.site/Admin/AdminImportDB/activate_accounts.php", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    })
      .then(async (res) => {
        const text = await res.text();
        console.log("Raw response:", text);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error("JSON parse error:", e);
          throw new Error("Invalid JSON response from server");
        }
      })
      .then((data) => {
        console.log("Parsed data:", data);
        if (data.status === "success") {
          setResultData({
            type: "success",
            title: "Success!",
            message: data.message || "Accounts activated successfully!"
          });
          fetchUsers(); // Refresh user list
        } else {
          setResultData({
            type: "error",
            title: "Activation Failed!",
            message: data.message || "Unknown error occurred"
          });
        }
        setShowResultModal(true);
      })
      .catch((err) => {
        console.error("Error activating accounts:", err);
        setResultData({
          type: "error",
          title: "Activation Error!",
          message: `An error occurred while activating accounts: ${err.message}. Please check server logs and try again.`
        });
        setShowResultModal(true);
      })
      .finally(() => {
        setIsActivating(false);
        setShowActivateModal(false);
      });
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const professorAndStudentUsers = users.filter(user => 
    user.user_Role === 'Professor' || user.user_Role === 'Student'
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Get modal icon based on result type
  const getModalIcon = () => {
    switch (resultData.type) {
      case "success":
        return SuccessIcon;
      case "error":
        return ErrorIcon;
      default:
        return ArchiveWarningIcon;
    }
  };

  const getModalIconColor = () => {
    switch (resultData.type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      default:
        return "bg-yellow-100";
    }
  };

  const getConfirmButtonColor = () => {
    switch (resultData.type) {
      case "success":
        return "bg-[#00A15D] hover:bg-[#00874E]";
      case "error":
        return "bg-[#FF6666] hover:bg-[#FF5555]";
      default:
        return "bg-[#00A15D] hover:bg-[#00874E]";
    }
  };

  // Lottie animation config
  const defaultLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <div>
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${
        isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"
      }`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".sql,application/sql,text/sql"
          className="hidden"
        />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={Import}
                alt="Import"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Import
              </h1>
            </div>
            <div className="text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>Import Databases for TrackED</span>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Control Buttons Section */}
          <div className="flex flex-col sm:flex-row text-[#465746] gap-3 sm:gap-4 sm:justify-between sm:items-center">
            {/* Filter, Import, and Activate Buttons */}
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
                    {["Professor", "Student"].map((f) => (
                      <button
                        key={f}
                        className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                        onClick={() => setOpen(false)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Import Database Button */}
              <button 
                onClick={handleImportDatabase}
                className="font-bold px-3 sm:px-4 py-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] text-xs sm:text-sm lg:text-base whitespace-nowrap transition-all duration-200 cursor-pointer"
              >
                Import Database
              </button>

              {/* Activate Accounts Button */}
              <button
                onClick={handleActivateAccounts}
                disabled={professorAndStudentUsers.length === 0 || isActivating}
                className={`font-bold text-white px-3 sm:px-4 py-2 rounded-md shadow-md border-2 border-transparent text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer ${
                  professorAndStudentUsers.length === 0 || isActivating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#00A15D] hover:bg-[#00874E]"
                }`}
              >
                {isActivating ? "Activating..." : "Activate Accounts"}
              </button>
            </div>

            {/* Search Bar */}
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

          {/* Users Table/Cards Section */}
          <div className="mt-4 sm:mt-5">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col justify-center items-center py-12">
                <div className="w-24 h-24 mb-4">
                  <Lottie 
                    {...defaultLottieOptions}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <p className="text-[#465746] text-lg font-medium">Loading users...</p>
              </div>
            )}

            {/* Desktop Table */}
            {!isLoading && (
              <>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3 text-xs sm:text-sm lg:text-base">
                    <thead>
                      <tr className="text-[#465746] font-bold">
                        <th className="py-2 px-2 sm:px-3">ID No.</th>
                        <th className="py-2 px-2 sm:px-3">Full Name</th>
                        <th className="py-2 px-2 sm:px-3">Email</th>
                        <th className="py-2 px-2 sm:px-3">Role</th>
                        <th className="py-2 px-2 sm:px-3">Gender</th>
                        <th className="py-2 px-2 sm:px-3">Year & Section</th>
                      </tr>
                    </thead>

                    <tbody className="text-[#465746]">
                      {currentUsers.length > 0 ? (
                        currentUsers.map((user, index) => (
                          <tr
                            key={index}
                            className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="py-3 px-2 sm:px-3 rounded-l-lg">{user.user_ID}</td>
                            <td className="py-3 px-2 sm:px-3">{user.user_firstname} {user.user_middlename} {user.user_lastname}</td>
                            <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">
                              {user.user_Email}
                            </td>
                            <td className="py-3 px-2 sm:px-3">{user.user_Role}</td>
                            <td className="py-3 px-2 sm:px-3">{user.user_Gender}</td>
                            <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                              {user.user_yearandsection}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-gray-500">
                            No users found. Please import data first.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Cards */}
                <div className="lg:hidden space-y-3">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <div key={index} className="bg-white rounded-lg shadow p-4 text-[#465746]">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">ID No.</p>
                            <p className="font-semibold text-sm">{user.user_ID}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Role</p>
                            <p className="font-semibold text-sm">{user.user_Role}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Full Name</p>
                            <p className="font-medium text-sm">{user.user_firstname} {user.user_middlename} {user.user_lastname}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm break-all">{user.user_Email}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-gray-500">Gender</p>
                              <p className="text-sm">{user.user_Gender}</p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-500">Year & Section</p>
                              <p className="text-sm">{user.user_yearandsection}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No users found. Please import data first.
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap justify-center mt-5 sm:mt-6 gap-2">
                    {/* Previous Button */}
                    {currentPage > 1 && (
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-md bg-white text-[#465746] hover:bg-gray-100 font-medium text-xs sm:text-sm transition-colors duration-200 cursor-pointer"
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
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-md bg-white text-[#465746] hover:bg-gray-100 font-medium text-xs sm:text-sm transition-colors duration-200 cursor-pointer"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {showPopup && <Popup setOpen={setShowPopup} />}
          </div>
        </div>
      </div>

      {/* Import Database Modal */}
      {showImportModal && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isImporting) {
              setShowImportModal(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              {/* Import Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <img 
                  src={Import} 
                  alt="Import" 
                  className="h-8 w-8" 
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Import Database
              </h3>
              
              <div className="mt-4 mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Select an SQL file to import into the database. This will replace existing data with matching primary keys.
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
                  {importFile ? (
                    <div className="text-center">
                      <p className="text-green-600 font-semibold">✓ File Selected</p>
                      <p className="text-sm text-gray-600 mt-1">{importFile.name}</p>
                      <p className="text-xs text-gray-500">{(importFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-500">No file selected</p>
                      <p className="text-xs text-gray-400 mt-1">Click below to choose an SQL file</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={triggerFileInput}
                  disabled={isImporting}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer border-2 border-dashed border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Choose SQL File
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isImporting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmImportDatabase}
                  className="flex-1 bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={!importFile || isImporting}
                >
                  {isImporting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 mr-2">
                        <Lottie 
                          {...defaultLottieOptions}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                      Importing...
                    </div>
                  ) : (
                    "Import Database"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activate Accounts Confirmation Modal */}
      {showActivateModal && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isActivating) {
              setShowActivateModal(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <img 
                  src={ArchiveWarningIcon} 
                  alt="Warning" 
                  className="h-8 w-8" 
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Activate Accounts?
              </h3>
              
              <div className="mt-4 mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  Are you sure you want to activate all imported Professor and Student accounts?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    This will affect {professorAndStudentUsers.length} user accounts
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    • Students: {professorAndStudentUsers.filter(user => user.user_Role === 'Student').length}
                  </p>
                  <p className="text-sm text-gray-600">
                    • Professors: {professorAndStudentUsers.filter(user => user.user_Role === 'Professor').length}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowActivateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isActivating}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmActivateAccounts}
                  className="flex-1 bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isActivating}
                >
                  {isActivating ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 mr-2">
                        <Lottie 
                          {...defaultLottieOptions}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                      Activating...
                    </div>
                  ) : (
                    "Activate Accounts"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal for Success/Error Messages */}
      {showResultModal && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowResultModal(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              {/* Dynamic Icon */}
              <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${getModalIconColor()} mb-4`}>
                <img 
                  src={getModalIcon()} 
                  alt={resultData.type} 
                  className="h-8 w-8" 
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {resultData.title}
              </h3>
              
              <div className="mt-4 mb-6">
                <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">
                  {resultData.message}
                </p>
                {resultData.type === "success" && (
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {resultData.title.includes("Import") ? "Database imported successfully!" : "Accounts activated successfully"}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      • Total users processed: {professorAndStudentUsers.length}
                    </p>
                  </div>
                )}
                {resultData.type === "error" && (
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      Operation failed
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      • Please check if the server is running
                    </p>
                    <p className="text-sm text-gray-600">
                      • Verify the database connection
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowResultModal(false)}
                  className={`flex-1 ${getConfirmButtonColor()} text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}