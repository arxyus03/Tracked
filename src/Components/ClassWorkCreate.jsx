import React, { useState, useEffect } from 'react';
import BackButton from '../assets/BackButton(Light).svg';
import ArrowDown from "../assets/ArrowDown(Light).svg";

const ClassWorkCreate = ({ 
  isOpen, 
  onClose, 
  onCreateActivity,
  onDuplicateTask,
  activityTypes = ["Assignment", "Quiz", "Activity", "Project", "Laboratory", "Announcement"],
  getCurrentDateTime,
  subjectCode,
  creatingActivity = false
}) => {
  const [activityType, setActivityType] = useState("");
  const [taskNumber, setTaskNumber] = useState("");
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [link, setLink] = useState("");
  const [points, setPoints] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignTo, setAssignTo] = useState("wholeClass");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [realStudents, setRealStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [existingActivities, setExistingActivities] = useState([]);
  const [setLoadingActivities] = useState(false);
  
  const [activityTypeDropdownOpen, setActivityTypeDropdownOpen] = useState(false);
  const [assignToDropdownOpen, setAssignToDropdownOpen] = useState(false);

  // Fetch real students and existing activities when component opens
  useEffect(() => {
    if (isOpen && subjectCode) {
      fetchClassStudents();
      fetchExistingActivities();
    }
  }, [isOpen, subjectCode]);

  const fetchClassStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await fetch(`https://tracked.6minds.site/Professor/SubjectDetailsDB/get_students_by_section.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched students:', result);
        if (result.success) {
          setRealStudents(result.students || []);
        } else {
          console.error('Error fetching students:', result.message);
          setRealStudents([]);
        }
      } else {
        throw new Error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setRealStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchExistingActivities = async () => {
    try {
      setLoadingActivities(true);
      const response = await fetch(`https://tracked.6minds.site/Professor/SubjectDetailsDB/get_activities.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched existing activities:', result);
        if (result.success) {
          setExistingActivities(result.activities || []);
        } else {
          console.error('Error fetching activities:', result.message);
          setExistingActivities([]);
        }
      } else {
        throw new Error('Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setExistingActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Check if task number already exists for the same activity type
  const isTaskNumberDuplicate = () => {
    if (!activityType || !taskNumber) return false;
    
    return existingActivities.some(activity => 
      activity.activity_type === activityType && 
      activity.task_number === taskNumber
    );
  };

  // Get existing task numbers for the selected activity type
  const getExistingTaskNumbers = () => {
    if (!activityType) return [];
    
    return existingActivities
      .filter(activity => activity.activity_type === activityType)
      .map(activity => activity.task_number)
      .sort((a, b) => a - b);
  };

  const resetForm = () => {
    setActivityType("");
    setTaskNumber("");
    setTitle("");
    setInstruction("");
    setLink("");
    setPoints("");
    setDeadline("");
    setAssignTo("wholeClass");
    setSelectedStudents([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === realStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(realStudents.map(student => student.tracked_ID));
    }
  };

  const handleCreate = () => {
    // Don't allow creating if already in progress
    if (creatingActivity) return;

    // Validate required fields
    if (!activityType || !taskNumber || !title) {
      alert("Please fill in all required fields (Activity Type, Task Number, and Title)");
      return;
    }

    // Check for duplicate task number
    if (isTaskNumberDuplicate()) {
      const existingTaskNumbers = getExistingTaskNumbers();
      const message = `"${activityType} ${taskNumber}" has already been created.\n\nExisting ${activityType}s: ${existingTaskNumbers.join(', ')}`;
      
      // Call the duplicate handler if provided, otherwise use alert
      if (onDuplicateTask) {
        onDuplicateTask(message);
      } else {
        alert(message);
      }
      return;
    }

    // Prepare assignment data
    const assignmentData = {
      assignTo,
      selectedStudents: assignTo === "individual" ? selectedStudents : []
    };

    onCreateActivity({
      activityType,
      taskNumber,
      title,
      instruction,
      link,
      points,
      deadline,
      ...assignmentData
    });
  };

  if (!isOpen) return null;

  const isDuplicate = isTaskNumberDuplicate();
  const existingTaskNumbers = getExistingTaskNumbers();

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
          setActivityTypeDropdownOpen(false);
          setAssignToDropdownOpen(false);
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-4xl mx-2 sm:mx-4 p-4 sm:p-6 lg:p-8 relative modal-pop max-h-[95vh] overflow-y-auto">
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors cursor-pointer touch-manipulation"
        >
          <img
            src={BackButton}
            alt="BackButton"
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
        </button>

        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 pr-10">
          Create School Work
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          Fill in the details to create a new activity
        </p>
        <hr className="border-gray-200 mb-4 sm:mb-5" />

        {/* Modal Body - Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          {/* Left Column - Basic Information */}
          <div className="space-y-4 sm:space-y-5">
            {/* Deadline Input */}
            <div>
              <label className="text-xs sm:text-sm font-semibold mb-2 block text-gray-700">Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={getCurrentDateTime()}
                className="w-full border-2 border-gray-300 rounded-md px-3 sm:px-4 py-2.5 sm:py-3 outline-none text-xs sm:text-sm focus:border-[#00874E] transition-colors"
              />
            </div>

            {/* Activity Type Dropdown */}
            <div className="relative">
              <label className="text-xs sm:text-sm font-semibold mb-2 block text-gray-700">
                Activity Type <span className="text-red-500">*</span>
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivityTypeDropdownOpen(!activityTypeDropdownOpen);
                }}
                className="w-full bg-white border-2 border-gray-300 text-black rounded-md px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between hover:border-[#00874E] active:border-[#00874E] focus:border-[#00874E] transition-colors cursor-pointer touch-manipulation text-sm"
              >
                <span className={`${!activityType ? 'text-gray-500' : ''}`}>
                  {activityType || "Select Activity Type"}
                </span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${activityTypeDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              {activityTypeDropdownOpen && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-xl border border-gray-200 z-10 overflow-hidden max-h-40 overflow-y-auto">
                  {activityTypes.map((type) => (
                    <button
                      key={type}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivityType(type);
                        setActivityTypeDropdownOpen(false);
                      }}
                      className="block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer touch-manipulation"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Task Number Input */}
            <div>
              <label className="text-xs sm:text-sm font-semibold mb-2 block text-gray-700">
                Task Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Activity 1"
                value={taskNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers and limit to 2 digits
                  if (value === '' || /^\d{1,2}$/.test(value)) {
                    setTaskNumber(value);
                  }
                }}
                onKeyPress={(e) => {
                  // Prevent non-numeric characters from being entered
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`w-full border-2 rounded-md px-3 sm:px-4 py-2.5 sm:py-3 outline-none text-xs sm:text-sm focus:border-[#00874E] transition-colors ${
                  isDuplicate 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
              />
              {isDuplicate && (
                <p className="text-red-500 text-xs mt-1">
                  ⚠️ {activityType} {taskNumber} already exists!
                </p>
              )}
              {activityType && existingTaskNumbers.length > 0 && (
                <p className="text-gray-500 text-xs mt-1">
                  Existing {activityType}s: {existingTaskNumbers.join(', ')}
                </p>
              )}
            </div>

            {/* Title Input */}
            <div>
              <label className="text-xs sm:text-sm font-semibold mb-2 block text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-md px-3 sm:px-4 py-2.5 sm:py-3 outline-none text-xs sm:text-sm focus:border-[#00874E] transition-colors"
              />
            </div>

            {/* Assign To Dropdown */}
            <div className="relative">
              <label className="text-xs sm:text-sm font-semibold mb-2 block text-gray-700">
                Assign To <span className="text-red-500">*</span>
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAssignToDropdownOpen(!assignToDropdownOpen);
                }}
                className="w-full bg-white border-2 border-gray-300 text-black rounded-md px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between hover:border-[#00874E] active:border-[#00874E] focus:border-[#00874E] transition-colors cursor-pointer touch-manipulation text-sm"
              >
                <span>
                  {assignTo === "wholeClass" ? "Whole Class" : "Individual Students"}
                </span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${assignToDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              {assignToDropdownOpen && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-xl border border-gray-200 z-10 overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssignTo("wholeClass");
                      setAssignToDropdownOpen(false);
                    }}
                    className="block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer touch-manipulation"
                  >
                    Whole Class
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssignTo("individual");
                      setAssignToDropdownOpen(false);
                    }}
                    className="block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer touch-manipulation"
                  >
                    Individual Students
                  </button>
                </div>
              )}
            </div>

            {/* Points Input */}
            <div>
              <label className="text-xs sm:text-sm font-semibold mb-2 block text-gray-700">Points</label>
              <input
                type="number"
                placeholder="0"
                value={points}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (value >= 0 && value <= 999)) {
                    setPoints(value);
                  }
                }}
                min="0"
                max="999"
                className="w-full border-2 border-gray-300 rounded-md px-3 sm:px-4 py-2.5 sm:py-3 outline-none text-xs sm:text-sm focus:border-[#00874E] transition-colors"
              />
            </div>

            {/* Link Input */}
            <div>
              <label className="text-xs sm:text-sm font-semibold mb-2 block text-gray-700">Link</label>
              <input
                type="text"
                placeholder="Enter link (optional)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-md px-3 sm:px-4 py-2.5 sm:py-3 outline-none text-xs sm:text-sm focus:border-[#00874E] transition-colors"
              />
            </div>
          </div>

          {/* Right Column - Student Selection and Instructions */}
          <div className="space-y-4 sm:space-y-5">
            {/* Student Selection (only show when individual is selected) */}
            {assignTo === "individual" && (
              <div className="border-2 border-gray-300 rounded-md p-3 sm:p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700">
                    Select Students
                  </label>
                  {!loadingStudents && realStudents.length > 0 && (
                    <button
                      onClick={handleSelectAllStudents}
                      className="text-xs text-[#00874E] hover:text-[#006B3D] font-medium cursor-pointer"
                    >
                      {selectedStudents.length === realStudents.length ? "Deselect All" : "Select All"}
                    </button>
                  )}
                </div>
                
                {loadingStudents ? (
                  <div className="text-center py-4">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#00874E] border-r-transparent"></div>
                    <p className="text-xs text-gray-500 mt-2">Loading students...</p>
                  </div>
                ) : realStudents.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-500">
                    No students found in this class.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pr-2">
                    {realStudents.map((student) => (
                      <div key={student.tracked_ID} className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-white rounded-md transition-colors">
                        <input
                          type="checkbox"
                          id={`student-${student.tracked_ID}`}
                          checked={selectedStudents.includes(student.tracked_ID)}
                          onChange={() => handleStudentSelection(student.tracked_ID)}
                          className="h-3 w-3 sm:h-4 sm:w-4 text-[#00874E] border-gray-300 rounded focus:ring-[#00874E] cursor-pointer flex-shrink-0"
                        />
                        <label 
                          htmlFor={`student-${student.tracked_ID}`}
                          className="flex-1 text-xs sm:text-sm text-gray-700 cursor-pointer min-w-0"
                        >
                          <div className="font-medium truncate">
                            {student.tracked_firstname} {student.tracked_lastname}
                          </div>
                          <div className="text-xs text-gray-500">ID: {student.tracked_ID}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {selectedStudents.length > 0 && (
                  <div className="mt-3 text-xs text-gray-600">
                    {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            )}

            {/* Instruction Textarea */}
            <div className={assignTo === "individual" ? "min-h-[150px] sm:min-h-[200px]" : "min-h-[200px] sm:min-h-[300px]"}>
              <label className="text-xs sm:text-sm font-semibold mb-2 block text-gray-700">Instruction</label>
              <textarea
                placeholder="Enter instruction..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-md px-3 sm:px-4 py-2.5 sm:py-3 outline-none resize-none text-xs sm:text-sm focus:border-[#00874E] transition-colors h-full min-h-[100px] sm:min-h-[120px]"
                rows={assignTo === "individual" ? (window.innerWidth < 640 ? 6 : 8) : (window.innerWidth < 640 ? 8 : 12)}
              />
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="mt-4 sm:mt-5 lg:mt-6">
          <button
            onClick={handleCreate}
            disabled={creatingActivity || isDuplicate}
            className={`w-full font-bold py-2.5 sm:py-3 rounded-md transition-all duration-200 text-sm sm:text-base cursor-pointer touch-manipulation active:scale-98 ${
              isDuplicate
                ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white'
                : creatingActivity
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-[#00A15D] hover:bg-[#00874E] active:bg-[#006B3D] text-white'
            }`}
          >
            {creatingActivity ? (
              <div className="flex items-center justify-center">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                Creating...
              </div>
            ) : isDuplicate ? (
              '⚠️ Task Number Exists - Click to See Details'
            ) : (
              'Create Activity'
            )}
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
  );
};

export default ClassWorkCreate;