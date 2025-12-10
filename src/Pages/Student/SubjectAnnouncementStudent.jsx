import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import AnnouncementCardStudent from "../../Components/AnnouncementCardStudent";

// ========== IMPORT ASSETS ==========
import Announcement from "../../assets/Announcement.svg";
import BackButton from '../../assets/BackButton.svg';
import ArrowDown from "../../assets/ArrowDown.svg";
import Search from "../../assets/Search.svg";
import StudentsIcon from "../../assets/StudentList.svg";
import Classwork from "../../assets/Classwork.svg";
import Attendance from "../../assets/Attendance.svg";
import Analytics from "../../assets/Analytics.svg";

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

  // ========== USE EFFECTS ==========
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
        if (result.success) {
          const announcementsWithReadStatus = result.announcements.map(announcement => ({
            ...announcement,
            isRead: false
          }));
          setAnnouncements(announcementsWithReadStatus);
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
  const handleMarkAsRead = (announcementId) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === announcementId 
          ? { ...announcement, isRead: true }
          : announcement
      )
    );
  };

  const handleMarkAsUnread = (announcementId) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === announcementId 
          ? { ...announcement, isRead: false }
          : announcement
      )
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
      <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-[#15151C] flex items-center justify-center">
        <img 
          src={Announcement} 
          alt="No announcements" 
          className="h-10 w-10 opacity-50" 
        />
      </div>
      <p className="text-[#FFFFFF]/60 text-base mb-2">
        {searchQuery || filterOption !== "All" 
          ? "No announcements match your search criteria" 
          : "No announcements available yet."
        }
      </p>
      <p className="text-[#FFFFFF]/40 text-sm">
        {searchQuery || filterOption !== "All" 
          ? "Try adjusting your search or filter options." 
          : "Check back later for new announcements from your professor."
        }
      </p>
    </div>
  );

  const renderActionButton = (to, icon, label, active = false, colorClass = "") => (
    <Link to={`${to}?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
      <button className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto ${
        active 
          ? 'bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30' 
          : colorClass
      }`}>
        <img src={icon} alt="" className="h-4 w-4" />
        <span className="sm:inline truncate">{label}</span>
      </button>
    </Link>
  );

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 text-center text-[#FFFFFF]">Loading announcements...</div>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* ========== MAIN CONTENT ========== */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          
          {/* ========== PAGE HEADER ========== */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img src={Announcement} alt="Class Announcements" className="h-6 w-6 sm:h-7 sm:w-7 mr-2" />
              <h1 className="font-bold text-xl lg:text-2xl text-[#FFFFFF]">Class Announcements</h1>
            </div>
            <p className="text-sm lg:text-base text-[#FFFFFF]/80">View Class announcements</p>
          </div>

          {/* ========== CLASS INFORMATION ========== */}
          <div className="flex flex-col gap-1 text-sm text-[#FFFFFF]/80 mb-4">
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
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#FFFFFF]/30 mb-4" />

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {renderActionButton("/SubjectAnnouncementStudent", Announcement, "Announcements", true)}
              {renderActionButton("/SubjectSchoolWorksStudent", Classwork, "School Works", false, "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30")}
              {renderActionButton("/SubjectAttendanceStudent", Attendance, "Attendance", false, "bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30")}
              {renderActionButton("/SubjectAnalyticsStudent", Analytics, "Reports", false, "bg-[#B39DDB]/20 text-[#B39DDB] border-[#B39DDB]/30 hover:bg-[#B39DDB]/30")}
            </div>
            <Link to={`/SubjectListStudent?code=${subjectCode}`} className="sm:self-start">
              <button className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 cursor-pointer">
                <img src={StudentsIcon} alt="Student List" className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* ========== FILTER & SEARCH ========== */}
          <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
            <div className="relative filter-dropdown sm:w-36">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="flex items-center justify-between w-full px-2.5 py-1.5 bg-[#15151C] rounded border border-transparent hover:border-[#00A15D] transition-all duration-200 text-xs font-medium cursor-pointer"
              >
                <span className="text-[#FFFFFF]">{filterOption}</span>
                <img src={ArrowDown} alt="" className={`ml-1.5 h-2.5 w-2.5 transition-transform duration-200 ${filterDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {filterDropdownOpen && (
                <div className="absolute top-full mt-1 bg-[#15151C] rounded w-full shadow-xl border border-[#FFFFFF]/10 z-20 overflow-hidden">
                  {["All", "Unread", "Read"].map((option) => (
                    <button
                      key={option}
                      className={`block px-2.5 py-1.5 w-full text-left hover:bg-[#23232C] text-xs transition-colors cursor-pointer ${
                        filterOption === option ? 'bg-[#23232C] font-semibold' : 'text-[#FFFFFF]/80'
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
                  className="w-full h-9 rounded px-2.5 py-1.5 pr-9 outline-none bg-[#15151C] text-xs text-[#FFFFFF] border border-transparent focus:border-[#00A15D] transition-colors placeholder:text-[#FFFFFF]/40"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FFFFFF]/60">
                  <img src={Search} alt="Search" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ========== ANNOUNCEMENT CARDS ========== */}
          <div className="space-y-4">
            {sortedAnnouncements.length > 0 ? (
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