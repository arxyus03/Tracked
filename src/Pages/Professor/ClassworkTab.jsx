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
import SubjectOverview from "../../assets/SubjectOverview.svg";
import TimeIcon from '../../assets/Clock.svg';

// ========== TIME INDICATOR HELPER FUNCTION ==========
const getTimeAgo = (createdAt) => {
  if (!createdAt) return "";
  
  try {
    const createdDate = new Date(createdAt);
    const now = new Date();
    
    const diffInSeconds = Math.floor((now - createdDate) / 1000);
    
    if (diffInSeconds < 0 || isNaN(diffInSeconds)) return "";
    
    const seconds = diffInSeconds;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44);
    const years = Math.floor(days / 365.25);
    
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

// New Minimal Small Activity Card Component
const MinimalActivityCard = ({ activity, onEdit, onArchive, onOpenSubmissions, isDarkMode }) => {
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

  const isActivityActive = (activity) => {
    return !isDeadlinePassed(activity.deadline) && !isFullyGraded(activity);
  };

  const submittedCount = activity.students ? 
    activity.students.filter(s => s.submitted).length : 0;
  
  const totalCount = activity.students ? activity.students.length : 0;

  const getActivityTypeColor = (type) => {
    const colors = {
      'Assignment': isDarkMode ? 'bg-[#767EE0]/20 text-[#767EE0]' : 'bg-[#767EE0]/10 text-[#767EE0]',
      'Quiz': isDarkMode ? 'bg-[#B39DDB]/20 text-[#B39DDB]' : 'bg-[#B39DDB]/10 text-[#B39DDB]',
      'Activity': isDarkMode ? 'bg-[#00A15D]/20 text-[#00A15D]' : 'bg-[#00A15D]/10 text-[#00A15D]',
      'Project': isDarkMode ? 'bg-[#FFA600]/20 text-[#FFA600]' : 'bg-[#FFA600]/10 text-[#FFA600]',
      'Laboratory': isDarkMode ? 'bg-[#A15353]/20 text-[#A15353]' : 'bg-[#A15353]/10 text-[#A15353]',
      'Exam': isDarkMode ? 'bg-[#FF5252]/20 text-[#FF5252]' : 'bg-[#FF5252]/10 text-[#FF5252]',
      'Remedial': isDarkMode ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'bg-[#3B82F6]/10 text-[#3B82F6]'
    };
    return colors[type] || (isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-300 text-gray-600');
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) {
      return;
    }
    onOpenSubmissions(activity);
  };

  const getGradingStatus = () => {
    if (isFullyGraded(activity)) {
      return {
        text: 'Graded',
        color: isDarkMode ? 'bg-[#00A15D]/20 text-[#00A15D]' : 'bg-[#00A15D]/10 text-[#00A15D]'
      };
    } else if (hasSomeGrades(activity)) {
      return {
        text: 'Partially Graded',
        color: isDarkMode ? 'bg-[#FFA600]/20 text-[#FFA600]' : 'bg-[#FFA600]/10 text-[#FFA600]'
      };
    } else if (isDeadlinePassed(activity.deadline)) {
      return {
        text: 'Past Deadline',
        color: isDarkMode ? 'bg-[#A15353]/20 text-[#A15353]' : 'bg-[#A15353]/10 text-[#A15353]'
      };
    }
    return null;
  };

  const gradingStatus = getGradingStatus();

  const getCardBackground = () => {
    if (isFullyGraded(activity)) {
      return isDarkMode ? 'bg-[#00A15D]/5 border-[#00A15D]/20' : 'bg-[#00A15D]/3 border-[#00A15D]/10';
    } else if (isDeadlinePassed(activity.deadline)) {
      return isDarkMode ? 'bg-[#A15353]/5 border-[#A15353]/20' : 'bg-[#A15353]/3 border-[#A15353]/10';
    } else if (hasSomeGrades(activity)) {
      return isDarkMode ? 'bg-[#FFA600]/5 border-[#FFA600]/20' : 'bg-[#FFA600]/3 border-[#FFA600]/10';
    }
    return isDarkMode ? 'bg-[#15151C] border-white/10' : 'bg-white border-gray-200';
  };

  const timeAgo = getTimeAgo(activity.created_at);

  return (
    <div 
      className={`rounded-lg border p-2.5 hover:shadow-sm transition-all cursor-pointer ${
        isDarkMode 
          ? 'hover:border-[#00A15D]/30' 
          : 'hover:border-[#00A15D]/50'
      } ${getCardBackground()}`}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className={`px-1.5 py-0.5 ${getActivityTypeColor(activity.activity_type)} text-xs font-medium rounded`}>
          {activity.activity_type} #{activity.task_number}
        </span>
        
        <div className="flex items-center gap-2">
          {activity.school_work_edited === 1 && (
            <span className={`px-1 py-0.5 text-xs font-medium rounded ${
              isDarkMode ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'bg-[#3B82F6]/10 text-[#3B82F6]'
            }`}>
              Edited
            </span>
          )}
          
          {gradingStatus && (
            <span className={`px-1 py-0.5 text-xs font-medium rounded ${gradingStatus.color}`}>
              {gradingStatus.text}
            </span>
          )}
          
          <div className={`text-xs font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
            {submittedCount}/{totalCount}
          </div>
          
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(activity);
              }}
              className={`p-1 rounded transition-colors cursor-pointer border ${
                isDarkMode 
                  ? 'bg-[#15151C] hover:bg-[#23232C] border-white/10 hover:border-[#00A15D]/30 text-gray-400 hover:text-[#00A15D]'
                  : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-[#00A15D] text-gray-600 hover:text-[#00A15D]'
              }`}
              title="Edit Activity"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            {!isActivityActive(activity) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(activity);
                }}
                className={`p-1 rounded transition-colors cursor-pointer border ${
                  isDarkMode 
                    ? 'bg-[#15151C] hover:bg-[#23232C] border-white/10 hover:border-[#00A15D]/30'
                    : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-[#00A15D]'
                }`}
                title="Archive Activity"
              >
                <img 
                  src={Archive} 
                  alt="Archive" 
                  className="w-3.5 h-3.5 opacity-80 hover:opacity-100" 
                  style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <h3 className={`font-medium text-xs mb-2 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {activity.title}
      </h3>
      
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <div className={isDeadlinePassed(activity.deadline) ? 'text-[#A15353]' : (isDarkMode ? 'text-white/80' : 'text-gray-600')}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <span className={`text-xs font-medium ${
            isDeadlinePassed(activity.deadline) 
              ? 'text-[#A15353]' 
              : (isDarkMode ? 'text-white/80' : 'text-gray-600')
          }`}>
            {formatDate(activity.deadline)}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-[#FFA600]">
            {activity.points || 0} pts
          </span>
        </div>
      </div>

      {timeAgo && (
        <div className="flex items-center gap-1 mt-1">
          <img 
            src={TimeIcon} 
            alt="Time" 
            className="w-2.5 h-2.5 opacity-60"
            style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
          />
          <span className={`text-[10px] font-medium ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
            {timeAgo} ago
          </span>
        </div>
      )}
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [showCreateSuccessModal, setShowCreateSuccessModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showGradeSuccessModal, setShowGradeSuccessModal] = useState(false);
  const [showArchiveSuccessModal, setShowArchiveSuccessModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [creatingActivity, setCreatingActivity] = useState(false);
  
  const activityTypes = ["Assignment", "Quiz", "Activity", "Project", "Laboratory", "Exam", "Remedial"];

  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    handleThemeChange();
    
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

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

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const copySubjectCode = () => {
    if (classInfo?.subject_code) {
      navigator.clipboard.writeText(classInfo.subject_code)
        .then(() => {
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

  const isActivityDuplicate = (activityType, taskNumber) => {
    return activities.some(activity => 
      activity.activity_type === activityType && 
      activity.task_number === taskNumber
    );
  };

  const isTitleDuplicate = (title, excludeActivityId = null) => {
    return activities.some(activity => {
      if (excludeActivityId && activity.id === excludeActivityId) {
        return false;
      }
      return activity.title.toLowerCase() === title.toLowerCase();
    });
  };

  const getExistingTaskNumbers = (activityType) => {
    return activities
      .filter(activity => activity.activity_type === activityType)
      .map(activity => activity.task_number)
      .sort((a, b) => a - b);
  };

  const getExistingTitles = () => {
    return activities.map(activity => activity.title);
  };

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

  const isActivityActive = (activity) => {
    return !isDeadlinePassed(activity.deadline) && !isFullyGraded(activity);
  };

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

  const handleCreateActivity = async (activityData) => {
    if (!activityData.activityType || !activityData.taskNumber || !activityData.title) {
      alert("Please fill in all required fields (Activity Type, Task Number, and Title)");
      return;
    }

    if (isActivityDuplicate(activityData.activityType, activityData.taskNumber)) {
      const existingTaskNumbers = getExistingTaskNumbers(activityData.activityType);
      const message = `"${activityData.activityType} ${activityData.taskNumber}" already exists.\n\nExisting ${activityData.activityType}s:\n${existingTaskNumbers.map(num => `${num}`).join('\n')}`;
      setDuplicateMessage(message);
      setShowDuplicateModal(true);
      return;
    }

    if (isTitleDuplicate(activityData.title)) {
      const existingTitles = getExistingTitles();
      const message = `Title "${activityData.title}" is already used.\n\nExisting titles:\n${existingTitles.map((title, index) => `${index + 1}. "${title}"`).join('\n')}`;
      setDuplicateMessage(message);
      setShowDuplicateModal(true);
      return;
    }

    if (activityData.points < 0) {
      alert("Points cannot be negative. Please enter a value of 0 or higher.");
      return;
    }

    if (activityData.deadline) {
      const selectedDate = new Date(activityData.deadline);
      const now = new Date();
      if (selectedDate < now) {
        alert("Deadline cannot be in the past. Please select a current or future date.");
        return;
      }
    }

    if (activityData.assignTo === "individual" && (!activityData.selectedStudents || activityData.selectedStudents.length === 0)) {
      alert("Please select at least one student for individual assignment");
      return;
    }

    try {
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
        deadline: activityData.deadline,
        assignTo: activityData.assignTo || 'wholeClass',
        selectedStudents: activityData.selectedStudents || []
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
      setCreatingActivity(false);
    }
  };

  const handleEditActivity = async (activityData) => {
    if (isActivityDuplicate(activityData.activityType, activityData.taskNumber) && 
        (editingActivity.activity_type !== activityData.activityType || 
         editingActivity.task_number !== activityData.taskNumber)) {
      const existingTaskNumbers = getExistingTaskNumbers(activityData.activityType);
      const message = `"${activityData.activityType} ${activityData.taskNumber}" already exists.\n\nExisting ${activityData.activityType}s:\n${existingTaskNumbers.map(num => `${num}`).join('\n')}`;
      setDuplicateMessage(message);
      setShowDuplicateModal(true);
      return;
    }

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

  const handleArchiveActivity = async (activity) => {
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

  const handleArchiveSchoolWork = (activity) => {
    if (isActivityActive(activity)) {
      alert("Cannot archive active activities. Please wait until the deadline passes or all submissions are graded.");
      return;
    }
    setActivityToArchive(activity);
    setShowArchiveModal(true);
  };

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

  const groupedActivities = {
    active: filteredActivities.filter(activity => isActivityActive(activity)),
    graded: filteredActivities.filter(activity => isFullyGraded(activity)),
    pastDeadline: filteredActivities.filter(activity => 
      isDeadlinePassed(activity.deadline) && !isFullyGraded(activity)
    )
  };

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

  const handleOpenSubmissions = (activity) => {
    setSelectedActivity(activity);
    setShowSubmissionsModal(true);
  };

  const handleEditSchoolWork = (activity) => {
    setEditingActivity(activity);
    setShowEditModal(true);
  };

  const renderEmptyState = () => (
    <div className="col-span-full text-center py-6">
      <div className={`mx-auto w-12 h-12 mb-3 rounded-full flex items-center justify-center ${
        isDarkMode ? 'bg-[#15151C]' : 'bg-gray-100'
      }`}>
        <img 
          src={SubjectDetailsIcon} 
          alt="No activities" 
          className="h-6 w-6 opacity-50"
          style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
        />
      </div>
      <p className={`text-xs mb-0.5 ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
        {searchQuery || filterOption !== "All" 
          ? "No activities match your search" 
          : "No activities created yet"
        }
      </p>
      <p className={`text-[10px] ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>
        Click the + button to create your first activity
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#23232C]' : 'bg-gray-50'}`}>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'} max-w-full overflow-x-hidden`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className={`p-5 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00A15D] border-r-transparent"></div>
            <p className={`mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading class details...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderActionButton = (to, icon, label, active = false, colorClass = "") => (
    <Link to={`${to}?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
      <button className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto min-w-0 ${
        active 
          ? (isDarkMode ? 'bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30' : 'bg-[#00A15D]/10 text-[#00A15D] border-[#00A15D]/20')
          : colorClass
      }`}>
        <img 
          src={icon} 
          alt="" 
          className="h-4 w-4 flex-shrink-0"
          style={isDarkMode ? {} : { filter: active ? 'none' : 'invert(0.5)' }}
        />
        <span className="sm:inline truncate text-xs sm:text-sm">{label}</span>
      </button>
    </Link>
  );

  const renderActivitySection = (title, activities, color) => (
    activities.length > 0 && (
      <>
        <div className="mb-2.5 mt-2.5">
          <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${color}`}></span>
            {title}
            <span className={`text-xs font-normal ml-2 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
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
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
        <hr className={`my-3 ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`} />
      </>
    )
  );

  return (
    <div className={`min-h-screen overflow-x-hidden ${isDarkMode ? 'bg-[#23232C]' : 'bg-gray-50'}`}>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'} max-w-full overflow-x-hidden`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-6 max-w-full overflow-x-hidden">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img
                src={Classwork}
                alt="Class"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-2"
                style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
              />
              <h1 className={`font-bold text-xl lg:text-2xl truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Class Work
              </h1>
            </div>
            <p className={`text-sm lg:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and create your class works
            </p>
          </div>

          <div className={`flex flex-col gap-1 text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT CODE:</span>
              <div className="flex items-center gap-2">
                <span>{classInfo?.subject_code || 'N/A'}</span>
                {classInfo?.subject_code && (
                  <button
                    onClick={copySubjectCode}
                    className={`p-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-[#15151C]' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title="Copy subject code"
                  >
                    <img 
                      src={Copy} 
                      alt="Copy" 
                      className="w-4 h-4"
                      style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
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
                    style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className={`mb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} />

          <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
            <div className="flex flex-col sm:flex-row gap-2 flex-1 flex-wrap min-w-0">
              {renderActionButton("/SubjectOverviewProfessor", SubjectOverview, "Subject Overview", false, isDarkMode ? "bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30 hover:bg-[#FF5252]/30" : "bg-[#FF5252]/10 text-[#FF5252] border-[#FF5252]/20 hover:bg-[#FF5252]/20")}
              {renderActionButton("/Class", Announcement, "Announcements", false, isDarkMode ? "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30" : "bg-[#767EE0]/10 text-[#767EE0] border-[#767EE0]/20 hover:bg-[#767EE0]/20")}
              {renderActionButton("/ClassworkTab", Classwork, "Class Work", true)}
              {renderActionButton("/Attendance", Attendance, "Attendance", false, isDarkMode ? "bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30" : "bg-[#FFA600]/10 text-[#FFA600] border-[#FFA600]/20 hover:bg-[#FFA600]/20")}
              {renderActionButton("/GradeTab", GradeIcon, "Grade", false, isDarkMode ? "bg-[#A15353]/20 text-[#A15353] border-[#A15353]/30 hover:bg-[#A15353]/30" : "bg-[#A15353]/10 text-[#A15353] border-[#A15353]/20 hover:bg-[#A15353]/20")}
              {renderActionButton("/AnalyticsTab", AnalyticsIcon, "Analytics", false, isDarkMode ? "bg-[#B39DDB]/20 text-[#B39DDB] border-[#B39DDB]/30 hover:bg-[#B39DDB]/30" : "bg-[#B39DDB]/10 text-[#B39DDB] border-[#B39DDB]/20 hover:bg-[#B39DDB]/20")}
            </div>
            
            <div className="flex items-center gap-2 justify-end sm:justify-start min-w-0">
              <Link to={`/StudentList?code=${subjectCode}`}>
                <div className="relative group">
                  <button className={`p-2 rounded-md shadow-md border-2 transition-all duration-200 flex-shrink-0 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-[#15151C] border-transparent hover:border-[#00A15D]' 
                      : 'bg-white border-transparent hover:border-[#00A15D]'
                  }`}>
                    <img 
                      src={ClassManagementIcon} 
                      alt="ClassManagement" 
                      className="h-4 w-4"
                      style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                    />
                  </button>
                  <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 ${
                    isDarkMode ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100 border border-gray-300'
                  }`}>
                    Student List
                  </div>
                </div>
              </Link>

              <Link to={`/ArchiveActivities?code=${subjectCode}`}>
                <div className="relative group">
                  <button className={`p-2 rounded-md shadow-md border-2 transition-all duration-200 flex-shrink-0 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-[#15151C] border-transparent hover:border-[#00A15D]' 
                      : 'bg-white border-transparent hover:border-[#00A15D]'
                  }`}>
                    <img 
                      src={Archive} 
                      alt="Archive" 
                      className="h-4 w-4"
                      style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                    />
                  </button>
                  <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 ${
                    isDarkMode ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100 border border-gray-300'
                  }`}>
                    Archived Activities
                  </div>
                </div>
              </Link>

              <div className="relative group">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className={`p-2 rounded-md shadow-md border-2 transition-all duration-200 flex-shrink-0 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-[#15151C] border-transparent hover:border-[#00A15D]' 
                      : 'bg-white border-transparent hover:border-[#00A15D]'
                  }`}>
                  <img 
                    src={Add} 
                    alt="Add" 
                    className="h-4 w-4"
                    style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                  />
                </button>
                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 ${
                  isDarkMode ? 'text-white bg-gray-800' : 'text-gray-900 bg-gray-100 border border-gray-300'
                }`}>
                  Create Activity
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
            <div className="relative filter-dropdown sm:w-36 min-w-0">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded border transition-all duration-200 text-xs font-medium cursor-pointer min-w-0 ${
                  filterOption !== "All" 
                    ? (isDarkMode ? 'border-[#767EE0] bg-[#767EE0]/10 text-[#767EE0]' : 'border-[#767EE0] bg-[#767EE0]/5 text-[#767EE0]')
                    : (isDarkMode ? 'border-gray-700 hover:border-[#767EE0] text-gray-300' : 'border-gray-300 hover:border-[#767EE0] text-gray-700')
                }`}
              >
                <span className="truncate">{filterOption}</span>
                <img
                  src={ArrowDown}
                  alt=""
                  className={`ml-1.5 h-2.5 w-2.5 transition-transform flex-shrink-0 ${
                    filterDropdownOpen ? 'rotate-180' : ''
                  } ${
                    filterOption !== "All" ? 'invert-[0.5] sepia-[1] saturate-[5] hue-rotate-[200deg]' : ''
                  }`}
                  style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                />
              </button>

              {filterDropdownOpen && (
                <div className={`absolute top-full mt-1 rounded w-full shadow-xl border z-20 overflow-hidden min-w-0 ${
                  isDarkMode ? 'bg-[#15151C] border-gray-700' : 'bg-white border-gray-300'
                }`}>
                  {["All", "Active", ...activityTypes, "Graded", "Past Deadline"].map((option) => (
                    <button
                      key={option}
                      className={`block px-2.5 py-1.5 w-full text-left hover:transition-colors cursor-pointer truncate text-xs ${
                        filterOption === option 
                          ? (isDarkMode ? 'bg-[#767EE0]/10 text-[#767EE0] border-l-2 border-[#767EE0] font-semibold' : 'bg-[#767EE0]/5 text-[#767EE0] border-l-2 border-[#767EE0] font-semibold')
                          : (isDarkMode ? 'text-gray-300 hover:bg-[#23232C]' : 'text-gray-700 hover:bg-gray-100')
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

            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full h-9 rounded px-2.5 py-1.5 pr-9 outline-none text-xs border transition-colors placeholder:text-gray-500 min-w-0 ${
                    isDarkMode 
                      ? 'bg-[#15151C] text-white border-gray-700 focus:border-[#767EE0]' 
                      : 'bg-white text-gray-900 border-gray-300 focus:border-[#767EE0]'
                  }`}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2">
                  <img
                    src={Search}
                    alt="Search"
                    className="h-3.5 w-3.5"
                    style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2.5 min-w-0">
            {renderActivitySection("Active Activities", groupedActivities.active, isDarkMode ? "bg-[#767EE0]" : "bg-[#767EE0]/80")}
            {renderActivitySection("Graded Activities", groupedActivities.graded, isDarkMode ? "bg-[#00A15D]" : "bg-[#00A15D]/80")}
            {renderActivitySection("Past Deadline", groupedActivities.pastDeadline, isDarkMode ? "bg-[#A15353]" : "bg-[#A15353]/80")}
            
            {filteredActivities.length === 0 && renderEmptyState()}
          </div>
        </div>
      </div>

      <ClassWorkCreate
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateActivity={handleCreateActivity}
        activityTypes={activityTypes}
        getCurrentDateTime={getCurrentDateTime}
        subjectCode={subjectCode}
        creatingActivity={creatingActivity}
        isDarkMode={isDarkMode}
      />

      <ClassWorkEdit
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditActivity}
        activity={editingActivity}
        activityTypes={activityTypes}
        getCurrentDateTime={getCurrentDateTime}
        subjectCode={subjectCode}
        isDarkMode={isDarkMode}
      />

      <ClassWorkArchive
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchiveActivity}
        activity={activityToArchive}
        isDarkMode={isDarkMode}
      />

      <ClassWorkSubmission
        activity={selectedActivity}
        isOpen={showSubmissionsModal}
        onClose={() => setShowSubmissionsModal(false)}
        onSave={handleSaveSubmissions}
        professorName={classInfo?.professor_name}
        isDarkMode={isDarkMode}
      />

      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
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

      <ClassWorkSuccess
        isOpen={showCreateSuccessModal}
        onClose={() => setShowCreateSuccessModal(false)}
        message="Activity created successfully!"
        type="success"
        isDarkMode={isDarkMode}
      />

      <ClassWorkSuccess
        isOpen={showEditSuccessModal}
        onClose={() => setShowEditSuccessModal(false)}
        message="Activity updated successfully!"
        type="edit"
        isDarkMode={isDarkMode}
      />

      <ClassWorkSuccess
        isOpen={showGradeSuccessModal}
        onClose={() => setShowGradeSuccessModal(false)}
        message="Grades saved successfully!"
        type="grade"
        isDarkMode={isDarkMode}
      />

      <ClassWorkSuccess
        isOpen={showArchiveSuccessModal}
        onClose={() => setShowArchiveSuccessModal(false)}
        message="Activity archived successfully!"
        type="archive"
        isDarkMode={isDarkMode}
      />
    </div>
  );
}