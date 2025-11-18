import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ActivityCard from "../../Components/ActivityCard";

import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Add from "../../assets/Add(Light).svg";
import Archive from "../../assets/Archive(Light).svg";
import ArrowDown from "../../assets/ArrowDown(Light).svg";
import SuccessIcon from '../../assets/Success(Green).svg';
import ArchiveWarningIcon from '../../assets/Warning(Yellow).svg';

export default function SubjectDetails() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [activities, setActivities] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityToArchive, setActivityToArchive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Create modal form states
  const [activityType, setActivityType] = useState("");
  const [taskNumber, setTaskNumber] = useState("");
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [link, setLink] = useState("");
  const [points, setPoints] = useState("");
  const [deadline, setDeadline] = useState("");
  
  // Edit modal form states
  const [editActivityType, setEditActivityType] = useState("");
  const [editTaskNumber, setEditTaskNumber] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editInstruction, setEditInstruction] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  
  // Dropdown states
  const [activityTypeDropdownOpen, setActivityTypeDropdownOpen] = useState(false);
  const [editActivityTypeDropdownOpen, setEditActivityTypeDropdownOpen] = useState(false);
  
  const activityTypes = ["Assignment","Quiz", "Activity", "Project", "Laboratory", "Announcement"];

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

  // Fetch class details
  useEffect(() => {
    if (subjectCode) {
      fetchClassDetails();
    }
  }, [subjectCode]);

  // Fetch students and activities after classInfo is available
  useEffect(() => {
    if (classInfo) {
      fetchActivities();
    }
  }, [classInfo]);

  const fetchClassDetails = async () => {
    try {
      const professorId = getProfessorId();
      const response = await fetch(`https://tracked.6minds.site/Professor/SubjectDetailsDB/get_class_details.php?subject_code=${subjectCode}&professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setClassInfo(result.class_data);
        }
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(`https://tracked.6minds.site/Professor/SubjectDetailsDB/get_activities.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched activities result:', result);
        if (result.success) {
          // Use the school_work_edited flag from the database directly
          setActivities(result.activities);
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

const handleCreateActivity = async () => {
  // Validate required fields
  if (!activityType || !taskNumber || !title) {
    alert("Please fill in all required fields (Activity Type, Task Number, and Title)");
    return;
  }

  // Validate points (should not be negative)
  if (points < 0) {
    alert("Points cannot be negative. Please enter a value of 0 or higher.");
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

  try {
    const professorId = getProfessorId();
    const activityData = {
      subject_code: subjectCode,
      professor_ID: professorId,
      activity_type: activityType,
      task_number: taskNumber,
      title: title,
      instruction: instruction,
      link: link,
      points: points || 0,
      deadline: deadline
    };

    console.log('Creating activity with data:', activityData);

    const response = await fetch('https://tracked.6minds.site/Professor/SubjectDetailsDB/create_activity.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData)
    });

    // Get the raw response text first
    const rawResponse = await response.text();
    console.log('Raw response from server:', rawResponse);
    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);

    // Check if response looks like HTML/error
    if (rawResponse.trim().startsWith('<') || rawResponse.includes('<br />') || rawResponse.includes('<!DOCTYPE')) {
      console.error('Server returned HTML instead of JSON. This indicates a PHP error.');
      alert('Server error: Please check the PHP error logs');
      return;
    }

    // Try to parse as JSON
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
      
      // Reset form fields
      setActivityType("");
      setTaskNumber("");
      setTitle("");
      setInstruction("");
      setLink("");
      setPoints("");
      setDeadline("");
      setShowCreateModal(false);
      
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } else {
      alert('Error creating activity: ' + result.message);
    }
  } catch (error) {
    console.error('Network error creating activity:', error);
    alert('Network error creating activity. Please try again.');
  }
};

  const handleEditSchoolWork = (activity) => {
    setEditingActivity(activity);
    setEditActivityType(activity.activity_type || "");
    setEditTaskNumber(activity.task_number || "");
    setEditTitle(activity.title || "");
    setEditInstruction(activity.instruction || "");
    setEditLink(activity.link || "");
    setEditPoints(activity.points || "");
    
    // FIX: Properly format the deadline for datetime-local input
    let formattedDeadline = "";
    if (activity.deadline) {
      // Convert the database datetime to the format needed for datetime-local input
      const date = new Date(activity.deadline);
      
      // Check if the date is valid
      if (!isNaN(date.getTime())) {
        // Format: YYYY-MM-DDTHH:mm
        formattedDeadline = date.toISOString().slice(0, 16);
      } else {
        // If parsing fails, try to handle the string directly
        console.warn('Invalid date format for deadline:', activity.deadline);
        formattedDeadline = activity.deadline.split(' ')[0] + 'T00:00'; // Fallback
      }
    }
    
    setEditDeadline(formattedDeadline);
    setShowEditModal(true);
  };

const handleSaveSchoolWork = async () => {
  // Validate points (should not be negative)
  if (editPoints < 0) {
    alert("Points cannot be negative. Please enter a value of 0 or higher.");
    return;
  }

  // Validate deadline (should not be in the past)
  if (editDeadline) {
    const selectedDate = new Date(editDeadline);
    const now = new Date();
    if (selectedDate < now) {
      alert("Deadline cannot be in the past. Please select a current or future date.");
      return;
    }
  }

  try {
    const updatedActivityData = {
      activity_type: editActivityType,
      task_number: editTaskNumber,
      title: editTitle,
      instruction: editInstruction,
      link: editLink,
      points: editPoints || 0,
      deadline: editDeadline
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
      // Refresh activities to get the updated school_work_edited flag from database
      await fetchActivities();
      
      setShowEditModal(false);
      setEditingActivity(null);
      
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } else {
      alert('Error updating activity: ' + result.message);
    }
  } catch (error) {
    console.error('Error updating activity:', error);
    alert('Error updating activity. Please try again.');
  }
};

  const handleArchiveActivity = (activity) => {
    setActivityToArchive(activity);
    setShowArchiveModal(true);
  };

  const confirmArchive = async () => {
    if (!activityToArchive) return;

    try {
      const professorId = getProfessorId();
      
      const response = await fetch('https://tracked.6minds.site/Professor/ArchiveActivitiesDB/archive_activity.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_ID: activityToArchive.id,
          professor_ID: professorId
        })
      });

      const result = await response.json();

      if (result.success) {
        setActivities(prev => prev.filter(activity => activity.id !== activityToArchive.id));
        setShowArchiveModal(false);
        setActivityToArchive(null);
        
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
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
  
  const handleSaveActivity = async (activityId, updatedStudents) => {
    try {
      console.log('Saving grades for activity:', activityId, 'Students:', updatedStudents);
      
      const response = await fetch('https://tracked.6minds.site/Professor/SubjectDetailsDB/update_activity_grades.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_ID: activityId,
          students: updatedStudents
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Save result:', result);

      if (result.success) {
        setEditingActivityId(null);
        // Update students but DON'T mark as edited for record edits
        setActivities(prev => prev.map(activity => 
          activity.id === activityId 
            ? { 
                ...activity, 
                students: updatedStudents
                // Don't set isEdited or schoolWorkEdited here
              }
            : activity
        ));
      } else {
        alert('Error saving grades: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Error saving grades. Please try again. Error: ' + error.message);
    }
  };

  const handleMarkAllSubmitted = async (activityId) => {
    try {
      const activity = activities.find(a => a.id === activityId);
      if (!activity || !activity.students) {
        console.error('Activity or students not found');
        return;
      }

      // Prepare students data
      const studentsData = activity.students.map(student => ({
        user_ID: student.user_ID || student.id,
        user_Name: student.user_Name || student.name
      }));

      // Include the activity points in the request
      const requestData = {
        activity_ID: activityId,
        students: studentsData,
        points: activity.points // Send the current activity points
      };

      const response = await fetch('https://tracked.6minds.site/Professor/SubjectDetailsDB/mark_all_submitted.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state with the points from server response
        const assignedPoints = result.data.points_assigned;
        
        setActivities(prev => prev.map(activity => 
          activity.id === activityId 
            ? {
                ...activity,
                students: activity.students.map(student => ({
                  ...student,
                  submitted: true,
                  late: false,
                  grade: assignedPoints // Use the exact points from server
                }))
                // Don't set isEdited or schoolWorkEdited here
              }
            : activity
        ));

        console.log('Mark all submitted successful. Points assigned:', assignedPoints);
      } else {
        console.error('Error marking all as submitted:', result.message);
        alert('Error marking all as submitted: ' + result.message);
      }
    } catch (error) {
      console.error('Error marking all as submitted:', error);
      alert('Error marking all as submitted. Please try again.');
    }
  };

  const handleGradeChange = (activityId, studentId, value) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? {
            ...activity,
            students: activity.students.map(student =>
              student.user_ID === studentId
                ? { ...student, grade: value }
                : student
            )
          }
        : activity
    ));
  };

  const handleSubmissionChange = (activityId, studentId, status) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? {
            ...activity,
            students: activity.students.map(student =>
              student.user_ID === studentId
                ? { 
                    ...student, 
                    submitted: status === 'submitted' || status === 'late',
                    late: status === 'late'
                  }
                : student
            )
          }
        : activity
    ));
  };

  // FIX: Check if there are students before allowing edit mode
  const handleEditToggle = (activityId) => {
      const activity = activities.find(a => a.id === activityId);
      
      // Check if activity has enrolled students
      if (!activity || !activity.students || activity.students.length === 0) {
          alert("Cannot edit records: No enrolled students found for this activity.");
          return;
      }
      
      setEditingActivityId(editingActivityId === activityId ? null : activityId);
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
        No activities created yet.
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
          <div className="p-5 text-center">Loading...</div>
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
          
          {/* Page Header - Updated to match ClassManagement style */}
          <div className="mb-4 sm:mb-4">
            <div className="flex items-center mb-2">
              <img
                src={SubjectDetailsIcon}
                alt="SubjectDetailsIcon"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Subject Details
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              Academic Management
            </p>
          </div>

          {/* Subject Information */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo?.subject_code || 'Loading...'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'Loading...'}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Section:</span>
                <span>{classInfo?.section || 'Loading...'}</span>
              </div>
              <Link to={"/ClassManagement"} className="sm:hidden">
                <img 
                  src={BackButton} 
                  alt="Back" 
                  className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* ATTENDANCE, ADD, and ARCHIVE Buttons */}
          <div className="flex items-center justify-between w-full mt-4 sm:mt-5 gap-3">
            <Link to={`/Attendance?code=${subjectCode}`} className="flex-1 sm:flex-initial">
              <button className="px-4 sm:px-5 py-2 bg-white font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 cursor-pointer">
                ATTENDANCE
              </button>
            </Link>

            <div className="flex items-center gap-2">
              <Link to={`/ArchiveActivities?code=${subjectCode}`}>
                <button className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer">
                  <img 
                    src={Archive} 
                    alt="Archive" 
                    className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </Link>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer">
                <img 
                  src={Add} 
                  alt="Add" 
                  className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>

          {/* ACTIVITY CARDS */}
          <div className="space-y-4 mt-4 sm:mt-5">
            {activities.length === 0 ? (
              renderEmptyState()
            ) : (
              activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  isEditing={editingActivityId === activity.id}
                  onGradeChange={(studentId, value) => handleGradeChange(activity.id, studentId, value)}
                  onSubmissionChange={(studentId, status) => handleSubmissionChange(activity.id, studentId, status)}
                  onSave={(updatedStudents) => handleSaveActivity(activity.id, updatedStudents)}
                  onMarkAllSubmitted={() => handleMarkAllSubmitted(activity.id)}
                  onEditToggle={() => handleEditToggle(activity.id)}
                  onEditSchoolWork={() => handleEditSchoolWork(activity)}
                  onArchive={() => handleArchiveActivity(activity)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Rest of the modals remain the same */}
      {/* Create School Work Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50 overlay-fade p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
              setActivityTypeDropdownOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg p-4 sm:p-6 md:p-8 relative modal-pop max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setActivityTypeDropdownOpen(false);
              }}
              aria-label="Close modal"
              className="absolute top-4 right-4 sm:right-6 md:right-8 top-5 sm:hidden cursor-pointer"
            >
              <img
                src={BackButton}
                alt="BackButton"
                className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6"
              />
            </button>

            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 pr-8">
              Create School Work
            </h2>
            <hr className="border-gray-300 mb-3 sm:mb-4" />

            {/* Modal Body */}
            <div className="space-y-4">
              {/* Activity Type Dropdown */}
              <div className="relative">
                <label className="text-sm font-semibold mb-1.5 block">Activity Type</label>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivityTypeDropdownOpen(!activityTypeDropdownOpen);
                  }}
                  className="w-full bg-white border border-gray-300 text-black rounded-md px-4 py-2.5 flex items-center justify-between hover:border-[#00874E] transition-colors"
                >
                  <span className="text-sm">{activityType || "Activity Type"}</span>
                  <img 
                    src={ArrowDown} 
                    alt="Arrow" 
                    className={`h-4 w-4 transition-transform ${activityTypeDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                {activityTypeDropdownOpen && (
                  <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-10 max-h-48 overflow-y-auto">
                    {activityTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setActivityType(type);
                          setActivityTypeDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 transition-colors"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Task Number Input */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Task Number:</label>
                <input
                  type="text"
                  placeholder="Activity 1"
                  value={taskNumber}
                  onChange={(e) => setTaskNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Title Input */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Title:</label>
                <input
                  type="text"
                  placeholder="Title*"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Instruction Textarea */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Instruction:</label>
                <textarea
                  placeholder="Instruction"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none min-h-[100px] resize-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Link Input */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Link:</label>
                <input
                  type="text"
                  placeholder="Insert Link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Points Input */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Points:</label>
                <input
                  type="number"
                  placeholder="--"
                  value={points}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers up to 3 digits (0-999) and prevent negative values
                    if (value === '' || (value >= 0 && value <= 999 && value.length <= 3)) {
                      setPoints(value);
                    }
                  }}
                  min="0"
                  max="999"
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Deadline Input */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Deadline:</label>
                <input
                  type="datetime-local"
                  placeholder="Select deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={getCurrentDateTime()} // Prevent past dates
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateActivity}
                className="w-full bg-[#00A15D] text-white font-bold py-2.5 rounded-md hover:bg-[#00874E] transition-colors text-sm sm:text-base cursor-pointer mt-2"
              >
                Create
              </button>
            </div>
          </div>

          <style>{`
            .overlay-fade { animation: overlayFade .18s ease-out both; }
            @keyframes overlayFade { from { opacity: 0 } to { opacity: 1 } }

            .modal-pop {
              transform-origin: top center;
              animation: popIn .22s cubic-bezier(.2,.8,.2,1) both;
            }
            @keyframes popIn {
              from { opacity: 0; transform: translateY(-8px) scale(.98); }
              to   { opacity: 1; transform: translateY(0)   scale(1);    }
            }
          `}</style>
        </div>
      )}

      {/* Edit School Work Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50 overlay-fade p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setEditActivityTypeDropdownOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg p-4 sm:p-6 md:p-8 relative modal-pop max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditActivityTypeDropdownOpen(false);
              }}
              aria-label="Close modal"
              className="absolute top-4 right-4 sm:right-6 md:right-8 top-5 sm:hidden cursor-pointer"
            >
              <img
                src={BackButton}
                alt="BackButton"
                className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6"
              />
            </button>

            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 pr-8">
              Edit School Work
            </h2>
            <hr className="border-gray-300 mb-3 sm:mb-4" />

            {/* Modal Body */}
            <div className="space-y-4">
              {/* Activity Type Dropdown */}
              <div className="relative">
                <label className="text-sm font-semibold mb-1.5 block">Activity Type</label>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditActivityTypeDropdownOpen(!editActivityTypeDropdownOpen);
                  }}
                  className="w-full bg-white border border-gray-300 text-black rounded-md px-4 py-2.5 flex items-center justify-between hover:border-[#00874E] transition-colors"
                >
                  <span className="text-sm">{editActivityType || "Activity Type"}</span>
                  <img 
                    src={ArrowDown} 
                    alt="Arrow" 
                    className={`h-4 w-4 transition-transform ${editActivityTypeDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                {editActivityTypeDropdownOpen && (
                  <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-10 max-h-48 overflow-y-auto">
                    {activityTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setEditActivityType(type);
                          setEditActivityTypeDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 transition-colors"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Task Number Input */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Task Number:</label>
                <input
                  type="text"
                  placeholder="Activity 1"
                  value={editTaskNumber}
                  onChange={(e) => setEditTaskNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Title Input */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Title:</label>
                <input
                  type="text"
                  placeholder="Title*"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Instruction Textarea */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Instruction:</label>
                <textarea
                  placeholder="Instruction"
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none min-h-[100px] resize-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Link Input */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Link:</label>
                <input
                  type="text"
                  placeholder="Insert Link"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Points Input */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Points:</label>
                <input
                  type="number"
                  placeholder="--"
                  value={editPoints}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers up to 3 digits (0-999) and prevent negative values
                    if (value === '' || (value >= 0 && value <= 999 && value.length <= 3)) {
                      setEditPoints(value);
                    }
                  }}
                  min="0"
                  max="999"
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

            {/* Deadline Input - FIXED: Now properly shows the existing deadline */}
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Deadline:</label>
              <input
                type="datetime-local"
                placeholder="Select deadline"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                min={getCurrentDateTime()} // Prevent past dates
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
              />
            </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSchoolWork}
                className="w-full bg-[#00A15D] text-white font-bold py-2.5 rounded-md hover:bg-[#00874E] transition-colors text-sm sm:text-base cursor-pointer mt-2"
              >
                Save Changes
              </button>
            </div>
          </div>

          <style>{`
            .overlay-fade { animation: overlayFade .18s ease-out both; }
            @keyframes overlayFade { from { opacity: 0 } to { opacity: 1 } }

            .modal-pop {
              transform-origin: top center;
              animation: popIn .22s cubic-bezier(.2,.8,.2,1) both;
            }
            @keyframes popIn {
              from { opacity: 0; transform: translateY(-8px) scale(.98); }
              to   { opacity: 1; transform: translateY(0)   scale(1);    }
            }
          `}</style>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveModal && activityToArchive && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowArchiveModal(false);
              setActivityToArchive(null);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <img 
                  src={ArchiveWarningIcon} 
                  alt="Warning" 
                  className="h-8 w-8" 
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Archive Activity?
              </h3>
              
              <div className="mt-4 mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  Are you sure you want to archive this activity?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {activityToArchive.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Type: {activityToArchive.activity_type}
                  </p>
                  <p className="text-sm text-gray-600">
                    Task: {activityToArchive.task_number}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowArchiveModal(false);
                    setActivityToArchive(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmArchive}
                  className="flex-1 bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - Auto-dismiss */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4">
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <img 
                  src={SuccessIcon} 
                  alt="Success" 
                  className="h-8 w-8"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Success!
              </h3>
              
              <p className="text-sm text-gray-600">
                {showEditModal ? "Activity updated successfully!" : 
                 showArchiveModal ? "Activity archived successfully!" : 
                 "Activity created successfully!"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}