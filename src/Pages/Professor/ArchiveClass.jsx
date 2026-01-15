import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ArchiveIcon from "../../assets/Archive.svg";
import BackButton from "../../assets/BackButton.svg";
import Book from "../../assets/ClassManagementSubject(Light).svg";
import DeleteIcon from "../../assets/Delete.svg";
import UnarchiveIcon from "../../assets/Unarchive.svg";

export default function ArchiveClass() {
  const [isOpen, setIsOpen] = useState(true);
  const [archivedClasses, setArchivedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [classToUnarchive, setClassToUnarchive] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // Added theme state

  // Updated background colors to match student page
  const bgOptions = [
    "#1E40AF", // Blue
    "#065F46", // Green
    "#5B21B6", // Purple
    "#991B1B", // Red
    "#9A3412", // Orange
    "#0C4A6E", // Cyan
    "#4C1D95", // Purple
    "#134E4A", // Teal
    "#831843", // Pink
    "#3730A3", // Indigo
  ];

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Check initial theme
    handleThemeChange();
    
    // Listen for theme changes
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  // Theme-based colors
  const getBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getCardBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getModalBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getInputBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getBorderColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/20" : "border-gray-200";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-white" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-white/80" : "text-gray-600";
  };

  const getLightTextColor = () => {
    return isDarkMode ? "text-white/40" : "text-gray-400";
  };

  // GET LOGGED-IN USER ID
  const getProfessorId = () => {
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        return userData.id;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return null;
  };

  // Load archived classes from database on component mount
  useEffect(() => {
    fetchArchivedClasses();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchArchivedClasses = async () => {
    try {
      setLoading(true);
      const professorId = getProfessorId();
      
      if (!professorId) {
        console.error('No professor ID found. User may not be logged in.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`https://tracked.6minds.site/Professor/ArchiveClassDB/get_archived_classes.php?professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const classesWithColors = result.classes.map((classItem, index) => ({
            ...classItem,
            bgColor: bgOptions[index % bgOptions.length]
          }));
          setArchivedClasses(classesWithColors);
        } else {
          console.error('Error fetching archived classes:', result.message);
        }
      } else {
        throw new Error('Failed to fetch archived classes');
      }
    } catch (error) {
      console.error('Error fetching archived classes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle unarchive
  const handleUnarchive = async (classItem, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setClassToUnarchive(classItem);
    setShowUnarchiveModal(true);
  };

  const confirmUnarchive = async () => {
    if (!classToUnarchive) return;

    try {
      const professorId = getProfessorId();
      
      const response = await fetch('https://tracked.6minds.site/Professor/ArchiveClassDB/unarchive_class.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_code: classToUnarchive.subject_code,
          professor_ID: professorId
        })
      });

      const result = await response.json();

      if (result.success) {
        setArchivedClasses(prevClasses => 
          prevClasses.filter(c => c.subject_code !== classToUnarchive.subject_code)
        );
        setShowUnarchiveModal(false);
        setClassToUnarchive(null);
      } else {
        alert('Error unarchiving class: ' + result.message);
        setShowUnarchiveModal(false);
      }
    } catch (error) {
      console.error('Error unarchiving class:', error);
      alert('Error unarchiving class. Please try again.');
      setShowUnarchiveModal(false);
    }
  };

  // Handle delete
  const handleDelete = async (classItem, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setClassToDelete(classItem);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;

    try {
      const professorId = getProfessorId();
      
      const response = await fetch('https://tracked.6minds.site/Professor/ArchiveClassDB/delete_class.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_code: classToDelete.subject_code,
          professor_ID: professorId
        })
      });

      const result = await response.json();

      if (result.success) {
        setArchivedClasses(prevClasses => 
          prevClasses.filter(c => c.subject_code !== classToDelete.subject_code)
        );
        setShowDeleteModal(false);
        setClassToDelete(null);
      } else {
        alert('Error deleting class: ' + result.message);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Error deleting class. Please try again.');
      setShowDeleteModal(false);
    }
  };

  // Function to render archived class cards
  const renderArchivedClassCards = () => {
    if (loading) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00A15D] border-r-transparent"></div>
          <p className={`mt-3 ${getSecondaryTextColor()}`}>Loading archived classes...</p>
        </div>
      );
    }

    if (archivedClasses.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className={`mx-auto w-16 h-16 mb-4 rounded-full ${getCardBackgroundColor()} flex items-center justify-center`}>
            <img 
              src={ArchiveIcon} 
              alt="No archived classes" 
              className="h-8 w-8 opacity-50"
              style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'invert(0.5)' }}
            />
          </div>
          <p className={`${getSecondaryTextColor()} text-sm sm:text-base`}>
            No archived classes found.
          </p>
          <p className={`${getLightTextColor()} text-xs sm:text-sm mt-2`}>
            Classes you archive will appear here.
          </p>
        </div>
      );
    }

    return archivedClasses.map((classItem) => (
      <div
        key={classItem.subject_code}
        className="text-white rounded-lg p-4.5 space-y-3 border-2 border-transparent hover:border-[#00A15D] hover:shadow-md transition-all duration-200 h-full"
        style={{ backgroundColor: classItem.bgColor }}
      >
        {/* Header with Section and Buttons */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center min-w-0 flex-1">
            <img
              src={Book}
              alt="Subject"
              className="h-5 w-5 flex-shrink-0 mr-2"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <div className="min-w-0">
              <p className="text-xs opacity-70">Section:</p>
              <p className="text-sm font-bold truncate">
                {classItem.section}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={(e) => handleDelete(classItem, e)}
              className={`${isDarkMode ? 'bg-[#23232C]' : 'bg-white/20'} rounded-md w-8 h-8 shadow-sm flex items-center justify-center border-2 border-transparent hover:border-[#A15353] hover:scale-105 transition-all duration-200 cursor-pointer`}
              title="Delete permanently"
            >
              <img 
                src={DeleteIcon} 
                alt="Delete class" 
                className="h-4 w-4"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </button>

            <button
              onClick={(e) => handleUnarchive(classItem, e)}
              className={`${isDarkMode ? 'bg-[#23232C]' : 'bg-white/20'} rounded-md w-8 h-8 shadow-sm flex items-center justify-center border-2 border-transparent hover:border-[#00A15D] hover:scale-105 transition-all duration-200 cursor-pointer`}
              title="Restore class"
            >
              <img 
                src={UnarchiveIcon} 
                alt="Unarchive class" 
                className="h-4 w-4"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </button>
          </div>
        </div>

        {/* Subject Details */}
        <div className="space-y-1.5 pt-2.5 border-t border-white/20">
          <div>
            <p className="text-xs opacity-70 mb-0.5">Subject:</p>
            <p className="text-sm font-semibold break-words line-clamp-2">
              {classItem.subject}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <div>
              <span className="opacity-70">Code: </span>
              <span className="font-semibold">{classItem.subject_code}</span>
            </div>
            <div>
              <span className="opacity-70">Year Level: </span>
              <span className="font-semibold">{classItem.year_level}</span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className={`${getBackgroundColor()} min-h-screen`}>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen}/>

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* Page Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <img
                  src={ArchiveIcon}
                  alt="Archive"
                  className="h-6 w-6 sm:h-7 sm:w-7 mr-2"
                  style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'invert(0.5)' }}
                />
                <h1 className={`font-bold text-xl lg:text-2xl ${getTextColor()}`}>
                  Archives
                </h1>
              </div>
              
              {/* Back Button */}
              <Link to="/ClassManagement">
                <button 
                  className="flex items-center justify-center w-8 h-8 cursor-pointer transition-all duration-200 hover:opacity-70"
                  aria-label="Back to Classes"
                >
                  <img
                    src={BackButton}
                    alt="Back"
                    className="h-5 w-5"
                    style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'invert(0.5)' }}
                  />
                </button>
              </Link>
            </div>
            <p className={`text-sm lg:text-base ${getSecondaryTextColor()}`}>
              Classes you've archived
            </p>
          </div>

          <hr className={`${getBorderColor()} mb-4`} />

          {/* Archived Classes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {renderArchivedClassCards()}
          </div>
        </div>
      </div>

      {/* Unarchive Confirmation Modal */}
      {showUnarchiveModal && classToUnarchive && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUnarchiveModal(false);
              setClassToUnarchive(null);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className={`${getModalBackgroundColor()} ${getTextColor()} rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop`}>
            <div className="text-center">
              {/* Info Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#00A15D]/20 mb-4">
                <img 
                  src={UnarchiveIcon} 
                  alt="Restore" 
                  className="h-8 w-8"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Restore Class?
              </h3>
              
              <div className="mt-4 mb-6">
                <p className={`text-sm ${getSecondaryTextColor()} mb-3`}>
                  Are you sure you want to restore this class?
                </p>
                <div className={`${getInputBackgroundColor()} rounded-lg p-4 text-left`}>
                  <p className={`text-base sm:text-lg font-semibold break-words ${getTextColor()}`}>
                    {classToUnarchive.subject}
                  </p>
                  <p className={`text-sm ${getSecondaryTextColor()} mt-1`}>
                    Section: {classToUnarchive.section}
                  </p>
                  <p className={`text-sm ${getSecondaryTextColor()}`}>
                    Code: {classToUnarchive.subject_code}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowUnarchiveModal(false);
                    setClassToUnarchive(null);
                  }}
                  className={`flex-1 ${getInputBackgroundColor()} hover:${isDarkMode ? 'bg-[#2A2A35]' : 'bg-gray-100'} font-bold py-3 rounded-md transition-all duration-200 cursor-pointer ${getTextColor()}`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUnarchive}
                  className="flex-1 bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && classToDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
              setClassToDelete(null);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className={`${getModalBackgroundColor()} ${getTextColor()} rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop`}>
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#A15353]/20 mb-4">
                <img 
                  src={DeleteIcon} 
                  alt="Delete" 
                  className="h-8 w-8"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Delete Class?
              </h3>
              
              <div className="mt-4 mb-6">
                <p className={`text-sm ${getSecondaryTextColor()} mb-1`}>
                  Are you sure you want to permanently delete this class?
                </p>
                <p className="text-sm font-semibold text-[#A15353] mb-3">
                  This action cannot be undone.
                </p>
                <div className={`${getInputBackgroundColor()} rounded-lg p-4 text-left`}>
                  <p className={`text-base sm:text-lg font-semibold break-words ${getTextColor()}`}>
                    {classToDelete.subject}
                  </p>
                  <p className={`text-sm ${getSecondaryTextColor()} mt-1`}>
                    Section: {classToDelete.section}
                  </p>
                  <p className={`text-sm ${getSecondaryTextColor()}`}>
                    Code: {classToDelete.subject_code}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setClassToDelete(null);
                  }}
                  className={`flex-1 ${getInputBackgroundColor()} hover:${isDarkMode ? 'bg-[#2A2A35]' : 'bg-gray-100'} font-bold py-3 rounded-md transition-all duration-200 cursor-pointer ${getTextColor()}`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-[#A15353] hover:bg-[#8A4545] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
  );
}