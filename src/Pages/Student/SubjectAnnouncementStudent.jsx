import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

// ========== IMPORT ASSETS ==========
import Announcement from "../../assets/Announcement.svg";
import BackButton from '../../assets/BackButton.svg';
import ArrowDown from "../../assets/ArrowDown.svg";
import Search from "../../assets/Search.svg";
import StudentsIcon from "../../assets/StudentList.svg";
import Classwork from "../../assets/Classwork.svg";
import Attendance from "../../assets/Attendance.svg";
import Analytics from "../../assets/Analytics.svg";
import SubjectOverview from "../../assets/SubjectOverview.svg";

export default function SubjectAnnouncementStudent() {
  // ========== STATE VARIABLES ==========
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [filterOption, setFilterOption] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false); // Added theme state

  // ========== USE EFFECTS ==========
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

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setStudentId(userData.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (subjectCode) fetchClassDetails();
  }, [subjectCode]);

  useEffect(() => {
    if (classInfo && studentId) fetchAnnouncements();
  }, [classInfo, studentId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownOpen && !event.target.closest('.filter-dropdown')) {
        setFilterDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [filterDropdownOpen]);

  // ========== THEME HELPER FUNCTIONS ==========
  const getBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-white" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-white/80" : "text-gray-600";
  };

  const getMutedTextColor = () => {
    return isDarkMode ? "text-white/60" : "text-gray-500";
  };

  const getDividerColor = () => {
    return isDarkMode ? "border-white/30" : "border-gray-300";
  };

  const getInputBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-gray-100";
  };

  const getInputBorderColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/10" : "border-gray-300";
  };

  const getInputFocusBorderColor = () => {
    return isDarkMode ? "focus:border-[#767EE0]" : "focus:border-[#4F46E5]";
  };

  const getDropdownBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getDropdownBorderColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/10" : "border-gray-200";
  };

  const getDropdownHoverBackgroundColor = () => {
    return isDarkMode ? "hover:bg-[#23232C]" : "hover:bg-gray-50";
  };

  const getEmptyStateBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-gray-100";
  };

  // ========== API CALL FUNCTIONS ==========
  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_class_details_student.php?subject_code=${subjectCode}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) setClassInfo(result.class_data);
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  const fetchAnnouncements = async () => {
    if (!studentId) return;
    
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/AnnouncementStudentDB/get_announcements_student.php?subject_code=${subjectCode}&student_id=${studentId}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched announcements for student:', result);
        
        if (result.success) {
          // Transform announcements to include updated_at field with proper parsing
          const transformedAnnouncements = result.announcements.map(announcement => ({
            ...announcement,
            updated_at: announcement.updated_at || null
          }));
          console.log('Transformed announcements:', transformedAnnouncements);
          setAnnouncements(transformedAnnouncements);
        } else {
          setAnnouncements([]);
        }
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLER FUNCTIONS ==========
  const handleMarkAsRead = async (announcementId) => {
    try {
      const response = await fetch('https://tracked.6minds.site/Student/AnnouncementStudentDB/get_announcements_student.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          announcement_id: announcementId,
          student_id: studentId,
          is_read: 1
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setAnnouncements(prev => 
          prev.map(announcement => 
            announcement.id === announcementId 
              ? { ...announcement, isRead: true }
              : announcement
          )
        );
      } else {
        console.error('Failed to mark as read:', result.message);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAsUnread = async (announcementId) => {
    try {
      const response = await fetch('https://tracked.6minds.site/Student/AnnouncementStudentDB/get_announcements_student.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          announcement_id: announcementId,
          student_id: studentId,
          is_read: 0
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setAnnouncements(prev => 
          prev.map(announcement => 
            announcement.id === announcementId 
              ? { ...announcement, isRead: false }
              : announcement
          )
        );
      } else {
        console.error('Failed to mark as unread:', result.message);
      }
    } catch (error) {
      console.error('Error marking as unread:', error);
    }
  };

const AnnouncementCard = ({ announcement }) => {
    const [open, setOpen] = useState(false);
    const [readStatus, setReadStatus] = useState(announcement.isRead);
    const [showFullInstructions, setShowFullInstructions] = useState(false);
    const [relativeTime, setRelativeTime] = useState("");

    // Load read status from localStorage on component mount
    useEffect(() => {
      if (announcement.id) {
        const savedReadStatus = localStorage.getItem(`announcement_${announcement.id}_read_student`);
        if (savedReadStatus !== null) {
          setReadStatus(savedReadStatus === 'true');
        }
      }
    }, [announcement.id]);

    // Save read status to localStorage whenever it changes
    useEffect(() => {
      if (announcement.id) {
        localStorage.setItem(`announcement_${announcement.id}_read_student`, readStatus.toString());
      }
    }, [readStatus, announcement.id]);

    // Function to calculate relative time
    const getRelativeTime = (dateString) => {
      if (!dateString || dateString === "No deadline" || dateString === "N/A") return "N/A";
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return "Recently";
        }
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 0) {
          return "Just now";
        } else if (diffInSeconds < 60) {
          return `${diffInSeconds}s ago`;
        } else if (diffInSeconds < 3600) {
          const minutes = Math.floor(diffInSeconds / 60);
          return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
          const hours = Math.floor(diffInSeconds / 3600);
          return `${hours}h ago`;
        } else if (diffInSeconds < 2592000) {
          const days = Math.floor(diffInSeconds / 86400);
          return `${days}d ago`;
        } else if (diffInSeconds < 31536000) {
          const months = Math.floor(diffInSeconds / 2592000);
          return `${months}mo ago`;
        } else {
          const years = Math.floor(diffInSeconds / 31536000);
          return `${years}y ago`;
        }
      } catch {
        return "Recently";
      }
    };

    // Update relative time periodically
    useEffect(() => {
      if (announcement.datePosted) {
        setRelativeTime(getRelativeTime(announcement.datePosted));
        
        const interval = setInterval(() => {
          setRelativeTime(getRelativeTime(announcement.datePosted));
        }, 60000);
        
        return () => clearInterval(interval);
      }
    }, [announcement.datePosted]);

    // Format deadline for display
    const formatDeadline = (dateString) => {
      if (!dateString || dateString === "No deadline" || dateString === "N/A") return "No deadline";
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return dateString;
        }
        
        const dateFormatted = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        
        const timeFormatted = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        return `${dateFormatted} | ${timeFormatted}`;
      } catch {
        return dateString;
      }
    };

    // FIXED: Check if announcement has been edited
    const isEdited = () => {
      if (!announcement.updated_at) return false;
      
      try {
        const updatedDate = new Date(announcement.updated_at);
        const createdDate = new Date(announcement.datePosted);
        
        if (isNaN(updatedDate.getTime()) || isNaN(createdDate.getTime())) {
          return false;
        }
        
        // Check if updated_at is significantly different from created_at (more than 1 second)
        const timeDifference = Math.abs(updatedDate.getTime() - createdDate.getTime());
        return timeDifference > 1000; // More than 1 second difference
      } catch (error) {
        console.error('Error checking if edited:', error);
        return false;
      }
    };

    const edited = isEdited();

    const handleCardClick = () => {
      if (!readStatus) {
        setReadStatus(true);
        handleMarkAsRead(announcement.id);
      }
      setOpen(!open);
    };

    const handleMarkAsUnreadClick = (e) => {
      e.stopPropagation();
      setReadStatus(false);
      handleMarkAsUnread(announcement.id);
      // DO NOT setOpen(false) here - let the card stay open
    };

    // Check if instructions are long
    const isInstructionsLong = announcement.instructions && announcement.instructions.length > 150;
    const displayInstructions = showFullInstructions 
      ? announcement.instructions 
      : (isInstructionsLong ? announcement.instructions.substring(0, 150) + '...' : announcement.instructions);

    const formattedDeadline = formatDeadline(announcement.deadline);

    // Theme-based colors for announcement card
    const getAnnouncementCardBackground = () => {
      return readStatus 
        ? (isDarkMode ? 'bg-[#15151C]' : 'bg-gray-50')
        : (isDarkMode ? 'bg-[#00A15D]/10' : 'bg-[#00A15D]/5');
    };

    const getAnnouncementCardBorder = () => {
      return !readStatus 
        ? (isDarkMode ? 'border-l-4 border-[#00A15D]' : 'border-l-4 border-[#059669]')
        : '';
    };

    return (
      <div 
        className={`shadow-md rounded-md mt-3 w-full transition-all duration-200 ${getAnnouncementCardBackground()} ${getAnnouncementCardBorder()} ${
          isDarkMode 
            ? 'hover:shadow-lg hover:border-[#767EE0] hover:border-1'
            : 'hover:shadow-lg hover:border-[#4F46E5] hover:border-1'
        }`}
      >
        {/* Header */}
        <div 
          className="relative p-3 cursor-pointer" 
          onClick={handleCardClick}
        >
          <div className="flex flex-col gap-1 pr-16">
            {/* Title and subject section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1 min-w-0 text-sm">
                <span className={`font-bold ${getTextColor()}`}>{announcement.subject}:</span>
                <span className={getSecondaryTextColor()}>{announcement.title}</span>
                {announcement.section && (
                  <span className={`text-xs ${getMutedTextColor()}`}>({announcement.section})</span>
                )}
                {/* Show "Edited" badge when announcement has been updated */}
                {edited && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isDarkMode ? 'bg-[#767EE0] text-[#FFFFFF]' : 'bg-[#4F46E5] text-white'
                  }`}>
                    Edited
                  </span>
                )}
                {/* Show "New" badge only when unread */}
                {!readStatus && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isDarkMode ? 'bg-[#00A15D] text-[#FFFFFF]' : 'bg-[#059669] text-white'
                  }`}>
                    New
                  </span>
                )}
              </div>
            </div>
            
            {/* Timestamp - only shown when card is CLOSED */}
            {!open && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs">
                <span className={getMutedTextColor()}>{relativeTime}</span>
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {/* Only show "Mark Unread" button when announcement is read */}
            {readStatus && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsUnreadClick(e);
                }}
                className={`text-xs ${
                  isDarkMode ? 'text-[#00A15D] hover:text-[#00874E]' : 'text-[#059669] hover:text-[#047857]'
                } font-medium hover:underline transition-colors cursor-pointer`}
                title="Mark as unread"
              >
                Mark Unread
              </button>
            )}
            <img
              src={ArrowDown}
              alt="Expand"
              className={`h-4 w-4 transform transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              style={isDarkMode ? { filter: 'brightness(0) invert(1)' } : { filter: 'invert(0.5)' }}
            />
          </div>
        </div>

        {/* Content - Only visible when expanded */}
        {open && (
          <div className={`p-3 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row justify-between gap-2 mb-3">
              <div className="mb-2 sm:mb-0">
                <p className={`font-semibold text-base ${getTextColor()}`}>{announcement.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-xs ${getMutedTextColor()}`}>Posted By: {announcement.postedBy}</p>
                </div>
                {announcement.section && (
                  <p className={`text-xs ${getMutedTextColor()} mt-1`}>Section: {announcement.section}</p>
                )}
              </div>

              {/* Timestamp and deadline - shown when card is OPEN */}
              <div className={`text-xs ${getMutedTextColor()} sm:text-right`}>
                <p>{relativeTime}</p>
                {announcement.deadline && announcement.deadline !== "N/A" && announcement.deadline !== "No deadline" && (
                  <p className={`${isDarkMode ? 'text-[#A15353]' : 'text-red-600'} font-bold mt-1`}>
                    Deadline: {formattedDeadline}
                  </p>
                )}
              </div>
            </div>

            {/* Instructions with Show More/Less */}
            <div className="mt-4">
              <p className={`font-semibold mb-1 text-sm ${getTextColor()}`}>Instructions:</p>
              {announcement.instructions ? (
                <>
                  <p className={`text-xs ${getSecondaryTextColor()} whitespace-pre-wrap break-words`}>
                    {displayInstructions}
                  </p>
                  {isInstructionsLong && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFullInstructions(!showFullInstructions);
                      }}
                      className={`mt-1 ${
                        isDarkMode ? 'text-[#00A15D]' : 'text-[#059669]'
                      } font-medium hover:underline text-xs cursor-pointer`}
                    >
                      {showFullInstructions ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </>
              ) : (
                <p className={`text-xs ${getMutedTextColor()} italic`}>No instructions provided.</p>
              )}
              {announcement.link && announcement.link !== "#" && announcement.link !== null && announcement.link !== "" && (
                <a
                  href={announcement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-2 inline-block ${
                    isDarkMode ? 'text-[#767EE0]' : 'text-[#4F46E5]'
                  } font-semibold hover:underline text-xs break-all`}
                  onClick={(e) => e.stopPropagation()}
                >
                  🔗 View Link
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== FILTER & SORT LOGIC ==========
  const filteredAnnouncements = announcements.filter(announcement => {
    let matchesFilter = true;
    if (filterOption === "Unread") matchesFilter = !announcement.isRead;
    if (filterOption === "Read") matchesFilter = announcement.isRead;
    
    const matchesSearch = 
      announcement.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.instructions?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (filterOption === "All") {
      if (a.isRead && !b.isRead) return 1;
      if (!a.isRead && b.isRead) return -1;
      return new Date(b.datePosted) - new Date(a.datePosted);
    }
    return 0;
  });

  // ========== RENDER HELPERS ==========
  const renderEmptyState = () => (
    <div className="col-span-full text-center py-12">
      <div className={`mx-auto w-20 h-20 mb-6 rounded-full ${getEmptyStateBackgroundColor()} flex items-center justify-center`}>
        <img 
          src={Announcement} 
          alt="No announcements" 
          className="h-10 w-10 opacity-50" 
          style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
        />
      </div>
      <p className={`text-base mb-2 ${getSecondaryTextColor()}`}>
        {searchQuery || filterOption !== "All" 
          ? "No announcements match your search criteria" 
          : "No announcements available yet."
        }
      </p>
      <p className={`text-sm ${getMutedTextColor()}`}>
        {searchQuery || filterOption !== "All" 
          ? "Try adjusting your search or filter options." 
          : "Check back later for new announcements from your professor."
        }
      </p>
    </div>
  );

  const renderActionButton = (to, icon, label, active = false, colorClass = "") => {
    const buttonClass = `flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto ${
      active 
        ? (isDarkMode 
            ? 'bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30 hover:bg-[#00A15D]/30' 
            : 'bg-[#059669]/20 text-[#059669] border-[#059669]/30 hover:bg-[#059669]/30'
          ) 
        : colorClass
    }`;
    
    return (
      <Link to={`${to}?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
        <button className={buttonClass}>
          <img src={icon} alt="" className="h-4 w-4" style={isDarkMode ? {} : { filter: 'invert(0.5)' }} />
          <span className="sm:inline truncate">{label}</span>
        </button>
      </Link>
    );
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className={`min-h-screen ${getBackgroundColor()}`}>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className={`p-8 text-center ${getTextColor()}`}>Loading announcements...</div>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className={`min-h-screen ${getBackgroundColor()}`}>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* ========== MAIN CONTENT ========== */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          
          {/* ========== PAGE HEADER ========== */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img 
                src={Announcement} 
                alt="Class Announcements" 
                className="h-6 w-6 sm:h-7 sm:w-7 mr-2" 
                style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
              />
              <h1 className={`font-bold text-xl lg:text-2xl ${getTextColor()}`}>Class Announcements</h1>
            </div>
            <p className={`text-sm lg:text-base ${getSecondaryTextColor()}`}>View Class announcements</p>
          </div>

          {/* ========== CLASS INFORMATION ========== */}
          <div className={`flex flex-col gap-1 text-sm ${getSecondaryTextColor()} mb-4`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'Loading...'}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{classInfo?.section || 'Loading...'}</span>
              </div>
              <Link to="/Subjects">
                <img 
                  src={BackButton} 
                  alt="Back" 
                  className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" 
                  style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                />
              </Link>
            </div>
          </div>

          <hr className={`${getDividerColor()} mb-4`} />

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {/* Updated Subject Overview Button with Dynamic Subject Name */}
              <Link to={`/SubjectOverviewStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
                <button className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto ${
                  isDarkMode 
                    ? 'bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30 hover:bg-[#FF5252]/30' 
                    : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                }`}>
                  <img src={SubjectOverview} alt="" className="h-4 w-4" style={isDarkMode ? {} : { filter: 'invert(0.5)' }} />
                  <span className="sm:inline truncate">{classInfo?.subject || 'Subject'} Overview</span>
                </button>
              </Link>
              
              {/* Existing buttons */}
              {renderActionButton("/SubjectAnnouncementStudent", Announcement, "Announcements", true)}
              {renderActionButton(
                "/SubjectSchoolWorksStudent", 
                Classwork, 
                "School Works", 
                false, 
                isDarkMode 
                  ? 'bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30' 
                  : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
              )}
              {renderActionButton(
                "/SubjectAttendanceStudent", 
                Attendance, 
                "Attendance", 
                false, 
                isDarkMode 
                  ? 'bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30' 
                  : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
              )}
              {renderActionButton(
                "/SubjectAnalyticsStudent", 
                Analytics, 
                "Reports", 
                false, 
                isDarkMode 
                  ? 'bg-[#B39DDB]/20 text-[#B39DDB] border-[#B39DDB]/30 hover:bg-[#B39DDB]/30' 
                  : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
              )}
            </div>
            <Link to={`/SubjectListStudent?code=${subjectCode}`} className="sm:self-start">
              <button className={`p-2 rounded-md shadow-md border-2 ${
                isDarkMode 
                  ? 'bg-[#15151C] border-transparent hover:border-[#00A15D]' 
                  : 'bg-white border-gray-300 hover:border-[#059669]'
              } transition-all duration-200 cursor-pointer`}>
                <img src={StudentsIcon} alt="Student List" className="h-4 w-4" style={isDarkMode ? {} : { filter: 'invert(0.5)' }} />
              </button>
            </Link>
          </div>

          {/* ========== FILTER & SEARCH ========== */}
          <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
            <div className="relative filter-dropdown sm:w-36">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 ${getInputBackgroundColor()} rounded border transition-all duration-200 text-xs font-medium cursor-pointer ${
                  filterOption !== "All" 
                    ? (isDarkMode 
                        ? 'border-[#767EE0] bg-[#767EE0]/10 text-[#767EE0]' 
                        : 'border-indigo-500 bg-indigo-50 text-indigo-600'
                      ) 
                    : `${getInputBorderColor()} hover:border-[#767EE0] ${getTextColor()}`
                }`}
              >
                <span>{filterOption}</span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`ml-1.5 h-2.5 w-2.5 transition-transform duration-200 ${
                    filterDropdownOpen ? 'rotate-180' : ''
                  }`} 
                  style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                />
              </button>

              {filterDropdownOpen && (
                <div className={`absolute top-full mt-1 ${getDropdownBackgroundColor()} rounded w-full shadow-xl border ${getDropdownBorderColor()} z-20 overflow-hidden`}>
                  {["All", "Unread", "Read"].map((option) => (
                    <button
                      key={option}
                      className={`block px-2.5 py-1.5 w-full text-left ${getDropdownHoverBackgroundColor()} text-xs transition-colors cursor-pointer ${
                        filterOption === option 
                          ? (isDarkMode 
                              ? 'bg-[#767EE0]/10 text-[#767EE0] border-l-2 border-[#767EE0] font-semibold' 
                              : 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-500 font-semibold'
                            ) 
                          : getTextColor()
                      }`}
                      onClick={() => {
                        setFilterOption(option);
                        setFilterDropdownOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full h-9 rounded px-2.5 py-1.5 pr-9 outline-none ${getInputBackgroundColor()} text-xs ${getTextColor()} border ${getInputBorderColor()} ${getInputFocusBorderColor()} transition-colors placeholder:${getMutedTextColor()}`}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2">
                  <img 
                    src={Search} 
                    alt="Search" 
                    className="h-3.5 w-3.5" 
                    style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ========== ANNOUNCEMENT CARDS ========== */}
          <div className="space-y-4">
            {sortedAnnouncements.length > 0 ? (
              sortedAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                />
              ))
            ) : (
              renderEmptyState()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}