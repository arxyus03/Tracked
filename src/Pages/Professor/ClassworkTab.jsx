import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ClassWorkCreate from "../../Components/ClassWorkCreate";
import ClassWorkEdit from "../../Components/ClassWorkEdit";
import ClassWorkArchive from "../../Components/ClassWorkArchive";
import ClassWorkSubmission from "../../Components/ClassWorkSubmission";
import ClassWorkSuccess from "../../Components/ClassWorkSuccess";

import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Add from "../../assets/Add(Light).svg";
import Archive from "../../assets/Archive(Light).svg";
import Attendance from "../../assets/Attendance(Light).svg";
import Announcement from "../../assets/Announcement(Light).svg";
import Classwork from "../../assets/Classwork(Light).svg";
import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Search from "../../assets/Search.svg";
import StudentsIcon from "../../assets/Person.svg";
import ClassManagementIcon from "../../assets/ClassManagement(Light).svg";

// New Small Activity Card Component
const SmallActivityCard = ({ activity, onEdit, onArchive, onOpenSubmissions }) => {
  const formatDate = (dateString) => {
    if (!dateString || dateString === "No deadline") return "No deadline";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
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
      // Parse the createdAt string as UTC to avoid timezone issues
      const created = new Date(createdAt + 'Z'); // Add 'Z' to indicate UTC
      const now = new Date();
      
      // If the date is invalid, return fallback
      if (isNaN(created.getTime())) {
        return "Recently";
      }
      
      const diffMs = now - created;
      
      // Convert to seconds
      const diffSecs = Math.floor(diffMs / 1000);
      
      if (diffSecs < 60) {
        return diffSecs <= 1 ? "Just now" : `${diffSecs}s ago`;
      }
      
      // Convert to minutes
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) {
        return diffMins === 1 ? "1m ago" : `${diffMins}m ago`;
      }
      
      // Convert to hours
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return diffHours === 1 ? "1h ago" : `${diffHours}h ago`;
      }
      
      // Convert to days
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) {
        return diffDays === 1 ? "1d ago" : `${diffDays}d ago`;
      }
      
      // Convert to weeks
      const diffWeeks = Math.floor(diffDays / 7);
      if (diffWeeks < 4) {
        return diffWeeks === 1 ? "1w ago" : `${diffWeeks}w ago`;
      }
      
      // For longer periods, show the actual date
      return created.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
    } catch (error) {
      console.error('Error parsing date:', error, 'Input:', createdAt);
      return "Recently";
    }
  };

  // Check if deadline is urgent (within 24 hours or past due)
  const isDeadlineUrgent = (deadline) => {
    if (!deadline || deadline === "No deadline") return false;
    
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const timeDiff = deadlineDate - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      return hoursDiff <= 24; // Urgent if within 24 hours
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
      return deadlineDate < now;
    } catch {
      return false;
    }
  };

  const submittedCount = activity.students ? activity.students.filter(s => s.submitted).length : 0;
  const totalCount = activity.students ? activity.students.length : 0;
  const submissionRate = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;

  // Get activity type color
  const getActivityTypeColor = (type) => {
    const colors = {
      'Assignment': 'bg-blue-100 text-blue-800',
      'Quiz': 'bg-purple-100 text-purple-800',
      'Activity': 'bg-green-100 text-green-800',
      'Project': 'bg-orange-100 text-orange-800',
      'Laboratory': 'bg-red-100 text-red-800',
      'Announcement': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Handle card click to open submissions
  const handleCardClick = (e) => {
    // Don't trigger if clicking on action buttons
    if (e.target.closest('button')) {
      return;
    }
    onOpenSubmissions(activity);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        {/* Left Section - Activity Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 ${getActivityTypeColor(activity.activity_type)} text-xs font-medium rounded`}>
              {activity.activity_type}
            </span>
            <span className="text-sm text-gray-500">#{activity.task_number}</span>
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

            {/* Posted time */}
            <div className="flex items-center gap-2">
              <span className="font-medium">Posted:</span>
              <span>{getPostedTime(activity.created_at)}</span>
            </div>

            {/* Points */}
            {activity.points > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-bold">Points:</span>
                <span className="text-green-600 font-bold">{activity.points} pts</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Stats and Actions */}
        <div className="flex flex-col items-end gap-3 ml-4" onClick={(e) => e.stopPropagation()}>
          {/* Submission Stats */}
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 mb-1">
              <span className={submissionRate === 100 ? 'text-green-600' : 'text-gray-900'}>
                {submittedCount}
              </span>
              <span className="text-gray-400">/{totalCount}</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">Submitted</div>
            
            {/* Progress bar */}
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  submissionRate === 100 ? 'bg-green-500' :
                  submissionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.max(submissionRate, 0)}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(activity)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
              title="Edit Activity"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onArchive(activity)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
              title="Archive Activity"
            >
              <img src={Archive} alt="Archive" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ClassworkTab() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [activities, setActivities] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityToArchive, setActivityToArchive] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Separate state variables for each modal type
  const [showCreateSuccessModal, setShowCreateSuccessModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showGradeSuccessModal, setShowGradeSuccessModal] = useState(false);
  const [showArchiveSuccessModal, setShowArchiveSuccessModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [creatingActivity, setCreatingActivity] = useState(false);
  
  const activityTypes = ["Assignment", "Quiz", "Activity", "Project", "Laboratory", "Announcement"];

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Get professor ID from localStorage
  const getProfessorId = () => {
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        return userData.id;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return null;
  };

  // Get current datetime in YYYY-MM-DDTHH:mm format for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  // Fetch all data in sequence
  useEffect(() => {
    const fetchAllData = async () => {
      if (!subjectCode) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await fetchClassDetails();
        await fetchActivities();
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
      const professorId = getProfessorId();
      if (!professorId) {
        console.error('No professor ID found');
        return;
      }

      const response = await fetch(`https://tracked.6minds.site/Professor/SubjectDetailsDB/get_class_details.php?subject_code=${subjectCode}&professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setClassInfo(result.class_data);
        } else {
          console.error('Error fetching class details:', result.message);
        }
      } else {
        throw new Error('Failed to fetch class details');
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      if (!subjectCode) {
        console.error('No subject code provided');
        return;
      }

      const response = await fetch(`https://tracked.6minds.site/Professor/SubjectDetailsDB/get_activities.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched activities result:', result);
        if (result.success) {
          setActivities(result.activities || []);
        } else {
          console.error('Error fetching activities:', result.message);
          setActivities([]);
        }
      } else {
        throw new Error('Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    }
  };

  // Check if activity already exists (duplicate detection)
  const isActivityDuplicate = (activityType, taskNumber) => {
    return activities.some(activity => 
      activity.activity_type === activityType && 
      activity.task_number === taskNumber
    );
  };

  // Get existing task numbers for a specific activity type
  const getExistingTaskNumbers = (activityType) => {
    return activities
      .filter(activity => activity.activity_type === activityType)
      .map(activity => activity.task_number)
      .sort((a, b) => a - b);
  };

  // Handle create activity from modal
  const handleCreateActivity = async (activityData) => {
    // Validate required fields
    if (!activityData.activityType || !activityData.taskNumber || !activityData.title) {
      alert("Please fill in all required fields (Activity Type, Task Number, and Title)");
      return;
    }

    // Check for duplicate activity
    if (isActivityDuplicate(activityData.activityType, activityData.taskNumber)) {
      const existingTaskNumbers = getExistingTaskNumbers(activityData.activityType);
      const message = `"${activityData.activityType} ${activityData.taskNumber}" has already been created.\n\nExisting ${activityData.activityType}s: ${existingTaskNumbers.join(', ')}`;
      setDuplicateMessage(message);
      setShowDuplicateModal(true);
      return;
    }

    // Validate points (should not be negative)
    if (activityData.points < 0) {
      alert("Points cannot be negative. Please enter a value of 0 or higher.");
      return;
    }

    // Validate deadline (should not be in the past)
    if (activityData.deadline) {
      const selectedDate = new Date(activityData.deadline);
      const now = new Date();
      if (selectedDate < now) {
        alert("Deadline cannot be in the past. Please select a current or future date.");
        return;
      }
    }

    try {
      // Set creating state
      setCreatingActivity(true);

      const professorId = getProfessorId();
      if (!professorId) {
        alert("Error: Professor ID not found");
        return;
      }

      const apiData = {
        subject_code: subjectCode,
        professor_ID: professorId,
        activity_type: activityData.activityType,
        task_number: activityData.taskNumber,
        title: activityData.title,
        instruction: activityData.instruction,
        link: activityData.link,
        points: activityData.points || 0,
        deadline: activityData.deadline
      };

      console.log('Creating activity with data:', apiData);

      const response = await fetch('https://tracked.6minds.site/Professor/SubjectDetailsDB/create_activity.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      const rawResponse = await response.text();
      console.log('Raw response from server:', rawResponse);

      // Check if response looks like HTML/error
      if (rawResponse.trim().startsWith('<') || rawResponse.includes('<br />') || rawResponse.includes('<!DOCTYPE')) {
        console.error('Server returned HTML instead of JSON. This indicates a PHP error.');
        alert('Server error: Please check the PHP error logs');
        return;
      }

      let result;
      try {
        result = JSON.parse(rawResponse);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Raw response that failed to parse:', rawResponse);
        alert('Server returned invalid JSON. Check console for details.');
        return;
      }

      console.log('Parsed result:', result);

      if (result.success) {
        await fetchActivities();
        setShowCreateModal(false);
        
        setShowCreateSuccessModal(true);
        setTimeout(() => {
          setShowCreateSuccessModal(false);
        }, 2000);
      } else {
        alert('Error creating activity: ' + result.message);
      }
    } catch (error) {
      console.error('Network error creating activity:', error);
      alert('Network error creating activity. Please try again.');
    } finally {
      // Reset creating state
      setCreatingActivity(false);
    }
  };

  // Handle edit activity
  const handleEditActivity = async (activityData) => {
    try {
      const updatedActivityData = {
        activity_type: activityData.activityType,
        task_number: activityData.taskNumber,
        title: activityData.title,
        instruction: activityData.instruction,
        link: activityData.link,
        points: activityData.points || 0,
        deadline: activityData.deadline
      };

      console.log('Updating activity with data:', updatedActivityData);

      const response = await fetch('https://tracked.6minds.site/Professor/SubjectDetailsDB/update_activity.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_ID: editingActivity.id,
          ...updatedActivityData
        })
      });

      const result = await response.json();
      console.log('Update activity response:', result);

      if (result.success) {
        await fetchActivities();
        setShowEditModal(false);
        setEditingActivity(null);
        
        setShowEditSuccessModal(true);
        setTimeout(() => {
          setShowEditSuccessModal(false);
        }, 2000);
      } else {
        alert('Error updating activity: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('Error updating activity. Please try again.');
    }
  };

  // Handle archive activity
  const handleArchiveActivity = async (activity) => {
    try {
      const professorId = getProfessorId();
      if (!professorId) {
        alert("Error: Professor ID not found");
        return;
      }
      
      const response = await fetch('https://tracked.6minds.site/Professor/ArchiveActivitiesDB/archive_activity.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_ID: activity.id,
          professor_ID: professorId
        })
      });

      const result = await response.json();

      if (result.success) {
        setActivities(prev => prev.filter(a => a.id !== activity.id));
        setShowArchiveModal(false);
        setActivityToArchive(null);
        
        setShowArchiveSuccessModal(true);
        setTimeout(() => {
          setShowArchiveSuccessModal(false);
        }, 2000);
      } else {
        alert('Error archiving activity: ' + result.message);
        setShowArchiveModal(false);
      }
    } catch (error) {
      console.error('Error archiving activity:', error);
      alert('Error archiving activity. Please try again.');
      setShowArchiveModal(false);
    }
  };

  // Handle saving grades from submissions modal
  const handleSaveSubmissions = async (updatedStudents) => {
    try {
      console.log('Saving grades for activity:', selectedActivity.id, 'Students:', updatedStudents);
      
      const response = await fetch('https://tracked.6minds.site/Professor/SubjectDetailsDB/update_activity_grades.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_ID: selectedActivity.id,
          students: updatedStudents
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Save result:', result);

      if (result.success) {
        setActivities(prev => prev.map(activity => 
          activity.id === selectedActivity.id 
            ? { 
                ...activity, 
                students: updatedStudents
              }
            : activity
        ));
        
        setShowSubmissionsModal(false);
        setShowGradeSuccessModal(true);
        setTimeout(() => {
          setShowGradeSuccessModal(false);
        }, 2000);
      } else {
        alert('Error saving grades: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Error saving grades. Please try again. Error: ' + error.message);
    }
  };

  // Filter activities based on search and filter
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.task_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filterOption !== "All") {
      matchesFilter = activity.activity_type === filterOption;
    }
    
    return matchesSearch && matchesFilter;
  });

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

  // Handle opening submissions modal
  const handleOpenSubmissions = (activity) => {
    setSelectedActivity(activity);
    setShowSubmissionsModal(true);
  };

  // Handle edit school work
  const handleEditSchoolWork = (activity) => {
    setEditingActivity(activity);
    setShowEditModal(true);
  };

  // Handle archive activity
  const handleArchiveSchoolWork = (activity) => {
    setActivityToArchive(activity);
    setShowArchiveModal(true);
  };

  // Render empty state when no activities
  const renderEmptyState = () => (
    <div className="col-span-full text-center py-8 sm:py-12 lg:py-16">
      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-4 sm:mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <img 
          src={SubjectDetailsIcon} 
          alt="No activities" 
          className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 opacity-50" 
        />
      </div>
      <p className="text-gray-500 text-sm sm:text-base lg:text-lg mb-2">
        {searchQuery || filterOption !== "All" 
          ? "No activities match your search criteria" 
          : "No activities created yet."
        }
      </p>
      <p className="text-gray-400 text-xs sm:text-sm lg:text-base">
        Click the + button to create your first activity.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
            <p className="mt-3 text-gray-600">Loading class details...</p>
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
                src={SubjectDetailsIcon}
                alt="Class"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Class Management
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              Manage your class activities and assignments
            </p>
          </div>

          {/* Subject Information */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo?.subject_code || 'N/A'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Section:</span>
                <span>{classInfo?.section || 'N/A'}</span>
              </div>
              <div className="w-full flex justify-end">
                <Link to={"/ClassManagement"}>
                  <img 
                    src={BackButton} 
                    alt="Back" 
                    className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full mt-4 sm:mt-5 gap-3">
            {/* Navigation buttons - Stack on mobile, row on tablet/desktop */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Announcement Button - Full width on mobile, auto on larger */}
              <Link to={`/Class?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-white font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={Announcement} 
                    alt="" 
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span className="sm:inline">ANNOUNCEMENT</span>
                </button>
              </Link>

              {/* Classwork and Attendance - Side by side on all screens */}
              <div className="flex gap-3 w-full sm:w-auto">
                <Link to={`/ClassworkTab?code=${subjectCode}`} className="flex-1 min-w-0">
                  <button className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 bg-white font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 cursor-pointer w-full">
                    <img 
                      src={Classwork} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                    />
                    <span className="whitespace-nowrap truncate">CLASS WORK</span>
                  </button>
                </Link>

                <Link to={`/Attendance?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-white font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 cursor-pointer w-full sm:w-auto">
                    <img 
                      src={Attendance} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">ATTENDANCE</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Action buttons - Icons only on mobile/tablet, unchanged on desktop */}
            <div className="flex items-center gap-2 justify-end sm:justify-start mt-3 sm:mt-0 w-full sm:w-auto">
              <Link to={`/StudentList?code=${subjectCode}`}>
                <button className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer w-10 h-10 sm:w-auto sm:h-auto">
                  <img 
                    src={ClassManagementIcon} 
                    alt="ClassManagement" 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                  />
                </button>
              </Link>

              <Link to={`/ArchiveActivities?code=${subjectCode}`}>
                <button className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer w-10 h-10 sm:w-auto sm:h-auto">
                  <img 
                    src={Archive} 
                    alt="Archive" 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                  />
                </button>
              </Link>

              <button 
                onClick={() => setShowCreateModal(true)}
                className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer w-10 h-10 sm:w-auto sm:h-auto">
                <img 
                  src={Add} 
                  alt="Add" 
                  className="h-5 w-5 sm:h-6 sm:w-6" 
                />
              </button>
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
                  {["All", ...activityTypes].map((option) => (
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

          {/* SMALL ACTIVITY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 sm:mt-5">
            {filteredActivities.length === 0 ? (
              renderEmptyState()
            ) : (
              filteredActivities.map((activity) => (
                <SmallActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={handleEditSchoolWork}
                  onArchive={handleArchiveSchoolWork}
                  onOpenSubmissions={handleOpenSubmissions}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Components */}
      <ClassWorkCreate
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateActivity={handleCreateActivity}
        activityTypes={activityTypes}
        getCurrentDateTime={getCurrentDateTime}
        subjectCode={subjectCode}
        creatingActivity={creatingActivity}
      />

      <ClassWorkEdit
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditActivity}
        activity={editingActivity}
        activityTypes={activityTypes}
        getCurrentDateTime={getCurrentDateTime}
        subjectCode={subjectCode}
      />

      <ClassWorkArchive
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchiveActivity}
        activity={activityToArchive}
      />

      <ClassWorkSubmission
        activity={selectedActivity}
        isOpen={showSubmissionsModal}
        onClose={() => setShowSubmissionsModal(false)}
        onSave={handleSaveSubmissions}
        professorName={classInfo?.professor_name}
      />

      {/* Separate Success Modals for Different Operations */}
      <ClassWorkSuccess
        isOpen={showCreateSuccessModal}
        onClose={() => setShowCreateSuccessModal(false)}
        message="Activity created successfully!"
        type="success"
      />

      <ClassWorkSuccess
        isOpen={showEditSuccessModal}
        onClose={() => setShowEditSuccessModal(false)}
        message="Activity updated successfully!"
        type="edit"
      />

      <ClassWorkSuccess
        isOpen={showGradeSuccessModal}
        onClose={() => setShowGradeSuccessModal(false)}
        message="Grades saved successfully!"
        type="grade"
      />

      <ClassWorkSuccess
        isOpen={showArchiveSuccessModal}
        onClose={() => setShowArchiveSuccessModal(false)}
        message="Activity archived successfully!"
        type="archive"
      />

      {/* Duplicate Activity Modal */}
      <ClassWorkSuccess
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        message={duplicateMessage}
        type="duplicate"
      />
    </div>
  );
}