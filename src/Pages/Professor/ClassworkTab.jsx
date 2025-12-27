import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ClassWorkCreate from "../../Components/ProfessorComponents/ClassWorkCreate";
import ClassWorkEdit from "../../Components/ProfessorComponents/ClassWorkEdit";
import ClassWorkArchive from "../../Components/ProfessorComponents/ClassWorkArchive";
import ClassWorkSubmission from "../../Components/ProfessorComponents/ClassWorkSubmission";
import ClassWorkSuccess from "../../Components/ProfessorComponents/ClassWorkSuccess";

import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton.svg';
import Add from "../../assets/Add.svg";
import Archive from "../../assets/Archive.svg";
import Attendance from "../../assets/Attendance.svg";
import Announcement from "../../assets/Announcement.svg";
import Classwork from "../../assets/Classwork.svg";
import ArrowDown from "../../assets/ArrowDown.svg";
import Search from "../../assets/Search.svg";
import ClassManagementIcon from "../../assets/ClassManagement.svg";
import GradeIcon from "../../assets/Grade.svg";
import AnalyticsIcon from "../../assets/Analytics.svg";
import Copy from "../../assets/Copy.svg";
// ADD THIS NEW IMPORT
import SubjectOverview from "../../assets/SubjectOverview.svg";

