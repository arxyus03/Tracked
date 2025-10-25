import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ArchiveIcon from "../../assets/Archive(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";
import Book from "../../assets/ClassManagementSubject(Light).svg";
import DeleteIcon from "../../assets/Delete.svg";
import UnarchiveIcon from "../../assets/Unarchive.svg";

export default function ArchiveClass() {
  const [isOpen, setIsOpen] = useState(false);
  const [archivedClasses, setArchivedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [classToUnarchive, setClassToUnarchive] = useState(null);

  // background colors (same as ClassManagement.jsx)
  const bgOptions = [
    "#874040",
    "#4951AA", 
    "#00874E",
    "#374151",
    "#1E3A8A",
  ];

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

  const fetchArchivedClasses = async () => {
    try {
      setLoading(true);
      const professorId = getProfessorId();
      
      if (!professorId) {
        console.error('No professor ID found. User may not be logged in.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost/TrackEd/src/Pages/Professor/ArchiveClassDB/get_archived_classes.php?professor_ID=${professorId}`);
      
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
      
      const response = await fetch('http://localhost/TrackEd/src/Pages/Professor/ArchiveClassDB/unarchive_class.php', {
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
      
      const response = await fetch('http://localhost/TrackEd/src/Pages/Professor/ArchiveClassDB/delete_class.php', {
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
          <p className="mt-3 text-gray-600">Loading archived classes...</p>
        </div>
      );
    }

    if (archivedClasses.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <img src={ArchiveIcon} alt="No archived classes" className="h-8 w-8 opacity-50" />
          </div>
          <p className="text-gray-500 text-sm sm:text-base">
            No archived classes found.
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            Classes you archive will appear here.
          </p>
        </div>
      );
    }

    return archivedClasses.map((classItem) => (
      <div
        key={classItem.subject_code}
        className="text-white rounded-lg p-4 sm:p-5 lg:p-6 space-y-3 border-2 border-transparent hover:border-[#351111] hover:shadow-lg transition-all duration-200"
        style={{ backgroundColor: classItem.bgColor }}
      >
        {/* Header with Section and Buttons */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center min-w-0 flex-1">
            <img
              src={Book}
              alt="Subject"
              className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mr-2"
            />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm opacity-90">Section:</p>
              <p className="text-sm sm:text-base lg:text-lg font-bold truncate">
                {classItem.section}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={(e) => handleDelete(classItem, e)}
              className="bg-white rounded-md w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 shadow-md flex items-center justify-center border-2 border-transparent hover:border-red-500 hover:scale-105 transition-all duration-200 cursor-pointer"
              title="Delete permanently"
            >
              <img 
                src={DeleteIcon} 
                alt="Delete class" 
                className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6" 
              />
            </button>

            <button
              onClick={(e) => handleUnarchive(classItem, e)}
              className="bg-white rounded-md w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 shadow-md flex items-center justify-center border-2 border-transparent hover:border-[#00874E] hover:scale-105 transition-all duration-200 cursor-pointer"
              title="Restore class"
            >
              <img 
                src={UnarchiveIcon} 
                alt="Unarchive class" 
                className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6" 
              />
            </button>
          </div>
        </div>

        {/* Subject Details */}
        <div className="space-y-2 pt-2 border-t border-white/20">
          <div>
            <p className="text-xs sm:text-sm opacity-90 mb-0.5">Subject:</p>
            <p className="text-sm sm:text-base lg:text-lg font-semibold break-words line-clamp-2">
              {classItem.subject}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm lg:text-base">
            <div>
              <span className="opacity-90">Year Level: </span>
              <span className="font-semibold">{classItem.year_level}</span>
            </div>
            <div>
              <span className="opacity-90">Code: </span>
              <span className="font-semibold">{classItem.subject_code}</span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <img
                  src={ArchiveIcon}
                  alt=""
                  className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
                />
                <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                  Archives
                </h1>
              </div>
              
              {/* Mobile Back Button */}
              <Link to="/ClassManagement" className="sm:hidden">
                <button 
                  className="flex items-center justify-center w-9 h-9 cursor-pointer transition-all duration-200 hover:scale-110"
                  aria-label="Back to Classes"
                >
                  <img
                    src={BackButton}
                    alt="Back"
                    className="h-6 w-6"
                  />
                </button>
              </Link>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]/80 ml-9 sm:ml-10">
              Classes you've archived
            </p>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

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
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              {/* Info Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <img 
                  src={UnarchiveIcon} 
                  alt="Restore" 
                  className="h-8 w-8"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Restore Class?
              </h3>
              
              <div className="mt-4 mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  Are you sure you want to restore this class?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {classToUnarchive.subject}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Section: {classToUnarchive.section}
                  </p>
                  <p className="text-sm text-gray-600">
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
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
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
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <img 
                  src={DeleteIcon} 
                  alt="Delete" 
                  className="h-8 w-8"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Delete Class?
              </h3>
              
              <div className="mt-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">
                  Are you sure you want to permanently delete this class?
                </p>
                <p className="text-sm font-semibold text-red-600 mb-3">
                  This action cannot be undone.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {classToDelete.subject}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Section: {classToDelete.section}
                  </p>
                  <p className="text-sm text-gray-600">
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
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
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