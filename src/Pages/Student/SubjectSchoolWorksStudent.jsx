import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import StudentActivityDetails from "../../Components/StudentComponents/StudentActivityDetails";

// ========== IMPORT ASSETS ==========
import BackButton from '../../assets/BackButton.svg';
import ArrowDown from "../../assets/ArrowDown.svg";
import Search from "../../assets/Search.svg";
import StudentsIcon from "../../assets/StudentList.svg";
import Announcement from "../../assets/Announcement.svg";
import Classwork from "../../assets/Classwork.svg";
import Attendance from "../../assets/Attendance.svg";
import Analytics from "../../assets/Analytics.svg";
import DeadlineIcon from "../../assets/Deadline.svg";
import GradeIcon from "../../assets/Points.svg";
import FileIcon from "../../assets/File.svg"; // Changed from Photo.svg to File.svg
import SubjectOverview from "../../assets/SubjectOverview.svg";
import TimeIcon from "../../assets/Clock.svg"; // Added time icon

// ========== TIME INDICATOR HELPER FUNCTION ==========
const getTimeAgo = (createdAt) => {
  if (!createdAt) return "";
  
  try {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now - createdDate) / 1000);
    
    // If the date is in the future or invalid, return empty
    if (diffInSeconds < 0 || isNaN(diffInSeconds)) return "";
    
    // Calculate time differences
    const seconds = diffInSeconds;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44); // Average days in month
    const years = Math.floor(days / 365.25); // Account for leap years
    
    if (years > 0) return `${years}y`;
    if (months > 0) return `${months}mo`;
    if (weeks > 0) return `${weeks}w`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    if (seconds >= 0) return `${seconds}s`;
    
    return "";
  } catch (error) {
    console.error("Error calculating time ago:", error);
    return "";
  }
};

