import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Subject from '../../assets/Subjects(Light).svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import Add from "../../assets/Add(Light).svg";
import AddIcon from "../../assets/AddIcon.svg";
import Archive from "../../assets/Archive(Light).svg";
import ArchiveRow from "../../assets/ArchiveRow(Light).svg";
import Palette from "../../assets/Palette(Light).svg";
import BackButton from '../../assets/BackButton(Light).svg';
import Book from '../../assets/ClassManagementSubject(Light).svg';
import ArchiveWarningIcon from "../../assets/Warning(Yellow).svg";
import SuccessIcon from '../../assets/Success(Green).svg';
import ErrorIcon from '../../assets/Error(Red).svg';

export default function Subjects() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName] = useState("Student");

  // background colors (matching student theme)
  const bgOptions = [
    "#E8F5E9", // Light Green
    "#FFF3E0", // Light Orange
    "#E3F2FD", // Light Blue
    "#F3E5F5", // Light Purple
    "#FFF9C4", // Light Yellow
  ];

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // join class modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  // archive modal states
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [classToArchive, setClassToArchive] = useState(null);

  // popup states
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
    fetchStudentClasses();
  }, []);

  const fetchStudentClasses = async () => {
    try {
      setLoading(true);
      const studentId = getStudentId();
      
      if (studentId) {
        const response = await fetch(`https://tracked.6minds.site/Student/SubjectsDB/get_student_classes.php?student_id=${studentId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            const classesWithColors = data.classes.map((cls, index) => ({
              ...cls,
              bgColor: bgOptions[index % bgOptions.length]
            }));
            setClasses(classesWithColors);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching student classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const openJoinModal = () => {
    setClassCode("");
    setShowJoinModal(true);
  };

  const closeJoinModal = () => setShowJoinModal(false);

  const handleJoin = async () => {
    if (!classCode.trim()) {
      setPopupMessage('Please enter a class code');
      setShowErrorPopup(true);
      return;
    }

    setJoinLoading(true);
    try {
      const studentId = getStudentId();
      
      const response = await fetch('https://tracked.6minds.site/Student/SubjectsDB/join_class.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          subject_code: classCode.trim().toUpperCase()
        })
      });

      const data = await response.json();

      if (data.success) {
        setPopupMessage('Successfully joined class!');
        setShowSuccessPopup(true);
        setShowJoinModal(false);
        fetchStudentClasses(); // Refresh the class list
      } else {
        setPopupMessage(data.message || 'Failed to join class');
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Error joining class:', error);
      setPopupMessage('Error joining class. Please try again.');
      setShowErrorPopup(true);
    } finally {
      setJoinLoading(false);
    }
  };

  // Handle Enter key press in modal input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  // Handle palette click to cycle through colors
  const handlePaletteClick = (e, subjectCode) => {
    e.preventDefault();
    e.stopPropagation();
    
    setClasses(prevClasses => {
      return prevClasses.map(cls => {
        if (cls.subject_code === subjectCode) {
          const currentIndex = bgOptions.indexOf(cls.bgColor);
          const nextIndex = (currentIndex + 1) % bgOptions.length;
          return { ...cls, bgColor: bgOptions[nextIndex] };
        }
        return cls;
      });
    });
  };

  // Handle archive - opens confirmation modal
  const handleArchive = (e, classItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    setClassToArchive(classItem);
    setShowArchiveModal(true);
  };

  // Confirm archive action
  const confirmArchive = async () => {
      if (!classToArchive) return;

      try {
          const studentId = getStudentId();
          
          const response = await fetch('https://tracked.6minds.site/Student/SubjectsDB/archive_class.php', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  student_id: studentId,
                  subject_code: classToArchive.subject_code
              })
          });

          const data = await response.json();

          if (data.success) {
              setClasses(prevClasses => prevClasses.filter(c => c.subject_code !== classToArchive.subject_code));
              setShowArchiveModal(false);
              setClassToArchive(null);
              setPopupMessage('Class archived successfully');
              setShowSuccessPopup(true);
          } else {
              setPopupMessage(data.message || 'Failed to archive class');
              setShowErrorPopup(true);
          }
      } catch (error) {
          console.error('Error archiving class:', error);
          setPopupMessage('Error archiving class. Please try again.');
          setShowErrorPopup(true);
      }
  };

  // Function to render class cards
  const renderClassCards = () => {
    if (loading) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
          <p className="mt-3 text-gray-600">Loading classes...</p>
        </div>
      );
    }

    if (classes.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <img 
              src={Add} 
              alt="No classes" 
              className="h-8 w-8 opacity-50"
            />
          </div>
          <p className="text-gray-500 text-sm sm:text-base">
            No classes enrolled yet. Click the + button to join a class.
          </p>
        </div>
      );
    }

    return classes.map((classItem) => (
      <Link 
        to={`/SubjectDetailsStudent?code=${classItem.subject_code}`} 
        key={classItem.subject_code}
        className="block"
      >
        <div
          className="text-[#465746] rounded-lg p-4 sm:p-5 lg:p-6 space-y-3 border-2 border-transparent hover:border-[#00874E] hover:shadow-lg transition-all duration-200 h-full"
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
                <p className="text-xs sm:text-sm opacity-70">Section:</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold truncate">
                  {classItem.section}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={(e) => handlePaletteClick(e, classItem.subject_code)}
                className="bg-white rounded-md w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 shadow-md flex items-center justify-center border-2 border-transparent hover:border-[#00874E] hover:scale-105 transition-all duration-200 cursor-pointer"
                aria-label="Change color"
              >
                <img 
                  src={Palette} 
                  alt="" 
                  className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6" 
                />
              </button>
              <button 
                onClick={(e) => handleArchive(e, classItem)}
                className="bg-white rounded-md w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 shadow-md flex items-center justify-center border-2 border-transparent hover:border-[#00874E] hover:scale-105 transition-all duration-200 cursor-pointer"
                aria-label="Archive class"
              >
                <img 
                  src={ArchiveRow} 
                  alt="" 
                  className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6" 
                />
              </button>
            </div>
          </div>

          {/* Subject Details */}
          <div className="space-y-2 pt-2 border-t border-[#465746]/20">
            <div>
              <p className="text-xs sm:text-sm opacity-70 mb-0.5">Subject:</p>
              <p className="text-sm sm:text-base lg:text-lg font-semibold break-words line-clamp-2">
                {classItem.subject}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm lg:text-base">
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
      </Link>
    ));
  };

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-8 text-[#465746]">
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img src={Subject} alt="Subjects" className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3" />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">Subjects</h1>
            </div>
            <div className='flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0'>
              <div className="text-sm sm:text-base lg:text-lg">
                <span>Enrolled Subjects</span>
              </div>
              <div className="flex items-center text-sm sm:text-base lg:text-lg self-end sm:self-auto">
                <span>2nd Semester 2024 - 2025</span>
                <img src={ArrowDown} alt="ArrowDown" className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6 ml-auto justify-end">
            <Link to="/ArchiveClassStudent">
              <button className="font-bold py-2.5 bg-white rounded-md w-11 h-11 lg:w-12 lg:h-12 shadow-md flex items-center justify-center border-2 border-transparent hover:border-[#00874E] hover:scale-105 transition-all duration-200 cursor-pointer">
                <img src={Archive} alt="Archive" className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </Link>

            <button
              onClick={openJoinModal}
              className="font-bold py-2.5 bg-white rounded-md w-11 h-11 lg:w-12 lg:h-12 shadow-md flex items-center justify-center border-2 border-transparent hover:border-[#00874E] hover:scale-105 transition-all duration-200 cursor-pointer"
              aria-label="Join class"
            >
              <img src={Add} alt="Add" className="h-6 w-6" />
            </button>
          </div>

          {/* Class Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {renderClassCards()}
          </div>
        </div>
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 overlay-fade"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeJoinModal();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white w-full max-w-md rounded-lg shadow-2xl p-6 sm:p-8 relative modal-pop"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <img src={AddIcon} alt="Plus" className="h-7 w-7 sm:h-8 sm:w-8" />
                <h3 className="text-lg sm:text-xl font-bold">Join Class</h3>
              </div>

              <button
                onClick={closeJoinModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <img src={BackButton} alt="Close" className="h-6 w-6 sm:h-7 sm:w-7"/>
              </button>
            </div>

            <hr className="border-gray-200 mb-4 sm:mb-5" />

            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Class code: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter class code"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="w-full border-2 border-gray-300 rounded-md px-4 py-3 mb-5 focus:outline-none focus:border-[#00874E] transition-colors text-sm uppercase"
            />

            <div className="flex justify-end">
              <button
                onClick={handleJoin}
                disabled={!classCode.trim() || joinLoading}
                className={`px-6 py-3 rounded-md font-bold text-white text-sm sm:text-base transition-all duration-200 ${
                  classCode.trim() && !joinLoading 
                    ? 'bg-[#00A15D] hover:bg-[#00874E] cursor-pointer' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {joinLoading ? 'Joining...' : 'Join'}
              </button>
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

      {/* Archive Confirmation Modal */}
      {showArchiveModal && classToArchive && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowArchiveModal(false);
              setClassToArchive(null);
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
                Archive Class?
              </h3>
              
              <div className="mt-4 mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  Are you sure you want to archive this class?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {classToArchive.subject}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Section: {classToArchive.section}
                  </p>
                  <p className="text-sm text-gray-600">
                    Code: {classToArchive.subject_code}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowArchiveModal(false);
                    setClassToArchive(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmArchive}
                  className="flex-1 bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Archive
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
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <img 
                  src={SuccessIcon} 
                  alt="Success" 
                  className="h-8 w-8"
                />
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-6">{popupMessage}</p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
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
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <img 
                  src={ErrorIcon} 
                  alt="Error" 
                  className="h-8 w-8"
                />
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-6">{popupMessage}</p>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}