import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ClassWorkCreate from "../../Components/ClassworkTabComponents/ClassWorkCreate";
import ClassWorkEdit from "../../Components/ClassworkTabComponents/ClassWorkEdit";
import ClassWorkArchive from "../../Components/ClassworkTabComponents/ClassWorkArchive";
import ClassWorkSubmission from "../../Components/ClassworkTabComponents/ClassWorkSubmission";
import ClassWorkSuccess from "../../Components/ClassworkTabComponents/ClassWorkSuccess";

import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Add from "../../assets/Add(Light).svg";
import Archive from "../../assets/Archive(Light).svg";
import Attendance from "../../assets/Attendance(Light).svg";
import Announcement from "../../assets/Announcement(Light).svg";
import Classwork from "../../assets/Classwork(Light).svg";
import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Search from "../../assets/Search.svg";
import ClassManagementIcon from "../../assets/ClassManagement(Light).svg";
import GradeIcon from "../../assets/Grade(Light).svg";
import AnalyticsIcon from "../../assets/Analytics(Light).svg";
import Copy from "../../assets/Copy(Light).svg"; // From second component

// New Small Activity Card Component - Merged version
const SmallActivityCard = ({ activity, onEdit, onArchive, onOpenSubmissions }) => {
  const formatDate = (dateString) => {
    if (!dateString || dateString === "No deadline") return "No deadline";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
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
      const created = new Date(createdAt + 'Z');
      const now = new Date();
      
      if (isNaN(created.getTime())) {
        return "Recently";
      }
      
      const diffMs = now - created;
      const diffSecs = Math.floor(diffMs / 1000);
      
      if (diffSecs < 60) {
        return diffSecs <= 1 ? "Just now" : `${diffSecs}s ago`;
      }
      
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) {
        return diffMins === 1 ? "1m ago" : `${diffMins}m ago`;
      }
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return diffHours === 1 ? "1h ago" : `${diffHours}h ago`;
      }
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) {
        return diffDays === 1 ? "1d ago" : `${diffDays}d ago`;
      }
      
      const diffWeeks = Math.floor(diffDays / 7);
      if (diffWeeks < 4) {
        return diffWeeks === 1 ? "1w ago" : `${diffWeeks}w ago`;
      }
      
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

  // Check if deadline is urgent (within 24 hours or past deadline)
  const isDeadlineUrgent = (deadline) => {
    if (!deadline || deadline === "No deadline") return false;
    
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const timeDiff = deadlineDate - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      return hoursDiff <= 24;
    } catch {
      return false;
    }
  };

  // Check if deadline is past deadline
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

  // Updated: Check if activity is fully graded - Using second component's logic (ALL students must have grade)
  const isFullyGraded = (activity) => {
    if (!activity.students || activity.students.length === 0) return false;
    
    // Check if ALL students (not just submitted ones) have valid grades that are NOT 0
    return activity.students.every(student => {
      const grade = student.grade;
      return grade != null && 
             grade !== '' && 
             grade !== undefined && 
             grade !== 0 && 
             grade !== '0';
    });
  };

  // Check if activity has any grades (excluding 0 grades)
  const hasSomeGrades = (activity) => {
    if (!activity.students || activity.students.length === 0) return false;
    
    return activity.students.some(student => {
      const grade = student.grade;
      return grade != null && 
             grade !== '' && 
             grade !== undefined && 
             grade !== 0 && 
             grade !== '0';
    });
  };

  // Check if activity is active (not past deadline and not fully graded) - From second component
  const isActivityActive = (activity) => {
    return !isDeadlinePassed(activity.deadline) && !isFullyGraded(activity);
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
    if (e.target.closest('button')) {
      return;
    }
    onOpenSubmissions(activity);
  };

  // Determine card background based on status
  const getCardBackground = () => {
    if (isFullyGraded(activity)) {
      return 'bg-green-50 border-green-200';
    } else if (isDeadlinePassed(activity.deadline)) {
      return 'bg-red-50 border-red-200';
    } else if (hasSomeGrades(activity)) {
      return 'bg-yellow-50 border-yellow-200';
    }
    return 'bg-white border-gray-200';
  };

  return (
    <div 
      className={`rounded-lg shadow-md border p-4 hover:shadow-lg transition-shadow cursor-pointer ${getCardBackground()}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        {/* Left Section - Activity Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2 py-1 ${getActivityTypeColor(activity.activity_type)} text-xs font-medium rounded`}>
              {activity.activity_type}
            </span>
            <span className="text-sm text-gray-500">#{activity.task_number}</span>
            
            {/* Status badges - Hidden on mobile, shown on md and larger (from second component) */}
            <div className="hidden md:flex items-center gap-1">
              {isFullyGraded(activity) && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Graded
                </span>
              )}
              
              {isDeadlinePassed(activity.deadline) && !isFullyGraded(activity) && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Past Deadline
                </span>
              )}
              
              {hasSomeGrades(activity) && !isFullyGraded(activity) && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Partially Graded
                </span>
              )}
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 text-lg mb-3 truncate">
            {activity.title}
          </h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            {/* Deadline with icon (from second component) */}
            <div className="flex items-center gap-2">
              <svg className={`w-4 h-4 ${
                isDeadlinePassed(activity.deadline) || isDeadlineUrgent(activity.deadline) 
                  ? 'text-red-600' 
                  : 'text-gray-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`font-medium ${
                isDeadlinePassed(activity.deadline) || isDeadlineUrgent(activity.deadline) 
                  ? 'text-red-600 font-bold' 
                  : 'text-gray-600'
              }`}>
                {formatDate(activity.deadline)}
              </span>
            </div>

            {/* Posted time with icon (from second component) */}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{getPostedTime(activity.created_at)}</span>
            </div>

            {/* Points with icon (from second component) */}
            {activity.points > 0 && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-600 font-bold">{activity.points} pts</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Stats and Actions */}
        <div className="flex flex-col items-end gap-3 ml-4" onClick={(e) => e.stopPropagation()}>
          {/* Submission Stats - Simplified (from second component) */}
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 mb-1">
              <span className={submissionRate === 100 ? 'text-green-600' : 'text-gray-900'}>
                {submittedCount}
              </span>
              <span className="text-gray-400">/{totalCount}</span>
            </div>
            <div className="text-xs text-gray-500">Submitted</div>
            
            {/* Progress bar - Keep from first component */}
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div 
                className={`h-full ${
                  submissionRate === 100 ? 'bg-green-500' :
                  submissionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.max(submissionRate, 0)}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons - Merged responsive behavior */}
          <div className="flex items-center gap-2">
            {/* Edit Button with Tooltip - Hidden on mobile, shown on md+ (from second component) */}
            <div className="relative group hidden md:block">
              <button
                onClick={() => onEdit(activity)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Edit Activity
              </div>
            </div>
            
            {/* Edit Button for mobile - No tooltip */}
            <button
              onClick={() => onEdit(activity)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer md:hidden"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            {/* Archive Button - Only show for non-active activities (from second component) */}
            {!isActivityActive(activity) && (
              <>
                {/* Archive Button with Tooltip - Hidden on mobile, shown on md+ */}
                <div className="relative group hidden md:block">
                  <button
                    onClick={() => onArchive(activity)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                  >
                    <img src={Archive} alt="Archive" className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Archive Activity
                  </div>
                </div>
                
                {/* Archive Button for mobile - No tooltip */}
                <button
                  onClick={() => onArchive(activity)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer md:hidden"
                >
                  <img src={Archive} alt="Archive" className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile-only Status Indicators - Simple dot indicators (from second component) */}
      <div className="md:hidden flex items-center gap-2 mt-2">
        {isFullyGraded(activity) && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">Graded</span>
          </div>
        )}
        
        {isDeadlinePassed(activity.deadline) && !isFullyGraded(activity) && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-red-600 font-medium">Past Deadline</span>
          </div>
        )}
        
        {hasSomeGrades(activity) && !isFullyGraded(activity) && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-yellow-600 font-medium">Partially Graded</span>
          </div>
        )}
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
  
  const activityTypes = ["Assignment", "Quiz", "Activity", "Project", "Laboratory"];

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

  // Copy subject code to clipboard (from second component)
  const copySubjectCode = () => {
    if (classInfo?.subject_code) {
      navigator.clipboard.writeText(classInfo.subject_code)
        .then(() => {
          // Show temporary feedback
          const originalText = document.querySelector('.copy-text');
          if (originalText) {
            originalText.textContent = 'Copied!';
            setTimeout(() => {
              originalText.textContent = 'Copy';
            }, 2000);
          }
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
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

      // Using localhost endpoint from first component
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

      // Using localhost endpoint from first component
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

  // Check if activity already exists (duplicate detection for activity type + task number) - From second component
  const isActivityDuplicate = (activityType, taskNumber) => {
    return activities.some(activity => 
      activity.activity_type === activityType && 
      activity.task_number === taskNumber
    );
  };

  // Check if activity title already exists (duplicate title detection) - From second component
  const isTitleDuplicate = (title, excludeActivityId = null) => {
    return activities.some(activity => {
      if (excludeActivityId && activity.id === excludeActivityId) {
        return false;
      }
      return activity.title.toLowerCase() === title.toLowerCase();
    });
  };

  // Get existing task numbers for a specific activity type - From second component
  const getExistingTaskNumbers = (activityType) => {
    return activities
      .filter(activity => activity.activity_type === activityType)
      .map(activity => activity.task_number)
      .sort((a, b) => a - b);
  };

  // Get existing activity titles - From second component
  const getExistingTitles = () => {
    return activities.map(activity => activity.title);
  };

  // Updated: Check if activity is fully graded - Using second component's logic
  const isFullyGraded = (activity) => {
    if (!activity.students || activity.students.length === 0) return false;
    
    return activity.students.every(student => {
      const grade = student.grade;
      return grade != null && 
             grade !== '' && 
             grade !== undefined && 
             grade !== 0 && 
             grade !== '0';
    });
  };

  // Check if activity is active - From second component
  const isActivityActive = (activity) => {
    return !isDeadlinePassed(activity.deadline) && !isFullyGraded(activity);
  };

  // Check if deadline is passed
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

  // Handle create activity from modal
  const handleCreateActivity = async (activityData) => {
    // Validate required fields
    if (!activityData.activityType || !activityData.taskNumber || !activityData.title) {
      alert("Please fill in all required fields (Activity Type, Task Number, and Title)");
      return;
    }

    // Check for duplicate activity (activity type + task number) - From second component
    if (isActivityDuplicate(activityData.activityType, activityData.taskNumber)) {
      const existingTaskNumbers = getExistingTaskNumbers(activityData.activityType);
      const message = `"${activityData.activityType} ${activityData.taskNumber}" already exists.\n\nExisting ${activityData.activityType}s:\n${existingTaskNumbers.map(num => `${num}`).join('\n')}`;
      setDuplicateMessage(message);
      setShowDuplicateModal(true);
      return;
    }

    // Check for duplicate title - From second component
    if (isTitleDuplicate(activityData.title)) {
      const existingTitles = getExistingTitles();
      const message = `Title "${activityData.title}" is already used.\n\nExisting titles:\n${existingTitles.map((title, index) => `${index + 1}. "${title}"`).join('\n')}`;
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

      // Using localhost endpoint from first component
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
    // Check for duplicate activity - From second component
    if (isActivityDuplicate(activityData.activityType, activityData.taskNumber) && 
        (editingActivity.activity_type !== activityData.activityType || 
         editingActivity.task_number !== activityData.taskNumber)) {
      const existingTaskNumbers = getExistingTaskNumbers(activityData.activityType);
      const message = `"${activityData.activityType} ${activityData.taskNumber}" already exists.\n\nExisting ${activityData.activityType}s:\n${existingTaskNumbers.map(num => `${num}`).join('\n')}`;
      setDuplicateMessage(message);
      setShowDuplicateModal(true);
      return;
    }

    // Check for duplicate title - From second component
    if (isTitleDuplicate(activityData.title, editingActivity.id)) {
      const existingTitles = getExistingTitles();
      const filteredTitles = existingTitles.filter(title => 
        title.toLowerCase() !== editingActivity.title.toLowerCase()
      );
      const message = `Title "${activityData.title}" is already used.\n\nExisting titles:\n${filteredTitles.map((title, index) => `${index + 1}. "${title}"`).join('\n')}`;
      setDuplicateMessage(message);
      setShowDuplicateModal(true);
      return;
    }

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

      // Using localhost endpoint from first component
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

  // Handle archive activity - Using second component's logic
  const handleArchiveActivity = async (activity) => {
    // Prevent archiving active activities - From second component
    if (isActivityActive(activity)) {
      alert("Cannot archive active activities. Please wait until the deadline passes or all submissions are graded.");
      setShowArchiveModal(false);
      return;
    }

    try {
      const professorId = getProfessorId();
      if (!professorId) {
        alert("Error: Professor ID not found");
        return;
      }
      
      // Using localhost endpoint from first component
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

  // Handle archive button click - check if activity is active (from second component)
  const handleArchiveSchoolWork = (activity) => {
    if (isActivityActive(activity)) {
      alert("Cannot archive active activities. Please wait until the deadline passes or all submissions are graded.");
      return;
    }
    setActivityToArchive(activity);
    setShowArchiveModal(true);
  };

  // Handle saving grades from submissions modal
  const handleSaveSubmissions = async (updatedStudents) => {
    try {
      console.log('Saving grades for activity:', selectedActivity.id, 'Students:', updatedStudents);
      
      // Using localhost endpoint from first component
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
      switch (filterOption) {
        case "Graded":
          matchesFilter = isFullyGraded(activity);
          break;
        case "Past Deadline":
          matchesFilter = isDeadlinePassed(activity.deadline);
          break;
        case "Active": // From second component
          matchesFilter = isActivityActive(activity);
          break;
        default:
          matchesFilter = activity.activity_type === filterOption;
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  // Group activities by status for visual separation - Using second component's grouping
  const groupedActivities = {
    active: filteredActivities.filter(activity => isActivityActive(activity)),
    graded: filteredActivities.filter(activity => isFullyGraded(activity)),
    pastDeadline: filteredActivities.filter(activity => 
      isDeadlinePassed(activity.deadline) && !isFullyGraded(activity)
    )
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
                src={Classwork}
                alt="Class"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Class Work
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              Manage and create your class works
            </p>
          </div>

          {/* Subject Information with Copy Button (from second component) */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <div className="flex items-center gap-2">
                <span>{classInfo?.subject_code || 'N/A'}</span>
                {classInfo?.subject_code && (
                  <button
                    onClick={copySubjectCode}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer flex items-center gap-1"
                    title="Copy subject code"
                  >
                    <img 
                      src={Copy} 
                      alt="Copy" 
                      className="w-4 h-4" 
                    />
                    <span className="text-xs copy-text">Copy</span>
                  </button>
                )}
              </div>
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
            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Announcement Button */}
              <Link to={`/Class?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#e6f4ea] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4edd8] transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={Announcement} 
                    alt="" 
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span className="sm:inline">Announcement</span>
                </button>
              </Link>

              {/* Classwork, Attendance, Grade and Analytics */}
              <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:gap-4 sm:w-auto">
                <Link to={`/ClassworkTab?code=${subjectCode}`} className="min-w-0">
                  <button className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 bg-[#e6f0ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4e3ff] transition-all duration-300 cursor-pointer w-full">
                    <img 
                      src={Classwork} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                    />
                    <span className="whitespace-nowrap truncate">Class work</span>
                  </button>
                </Link>

                <Link to={`/Attendance?code=${subjectCode}`} className="sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#fff4e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#ffebd4] transition-all duration-300 cursor-pointer w-full sm:w-auto">
                    <img 
                      src={Attendance} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Attendance</span>
                  </button>
                </Link>

                {/* Grade Button */}
                <Link to={`/GradeTab?code=${subjectCode}`} className="sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#ffe6e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#ffd4d4] transition-all duration-300 cursor-pointer w-full sm:w-auto">
                    <img 
                      src={GradeIcon} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Grade</span>
                  </button>
                </Link>

                {/* Analytics Button */}
                <Link to={`/AnalyticsTab?code=${subjectCode}`} className="sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#f0e6ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#e6d4ff] transition-all duration-300 cursor-pointer w-full sm:w-auto">
                    <img 
                      src={AnalyticsIcon} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Analytics</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 justify-end sm:justify-start mt-3 sm:mt-0 w-full sm:w-auto">
              <Link to={`/StudentList?code=${subjectCode}`}>
                <div className="relative group">
                  <button className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer w-10 h-10 sm:w-auto sm:h-auto">
                    <img 
                      src={ClassManagementIcon} 
                      alt="ClassManagement" 
                      className="h-5 w-5 sm:h-6 sm:w-6" 
                    />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Student List
                  </div>
                </div>
              </Link>

              <Link to={`/ArchiveActivities?code=${subjectCode}`}>
                <div className="relative group">
                  <button className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer w-10 h-10 sm:w-auto sm:h-auto">
                    <img 
                      src={Archive} 
                      alt="Archive" 
                      className="h-5 w-5 sm:h-6 sm:w-6" 
                    />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Archived Activities
                  </div>
                </div>
              </Link>

              <div className="relative group">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer w-10 h-10 sm:w-auto sm:h-auto">
                  <img 
                    src={Add} 
                    alt="Add" 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                  />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Create Activity
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Search Section */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-5">
            {/* Filter dropdown - Updated with "Active" filter */}
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

              {/* Dropdown options - Updated with "Active" option */}
              {filterDropdownOpen && (
                <div className="absolute top-full mt-2 bg-white rounded-md w-full sm:min-w-[200px] shadow-xl border border-gray-200 z-20 overflow-hidden">
                  {["All", "Active", ...activityTypes, "Graded", "Past Deadline"].map((option) => (
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

          {/* SMALL ACTIVITY CARDS WITH VISUAL SEPARATION */}
          <div className="mt-4 sm:mt-5">
            {/* Active Activities Section (from second component) */}
            {groupedActivities.active.length > 0 && (
              <>
                <div className="mb-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    Active Activities
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({groupedActivities.active.length})
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedActivities.active.map((activity) => (
                    <SmallActivityCard
                      key={activity.id}
                      activity={activity}
                      onEdit={handleEditSchoolWork}
                      onArchive={handleArchiveSchoolWork}
                      onOpenSubmissions={handleOpenSubmissions}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Graded Activities Section */}
            {groupedActivities.graded.length > 0 && (
              <>
                <div className="mb-4 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Graded Activities
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({groupedActivities.graded.length})
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {groupedActivities.graded.map((activity) => (
                    <SmallActivityCard
                      key={activity.id}
                      activity={activity}
                      onEdit={handleEditSchoolWork}
                      onArchive={handleArchiveSchoolWork}
                      onOpenSubmissions={handleOpenSubmissions}
                    />
                  ))}
                </div>
                <hr className="my-6 border-gray-300" />
              </>
            )}

            {/* Past Deadline Activities Section */}
            {groupedActivities.pastDeadline.length > 0 && (
              <>
                <div className="mb-4 mt-[-1rem]">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    Past Deadline
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({groupedActivities.pastDeadline.length})
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {groupedActivities.pastDeadline.map((activity) => (
                    <SmallActivityCard
                      key={activity.id}
                      activity={activity}
                      onEdit={handleEditSchoolWork}
                      onArchive={handleArchiveSchoolWork}
                      onOpenSubmissions={handleOpenSubmissions}
                    />
                  ))}
                </div>
                <hr className="my-6 border-gray-300" />
              </>
            )}

            {/* Empty State */}
            {filteredActivities.length === 0 && renderEmptyState()}
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

      {/* Duplicate Activity Modal - Improved Design (from second component) */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Duplicate Detected
                </h3>
              </div>
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <div className="mb-4">
                <p className="text-gray-600">
                  {duplicateMessage.split('\n')[0]}
                </p>
                
                {duplicateMessage.includes('Existing') && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      {duplicateMessage.includes('task numbers') ? 'Existing task numbers:' : 'Existing titles:'}
                    </h4>
                    <div className="max-h-48 overflow-y-auto">
                      {duplicateMessage.split('\n').slice(2).map((line, index) => (
                        line.trim() && (
                          <div key={index} className="flex items-start py-1">
                            <span className="text-gray-400 mr-2">•</span>
                            <span className="text-sm text-gray-600">{line.trim()}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDuplicateModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium transition-colors duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}