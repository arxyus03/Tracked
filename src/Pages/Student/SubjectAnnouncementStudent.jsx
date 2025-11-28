import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import AnnouncementCardStudent from "../../Components/AnnouncementCardStudent";

import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton(Light).svg';
import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Search from "../../assets/Search.svg";
import StudentsIcon from "../../assets/ClassManagement(Light).svg";
import Announcement from "../../assets/Announcement(Light).svg";
import Classwork from "../../assets/Classwork(Light).svg";
import Attendance from "../../assets/Attendance(Light).svg";
import Analytics from "../../assets/Analytics(Light).svg";

export default function SubjectAnnouncementStudent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  
  // Filter and Search states
  const [filterOption, setFilterOption] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get student ID from localStorage
  useEffect(() => {
    const getStudentId = () => {
      try {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setStudentId(userData.id);
          return userData.id;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
      return null;
    };

    getStudentId();
  }, []);

  // Fetch class details
  useEffect(() => {
    if (subjectCode) {
      fetchClassDetails();
    }
  }, [subjectCode]);

  // Fetch announcements after classInfo and studentId are available
  useEffect(() => {
    if (classInfo && studentId) {
      fetchAnnouncements();
    }
  }, [classInfo, studentId]);

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_class_details_student.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setClassInfo(result.class_data);
        } else {
          console.error('Error fetching class details:', result.message);
        }
      } else {
        console.error('HTTP error fetching class details:', response.status);
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  // Fetch announcements for student
  const fetchAnnouncements = async () => {
    if (!studentId) return;
    
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/AnnouncementStudentDB/get_announcements_student.php?subject_code=${subjectCode}&student_id=${studentId}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched announcements result:', result);
        if (result.success) {
          // Add read status to announcements (default to unread)
          const announcementsWithReadStatus = result.announcements.map(announcement => ({
            ...announcement,
            isRead: false // Default to unread
          }));
          setAnnouncements(announcementsWithReadStatus);
        } else {
          console.error('Error fetching announcements:', result.message);
          setAnnouncements([]);
        }
      } else {
        console.error('HTTP error fetching announcements:', response.status);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle marking announcement as read
  const handleMarkAsRead = (announcementId) => {
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements.map(announcement => 
        announcement.id === announcementId 
          ? { ...announcement, isRead: true }
          : announcement
      )
    );
  };

  // Handle marking announcement as unread
  const handleMarkAsUnread = (announcementId) => {
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements.map(announcement => 
        announcement.id === announcementId 
          ? { ...announcement, isRead: false }
          : announcement
      )
    );
  };

  // Filter announcements based on filter option and search query
  const filteredAnnouncements = announcements.filter(announcement => {
    // Filter by read status
    let matchesFilter = true;
    if (filterOption === "Unread") {
      matchesFilter = !announcement.isRead;
    } else if (filterOption === "Read") {
      matchesFilter = announcement.isRead;
    }
    
    // Filter by search query
    const matchesSearch = 
      announcement.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.instructions?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Sort announcements based on filter option
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    // For all filters, maintain original order or sort by unread first
    if (filterOption === "All") {
      // Put unread announcements first
      if (a.isRead && !b.isRead) return 1;
      if (!a.isRead && b.isRead) return -1;
      return new Date(b.datePosted) - new Date(a.datePosted);
    }
    return 0;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownOpen && !event.target.closest('.filter-dropdown')) {
        setFilterDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [filterDropdownOpen]);

  // Render empty state when no announcements
  const renderEmptyState = () => (
    <div className="col-span-full text-center py-8 sm:py-12 lg:py-16">
      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-4 sm:mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <img 
          src={Announcement} 
          alt="No announcements" 
          className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 opacity-50" 
        />
      </div>
      <p className="text-gray-500 text-sm sm:text-base lg:text-lg mb-2">
        {searchQuery || filterOption !== "All" 
          ? "No announcements match your search criteria" 
          : "No announcements available yet."
        }
      </p>
      <p className="text-gray-400 text-xs sm:text-sm lg:text-base">
        {searchQuery || filterOption !== "All" 
          ? "Try adjusting your search or filter options." 
          : "Check back later for new announcements from your professor."
        }
      </p>
    </div>
  );

  if (loading) {
    return (
      <div>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* Page Header - Updated for Announcements */}
          <div className="mb-4 sm:mb-4">
            <div className="flex items-center mb-2">
              <img
                src={Announcement}
                alt="Class Announcements"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Class Announcements
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              View Class announcements
            </p>
          </div>

          {/* Class Information */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo?.subject_code || subjectCode || 'Loading...'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'Loading...'}</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{classInfo?.section || 'Loading...'}</span>
              </div>
              <Link to={"/Subjects"}>
                <img 
                  src={BackButton} 
                  alt="Back" 
                  className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full mt-4 sm:mt-5 gap-3">
            {/* Navigation buttons - Stack on mobile, row on tablet/desktop */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Class Announcements Button - Active state with different background */}
              <Link to={`/SubjectAnnouncementStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#e6f4ea] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4edd8] transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={Announcement} 
                    alt="" 
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span className="sm:inline">Announcements</span>
                </button>
              </Link>

              {/* School Works and Attendance - Side by side on all screens */}
              <div className="flex gap-3 w-full sm:w-auto">
                <Link to={`/SubjectSchoolWorksStudent?code=${subjectCode}`} className="flex-1 min-w-0">
                  <button className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 bg-[#e6f0ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4e3ff] transition-all duration-300 cursor-pointer w-full">
                    <img 
                      src={Classwork} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                    />
                    <span className="whitespace-nowrap truncate">School Works</span>
                  </button>
                </Link>

                <Link to={`/SubjectAttendanceStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#fff4e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#ffebd4] transition-all duration-300 cursor-pointer w-full sm:w-auto">
                    <img 
                      src={Attendance} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Attendance</span>
                  </button>
                </Link>

                <Link to={`/SubjectAnalyticsStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#f0e6ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#e6d4ff] transition-all duration-300 cursor-pointer w-full sm:w-auto">
                    <img 
                      src={Analytics} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Reports</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Action buttons - Icons only on mobile/tablet, unchanged on desktop */}
            <div className="flex items-center gap-2 justify-end sm:justify-start mt-3 sm:mt-0 w-full sm:w-auto">
              <Link to={`/SubjectListStudent?code=${subjectCode}`}>
                <button className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer w-10 h-10 sm:w-auto sm:h-auto">
                  <img 
                    src={StudentsIcon} 
                    alt="Student List" 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                  />
                </button>
              </Link>
            </div>
          </div>

          {/* Filter and Search Section - Updated for Announcements */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-5">
            {/* Filter dropdown */}
            <div className="relative sm:flex-initial filter-dropdown">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="flex items-center justify-between w-full sm:w-auto font-bold px-4 py-2.5 bg-white rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] active:border-[#00874E] transition-all duration-200 text-sm sm:text-base sm:min-w-[160px] cursor-pointer touch-manipulation"
              >
                <span>{filterOption}</span>
                <img
                  src={ArrowDown}
                  alt=""
                  className={`ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${filterDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown options - Updated for Announcements */}
              {filterDropdownOpen && (
                <div className="absolute top-full mt-2 bg-white rounded-md w-full sm:min-w-[200px] shadow-xl border border-gray-200 z-20 overflow-hidden">
                  {["All", "Unread", "Read"].map((option) => (
                    <button
                      key={option}
                      className={`block px-4 py-2.5 w-full text-left hover:bg-gray-100 active:bg-gray-200 text-sm sm:text-base transition-colors duration-150 cursor-pointer touch-manipulation ${
                        filterOption === option ? 'bg-gray-50 font-semibold' : ''
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

            {/* Search bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 sm:h-12 rounded-md px-4 py-2.5 pr-12 shadow-md outline-none bg-white text-sm sm:text-base border-2 border-transparent focus:border-[#00874E] transition-colors"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <img
                    src={Search}
                    alt="Search"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ANNOUNCEMENT CARDS - Replaced Activity Cards */}
          <div className="space-y-4 mt-4 sm:mt-5">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
                <p className="mt-3 text-gray-600">Loading announcements...</p>
              </div>
            ) : sortedAnnouncements.length > 0 ? (
              sortedAnnouncements.map((announcement) => (
              <AnnouncementCardStudent
                key={announcement.id}
                id={announcement.id}
                subject={announcement.subject}
                title={announcement.title}
                postedBy={announcement.postedBy}
                datePosted={announcement.datePosted}
                deadline={announcement.deadline}
                instructions={announcement.instructions}
                link={announcement.link}
                section={announcement.section}
                isRead={announcement.isRead}
                onMarkAsRead={() => handleMarkAsRead(announcement.id)}
                onMarkAsUnread={() => handleMarkAsUnread(announcement.id)}
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