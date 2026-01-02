import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import NewAnnouncement from "../../Components/ProfessorComponents/NewAnnouncement";
import AnnouncementCard from "../../Components/ProfessorComponents/AnnouncementCard";

// ========== IMPORT ASSETS ==========
import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton.svg';
import Add from "../../assets/Add.svg";
import Archive from "../../assets/Archive.svg";
import Attendance from "../../assets/Attendance.svg";
import Announcement from "../../assets/Announcement.svg";
import AnnouncementIcon from "../../assets/Announcement.svg";
import Classwork from "../../assets/Classwork.svg";
import ClassManagementIcon from "../../assets/ClassManagement.svg";
import ArrowDown from "../../assets/ArrowDown.svg";
import SuccessIcon from '../../assets/Success(Green).svg';
import ArchiveWarningIcon from '../../assets/Warning(Yellow).svg';
import Search from "../../assets/Search.svg";
import GradeIcon from "../../assets/Grade.svg";
import AnalyticsIcon from "../../assets/Analytics.svg";
import Copy from "../../assets/Copy.svg";
import SubjectOverview from "../../assets/SubjectOverview.svg";

export default function AnnouncementTab() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
  
  // ANNOUNCEMENT STATES
  const [showModal, setShowModal] = useState(false);
  
  // Modal form states
  const [selectedSubject, setSelectedSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [deadline, setDeadline] = useState("");
  const [originalDeadline, setOriginalDeadline] = useState("");

  // Editing state
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [error, setError] = useState(null);

  // Classes state
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Filter state
  const [filterOption, setFilterOption] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Class info state
  const [classInfo, setClassInfo] = useState(null);
  const [loadingClassInfo, setLoadingClassInfo] = useState(true);

  // Posting state
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  // Get professor ID from localStorage
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

  // Get current datetime for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  // Copy subject code to clipboard
  const copySubjectCode = () => {
    const codeToCopy = classInfo?.subject_code || subjectCode;
    if (codeToCopy && codeToCopy !== 'N/A') {
      navigator.clipboard.writeText(codeToCopy)
        .then(() => {
          const copyButtons = document.querySelectorAll('.copy-text');
          copyButtons.forEach(button => {
            button.textContent = 'Copied!';
            setTimeout(() => {
              button.textContent = 'Copy';
            }, 2000);
          });
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  // Fetch all data independently
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [subjectCode]);

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
          setSelectedSubject(subjectCode);
        } else {
          console.error('Error fetching class details:', result.message);
          setClassInfo({
            subject_code: subjectCode,
            subject: 'Unknown Subject',
            section: 'Unknown Section'
          });
        }
      } else {
        console.error('Failed to fetch class details, status:', response.status);
        setClassInfo({
          subject_code: subjectCode,
          subject: 'Unknown Subject',
          section: 'Unknown Section'
        });
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
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

  // Fetch announcements from database - FIXED VERSION
  const fetchAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const professorId = getProfessorId();
      
      if (!professorId) {
        console.error('No professor ID found');
        setLoadingAnnouncements(false);
        return;
      }
      
      console.log('Fetching announcements for professor:', professorId, 'subject:', subjectCode);
      
      // Build URL - always include classroom_ID if available
      let url = `https://tracked.6minds.site/Professor/AnnouncementDB/get_announcements.php?professor_ID=${professorId}`;
      
      if (subjectCode) {
        url += `&classroom_ID=${subjectCode}`;
      }
      
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      
      console.log('Announcements response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched announcements raw:', result);
        
        if (result.success && result.announcements) {
          // Transform backend data to match frontend expectations
          const transformedAnnouncements = result.announcements.map(announcement => {
            // Load read status from localStorage
            const savedReadStatus = localStorage.getItem(`announcement_${announcement.id}_read`);
            const isRead = savedReadStatus === 'true';
            
            return {
              id: announcement.id || announcement.announcement_ID,
              subject: announcement.subject || 'Unknown Subject',
              title: announcement.title || 'No Title',
              postedBy: announcement.postedBy || 'Unknown Professor',
              datePosted: announcement.datePosted || announcement.created_at,
              deadline: announcement.deadline || null,
              instructions: announcement.instructions || announcement.description || 'No instructions provided.',
              link: announcement.link || '#',
              section: announcement.section || 'Unknown Section',
              subject_code: announcement.subject_code || subjectCode,
              isRead: isRead,
              updated_at: announcement.updated_at || announcement.datePosted
            };
          });
          
          console.log('Transformed announcements:', transformedAnnouncements);
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
      setError('Failed to fetch announcements. Please check your connection.');
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Get unique subjects from classes
  const getUniqueSubjects = () => {
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
  const handleMarkAsRead = async (announcementId) => {
    const professorId = getProfessorId();
    
    // Update local state
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements.map(announcement => 
        announcement.id === announcementId 
          ? { ...announcement, isRead: true }
          : announcement
      )
    );
    
    // Save to localStorage for persistence
    localStorage.setItem(`announcement_${announcementId}_read`, 'true');
    
    // Optional: Send to backend
    try {
      await fetch('https://tracked.6minds.site/Professor/AnnouncementDB/update_read_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          announcement_id: announcementId,
          professor_id: professorId,
          is_read: 1
        })
      });
    } catch (error) {
      console.error('Error updating read status:', error);
    }
  };

  // Handle marking announcement as unread
  const handleMarkAsUnread = async (announcementId) => {
    const professorId = getProfessorId();
    
    // Update local state
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements.map(announcement => 
        announcement.id === announcementId 
          ? { ...announcement, isRead: false }
          : announcement
      )
    );
    
    // Save to localStorage for persistence
    localStorage.setItem(`announcement_${announcementId}_read`, 'false');
    
    // Optional: Send to backend
    try {
      await fetch('https://tracked.6minds.site/Professor/AnnouncementDB/update_read_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          announcement_id: announcementId,
          professor_id: professorId,
          is_read: 0
        })
      });
    } catch (error) {
      console.error('Error updating read status:', error);
    }
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

    // Validate deadline if it's being changed when editing
    if (deadline) {
      const selectedDate = new Date(deadline + 'Z'); // Treat as UTC
      const now = new Date();
      
      const isSameDeadline = editingAnnouncement && 
                            originalDeadline && 
                            deadline === originalDeadline;
      
      if (!isSameDeadline && selectedDate < now) {
        alert("Deadline cannot be in the past. Please select a current or future date.");
        return;
      }
    }

    const professorId = getProfessorId();
    if (!professorId) {
      alert("Error: Professor ID not found");
      return;
    }

    console.log('=== POSTING ANNOUNCEMENT DEBUG ===');
    console.log('Deadline from form:', deadline);
    console.log('Treating as UTC time');
    console.log('Is editing?', !!editingAnnouncement);

    try {
      setPostingAnnouncement(true);

      if (editingAnnouncement) {
        // Update existing announcement
        const updateData = {
          announcement_ID: editingAnnouncement.id,
          professor_ID: professorId,
          title: title,
          description: description,
          link: link || null,
          deadline: deadline || null // Send as-is (YYYY-MM-DDTHH:mm format)
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
          deadline: deadline || null // Send as-is (YYYY-MM-DDTHH:mm format)
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
      setPostingAnnouncement(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setSelectedSubject(subjectCode || "");
    setTitle("");
    setDescription("");
    setLink("");
    setDeadline("");
    setOriginalDeadline("");
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
        fetchAnnouncements();
      } else {
        alert('Error deleting announcement: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Error deleting announcement. Please try again.');
    }
  };

  // Handle edit announcement - FIXED VERSION
  const handleEdit = (announcement) => {
    console.log('=== EDITING ANNOUNCEMENT DEBUG ===');
    console.log('Original deadline from DB:', announcement.deadline);
    
    setEditingAnnouncement(announcement);
    
    setSelectedSubject(announcement.subject_code || subjectCode);
    setTitle(announcement.title);
    setDescription(announcement.instructions || announcement.description);
    setLink(announcement.link === "#" ? "" : announcement.link);
    
    let formattedDeadline = "";
    if (announcement.deadline && announcement.deadline !== "No deadline") {
      try {
        const deadlineDate = new Date(announcement.deadline);
        if (!isNaN(deadlineDate.getTime())) {
          // Use UTC methods to get the UTC time for the form
          const year = deadlineDate.getUTCFullYear();
          const month = String(deadlineDate.getUTCMonth() + 1).padStart(2, '0');
          const day = String(deadlineDate.getUTCDate()).padStart(2, '0');
          const hours = String(deadlineDate.getUTCHours()).padStart(2, '0');
          const minutes = String(deadlineDate.getUTCMinutes()).padStart(2, '0');
          
          formattedDeadline = `${year}-${month}-${day}T${hours}:${minutes}`;
          
          console.log('Debug info:', {
            dbDeadline: announcement.deadline,
            parsedDate: deadlineDate.toISOString(),
            utcHours: deadlineDate.getUTCHours(),
            utcMinutes: deadlineDate.getUTCMinutes(),
            formattedForForm: formattedDeadline,
            expectedCardDisplay: `Card will show: Jan ${day}, ${year} at ${hours}:${minutes}`
          });
        }
      } catch (error) {
        console.error('Error parsing deadline:', error);
      }
    }
    
    console.log('Formatted deadline for form:', formattedDeadline);
    console.log('=== END DEBUG ===');
    
    setDeadline(formattedDeadline);
    setOriginalDeadline(formattedDeadline);
    
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
      sortedCount: sortedAnnouncements.length,
      loading: {
        overall: loading,
        announcements: loadingAnnouncements,
        classes: loadingClasses,
        classInfo: loadingClassInfo
      },
      error,
      filterOption,
      searchQuery
    });
  }, [loading, loadingAnnouncements, loadingClasses, loadingClassInfo, announcements, classes, classInfo, subjectCode, error, filterOption, searchQuery]);

  // Show loading only if announcements are still loading
  const isLoading = loadingAnnouncements || loading;

  if (isLoading && announcements.length === 0) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 text-center text-[#FFFFFF]">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00A15D] border-r-transparent"></div>
            <p className="mt-3 text-[#FFFFFF]/80">Loading announcements...</p>
            {error && <p className="mt-2 text-[#FF5252] text-sm">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER ACTION BUTTON HELPER ==========
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

  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* ========== MAIN CONTENT ========== */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          
          {/* ========== PAGE HEADER ========== */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img
                src={AnnouncementIcon}
                alt="Announcement"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-2"
              />
              <h1 className="font-bold text-xl lg:text-2xl text-[#FFFFFF]">
                Announcement
              </h1>
            </div>
            <p className="text-sm lg:text-base text-[#FFFFFF]/80">
              Post a class Announcement
            </p>
          </div>

          {/* ========== SUBJECT INFORMATION ========== */}
          <div className="flex flex-col gap-1 text-sm text-[#FFFFFF]/80 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT CODE:</span>
              <div className="flex items-center gap-2">
                <span>{classInfo?.subject_code || subjectCode || 'N/A'}</span>
                {(classInfo?.subject_code || subjectCode) && (classInfo?.subject_code !== 'N/A' && subjectCode !== 'N/A') && (
                  <button
                    onClick={copySubjectCode}
                    className="p-1 text-[#FFFFFF]/60 hover:text-[#FFFFFF] hover:bg-[#15151C] rounded transition-colors cursor-pointer flex items-center gap-1"
                    title="Copy subject code"
                  >
                    <img 
                      src={Copy} 
                      alt="Copy" 
                      className="w-4 h-4" 
                    />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'Unknown Subject'}</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{classInfo?.section || 'Unknown Section'}</span>
              </div>
              <div className="flex justify-end">
                <Link to={"/ClassManagement"}>
                  <img 
                    src={BackButton} 
                    alt="Back to Class Management" 
                    className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity"
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-[#FFFFFF]/30 mb-4" />

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {/* NEW: Subject Overview Button */}
              {renderActionButton("/SubjectOverviewProfessor", SubjectOverview, "Subject Overview", false, "bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30 hover:bg-[#FF5252]/30")}
              
              {/* Announcement Button - Active */}
              {renderActionButton("/Class", Announcement, "Announcements", true)}
              
              {/* Classwork Button */}
              {renderActionButton("/ClassworkTab", Classwork, "Class Work", false, "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30")}
              
              {/* Attendance Button */}
              {renderActionButton("/Attendance", Attendance, "Attendance", false, "bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30")}
              
              {/* Grade Button */}
              {renderActionButton("/GradeTab", GradeIcon, "Grade", false, "bg-[#A15353]/20 text-[#A15353] border-[#A15353]/30 hover:bg-[#A15353]/30")}
              
              {/* Analytics Button */}
              {renderActionButton("/AnalyticsTab", AnalyticsIcon, "Analytics", false, "bg-[#B39DDB]/20 text-[#B39DDB] border-[#B39DDB]/30 hover:bg-[#B39DDB]/30")}
            </div>
            
            {/* ========== ICON BUTTONS ========== */}
            <div className="flex items-center gap-2 justify-end sm:justify-start">
              {/* Class Management Button */}
              <Link to={`/StudentList?code=${subjectCode}`}>
                <button 
                  className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 flex-shrink-0 cursor-pointer"
                  title="View and manage class list"
                >
                  <img 
                    src={ClassManagementIcon} 
                    alt="Class Management" 
                    className="h-4 w-4" 
                  />
                </button>
              </Link>

              {/* Add Announcement Button */}
              <button 
                onClick={() => setShowModal(true)}
                className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 flex-shrink-0 cursor-pointer"
                title="Create new announcement"
              >
                <img 
                  src={Add} 
                  alt="Add Announcement" 
                  className="h-4 w-4" 
                />
              </button>
            </div>
          </div>

          {/* ========== FILTER & SEARCH ========== */}
          <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
            {/* Filter dropdown */}
            <div className="relative filter-dropdown sm:w-36">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 bg-[#15151C] rounded border transition-all duration-200 text-xs font-medium cursor-pointer ${
                  filterOption !== "All" 
                    ? 'border-[#767EE0] bg-[#767EE0]/10 text-[#767EE0]' 
                    : 'border-[#FFFFFF]/10 hover:border-[#767EE0] text-[#FFFFFF]'
                }`}
                title="Filter announcements by status"
              >
                <span>{filterOption}</span>
                <img
                  src={ArrowDown}
                  alt="Filter options"
                  className={`ml-1.5 h-2.5 w-2.5 transition-transform duration-200 ${
                    filterDropdownOpen ? 'rotate-180' : ''
                  } ${
                    filterOption !== "All" ? 'invert-[0.5] sepia-[1] saturate-[5] hue-rotate-[200deg]' : ''
                  }`}
                />
              </button>

              {/* Dropdown options */}
              {filterDropdownOpen && (
                <div className="absolute top-full mt-1 bg-[#15151C] rounded w-full shadow-xl border border-[#FFFFFF]/10 z-20 overflow-hidden">
                  {["All", "Unread", "Read", "Newest"].map((option) => (
                    <button
                      key={option}
                      className={`block px-2.5 py-1.5 w-full text-left hover:bg-[#23232C] text-xs transition-colors cursor-pointer ${
                        filterOption === option 
                          ? 'bg-[#767EE0]/10 text-[#767EE0] border-l-2 border-[#767EE0] font-semibold' 
                          : 'text-[#FFFFFF]/80'
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
                  className="w-full h-9 rounded px-2.5 py-1.5 pr-9 outline-none bg-[#15151C] text-xs text-[#FFFFFF] border border-[#FFFFFF]/10 focus:border-[#767EE0] transition-colors placeholder:text-[#FFFFFF]/40"
                  title="Search announcements by title, subject, or content"
                />
                <button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FFFFFF]/60"
                  title="Search announcements"
                >
                  <img
                    src={Search}
                    alt="Search"
                    className="h-3.5 w-3.5"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Error message display */}
          {error && (
            <div className="mb-4 p-3 bg-[#FF5252]/10 border border-[#FF5252] rounded">
              <p className="text-[#FFFFFF] text-sm">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  fetchAnnouncements();
                }}
                className="mt-2 text-[#FF5252] font-medium hover:underline text-xs cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* ========== ANNOUNCEMENT CARDS SECTION ========== */}
          <div className="space-y-4">
            {loadingAnnouncements ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00A15D] border-r-transparent"></div>
                <p className="mt-3 text-[#FFFFFF]/80">Loading announcements...</p>
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
                  announcementId={announcement.id}
                  professorId={getProfessorId()}
                  updatedAt={announcement.updated_at}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-[#15151C] flex items-center justify-center">
                  <img 
                    src={AnnouncementIcon} 
                    alt="No announcements" 
                    className="h-10 w-10 opacity-50"
                  />
                </div>
                <p className="text-[#FFFFFF]/60 text-base mb-2">
                  {searchQuery || filterOption !== "All" 
                    ? "No announcements match your search criteria" 
                    : "No announcements found for this class"
                  }
                </p>
                <p className="text-[#FFFFFF]/40 text-sm">
                  {searchQuery || filterOption !== "All" 
                    ? "Try adjusting your search or filter options." 
                    : "Start by creating your first announcement."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== ANNOUNCEMENT MODAL ========== */}
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
        currentSubjectCode={subjectCode}
        restrictToCurrentSubject={true}
        postingAnnouncement={postingAnnouncement}
        originalDeadline={originalDeadline}
      />
    </div>
  );
}