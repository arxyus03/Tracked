import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import NewAnnouncement from "../../Components/NewAnnouncement";
import AnnouncementCard from "../../Components/AnnouncementCard";

import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Add from "../../assets/Add(Light).svg";
import Archive from "../../assets/Archive(Light).svg";
import Attendance from "../../assets/Attendance(Light).svg";
import Announcement from "../../assets/Announcement(Light).svg";
import AnnouncementIcon from "../../assets/Announcement(Light).svg";
import Classwork from "../../assets/Classwork(Light).svg";
import ClassManagementIcon from "../../assets/ClassManagement(Light).svg";
import ArrowDown from "../../assets/ArrowDown(Light).svg";
import SuccessIcon from '../../assets/Success(Green).svg';
import ArchiveWarningIcon from '../../assets/Warning(Yellow).svg';
import Search from "../../assets/Search.svg";
// Import the new icons for Grade and Analytics
import GradeIcon from "../../assets/Grade(Light).svg";
import AnalyticsIcon from "../../assets/Analytics(Light).svg";

export default function AnnouncementTab() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
  
  // ANNOUNCEMENT STATES (from Announcement page)
  const [showModal, setShowModal] = useState(false);
  
  // Modal form states
  const [selectedSubject, setSelectedSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [deadline, setDeadline] = useState("");

  // Editing state
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Classes state (for dropdowns)
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Filter state
  const [filterOption, setFilterOption] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Class info state
  const [classInfo, setClassInfo] = useState(null);
  const [loadingClassInfo, setLoadingClassInfo] = useState(true);

  // ✅ NEW: Posting state
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  // Get professor ID from localStorage - FIXED VERSION
  const getProfessorId = () => {
    try {
      const userDataString = localStorage.getItem('user');
      console.log('User data from localStorage:', userDataString);
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('Parsed user data:', userData);
        
        // Try different possible ID fields
        const professorId = userData.id || userData.tracked_ID || userData.user_ID;
        console.log('Extracted professor ID:', professorId);
        
        if (!professorId) {
          console.error('No professor ID found in user data');
          return null;
        }
        
        return professorId;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    
    console.error('No user data found in localStorage');
    return null;
  };

  // Get current datetime in YYYY-MM-DDTHH:mm format for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  // Fetch all data independently
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch class details
        if (subjectCode) {
          await fetchClassDetails();
        }
        
        // Fetch classes and announcements in parallel
        await Promise.all([
          fetchClasses(),
          fetchAnnouncements()
        ]);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [subjectCode]);

  const fetchClassDetails = async () => {
    try {
      setLoadingClassInfo(true);
      const professorId = getProfessorId();
      
      if (!professorId || !subjectCode) {
        console.error('Missing professor ID or subject code');
        setLoadingClassInfo(false);
        return;
      }

      console.log('Fetching class details for:', { professorId, subjectCode });

      const response = await fetch(`https://tracked.6minds.site/Professor/SubjectDetailsDB/get_class_details.php?subject_code=${subjectCode}&professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Class details response:', result);
        
        if (result.success) {
          setClassInfo(result.class_data);
          // Set the selected subject for announcements to the current class
          setSelectedSubject(subjectCode);
        } else {
          console.error('Error fetching class details:', result.message);
          // Set default class info if API fails
          setClassInfo({
            subject_code: subjectCode,
            subject: 'Unknown Subject',
            section: 'Unknown Section'
          });
        }
      } else {
        console.error('Failed to fetch class details, status:', response.status);
        // Set default class info if API fails
        setClassInfo({
          subject_code: subjectCode,
          subject: 'Unknown Subject',
          section: 'Unknown Section'
        });
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
      // Set default class info on error
      setClassInfo({
        subject_code: subjectCode,
        subject: 'Unknown Subject',
        section: 'Unknown Section'
      });
    } finally {
      setLoadingClassInfo(false);
    }
  };

  // Fetch professor's classes for dropdowns
  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const professorId = getProfessorId();
      
      if (!professorId) {
        console.error('No professor ID found');
        setLoadingClasses(false);
        return;
      }
      
      console.log('Fetching classes for professor:', professorId);
      
      const response = await fetch(`https://tracked.6minds.site/Professor/ClassManagementDB/get_classes.php?professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Classes response:', result);
        
        if (result.success) {
          setClasses(result.classes);
        } else {
          console.error('Error fetching classes:', result.message);
          setClasses([]);
        }
      } else {
        throw new Error(`Failed to fetch classes: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Fetch announcements from database - UPDATED to handle actual backend response
  const fetchAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const professorId = getProfessorId();
      
      if (!professorId) {
        console.error('No professor ID found');
        setLoadingAnnouncements(false);
        return;
      }
      
      console.log('Fetching announcements for:', { professorId, subjectCode });
      
      // Build URL with parameters
      const url = `https://tracked.6minds.site/Professor/AnnouncementDB/get_announcements.php?professor_ID=${professorId}${subjectCode ? `&classroom_ID=${subjectCode}` : ''}`;
      
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      
      console.log('Announcements response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched announcements:', result);
        
        if (result.success) {
          // Transform backend data to match frontend expectations
          const transformedAnnouncements = result.announcements.map(announcement => ({
            ...announcement,
            // Map 'description' from backend to 'instructions' for frontend
            instructions: announcement.description,
            // Ensure all required fields are present
            isRead: false, // Default to unread
            // Use the actual fields from backend response
            id: announcement.id || announcement.announcement_ID,
            subject: announcement.subject,
            title: announcement.title,
            postedBy: announcement.postedBy || announcement.posted_by,
            datePosted: announcement.datePosted,
            deadline: announcement.deadline,
            link: announcement.link || '#',
            section: announcement.section,
            subject_code: announcement.subject_code
          }));
          
          setAnnouncements(transformedAnnouncements);
        } else {
          console.error('Error fetching announcements:', result.message);
          setAnnouncements([]);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch announcements:', errorText);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Get unique subjects from classes
  const getUniqueSubjects = () => {
    // Use a Map to ensure uniqueness by subject_code while keeping the first occurrence
    const subjectMap = new Map();
    
    classes.forEach(classItem => {
      if (!subjectMap.has(classItem.subject_code)) {
        subjectMap.set(classItem.subject_code, {
          subject_code: classItem.subject_code,
          subject_name: classItem.subject,
          section: classItem.section
        });
      }
    });
    
    return Array.from(subjectMap.values());
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
    if (filterOption === "Newest") {
      // Sort by date posted (newest first)
      return new Date(b.datePosted) - new Date(a.datePosted);
    }
    // For other filters, maintain original order or sort by unread first
    if (filterOption === "All") {
      // Put unread announcements first
      if (a.isRead && !b.isRead) return 1;
      if (!a.isRead && b.isRead) return -1;
      return new Date(b.datePosted) - new Date(a.datePosted);
    }
    return 0;
  });

  const handlePost = async () => {
    // Validate required fields
    if (!selectedSubject || !title || !description) {
      alert("Please fill in all required fields (Subject, Title, and Description)");
      return;
    }

    // Validate deadline (should not be in the past)
    if (deadline) {
      const selectedDate = new Date(deadline);
      const now = new Date();
      if (selectedDate < now) {
        alert("Deadline cannot be in the past. Please select a current or future date.");
        return;
      }
    }

    const professorId = getProfessorId();
    if (!professorId) {
      alert("Error: Professor ID not found");
      return;
    }

    console.log('Posting announcement with data:', {
      professor_ID: professorId,
      classroom_ID: selectedSubject,
      title: title,
      description: description,
      link: link || null,
      deadline: deadline
    });

    try {
      // ✅ NEW: Set posting state
      setPostingAnnouncement(true);

      if (editingAnnouncement) {
        // Update existing announcement
        const updateData = {
          announcement_ID: editingAnnouncement.id,
          professor_ID: professorId,
          title: title,
          description: description,
          link: link || null,
          deadline: deadline
        };

        console.log('Sending UPDATE data:', updateData);

        const response = await fetch('https://tracked.6minds.site/Professor/AnnouncementDB/update_announcement.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        console.log('Update response status:', response.status);
        
        const result = await response.json();
        console.log('Update response:', result);

        if (result.success) {
          // Refresh announcements
          await fetchAnnouncements();
          resetForm();
          setShowModal(false);
        } else {
          alert('Error updating announcement: ' + result.message);
        }
      } else {
        // Create new announcement
        const postData = {
          professor_ID: professorId,
          classroom_ID: selectedSubject,
          title: title,
          description: description,
          link: link || null,
          deadline: deadline
        };

        console.log('Sending CREATE data:', postData);

        const response = await fetch('https://tracked.6minds.site/Professor/AnnouncementDB/create_announcement.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData)
        });

        console.log('Create response status:', response.status);
        
        const result = await response.json();
        console.log('Create response:', result);

        if (result.success) {
          // Refresh announcements
          await fetchAnnouncements();
          resetForm();
          setShowModal(false);
        } else {
          alert('Error posting announcement: ' + result.message);
        }
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
      alert('Error posting announcement. Please try again.');
    } finally {
      // ✅ NEW: Reset posting state
      setPostingAnnouncement(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    // Reset to current class subject code instead of empty string
    setSelectedSubject(subjectCode || "");
    setTitle("");
    setDescription("");
    setLink("");
    setDeadline("");
    setEditingAnnouncement(null);
  };

  // Handle delete announcement
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const professorId = getProfessorId();
      
      const response = await fetch('https://tracked.6minds.site/Professor/AnnouncementDB/delete_announcement.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          announcement_ID: id,
          professor_ID: professorId
        })
      });

      const result = await response.json();

      if (result.success) {
        // Refresh announcements
        fetchAnnouncements();
      } else {
        alert('Error deleting announcement: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Error deleting announcement. Please try again.');
    }
  };

  // Handle edit announcement
  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    
    // Use the announcement's subject code directly
    setSelectedSubject(announcement.subject_code || subjectCode);
    setTitle(announcement.title);
    setDescription(announcement.instructions || announcement.description);
    setLink(announcement.link === "#" ? "" : announcement.link);
    
    // Convert deadline back to datetime-local format if it exists
    if (announcement.deadline && announcement.deadline !== "No deadline") {
      try {
        // Parse the formatted deadline back to datetime-local format
        const deadlineParts = announcement.deadline.split(' | ');
        if (deadlineParts.length === 2) {
          const datePart = deadlineParts[0];
          const timePart = deadlineParts[1];
          
          // Parse the formatted date (e.g., "January 20, 2024")
          const date = new Date(datePart);
          if (timePart) {
            const [time, modifier] = timePart.split(' ');
            let [hours, minutes] = time.split(':');
            
            if (modifier === 'pm' && hours !== '12') {
              hours = parseInt(hours) + 12;
            } else if (modifier === 'am' && hours === '12') {
              hours = '00';
            }
            
            date.setHours(parseInt(hours), parseInt(minutes));
          }
          
          setDeadline(date.toISOString().slice(0, 16));
        }
      } catch (error) {
        console.error('Error parsing deadline:', error);
        setDeadline("");
      }
    } else {
      setDeadline("");
    }
    
    setShowModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    resetForm();
    setShowModal(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close filter dropdown
      if (filterDropdownOpen && !event.target.closest('.filter-dropdown')) {
        setFilterDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [filterDropdownOpen]);

  // Debug: Log current state
  useEffect(() => {
    console.log('Current state:', {
      professorId: getProfessorId(),
      subjectCode,
      classInfo,
      announcementsCount: announcements.length,
      classesCount: classes.length,
      loading: {
        overall: loading,
        announcements: loadingAnnouncements,
        classes: loadingClasses,
        classInfo: loadingClassInfo
      }
    });
  }, [loading, loadingAnnouncements, loadingClasses, loadingClassInfo, announcements, classes, classInfo, subjectCode]);

  // Show loading only if all data is still loading
  const isLoading = loading && loadingAnnouncements;

  if (isLoading) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
            <p className="mt-3 text-gray-600">Loading announcements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={AnnouncementIcon}
                alt="Announcement"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
                title="Announcements section"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Announcement
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              Post a class Announcement
            </p>
          </div>

          {/* Subject Information */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo?.subject_code || subjectCode || 'N/A'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'Unknown Subject'}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Section:</span>
                <span>{classInfo?.section || 'Unknown Section'}</span>
              </div>
              <div className="w-full flex justify-end">
                <Link to={"/ClassManagement"}>
                  <img 
                    src={BackButton} 
                    alt="Back to Class Management" 
                    className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity"
                    title="Back to Class Management"
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* ANNOUNCEMENT ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full mt-4 sm:mt-5 gap-3">
            {/* Navigation buttons - Stack on mobile, row on tablet/desktop */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Announcement Button - Full width on mobile, auto on larger */}
              <Link to={`/Class?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button 
                  className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#e6f4ea] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4edd8] transition-all duration-300 cursor-pointer w-full sm:w-auto"
                  title="View class announcements"
                >
                  <img 
                    src={Announcement} 
                    alt="Announcements" 
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span className="sm:inline">Announcement</span>
                </button>
              </Link>

              {/* Classwork, Attendance, Grade and Analytics - Grid on mobile, row on desktop */}
              <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:gap-4 sm:w-auto">
                <Link to={`/ClassworkTab?code=${subjectCode}`} className="min-w-0">
                  <button 
                    className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 bg-[#e6f0ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4e3ff] transition-all duration-300 cursor-pointer w-full"
                    title="Manage classwork and assignments"
                  >
                    <img 
                      src={Classwork} 
                      alt="Classwork" 
                      className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                    />
                    <span className="whitespace-nowrap truncate">Class work</span>
                  </button>
                </Link>

                <Link to={`/Attendance?code=${subjectCode}`} className="sm:flex-initial">
                  <button 
                    className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#fff4e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#ffebd4] transition-all duration-300 cursor-pointer w-full sm:w-auto"
                    title="Take and view attendance"
                  >
                    <img 
                      src={Attendance} 
                      alt="Attendance" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Attendance</span>
                  </button>
                </Link>

                {/* NEW: Grade Button */}
                <Link to={`/GradeTab?code=${subjectCode}`} className="sm:flex-initial">
                  <button 
                    className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#ffe6e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#ffd4d4] transition-all duration-300 cursor-pointer w-full sm:w-auto"
                    title="Manage student grades"
                  >
                    <img 
                      src={GradeIcon} 
                      alt="Grades" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Grade</span>
                  </button>
                </Link>

                {/* NEW: Analytics Button */}
                <Link to={`/AnalyticsTab?code=${subjectCode}`} className="sm:flex-initial">
                  <button 
                    className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#f0e6ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#e6d4ff] transition-all duration-300 cursor-pointer w-full sm:w-auto"
                    title="View class analytics and insights"
                  >
                    <img 
                      src={AnalyticsIcon} 
                      alt="Analytics" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Analytics</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Action buttons - Icons only on mobile/tablet, unchanged on desktop */}
            <div className="flex items-center gap-2 justify-end sm:justify-start mt-3 sm:mt-0">
              <Link to={`/StudentList?code=${subjectCode}`}>
                <button 
                  className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-2"
                  title="View and manage class list"
                >
                  <img 
                    src={ClassManagementIcon} 
                    alt="Class Management" 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                  />
                </button>
              </Link>

              <button 
                onClick={() => setShowModal(true)}
                className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-2"
                title="Create new announcement"
              >
                <img 
                  src={Add} 
                  alt="Add Announcement" 
                  className="h-5 w-5 sm:h-6 sm:w-6" 
                />
              </button>
            </div>
          </div>

          {/* ANNOUNCEMENT FILTER AND SEARCH SECTION */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6 mt-4 sm:mt-5">
            {/* Filter dropdown */}
            <div className="relative sm:flex-initial filter-dropdown">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="flex items-center justify-between w-full sm:w-auto font-bold px-4 py-2.5 bg-white rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] active:border-[#00874E] transition-all duration-200 text-sm sm:text-base sm:min-w-[160px] cursor-pointer touch-manipulation"
                title="Filter announcements by status"
              >
                <span>{filterOption}</span>
                <img
                  src={ArrowDown}
                  alt="Filter options"
                  className={`ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${filterDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown options */}
              {filterDropdownOpen && (
                <div className="absolute top-full mt-2 bg-white rounded-md w-full sm:min-w-[200px] shadow-xl border border-gray-200 z-20 overflow-hidden">
                  {["All", "Unread", "Read", "Newest"].map((option) => (
                    <button
                      key={option}
                      className={`block px-4 py-2.5 w-full text-left hover:bg-gray-100 active:bg-gray-200 text-sm sm:text-base transition-colors duration-150 cursor-pointer touch-manipulation ${
                        filterOption === option ? 'bg-gray-50 font-semibold' : ''
                      }`}
                      onClick={() => {
                        setFilterOption(option);
                        setFilterDropdownOpen(false);
                      }}
                      title={`Show ${option.toLowerCase()} announcements`}
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
                  title="Search announcements by title, subject, or content"
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  title="Search announcements"
                >
                  <img
                    src={Search}
                    alt="Search"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ANNOUNCEMENT CARDS SECTION */}
          <div className="space-y-4 sm:space-y-5">
            {loadingAnnouncements ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
                <p className="mt-3 text-gray-600">Loading announcements...</p>
              </div>
            ) : sortedAnnouncements.length > 0 ? (
              sortedAnnouncements.map((announcement) => (
                <AnnouncementCard
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
                  onEdit={() => handleEdit(announcement)}
                  onDelete={() => handleDelete(announcement.id)}
                  onMarkAsRead={() => handleMarkAsRead(announcement.id)}
                  onMarkAsUnread={() => handleMarkAsUnread(announcement.id)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <img 
                    src={AnnouncementIcon} 
                    alt="No announcements" 
                    className="h-8 w-8 opacity-50"
                  />
                </div>
                <p className="text-gray-500 text-sm sm:text-base">
                  {searchQuery || filterOption !== "All" 
                    ? "No announcements match your search criteria" 
                    : "No announcements found for this class"
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      <NewAnnouncement
        showModal={showModal}
        handleModalClose={handleModalClose}
        editingAnnouncement={editingAnnouncement}
        handlePost={handlePost}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        link={link}
        setLink={setLink}
        deadline={deadline}
        setDeadline={setDeadline}
        getUniqueSubjects={getUniqueSubjects}
        loadingClasses={loadingClasses}
        getCurrentDateTime={getCurrentDateTime}
        currentSubjectCode={subjectCode} // Pass current subject code
        restrictToCurrentSubject={true} // Restrict to current class
        postingAnnouncement={postingAnnouncement} // Pass posting state
      />
    </div>
  );
}