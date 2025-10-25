import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import ActivityCard from "../../Components/Activities";

import ClassManagementLight from '../../assets/ClassManagement(Light).svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Add from "../../assets/Add(Light).svg";
import ArrowDown from "../../assets/ArrowDown(Light).svg";
import ActivityIcon from '../../assets/ClassManagement(Light).svg';
import SuccessIcon from '../../assets/Success(Green).svg'; // Add this import

export default function SubjectDetails() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activities, setActivities] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Add this state
  
  // Modal form states
  const [activityType, setActivityType] = useState("");
  const [taskNumber, setTaskNumber] = useState("");
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [link, setLink] = useState("");
  const [points, setPoints] = useState("");
  const [deadline, setDeadline] = useState("");
  
  // Dropdown state
  const [activityTypeDropdownOpen, setActivityTypeDropdownOpen] = useState(false);
  
  const activityTypes = ["Assignment", "Activity", "Project", "Laboratory", "Announcement"];

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

  // Fetch class details and students
  useEffect(() => {
    if (subjectCode) {
      fetchClassDetails();
    }
  }, [subjectCode]);

  // Fetch students and activities after classInfo is available
  useEffect(() => {
    if (classInfo) {
      fetchStudents();
      fetchActivities();
    }
  }, [classInfo]);

  const fetchClassDetails = async () => {
    try {
      const professorId = getProfessorId();
      const response = await fetch(`http://localhost/TrackEd/src/Pages/Professor/SubjectDetailsDB/get_class_details.php?subject_code=${subjectCode}&professor_ID=${professorId}`);
      
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

  const fetchStudents = async () => {
    try {
      if (!classInfo) return;
      
      const response = await fetch(`http://localhost/TrackEd/src/Pages/Professor/SubjectDetailsDB/get_students_by_section.php?section=${classInfo.section}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Just fetch, don't set state if not needed
          console.log('Fetched students:', result.students);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(`http://localhost/TrackEd/src/Pages/Professor/SubjectDetailsDB/get_activities.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched activities result:', result); // Debug log
        if (result.success) {
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

      console.log('Creating activity with data:', activityData); // Debug log

      const response = await fetch('http://localhost/TrackEd/src/Pages/Professor/SubjectDetailsDB/create_activity.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData)
      });

      const result = await response.json();
      console.log('Create activity response:', result); // Debug log

      if (result.success) {
        // Refresh activities to get the new one with students
        await fetchActivities(); // Fixed: added await here
        
        // Reset form and close modal
        setActivityType("");
        setTaskNumber("");
        setTitle("");
        setInstruction("");
        setLink("");
        setPoints("");
        setDeadline("");
        setShowModal(false);
        
        // Show success modal instead of alert
        setShowSuccessModal(true);
        
        // Auto-hide modal after 2 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      } else {
        alert('Error creating activity: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Error creating activity. Please try again.');
    }
  };
  
  const handleSaveActivity = async (activityId, updatedStudents) => {
    try {
      console.log('Saving grades for activity:', activityId, 'Students:', updatedStudents);
      
      const response = await fetch('http://localhost/TrackEd/src/Pages/Professor/SubjectDetailsDB/update_activity_grades.php', {
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
        setEditingActivityId(null); // Exit edit mode after saving
        // Update local state
        setActivities(prev => prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, students: updatedStudents }
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

  const handleMarkAllSubmitted = (activityId) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? {
            ...activity,
            students: activity.students.map(student => ({
              ...student,
              submitted: true
            }))
          }
        : activity
    ));
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

  const handleEditToggle = (activityId) => {
    setEditingActivityId(editingActivityId === activityId ? null : activityId);
  };

  // Render empty state when no activities
  const renderEmptyState = () => (
    <div className="col-span-full text-center py-8 sm:py-12 lg:py-16">
      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-4 sm:mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <img 
          src={ActivityIcon} 
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
        <Sidebar role="teacher" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen} userName="Jane Doe" />
          <div className="p-5 text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="teacher" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen} userName="Jane Doe" />

        <div className="p-3 sm:p-4 md:p-5 lg:p-5 xl:p-5">
          {/* "Header" of SUBJECT DETAILS PROF */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 sm:mb-4">
            <div className='flex items-center mb-2 sm:mb-0'>
              <img 
                src={ClassManagementLight} 
                alt="ClassManagement" 
                className='h-7 w-7 sm:h-6 sm:w-7 md:h-7 md:w-7 mr-3 sm:mr-3 mt-0.5 ml-2' 
              />
              <p className="font-bold text-xl sm:text-xl md:text-xl lg:text-[1.5rem] text-[#465746]">
                Class Management
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5 ml-2">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo?.subject_code || 'Loading...'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'Loading...'}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 sm:mr-5">
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

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

          {/* ATTENDANCE and ADD Button */}
          <div className="flex items-center justify-between w-full mt-4 sm:mt-5 gap-3">
            <Link to={`/Attendance?code=${subjectCode}`} className="flex-1 sm:flex-initial">
              <button className="px-4 sm:px-5 py-2 bg-white font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 cursor-pointer">
                ATTENDANCE
              </button>
            </Link>

            <button 
              onClick={() => setShowModal(true)}
              className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer">
              <img src={Add} alt="Add" className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
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
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create School Work Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50 overlay-fade p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setActivityTypeDropdownOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg p-4 sm:p-6 md:p-8 relative modal-pop max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowModal(false);
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
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Deadline Input */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Deadline:</label>
                <input
                  type="date"
                  placeholder="dd / mm / yy"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
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
                Activity created successfully!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}