// ========== STUDENT ACTIVITY CARD COMPONENT ==========
const StudentActivityCard = ({ activity, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString || dateString === "No deadline") return "No deadline";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const isDeadlineUrgent = (deadline) => {
    if (!deadline || deadline === "No deadline") return false;
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const timeDiff = deadlineDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      return hoursDiff <= 24 && hoursDiff > 0;
    } catch {
      return false;
    }
  };

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

  const getActivityTypeColor = (type) => {
    const colors = {
      'Assignment': 'bg-[#767EE0]/20 text-[#767EE0]',
      'Quiz': 'bg-[#B39DDB]/20 text-[#B39DDB]',
      'Activity': 'bg-[#00A15D]/20 text-[#00A15D]',
      'Project': 'bg-[#FFA600]/20 text-[#FFA600]',
      'Laboratory': 'bg-[#A15353]/20 text-[#A15353]',
      'Exam': 'bg-[#A15353]/20 text-[#A15353]', // Added Exam with same color as Laboratory
    };
    return colors[type] || 'bg-[#FFFFFF]/10 text-[#FFFFFF]/80';
  };

  const getStudentStatus = (activity) => {
    const isSubmitted = activity.submitted === 1 || activity.submitted === true || activity.submitted === '1';
    const isLate = activity.late === 1 || activity.late === true || activity.late === '1';
    
    let isOverdue = false;
    if (activity.deadline && activity.deadline !== "No deadline") {
      try {
        const deadlineDate = new Date(activity.deadline);
        const now = new Date();
        isOverdue = deadlineDate.getTime() < now.getTime() && !isSubmitted;
      } catch {}
    }
    
    if (isOverdue) return { 
      status: "Missed", 
      color: "bg-[#A15353]/20 text-[#A15353]", 
      type: "missed" 
    };
    if (isSubmitted) return { 
      status: "", // Empty string for submitted activities
      color: "", // No color needed since we won't display status
      type: "submitted" 
    };
    return { 
      status: "Active", 
      color: "bg-[#767EE0]/20 text-[#767EE0]", 
      type: "active" 
    };
  };

  const hasProfessorSubmission = activity.professor_file_count > 0 || 
                               (activity.professor_file_url && activity.professor_file_url !== null);

  const statusInfo = getStudentStatus(activity);
  const isGraded = activity.grade !== null && activity.grade !== undefined && activity.grade !== '';
  const deadlineColor = isDeadlinePassed(activity.deadline) || isDeadlineUrgent(activity.deadline) 
    ? 'text-[#A15353]' 
    : 'text-[#FFFFFF]/80';
  
  // Round grade to whole number
  const displayGrade = isGraded ? Math.round(parseFloat(activity.grade)) : null;
  const displayPoints = activity.points ? Math.round(parseFloat(activity.points)) : null;

  // Determine card background color based on status
  const getCardBackground = () => {
    if (statusInfo.type === 'missed') return 'bg-[#A15353]/10';
    if (statusInfo.type === 'submitted') return 'bg-[#15151C]';
    return 'bg-[#15151C]';
  };

  // Get grading status for the top label
  const getGradingStatus = () => {
    if (isGraded) {
      return {
        text: 'Graded',
        color: 'bg-[#00A15D]/20 text-[#00A15D]'
      };
    } else if (statusInfo.type === 'submitted') {
      return {
        text: 'Pending Grade',
        color: 'bg-[#FFA600]/20 text-[#FFA600]'
      };
    } else if (statusInfo.type === 'active') {
      return {
        text: 'Not Submitted',
        color: 'bg-[#767EE0]/20 text-[#767EE0]'
      };
    }
    return null;
  };

  const gradingStatus = getGradingStatus();
  const timeAgo = getTimeAgo(activity.created_at);

  return (
    <div 
      className={`rounded-lg border border-[#FFFFFF]/10 p-2.5 hover:shadow-sm transition-all cursor-pointer hover:border-[#00A15D]/30 ${getCardBackground()}`}
      onClick={() => onViewDetails(activity)}
    >
      {/* Header with type+number and status */}
      <div className="flex items-center justify-between mb-1.5">
        <span className={`px-1.5 py-0.5 ${getActivityTypeColor(activity.activity_type)} text-xs font-medium rounded`}>
          {activity.activity_type} #{activity.task_number}
        </span>
        <div className="flex items-center gap-1">
          {/* Reference Materials Icon with Count */}
          <div className="flex items-center gap-1 mr-1">
            <img 
              src={FileIcon} 
              alt="Reference Materials" 
              className={`w-3.5 h-3.5 ${hasProfessorSubmission ? 'opacity-100' : 'opacity-40'}`}
            />
            <span className={`text-xs font-bold ${
              hasProfessorSubmission 
                ? 'text-[#00A15D]' 
                : 'text-[#767EE0]'
            }`}>
              {hasProfessorSubmission ? (activity.professor_file_count || 1) : 0}
            </span>
          </div>
          
          {/* Only show status if it's not empty (i.e., not submitted) */}
          {statusInfo.status && (
            <span className={`px-1 py-0.5 text-xs font-medium rounded ${statusInfo.color}`}>
              {statusInfo.status}
            </span>
          )}
          {gradingStatus && (
            <span className={`px-1 py-0.5 text-xs font-medium rounded ${gradingStatus.color}`}>
              {gradingStatus.text}
            </span>
          )}
        </div>
      </div>
      
      {/* Title - Smaller */}
      <h3 className="font-medium text-[#FFFFFF] text-xs mb-2.5 truncate">
        {activity.title}
      </h3>
      
      {/* Minimal Info Row - Compact */}
      <div className="flex items-center justify-between mb-2">
        {/* Deadline */}
        <div className="flex items-center gap-1">
          <img src={DeadlineIcon} alt="Deadline" className="w-2.5 h-2.5" />
          <span className={`text-xs font-medium ${deadlineColor}`}>
            {formatDate(activity.deadline)}
          </span>
        </div>
        
        {/* Grade Status */}
        <div className="flex items-center gap-1">
          <img src={GradeIcon} alt="Grade" className="w-2.5 h-2.5" />
          {isGraded ? (
            <span className="text-xs font-medium text-[#FFA600]">
              {displayGrade}/{displayPoints}
            </span>
          ) : (
            <span className="text-xs font-medium text-[#FFA600]">
              No Grade
            </span>
          )}
        </div>
      </div>

      {/* Time Indicator - Added below Grade Status */}
      {timeAgo && (
        <div className="flex items-center gap-1 mt-1">
          <img src={TimeIcon} alt="Time" className="w-2.5 h-2.5 opacity-60" />
          <span className="text-[10px] font-medium text-[#FFFFFF]/60">
            {timeAgo} ago
          </span>
        </div>
      )}
    </div>
  );
};

