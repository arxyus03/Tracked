import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Subject from '../../assets/ArchiveClass.svg';
import ArchiveRow from "../../assets/Unarchive.svg";
import DeleteIcon from "../../assets/Delete.svg";
import BackButton from '../../assets/BackButton.svg';
import SuccessIcon from '../../assets/Success(Green).svg';
import ErrorIcon from '../../assets/Error(Red).svg';

export default function ArchivedClasses() {
  const [isOpen, setIsOpen] = useState(true);
  const [userName] = useState("Student");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [classToUnarchive, setClassToUnarchive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [archivedClasses, setArchivedClasses] = useState([]);
  
  // Popup states
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  // Get student ID from localStorage
  const getStudentId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    return null;
  };

  useEffect(() => {
    fetchArchivedClasses();
  }, []);

  const fetchArchivedClasses = async () => {
    try {
      setLoading(true);
      const studentId = getStudentId();
      
      if (studentId) {
        const response = await fetch(`https://tracked.6minds.site/Student/ArchiveClassStudentDB/get_archived_student_classes.php?student_id=${studentId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            setArchivedClasses(data.classes);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching archived classes:", error);
      setPopupMessage('Error loading archived classes');
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete permanently
  const handleDelete = (classItem, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setClassToDelete(classItem);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;

    try {
      const studentId = getStudentId();
      
      const response = await fetch('https://tracked.6minds.site/Student/ArchiveClassStudentDB/delete_student_class.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          subject_code: classToDelete.subject_code
        })
      });

      const data = await response.json();

      if (data.success) {
        setArchivedClasses((prev) => prev.filter((cls) => cls.subject_code !== classToDelete.subject_code));
        setShowDeleteModal(false);
        setClassToDelete(null);
        setPopupMessage('Class permanently deleted');
        setShowSuccessPopup(true);
      } else {
        setPopupMessage(data.message || 'Failed to delete class');
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      setPopupMessage('Error deleting class. Please try again.');
      setShowErrorPopup(true);
    }
  };

  // Handle unarchive/restore
  const handleUnarchive = (classItem, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setClassToUnarchive(classItem);
    setShowUnarchiveModal(true);
  };

  const confirmUnarchive = async () => {
    if (!classToUnarchive) return;

    try {
      const studentId = getStudentId();
      
      const response = await fetch('https://tracked.6minds.site/Student/ArchiveClassStudentDB/unarchive_student_class.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          subject_code: classToUnarchive.subject_code
        })
      });

      const data = await response.json();

      if (data.success) {
        setArchivedClasses((prev) => prev.filter((cls) => cls.subject_code !== classToUnarchive.subject_code));
        setShowUnarchiveModal(false);
        setClassToUnarchive(null);
        setPopupMessage('Class restored successfully');
        setShowSuccessPopup(true);
      } else {
        setPopupMessage(data.message || 'Failed to restore class');
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Error restoring class:', error);
      setPopupMessage('Error restoring class. Please try again.');
      setShowErrorPopup(true);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Function to render archived class cards
  const renderArchivedClassCards = () => {
    if (loading) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#767EE0] border-r-transparent"></div>
          <p className="mt-3 text-[#FFFFFF]/80">Loading archived classes...</p>
        </div>
      );
    }

    if (archivedClasses.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-[#15151C] flex items-center justify-center">
            <img 
              src={Subject} 
              alt="No archived classes" 
              className="h-8 w-8 opacity-50"
            />
          </div>
          <p className="text-[#FFFFFF]/60 text-sm">
            No archived classes found.
          </p>
          <p className="text-[#FFFFFF]/40 text-xs mt-2">
            Classes you archive will appear here.
          </p>
        </div>
      );
    }

    return archivedClasses.map((cls) => (
      <div
        key={cls.subject_code}
        className="text-[#FFFFFF] bg-[#15151C] rounded-md p-3 shadow-md space-y-2 border border-[#FFFFFF]/10 hover:border-[#767EE0] transition-all duration-200"
      >
        {/* Header with Code & Title */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">
              {cls.subject_code}: {cls.subject}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={(e) => handleDelete(cls, e)}
              className="bg-[#A15353] rounded-md w-8 h-8 shadow-md flex items-center justify-center border-2 border-transparent hover:border-[#FFFFFF] hover:scale-105 transition-all duration-200 cursor-pointer"
              title="Delete permanently"
            >
              <img 
                src={DeleteIcon} 
                alt="Delete" 
                className="h-4 w-4" 
              />
            </button>

            <button
              onClick={(e) => handleUnarchive(cls, e)}
              className="bg-[#00A15D] rounded-md w-8 h-8 shadow-md flex items-center justify-center border-2 border-transparent hover:border-[#FFFFFF] hover:scale-105 transition-all duration-200 cursor-pointer"
              title="Restore class"
            >
              <img 
                src={ArchiveRow} 
                alt="Restore" 
                className="h-4 w-4" 
              />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-1.5 pt-2 border-t border-[#FFFFFF]/20">
          <div className="text-xs">
            <span className="font-semibold text-[#FFFFFF]/80">Section:</span>
            <span className="ml-2 text-[#FFFFFF]">{cls.section}</span>
          </div>
          <div className="text-xs">
            <span className="font-semibold text-[#FFFFFF]/80">Year Level:</span>
            <span className="ml-2 text-[#FFFFFF]">{cls.year_level}</span>
          </div>
          {cls.archived_at && (
            <div className="text-xs text-[#FFFFFF]/60">
              <span className="font-semibold">Archived on:</span>
              <span className="ml-2">{formatDate(cls.archived_at)}</span>
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />

        {/* Page Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-6 text-[#FFFFFF]">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <img
                  src={Subject}
                  alt="Subjects"
                  className="h-6 w-6 sm:h-7 sm:w-7 mr-2"
                />
                <h1 className="font-bold text-xl lg:text-2xl">
                  Archived Classes
                </h1>
              </div>

              {/* Mobile Back Button */}
              <Link to="/Subjects">
                <button 
                  className="flex items-center justify-center w-8 h-8 cursor-pointer transition-all duration-200 hover:scale-110"
                  aria-label="Back to Subjects"
                >
                  <img
                    src={BackButton}
                    alt="Back"
                    className="h-5 w-5"
                  />
                </button>
              </Link>
            </div>
            <div className="text-sm text-[#FFFFFF]/80">
              <span>List of archived classes</span>
            </div>
          </div>

          <hr className="border-[#FFFFFF]/30 mb-4" />

          {/* Archived Classes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
          <div className="bg-[#15151C] text-[#FFFFFF] rounded-md shadow-2xl w-full max-w-sm p-6 relative modal-pop border border-[#FFFFFF]/10">
            <div className="text-center">
              {/* Info Icon */}
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-[#00A15D]/20 mb-4">
                <img 
                  src={ArchiveRow} 
                  alt="Restore" 
                  className="h-6 w-6"
                />
              </div>

              <h3 className="text-lg font-bold text-[#FFFFFF] mb-2">
                Restore Class?
              </h3>
              
              <div className="mt-3 mb-5">
                <p className="text-sm text-[#FFFFFF]/80 mb-3">
                  Are you sure you want to restore this class?
                </p>
                <div className="bg-[#23232C] rounded-md p-3 text-left border border-[#FFFFFF]/10">
                  <p className="text-sm font-semibold text-[#FFFFFF] break-words">
                    {classToUnarchive.subject_code}: {classToUnarchive.subject}
                  </p>
                  <p className="text-xs text-[#FFFFFF]/60 mt-1">
                    Section: {classToUnarchive.section}
                  </p>
                  <p className="text-xs text-[#FFFFFF]/60">
                    Year Level: {classToUnarchive.year_level}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUnarchiveModal(false);
                    setClassToUnarchive(null);
                  }}
                  className="flex-1 bg-[#23232C] hover:bg-[#2a2a35] text-[#FFFFFF] font-medium py-2.5 rounded-md transition-all duration-200 cursor-pointer border border-[#FFFFFF]/20"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUnarchive}
                  className="flex-1 bg-[#00A15D] hover:bg-[#00874E] text-white font-medium py-2.5 rounded-md transition-all duration-200 cursor-pointer"
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
          <div className="bg-[#15151C] text-[#FFFFFF] rounded-md shadow-2xl w-full max-w-sm p-6 relative modal-pop border border-[#FFFFFF]/10">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-[#A15353]/20 mb-4">
                <img 
                  src={DeleteIcon} 
                  alt="Delete" 
                  className="h-6 w-6"
                />
              </div>

              <h3 className="text-lg font-bold text-[#FFFFFF] mb-2">
                Delete Class?
              </h3>
              
              <div className="mt-3 mb-5">
                <p className="text-sm text-[#FFFFFF]/80 mb-1">
                  Are you sure you want to permanently delete this class?
                </p>
                <p className="text-sm font-semibold text-[#A15353] mb-3">
                  This action cannot be undone.
                </p>
                <div className="bg-[#23232C] rounded-md p-3 text-left border border-[#FFFFFF]/10">
                  <p className="text-sm font-semibold text-[#FFFFFF] break-words">
                    {classToDelete.subject_code}: {classToDelete.subject}
                  </p>
                  <p className="text-xs text-[#FFFFFF]/60 mt-1">
                    Section: {classToDelete.section}
                  </p>
                  <p className="text-xs text-[#FFFFFF]/60">
                    Year Level: {classToDelete.year_level}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setClassToDelete(null);
                  }}
                  className="flex-1 bg-[#23232C] hover:bg-[#2a2a35] text-[#FFFFFF] font-medium py-2.5 rounded-md transition-all duration-200 cursor-pointer border border-[#FFFFFF]/20"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-[#A15353] hover:bg-[#8a4242] text-white font-medium py-2.5 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={() => setShowSuccessPopup(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#15151C] text-[#FFFFFF] rounded-md shadow-2xl w-full max-w-sm p-6 relative modal-pop border border-[#FFFFFF]/10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-[#00A15D]/20 mb-4">
                <img 
                  src={SuccessIcon} 
                  alt="Success" 
                  className="h-6 w-6"
                />
              </div>
              <p className="text-sm text-[#FFFFFF]/80 mb-5">{popupMessage}</p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full bg-[#00A15D] hover:bg-[#00874E] text-white font-medium py-2.5 rounded-md transition-all duration-200 cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={() => setShowErrorPopup(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#15151C] text-[#FFFFFF] rounded-md shadow-2xl w-full max-w-sm p-6 relative modal-pop border border-[#FFFFFF]/10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-[#A15353]/20 mb-4">
                <img 
                  src={ErrorIcon} 
                  alt="Error" 
                  className="h-6 w-6"
                />
              </div>
              <p className="text-sm text-[#FFFFFF]/80 mb-5">{popupMessage}</p>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="w-full bg-[#A15353] hover:bg-[#8a4242] text-white font-medium py-2.5 rounded-md transition-all duration-200 cursor-pointer"
              >
                OK
              </button>
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