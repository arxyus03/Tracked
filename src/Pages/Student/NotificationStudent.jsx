import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import NotificationCard from "../../Components/NotificationCardStudent";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Notification from "../../assets/NotificationIcon.svg";
import Search from "../../assets/Search.svg";

export default function NotificationStudent() {
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [filterOption, setFilterOption] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current student ID from localStorage
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    console.log("User data from localStorage:", userData); // Debug log
    
    if (userData && userData.id) {
      setStudentId(userData.id);
      console.log("Student ID set to:", userData.id); // Debug log
    } else {
      setError("User not logged in. Please log in again.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      console.log("Fetching announcements for student:", studentId); // Debug log
      fetchStudentAnnouncements();
    }
  }, [studentId]);

  const fetchStudentAnnouncements = async () => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('student_id', studentId);
      
      console.log("Sending request to PHP with student ID:", studentId); // Debug log
      
      const response = await fetch('http://localhost/TrackEd/src/Pages/Student/NotificationstudentDB/get_student_announcements.php', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response:", data); // Debug log
      
      if (data.success) {
        setAnnouncements(data.announcements);
        setError(null);
        console.log(`Loaded ${data.announcements.length} announcements`); // Debug log
      } else {
        throw new Error(data.message || 'Failed to fetch announcements');
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError(`Failed to load announcements: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter announcements based on search query and filter option
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterOption === "All") return matchesSearch;
    if (filterOption === "Unread") return matchesSearch && !announcement.isRead;
    if (filterOption === "Read") return matchesSearch && announcement.isRead;
    if (filterOption === "Newest") return matchesSearch;
    
    return matchesSearch;
  });

  // Sort announcements by date (newest first)
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  if (loading) {
    return (
      <div>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />
          <div className="text-[#465746] p-4 sm:p-5 md:p-6 lg:p-8">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading announcements...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />
          <div className="text-[#465746] p-4 sm:p-5 md:p-6 lg:p-8">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-red-500">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`transition-all duration-300 ${
          isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"
        }`}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* content of NOTIFICATION*/}
        <div className="text-[#465746] p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img src={Notification} alt="Notification" className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">Notification</h1>
            </div>
            <div className='flex justify-between'>
              <div className="text-sm sm:text-base lg:text-lg">
                <span>Class Announcements</span>
              </div>
              <div className="flex text-sm sm:text-base lg:text-lg">
                <span> 2nd Semester 2024 - 2025  </span>
                <img src={ArrowDown} alt="ArrowDown" className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Filter and Search - Responsive Layout */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6">
            {/* Filter dropdown */}
            <div className="relative sm:flex-initial filter-dropdown">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full sm:w-auto font-bold px-4 py-2.5 bg-white rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] active:border-[#00874E] transition-all duration-200 text-sm sm:text-base sm:min-w-[160px] cursor-pointer touch-manipulation"
              >
                <span>{filterOption}</span>
                <img
                  src={ArrowDown}
                  alt=""
                  className={`ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Filter Dropdown SELECTIONS */}
              {open && (
                <div className="absolute top-full mt-2 bg-white rounded-md w-full sm:min-w-[200px] shadow-xl border border-gray-200 z-20 overflow-hidden">
                  {["All", "Unread", "Read", "Newest"].map((filter) => (
                    <button
                      key={filter}
                      className={`block px-4 py-2.5 w-full text-left hover:bg-gray-100 active:bg-gray-200 text-sm sm:text-base transition-colors duration-150 cursor-pointer touch-manipulation ${
                        filterOption === filter ? 'bg-gray-50 font-semibold' : ''
                      }`}
                      onClick={() => {
                        setFilterOption(filter);
                        setOpen(false);
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search bar */}
            <div className="relative flex-1">
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

          {/* Announcement Cards */}
          <div className="space-y-4 sm:space-y-5">
            {sortedAnnouncements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery || filterOption !== "All" 
                  ? "No announcements match your search criteria." 
                  : "No announcements available for your classes."}
              </div>
            ) : (
              sortedAnnouncements.map((announcement) => (
                <NotificationCard
                  key={announcement.announcement_ID}
                  title={announcement.title}
                  description={announcement.description}
                  date={new Date(announcement.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  isRead={announcement.isRead || false}
                  // Optional: You can pass additional data if needed
                  className={announcement.classroom_ID}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}