// ========== MAIN COMPONENT ==========
export default function SubjectSchoolWorksStudent() {
  // ========== STATE VARIABLES ==========
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
  const [activities, setActivities] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [filterOption, setFilterOption] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [studentImages, setStudentImages] = useState({});

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
        const id = userData.id || userData.tracked_ID;
        if (id) setStudentId(id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (subjectCode) fetchClassDetails();
  }, [subjectCode]);

  useEffect(() => {
    if (classInfo && studentId) fetchActivities();
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

  const fetchActivities = async () => {
    if (!studentId) return;
    
    try {
      // FIXED: Changed from student_code to subject_code
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_activities_student.php?subject_code=${subjectCode}&student_id=${studentId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) setActivities(result.activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // ========== HANDLER FUNCTIONS ==========
  const handleViewDetails = (activity) => {
    // Get the status of the activity
    const status = getActivityStatus(activity);
    // Create a new activity object with the status included
    const activityWithStatus = {
      ...activity,
      status: status // Add the status to the activity object
    };
    setSelectedActivity(activityWithStatus);
    setDetailsModalOpen(true);
  };

  const getActivityStatus = (activity) => {
    const isSubmitted = activity.submitted === 1 || activity.submitted === true || activity.submitted === '1';
    const isLate = activity.late === 1 || activity.late === true || activity.late === '1';
    
    let isOverdue = false;
    if (activity.deadline && activity.deadline !== "No deadline") {
      try {
        const deadlineDate = new Date(activity.deadline);
        const now = new Date();
        isOverdue = deadlineDate.getTime() < now.getTime() && !isSubmitted;
      } catch {}
    }
    
    if (isSubmitted && isLate) return "submitted";
    if (isSubmitted) return "submitted";
    if (isOverdue) return "missed";
    return "active";
  };

  // ========== FILTER & GROUP LOGIC ==========
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        activity.task_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filterOption !== "All") {
      if (filterOption === "Missed" || filterOption === "Submitted" || filterOption === "Active") {
        matchesFilter = getActivityStatus(activity) === filterOption.toLowerCase();
      } else {
        matchesFilter = activity.activity_type === filterOption;
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  const groupedActivities = {
    active: filteredActivities.filter(activity => getActivityStatus(activity) === "active"),
    submitted: filteredActivities.filter(activity => getActivityStatus(activity) === "submitted"),
    missed: filteredActivities.filter(activity => getActivityStatus(activity) === "missed")
  };

  // ========== RENDER HELPERS ==========
  const renderEmptyState = () => (
    <div className="col-span-full text-center py-6">
      <div className="mx-auto w-12 h-12 mb-3 rounded-full bg-[#15151C] flex items-center justify-center">
        <img 
          src={Classwork} 
          alt="No activities" 
          className="h-6 w-6 opacity-50" 
        />
      </div>
      <p className="text-[#FFFFFF]/60 text-xs mb-0.5">
        {searchQuery || filterOption !== "All" 
          ? "No activities match your search" 
          : "No activities available"
        }
      </p>
      <p className="text-[#FFFFFF]/40 text-[10px]">
        {searchQuery || filterOption !== "All" 
          ? "Try adjusting search or filters" 
          : "Check back later"
        }
      </p>
    </div>
  );

  const renderActionButton = (to, icon, label, active = false, colorClass = "") => (
    <Link to={`${to}?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
      <button className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto ${
        active 
          ? 'bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30' 
          : colorClass
      }`}>
        <img src={icon} alt="" className="h-4 w-4" />
        <span className="sm:inline truncate">{label}</span>
      </button>
    </Link>
  );

  const renderActivitySection = (title, activities, color) => (
    activities.length > 0 && (
      <>
        <div className="mb-2.5 mt-2.5">
          <h3 className="text-sm font-semibold text-[#FFFFFF] flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${color}`}></span>
            {title}
            <span className="text-xs font-normal text-[#FFFFFF]/50 ml-2">
              ({activities.length})
            </span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-3">
          {activities.map((activity) => (
            <StudentActivityCard
              key={activity.id}
              activity={activity}
              onViewDetails={handleViewDetails}
              studentImages={studentImages}
            />
          ))}
        </div>
        <hr className="my-3 border-[#FFFFFF]/10" />
      </>
    )
  );

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 text-center text-[#FFFFFF]">Loading activities...</div>
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
              <img src={Classwork} alt="School Works" className="h-6 w-6 sm:h-7 sm:w-7 mr-2" />
              <h1 className="font-bold text-xl lg:text-2xl text-[#FFFFFF]">School Works</h1>
            </div>
            <p className="text-sm lg:text-base text-[#FFFFFF]/80">Manage your academic activities</p>
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
              {/* New Subject Name Overview Button (Red) */}
              <Link to={`/SubjectOverviewStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
                <button className="flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30 hover:bg-[#FF5252]/30">
                  <img src={SubjectOverview} alt="" className="h-4 w-4" />
                  <span className="sm:inline truncate">{classInfo?.subject || 'Subject'} Overview</span>
                </button>
              </Link>
              
              {/* Existing buttons */}
              {renderActionButton("/SubjectAnnouncementStudent", Announcement, "Announcements", false, "bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30 hover:bg-[#00A15D]/30")}
              {renderActionButton("/SubjectSchoolWorksStudent", Classwork, "School Works", true)}
              {renderActionButton("/SubjectAttendanceStudent", Attendance, "Attendance", false, "bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30")}
              {renderActionButton("/SubjectAnalyticsStudent", Analytics, "Reports", false, "bg-[#B39DDB]/20 text-[#B39DDB] border-[#B39DDB]/30 hover:bg-[#B39DDB]/30")}
            </div>
            <Link to={`/SubjectListStudent?code=${subjectCode}`} className="sm:self-start">
              <button className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#767EE0] transition-all duration-200 cursor-pointer">
                <img src={StudentsIcon} alt="Student List" className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* ========== FILTER & SEARCH ========== */}
          <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
            <div className="relative filter-dropdown sm:w-36">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 bg-[#15151C] rounded border transition-all duration-200 text-xs font-medium cursor-pointer ${
                  filterOption !== "All" 
                    ? 'border-[#767EE0] bg-[#767EE0]/10 text-[#767EE0]' 
                    : 'border-[#FFFFFF]/10 hover:border-[#767EE0] text-[#FFFFFF]'
                }`}
              >
                <span>{filterOption}</span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`ml-1.5 h-2.5 w-2.5 transition-transform duration-200 ${
                    filterDropdownOpen ? 'rotate-180' : ''
                  } ${
                    filterOption !== "All" ? 'invert-[0.5] sepia-[1] saturate-[5] hue-rotate-[200deg]' : ''
                  }`} 
                />
              </button>

              {filterDropdownOpen && (
                <div className="absolute top-full mt-1 bg-[#15151C] rounded w-full shadow-xl border border-[#FFFFFF]/10 z-20 overflow-hidden">
                  {/* Added "Exam" to the filter options */}
                  {["All", "Active", "Submitted", "Missed", "Assignment", "Quiz", "Activity", "Project", "Laboratory", "Exam"].map((option) => (
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
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 rounded px-2.5 py-1.5 pr-9 outline-none bg-[#15151C] text-xs text-[#FFFFFF] border border-[#FFFFFF]/10 focus:border-[#767EE0] transition-colors placeholder:text-[#FFFFFF]/40"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FFFFFF]/60">
                  <img src={Search} alt="Search" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ========== ACTIVITY CARDS ========== */}
          <div className="mt-2.5">
            {renderActivitySection("Active Activities", groupedActivities.active, "bg-[#767EE0]")}
            {renderActivitySection("Submitted Activities", groupedActivities.submitted, "bg-[#00A15D]")}
            {renderActivitySection("Missed Activities", groupedActivities.missed, "bg-[#A15353]")}
            
            {filteredActivities.length === 0 && renderEmptyState()}
          </div>
        </div>
      </div>

      {/* ========== STUDENT ACTIVITY DETAILS MODAL ========== */}
      <StudentActivityDetails
        activity={selectedActivity}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        studentId={studentId}
      />
    </div>
  );
}