// New Minimal Small Activity Card Component
const MinimalActivityCard = ({ activity, onEdit, onArchive, onOpenSubmissions }) => {
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

  // Check if activity is fully graded
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

  // Check if activity is active (not past deadline and not fully graded)
  const isActivityActive = (activity) => {
    return !isDeadlinePassed(activity.deadline) && !isFullyGraded(activity);
  };

  const submittedCount = activity.students ? activity.students.filter(s => s.submitted).length : 0;
  const totalCount = activity.students ? activity.students.length : 0;

  // Get activity type color - Minimal version
  const getActivityTypeColor = (type) => {
    const colors = {
      'Assignment': 'bg-[#767EE0]/20 text-[#767EE0]',
      'Quiz': 'bg-[#B39DDB]/20 text-[#B39DDB]',
      'Activity': 'bg-[#00A15D]/20 text-[#00A15D]',
      'Project': 'bg-[#FFA600]/20 text-[#FFA600]',
      'Laboratory': 'bg-[#A15353]/20 text-[#A15353]',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  // Handle card click to open submissions
  const handleCardClick = (e) => {
    if (e.target.closest('button')) {
      return;
    }
    onOpenSubmissions(activity);
  };

  // Get grading status for the top label
  const getGradingStatus = () => {
    if (isFullyGraded(activity)) {
      return {
        text: 'Graded',
        color: 'bg-[#00A15D]/20 text-[#00A15D]'
      };
    } else if (hasSomeGrades(activity)) {
      return {
        text: 'Partially Graded',
        color: 'bg-[#FFA600]/20 text-[#FFA600]'
      };
    } else if (isDeadlinePassed(activity.deadline)) {
      return {
        text: 'Past Deadline',
        color: 'bg-[#A15353]/20 text-[#A15353]'
      };
    }
    return null;
  };

  const gradingStatus = getGradingStatus();

  // Determine card background based on status
  const getCardBackground = () => {
    if (isFullyGraded(activity)) {
      return 'bg-[#00A15D]/5 border-[#00A15D]/20';
    } else if (isDeadlinePassed(activity.deadline)) {
      return 'bg-[#A15353]/5 border-[#A15353]/20';
    } else if (hasSomeGrades(activity)) {
      return 'bg-[#FFA600]/5 border-[#FFA600]/20';
    }
    return 'bg-[#15151C] border-[#FFFFFF]/10';
  };

  return (
    <div 
      className={`rounded-lg border p-2.5 hover:shadow-sm transition-all cursor-pointer hover:border-[#00A15D]/30 ${getCardBackground()}`}
      onClick={handleCardClick}
    >
      {/* Header with type+number and top right buttons */}
      <div className="flex items-center justify-between mb-1.5">
        <span className={`px-1.5 py-0.5 ${getActivityTypeColor(activity.activity_type)} text-xs font-medium rounded`}>
          {activity.activity_type} #{activity.task_number}
        </span>
        
        {/* Top Right Section: Labels first, then Action Buttons at the far right */}
        <div className="flex items-center gap-2">
          {/* Grading Status - First label */}
          {gradingStatus && (
            <span className={`px-1 py-0.5 text-xs font-medium rounded ${gradingStatus.color}`}>
              {gradingStatus.text}
            </span>
          )}
          
          {/* Submission Stats - Second label */}
          <div className="text-xs font-medium text-[#FFFFFF]/80">
            {submittedCount}/{totalCount}
          </div>
          
          {/* Action Buttons - Edit and Archive at the far right */}
          <div className="flex items-center gap-0.5">
            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(activity);
              }}
              className="p-1 bg-[#15151C] hover:bg-[#23232C] rounded transition-colors cursor-pointer border border-[#FFFFFF]/10 hover:border-[#00A15D]/30"
              title="Edit Activity"
            >
              <svg className="w-3.5 h-3.5 text-gray-400 hover:text-[#00A15D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            {/* Archive Button - Only show for non-active activities */}
            {!isActivityActive(activity) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(activity);
                }}
                className="p-1 bg-[#15151C] hover:bg-[#23232C] rounded transition-colors cursor-pointer border border-[#FFFFFF]/10 hover:border-[#00A15D]/30"
                title="Archive Activity"
              >
                <img src={Archive} alt="Archive" className="w-3.5 h-3.5 opacity-80 hover:opacity-100" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Title - Smaller */}
      <h3 className="font-medium text-[#FFFFFF] text-xs mb-2 truncate">
        {activity.title}
      </h3>
      
      {/* Minimal Info Row - Compact with Clock Icon */}
      <div className="flex items-center justify-between mb-1">
        {/* Deadline with Clock Icon */}
        <div className="flex items-center gap-1">
          {/* Clock Icon - Always red text when deadline is passed */}
          <div className={`${isDeadlinePassed(activity.deadline) ? 'text-[#A15353]' : 'text-[#FFFFFF]/80'}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* Deadline Text - Red when deadline is passed */}
          <span className={`text-xs font-medium ${
            isDeadlinePassed(activity.deadline) 
              ? 'text-[#A15353]' 
              : 'text-[#FFFFFF]/80'
          }`}>
            {formatDate(activity.deadline)}
          </span>
        </div>
        
        {/* Points */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-[#FFA600]">
            {activity.points || 0} pts
          </span>
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

  // Copy subject code to clipboard
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

  // Check if activity already exists (duplicate detection for activity type + task number)
  const isActivityDuplicate = (activityType, taskNumber) => {
    return activities.some(activity => 
      activity.activity_type === activityType && 
      activity.task_number === taskNumber
    );
  };

  // Check if activity title already exists (duplicate title detection)
  const isTitleDuplicate = (title, excludeActivityId = null) => {
    return activities.some(activity => {
      if (excludeActivityId && activity.id === excludeActivityId) {
        return false;
      }
      return activity.title.toLowerCase() === title.toLowerCase();
    });
  };

  // Get existing task numbers for a specific activity type
  const getExistingTaskNumbers = (activityType) => {
    return activities
      .filter(activity => activity.activity_type === activityType)
      .map(activity => activity.task_number)
      .sort((a, b) => a - b);
  };

  // Get existing activity titles
  const getExistingTitles = () => {
    return activities.map(activity => activity.title);
  };

  // Check if activity is fully graded
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

    // Check for duplicate activity (activity type + task number)
    if (isActivityDuplicate(activityData.activityType, activityData.taskNumber)) {
      const existingTaskNumbers = getExistingTaskNumbers(activityData.activityType);
      const message = `"${activityData.activityType} ${activityData.taskNumber}" already exists.\n\nExisting ${activityData.activityType}s:\n${existingTaskNumbers.map(num => `${num}`).join('\n')}`;
      setDuplicateMessage(message);
      setShowDuplicateModal(true);
      return;
    }

    // Check for duplicate title
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
    // Check for duplicate activity
    if (isActivityDuplicate(activityData.activityType, activityData.taskNumber) && 
        (editingActivity.activity_type !== activityData.activityType || 
         editingActivity.task_number !== activityData.taskNumber)) {
      const existingTaskNumbers = getExistingTaskNumbers(activityData.activityType);
      const message = `"${activityData.activityType} ${activityData.taskNumber}" already exists.\n\nExisting ${activityData.activityType}s:\n${existingTaskNumbers.map(num => `${num}`).join('\n')}`;
      setDuplicateMessage(message);
      setShowDuplicateModal(true);
      return;
    }

    // Check for duplicate title
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
    // Prevent archiving active activities
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

  // Handle archive button click - check if activity is active
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
        case "Active":
          matchesFilter = isActivityActive(activity);
          break;
        default:
          matchesFilter = activity.activity_type === filterOption;
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  // Group activities by status for visual separation
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
    <div className="col-span-full text-center py-6">
      <div className="mx-auto w-12 h-12 mb-3 rounded-full bg-[#15151C] flex items-center justify-center">
        <img 
          src={SubjectDetailsIcon} 
          alt="No activities" 
          className="h-6 w-6 opacity-50" 
        />
      </div>
      <p className="text-[#FFFFFF]/60 text-xs mb-0.5">
        {searchQuery || filterOption !== "All" 
          ? "No activities match your search" 
          : "No activities created yet"
        }
      </p>
      <p className="text-[#FFFFFF]/40 text-[10px]">
        Click the + button to create your first activity
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-[#23232C] min-h-screen overflow-x-hidden">
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'} max-w-full overflow-x-hidden`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center text-white">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00A15D] border-r-transparent"></div>
            <p className="mt-3 text-gray-400">Loading class details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to render action buttons with consistent styling
  const renderActionButton = (to, icon, label, active = false, colorClass = "") => (
    <Link to={`${to}?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
      <button className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto min-w-0 ${
        active 
          ? 'bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30' 
          : colorClass
      }`}>
        <img src={icon} alt="" className="h-4 w-4 flex-shrink-0" />
        <span className="sm:inline truncate text-xs sm:text-sm">{label}</span>
      </button>
    </Link>
  );

  // Helper function to render activity section
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-3 min-w-0">
          {activities.map((activity) => (
            <MinimalActivityCard
              key={activity.id}
              activity={activity}
              onEdit={handleEditSchoolWork}
              onArchive={handleArchiveSchoolWork}
              onOpenSubmissions={handleOpenSubmissions}
            />
          ))}
        </div>
        <hr className="my-3 border-[#FFFFFF]/10" />
      </>
    )
  );

  return (
    <div className="bg-[#23232C] min-h-screen overflow-x-hidden">
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'} max-w-full overflow-x-hidden`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-6 max-w-full overflow-x-hidden">
          
          {/* Page Header */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img
                src={Classwork}
                alt="Class"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-2"
              />
              <h1 className="font-bold text-xl lg:text-2xl text-white truncate">
                Class Work
              </h1>
            </div>
            <p className="text-sm lg:text-base text-gray-400">
              Manage and create your class works
            </p>
          </div>

          {/* Subject Information with Copy Button */}
          <div className="flex flex-col gap-1 text-sm text-gray-400 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT CODE:</span>
              <div className="flex items-center gap-2">
                <span>{classInfo?.subject_code || 'N/A'}</span>
                {classInfo?.subject_code && (
                  <button
                    onClick={copySubjectCode}
                    className="p-1 text-gray-400 hover:text-white hover:bg-[#15151C] rounded transition-colors cursor-pointer flex items-center gap-1"
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
              <span>{classInfo?.subject || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{classInfo?.section || 'N/A'}</span>
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

          <hr className="border-gray-700 mb-4" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
            <div className="flex flex-col sm:flex-row gap-2 flex-1 flex-wrap min-w-0">
              {/* NEW: Subject Overview Button */}
              {renderActionButton("/SubjectOverviewProfessor", SubjectOverview, "Subject Overview", false, "bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30 hover:bg-[#FF5252]/30")}
              
              {/* Announcement Button */}
              {renderActionButton("/Class", Announcement, "Announcements", false, "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30")}
              
              {/* Classwork Button - Active */}
              {renderActionButton("/ClassworkTab", Classwork, "Class Work", true)}
              
              {/* Attendance Button */}
              {renderActionButton("/Attendance", Attendance, "Attendance", false, "bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30")}
              
              {/* Grade Button - CHANGED TO RED */}
              {renderActionButton("/GradeTab", GradeIcon, "Grade", false, "bg-[#A15353]/20 text-[#A15353] border-[#A15353]/30 hover:bg-[#A15353]/30")}
              
              {/* Analytics Button */}
              {renderActionButton("/AnalyticsTab", AnalyticsIcon, "Analytics", false, "bg-[#B39DDB]/20 text-[#B39DDB] border-[#B39DDB]/30 hover:bg-[#B39DDB]/30")}
            </div>
            
            {/* Icon Buttons */}
            <div className="flex items-center gap-2 justify-end sm:justify-start min-w-0">
              {/* Class Management Button */}
              <Link to={`/StudentList?code=${subjectCode}`}>
                <div className="relative group">
                  <button className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 flex-shrink-0 cursor-pointer">
                    <img 
                      src={ClassManagementIcon} 
                      alt="ClassManagement" 
                      className="h-4 w-4" 
                    />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Student List
                  </div>
                </div>
              </Link>

              {/* Archive Button */}
              <Link to={`/ArchiveActivities?code=${subjectCode}`}>
                <div className="relative group">
                  <button className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 flex-shrink-0 cursor-pointer">
                    <img 
                      src={Archive} 
                      alt="Archive" 
                      className="h-4 w-4" 
                    />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Archived Activities
                  </div>
                </div>
              </Link>

              {/* Add Activity Button */}
              <div className="relative group">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 flex-shrink-0 cursor-pointer">
                  <img 
                    src={Add} 
                    alt="Add" 
                    className="h-4 w-4" 
                  />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Create Activity
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Search Section */}
          <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
            {/* Filter dropdown */}
            <div className="relative filter-dropdown sm:w-36 min-w-0">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 bg-[#15151C] rounded border transition-all duration-200 text-xs font-medium cursor-pointer min-w-0 ${
                  filterOption !== "All" 
                    ? 'border-[#767EE0] bg-[#767EE0]/10 text-[#767EE0]' 
                    : 'border-gray-700 hover:border-[#767EE0] text-gray-300'
                }`}
              >
                <span className="truncate">{filterOption}</span>
                <img
                  src={ArrowDown}
                  alt=""
                  className={`ml-1.5 h-2.5 w-2.5 transition-transform duration-200 flex-shrink-0 ${
                    filterDropdownOpen ? 'rotate-180' : ''
                  } ${
                    filterOption !== "All" ? 'invert-[0.5] sepia-[1] saturate-[5] hue-rotate-[200deg]' : ''
                  }`}
                />
              </button>

              {/* Dropdown options */}
              {filterDropdownOpen && (
                <div className="absolute top-full mt-1 bg-[#15151C] rounded w-full shadow-xl border border-gray-700 z-20 overflow-hidden min-w-0">
                  {["All", "Active", ...activityTypes, "Graded", "Past Deadline"].map((option) => (
                    <button
                      key={option}
                      className={`block px-2.5 py-1.5 w-full text-left hover:bg-[#23232C] text-xs transition-colors cursor-pointer truncate ${
                        filterOption === option 
                          ? 'bg-[#767EE0]/10 text-[#767EE0] border-l-2 border-[#767EE0] font-semibold' 
                          : 'text-gray-300'
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
            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 rounded px-2.5 py-1.5 pr-9 outline-none bg-[#15151C] text-xs text-white border border-gray-700 focus:border-[#767EE0] transition-colors placeholder:text-gray-500 min-w-0"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <img
                    src={Search}
                    alt="Search"
                    className="h-3.5 w-3.5"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* MINIMAL ACTIVITY CARDS WITH VISUAL SEPARATION */}
          <div className="mt-2.5 min-w-0">
            {renderActivitySection("Active Activities", groupedActivities.active, "bg-[#767EE0]")}
            {renderActivitySection("Graded Activities", groupedActivities.graded, "bg-[#00A15D]")}
            {renderActivitySection("Past Deadline", groupedActivities.pastDeadline, "bg-[#A15353]")}
            
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

      {/* Duplicate Activity Modal */}
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