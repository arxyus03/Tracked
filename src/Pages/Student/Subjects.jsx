import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Subject from '../../assets/Subjects.svg';
import Add from "../../assets/Add.svg";
import AddIcon from "../../assets/JoinClass.svg";
import Archive from "../../assets/Archive.svg";
import ArchiveRow from "../../assets/Archive.svg";
import Palette from "../../assets/Palette.svg";
import BackButton from '../../assets/Back.svg';
import Book from '../../assets/ClassManagementSubject(Light).svg';
import ArchiveWarningIcon from "../../assets/Warning(Yellow).svg";
import SuccessIcon from '../../assets/Success(Green).svg';
import ErrorIcon from '../../assets/Error(Red).svg';

export default function Subjects() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName] = useState("Student");
  const [isDarkMode, setIsDarkMode] = useState(false); // Added theme state

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

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [classToArchive, setClassToArchive] = useState(null);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

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
        fetchStudentClasses();
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

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

  const handleArchive = (e, classItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    setClassToArchive(classItem);
    setShowArchiveModal(true);
  };

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

  // Theme-based style functions
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
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-100";
  };

  const getInputBorderColor = () => {
    return isDarkMode ? "border-[#23232C]" : "border-gray-300";
  };

  const getInputFocusBorderColor = () => {
    return isDarkMode ? "focus:border-[#00A15D]" : "focus:border-[#00A15D]";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/80" : "text-gray-600";
  };

  const getMutedTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/50" : "text-gray-500";
  };

  const getDividerColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/30" : "border-gray-300";
  };

  const getButtonBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-gray-100";
  };

  const getActionButtonBackground = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-200";
  };

  const getActionButtonHover = () => {
    return isDarkMode ? "hover:border-[#00A15D]" : "hover:border-[#00A15D]";
  };

  const getPopupBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getPopupTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]" : "text-gray-900";
  };

  const getPopupSecondaryTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/70" : "text-gray-600";
  };

  const renderClassCards = () => {
    if (loading) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00A15D] border-r-transparent"></div>
          <p className={`mt-3 ${getSecondaryTextColor()}`}>Loading classes...</p>
        </div>
      );
    }

    if (classes.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className={`mx-auto w-16 h-16 mb-4 rounded-full ${getButtonBackgroundColor()} flex items-center justify-center`}>
            <img 
              src={Add} 
              alt="No classes" 
              className="h-8 w-8 opacity-50"
              style={!isDarkMode ? { filter: 'invert(0.5)' } : {}}
            />
          </div>
          <p className={`${getMutedTextColor()} text-sm sm:text-base`}>
            No classes enrolled yet. Click the + button to join a class.
          </p>
        </div>
      );
    }

    return classes.map((classItem) => (
      <Link 
        to={`/SubjectOverviewStudent?code=${classItem.subject_code}`}
        key={classItem.subject_code}
        className="block"
      >
        <div
          className={`text-[#FFFFFF] rounded-lg p-4.5 space-y-3 border-2 border-transparent hover:border-[#00A15D] hover:shadow-md transition-all duration-200 h-full`}
          style={{ backgroundColor: classItem.bgColor }}
        >
          {/* Header with Section and Buttons */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center min-w-0 flex-1">
              <img
                src={Book}
                alt="Subject"
                className="h-5 w-5 flex-shrink-0 mr-2"
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
                onClick={(e) => handlePaletteClick(e, classItem.subject_code)}
                className={`${getActionButtonBackground()} rounded-md w-8 h-8 shadow-sm flex items-center justify-center border-2 border-transparent ${getActionButtonHover()} hover:scale-105 transition-all duration-200 cursor-pointer`}
                aria-label="Change color"
              >
                <img 
                  src={Palette} 
                  alt="" 
                  className="h-4 w-4" 
                  style={!isDarkMode ? { filter: 'invert(0.5)' } : {}}
                />
              </button>
              <button 
                onClick={(e) => handleArchive(e, classItem)}
                className={`${getActionButtonBackground()} rounded-md w-8 h-8 shadow-sm flex items-center justify-center border-2 border-transparent ${getActionButtonHover()} hover:scale-105 transition-all duration-200 cursor-pointer`}
                aria-label="Archive class"
              >
                <img 
                  src={ArchiveRow} 
                  alt="" 
                  className="h-4 w-4"
                  style={!isDarkMode ? { filter: 'invert(0.5)' } : {}}
                />
              </button>
            </div>
          </div>

          {/* Subject Details - Removed class code */}
          <div className="space-y-1.5 pt-2.5 border-t border-[#FFFFFF]/20">
            <div>
              <p className="text-xs opacity-70 mb-0.5">Subject:</p>
              <p className="text-sm font-semibold break-words line-clamp-2">
                {classItem.subject}
              </p>
            </div>
            <div className="text-xs">
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
    <div className={`min-h-screen ${getBackgroundColor()}`}>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />

        <div className={`p-4 sm:p-5 md:p-6 lg:p-8 ${getTextColor()}`}>
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img 
                src={Subject} 
                alt="Subjects" 
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
                style={!isDarkMode ? { filter: 'invert(0.5)' } : {}}
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">Subjects</h1>
            </div>
            <div className={`text-sm sm:text-base lg:text-lg ${getSecondaryTextColor()}`}>
              <span>Enrolled Subjects</span>
            </div>
          </div>

          <hr className={`${getDividerColor()} mb-5 sm:mb-6`} />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6 ml-auto justify-end">
            <Link to="/ArchiveClassStudent">
              <button className={`font-bold py-2.5 ${getButtonBackgroundColor()} rounded-md w-10 h-10 lg:w-11 lg:h-11 shadow-md flex items-center justify-center border-2 border-transparent ${getActionButtonHover()} hover:scale-105 transition-all duration-200 cursor-pointer`}>
                <img 
                  src={Archive} 
                  alt="Archive" 
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  style={!isDarkMode ? { filter: 'invert(0.5)' } : {}}
                />
              </button>
            </Link>

            <button
              onClick={openJoinModal}
              className={`font-bold py-2.5 ${getButtonBackgroundColor()} rounded-md w-10 h-10 lg:w-11 lg:h-11 shadow-md flex items-center justify-center border-2 border-transparent ${getActionButtonHover()} hover:scale-105 transition-all duration-200 cursor-pointer`}
              aria-label="Join class"
            >
              <img 
                src={Add} 
                alt="Add" 
                className="h-5 w-5"
                style={!isDarkMode ? { filter: 'invert(0.5)' } : {}}
              />
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
            className={`${getModalBackgroundColor()} w-full max-w-md rounded-lg shadow-2xl p-6 sm:p-8 relative modal-pop`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={AddIcon} 
                  alt="Plus" 
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  style={!isDarkMode ? { filter: 'invert(0.5)' } : {}}
                />
                <h3 className={`text-lg sm:text-xl font-bold ${getTextColor()}`}>Join Class</h3>
              </div>

              <button
                onClick={closeJoinModal}
                className="p-2 hover:bg-gray-200 dark:hover:bg-[#23232C] rounded-full transition-colors"
                aria-label="Close"
              >
                <img 
                  src={BackButton} 
                  alt="Close" 
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  style={!isDarkMode ? { filter: 'invert(0.5)' } : {}}
                />
              </button>
            </div>

            <hr className={`${getDividerColor()} mb-4 sm:mb-5`} />

            <label className={`block text-sm font-semibold mb-2 ${getTextColor()}`}>
              Class code: <span className="text-[#A15353]">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter class code"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className={`w-full border-2 ${getInputBorderColor()} ${getInputBackgroundColor()} rounded-md px-4 py-3 mb-5 focus:outline-none ${getInputFocusBorderColor()} transition-colors text-sm uppercase ${getTextColor()} placeholder:${getMutedTextColor()}`}
            />

            <div className="flex justify-end">
              <button
                onClick={handleJoin}
                disabled={!classCode.trim() || joinLoading}
                className={`px-6 py-3 rounded-md font-bold text-white text-sm sm:text-base transition-all duration-200 ${
                  classCode.trim() && !joinLoading 
                    ? 'bg-[#00A15D] hover:bg-[#00874E] cursor-pointer' 
                    : 'bg-gray-300 dark:bg-[#23232C] cursor-not-allowed text-gray-500 dark:text-[#FFFFFF]/50'
                }`}
              >
                {joinLoading ? 'Joining...' : 'Join'}
              </button>
            </div>
          </div>
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
          <div className={`${getPopupBackgroundColor()} ${getPopupTextColor()} rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#FFA600]/20 mb-4">
                <img 
                  src={ArchiveWarningIcon} 
                  alt="Warning" 
                  className="h-8 w-8" 
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Archive Class?
              </h3>
              
              <div className="mt-4 mb-6">
                <p className={`text-sm ${getPopupSecondaryTextColor()} mb-3`}>
                  Are you sure you want to archive this class?
                </p>
                <div className={`${getInputBackgroundColor()} rounded-lg p-4 text-left`}>
                  <p className="text-base sm:text-lg font-semibold break-words">
                    {classToArchive.subject}
                  </p>
                  <p className={`text-sm ${getPopupSecondaryTextColor()} mt-1`}>
                    Section: {classToArchive.section}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowArchiveModal(false);
                    setClassToArchive(null);
                  }}
                  className={`flex-1 ${getButtonBackgroundColor()} hover:bg-gray-200 dark:hover:bg-[#2A2A35] font-bold py-3 rounded-md transition-all duration-200 cursor-pointer ${getTextColor()}`}
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
          <div className={`${getPopupBackgroundColor()} ${getPopupTextColor()} rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#00A15D]/20 mb-4">
                <img 
                  src={SuccessIcon} 
                  alt="Success" 
                  className="h-8 w-8"
                />
              </div>
              <p className={`text-sm sm:text-base ${getPopupSecondaryTextColor()} mb-6`}>{popupMessage}</p>
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
          <div className={`${getPopupBackgroundColor()} ${getPopupTextColor()} rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#A15353]/20 mb-4">
                <img 
                  src={ErrorIcon} 
                  alt="Error" 
                  className="h-8 w-8"
                />
              </div>
              <p className={`text-sm sm:text-base ${getPopupSecondaryTextColor()} mb-6`}>{popupMessage}</p>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="w-full bg-[#A15353] hover:bg-[#8A4545] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
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