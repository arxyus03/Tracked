import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import StudentActivityDetails from "../../Components/StudentActivityDetails";

import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton(Light).svg';
import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Search from "../../assets/Search.svg";
import StudentsIcon from "../../assets/ClassManagement(Light).svg";
import Announcement from "../../assets/Announcement(Light).svg";
import Classwork from "../../assets/Classwork(Light).svg";
import Attendance from "../../assets/Attendance(Light).svg";
import Analytics from "../../assets/Analytics(Light).svg";

// Student Activity Card Component
const StudentActivityCard = ({ activity, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString || dateString === "No deadline") return "No deadline";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getPostedTime = (createdAt) => {
    if (!createdAt) return "Recently";
    
    try {
      const created = new Date(createdAt);
      const now = new Date();
      
      // Use UTC timestamps for accurate comparison
      const diffMs = now.getTime() - created.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffYears = Math.floor(diffDays / 365);
      
      if (diffSeconds < 60) return `${diffSeconds}s ago`;
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 365) return `${diffDays}d ago`;
      return `${diffYears}y ago`;
    } catch {
      return "Recently";
    }
  };

  // Check if deadline is urgent (within 24 hours or past due)
  const isDeadlineUrgent = (deadline) => {
    if (!deadline || deadline === "No deadline") return false;
    
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      
      // Compare UTC timestamps directly
      const timeDiff = deadlineDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      return hoursDiff <= 24 && hoursDiff > 0; // Urgent if within 24 hours but not passed
    } catch {
      return false;
    }
  };

  // Check if deadline is past due
  const isDeadlinePassed = (deadline) => {
    if (!deadline || deadline === "No deadline") return false;
    
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      return deadlineDate.getTime() < now.getTime();
    } catch {
      return false;
    }
  };

  // Get activity type color
  const getActivityTypeColor = (type) => {
    const colors = {
      'Assignment': 'bg-blue-100 text-blue-800',
      'Quiz': 'bg-purple-100 text-purple-800',
      'Activity': 'bg-green-100 text-green-800',
      'Project': 'bg-orange-100 text-orange-800',
      'Laboratory': 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Get student status
  const getStudentStatus = (activity) => {
    const isSubmitted = activity.submitted === 1 || activity.submitted === true || activity.submitted === '1';
    const isLate = activity.late === 1 || activity.late === true || activity.late === '1';
    
    // Check if deadline is overdue and not submitted - using UTC
    let isOverdue = false;
    if (activity.deadline && activity.deadline !== "No deadline") {
      try {
        const deadlineDate = new Date(activity.deadline);
        const now = new Date();
        isOverdue = deadlineDate.getTime() < now.getTime() && !isSubmitted;
      } catch {
        // If date parsing fails, skip overdue check
      }
    }
    
    if (isSubmitted && isLate) return { status: "Late", color: "bg-yellow-100 text-yellow-800" };
    if (isSubmitted) return { status: "Submitted", color: "bg-green-100 text-green-800" };
    if (isOverdue) return { status: "Missed", color: "bg-red-100 text-red-800" };
    return { status: "Assigned", color: "bg-blue-100 text-blue-800" };
  };

  // Check if professor has submitted (static for now - you can replace this with actual data from backend)
  const hasProfessorSubmission = activity.id % 2 === 0; // Example: every other activity has professor submission

  const statusInfo = getStudentStatus(activity);

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onViewDetails(activity)}
    >
      <div className="flex items-start justify-between">
        {/* Left Section - Activity Info */}
        <div className="flex-1 min-w-0">
          {/* Top row with activity type, task number, status, and posted time */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 ${getActivityTypeColor(activity.activity_type)} text-xs font-medium rounded`}>
                {activity.activity_type}
              </span>
              <span className="text-sm text-gray-500 font-bold">#{activity.task_number}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}>
                {statusInfo.status}
              </span>
            </div>
            {/* Posted time moved to upper right */}
            <div className="text-xs text-gray-500 text-right">
              <div>{getPostedTime(activity.created_at)}</div>
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 text-lg mb-2 truncate">
            {activity.title}
          </h3>
          
          <div className="space-y-1 text-sm text-gray-600">
            {/* Deadline with simple red text for urgency */}
            <div className="flex items-center gap-2">
              <span className="font-medium">Deadline:</span>
              <span className={`font-medium ${
                isDeadlinePassed(activity.deadline) || isDeadlineUrgent(activity.deadline) 
                  ? 'text-red-600 font-bold' 
                  : 'text-gray-600'
              }`}>
                {formatDate(activity.deadline)}
              </span>
            </div>

            {/* Points */}
            {activity.points > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-bold">Points:</span>
                <span className="text-green-600 font-bold">{activity.points} pts</span>
              </div>
            )}
          </div>

          {/* Professor's Submission Status - Quick Overview */}
          <div className={`mt-3 p-2 rounded-lg border ${
            hasProfessorSubmission 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${
                  hasProfessorSubmission ? 'text-green-700' : 'text-blue-700'
                }`}>
                  Professor's Submission of your work:
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  hasProfessorSubmission 
                    ? 'bg-green-100 text-green-800 font-semibold' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {hasProfessorSubmission ? 'Available' : 'Pending'}
                </span>
              </div>
              {hasProfessorSubmission && (
                <span className="text-green-600 text-xs flex items-center gap-1">
                </span>
              )}
            </div>
            <p className="text-xs mt-1 text-gray-600">
              {hasProfessorSubmission 
                ? 'Professor has uploaded your work for reference' 
                : 'Waiting for professor to upload your work'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SubjectSchoolWorksStudent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
  const [activities, setActivities] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  
  // Filter and Search states
  const [filterOption, setFilterOption] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Student images state
  const [studentImages, setStudentImages] = useState({});

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

  // Fetch activities after classInfo and studentId are available
  useEffect(() => {
    if (classInfo && studentId) {
      fetchActivities();
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

  const fetchActivities = async () => {
    if (!studentId) return;
    
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_activities_student.php?subject_code=${subjectCode}&student_id=${studentId}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched activities result:', result);
        if (result.success) {
          setActivities(result.activities);
        } else {
          console.error('Error fetching activities:', result.message);
        }
      } else {
        console.error('HTTP error fetching activities:', response.status);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (activityId, file) => {
    if (!studentId) {
      alert("Student ID not found. Please log in again.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('activity_id', activityId);
      formData.append('student_id', studentId);
      formData.append('image', file);

      const response = await fetch('https://tracked.6minds.site/Student/SubjectDetailsStudentDB/upload_activity_image.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Create a local URL for the uploaded image
        const imageUrl = URL.createObjectURL(file);
        const newImage = {
          id: Date.now(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: imageUrl,
          uploadDate: new Date().toISOString()
        };

        setStudentImages(prev => ({
          ...prev,
          [activityId]: newImage
        }));

        alert('Image uploaded successfully!');
      } else {
        alert('Error uploading image: ' + result.message);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    }
  };

  // Handle view details
  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setDetailsModalOpen(true);
  };

  // Filter activities based on filter option and search query
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        activity.task_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filterOption !== "All") {
      // Filter by activity type instead of status
      matchesFilter = activity.activity_type === filterOption;
    }
    
    return matchesSearch && matchesFilter;
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

  // Render empty state when no activities
  const renderEmptyState = () => (
    <div className="col-span-full text-center py-8 sm:py-12 lg:py-16">
      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-4 sm:mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <img 
          src={Classwork} 
          alt="No activities" 
          className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 opacity-50" 
        />
      </div>
      <p className="text-gray-500 text-sm sm:text-base lg:text-lg mb-2">
        {searchQuery || filterOption !== "All" 
          ? "No activities match your search criteria" 
          : "No activities available yet."
        }
      </p>
      <p className="text-gray-400 text-xs sm:text-sm lg:text-base">
        {searchQuery || filterOption !== "All" 
          ? "Try adjusting your search or filter options." 
          : "Check back later for new activities from your professor."
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
          
          {/* Page Header */}
          <div className="mb-4 sm:mb-4">
            <div className="flex items-center mb-2">
              <img
                src={Classwork}
                alt="School Works"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                School Works
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              Manage your academic activities and submissions
            </p>
          </div>

          {/* Subject Information */}
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
              {/* Class Announcements Button*/}
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

          {/* Filter and Search Section */}
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

                {/* Dropdown options */}
                {filterDropdownOpen && (
                  <div className="absolute top-full mt-2 bg-white rounded-md w-full sm:min-w-[200px] shadow-xl border border-gray-200 z-20 overflow-hidden">
                    {["All", "Assignment", "Quiz", "Activity", "Project", "Laboratory"].map((option) => (
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
                    placeholder="Search activities..."
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

          {/* ACTIVITY CARDS - Updated with new design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4 sm:mt-5">
            {filteredActivities.length === 0 ? (
              renderEmptyState()
            ) : (
              filteredActivities.map((activity) => (
                <StudentActivityCard
                  key={activity.id}
                  activity={activity}
                  onViewDetails={handleViewDetails}
                  studentImages={studentImages}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Student Activity Details Modal */}
      <StudentActivityDetails
        activity={selectedActivity}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onImageUpload={handleImageUpload}
        studentImages={studentImages}
      />
    </div>
  );
}