import React, { useState, useEffect } from 'react';
import BackButton from '../../assets/BackButton.svg';
import ArrowDown from "../../assets/ArrowDown.svg";

const ClassWorkCreate = ({ 
  isOpen, 
  onClose, 
  onCreateActivity,
  onDuplicateTask,
  activityTypes = ["Activity", "Assignment", "Quiz", "Laboratory", "Project", "Remedial", "Exam"],
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
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  const [activityTypeDropdownOpen, setActivityTypeDropdownOpen] = useState(false);
  const [assignToDropdownOpen, setAssignToDropdownOpen] = useState(false);

  const filteredActivityTypes = activityTypes.filter(type => type !== "Announcement");

  // Add CSS for styling the calendar icon
  useEffect(() => {
    if (isOpen) {
      const style = document.createElement('style');
      style.innerHTML = `
        .deadline-input::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        .deadline-input::-moz-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        .deadline-input::-webkit-datetime-edit {
          color: white;
        }
        .deadline-input::-webkit-datetime-edit-fields-wrapper {
          color: white;
        }
        .deadline-input::-webkit-datetime-edit-text {
          color: white;
          padding: 0 0.3em;
        }
        .deadline-input::-webkit-datetime-edit-month-field,
        .deadline-input::-webkit-datetime-edit-day-field,
        .deadline-input::-webkit-datetime-edit-year-field,
        .deadline-input::-webkit-datetime-edit-hour-field,
        .deadline-input::-webkit-datetime-edit-minute-field,
        .deadline-input::-webkit-datetime-edit-ampm-field {
          color: white;
        }
        .deadline-input::-webkit-inner-spin-button {
          display: none;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [isOpen]);

  // Fetch real students and existing activities
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
        if (result.success) {
          setRealStudents(result.students || []);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
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
        if (result.success) {
          setExistingActivities(result.activities || []);
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const isTaskNumberDuplicate = () => {
    if (!activityType || !taskNumber) return false;
    return existingActivities.some(activity => 
      activity.activity_type === activityType && 
      activity.task_number === taskNumber
    );
  };

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
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    setSelectedStudents(
      selectedStudents.length === realStudents.length 
        ? [] 
        : realStudents.map(student => student.tracked_ID)
    );
  };

  const handleCreate = () => {
    if (creatingActivity) return;

    if (!activityType || !taskNumber || !title) {
      alert("Please fill in all required fields");
      return;
    }

    if (isTaskNumberDuplicate()) {
      const existingTaskNumbers = getExistingTaskNumbers();
      const message = `"${activityType} ${taskNumber}" already exists.\n\nExisting ${activityType}s: ${existingTaskNumbers.join(', ')}`;
      
      if (onDuplicateTask) {
        onDuplicateTask(message);
      } else {
        alert(message);
      }
      return;
    }

    onCreateActivity({
      activityType,
      taskNumber,
      title,
      instruction,
      link,
      points,
      deadline,
      assignTo,
      selectedStudents: assignTo === "individual" ? selectedStudents : []
    });
  };

  if (!isOpen) return null;

  const isDuplicate = isTaskNumberDuplicate();
  const existingTaskNumbers = getExistingTaskNumbers();

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-2 sm:p-3">
      <div className="bg-[#15151C] text-white rounded-lg w-full max-w-2xl mx-2 p-4 sm:p-5 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Create School Work</h2>
            <p className="text-xs text-gray-400 mt-1">Fill in the details to create a new activity</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-800 rounded"
          >
            <img src={BackButton} alt="Close" className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            {/* Deadline */}
            <div>
              <label className="text-xs font-medium mb-1 block">Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={getCurrentDateTime()}
                className="deadline-input w-full bg-[#23232C] border border-gray-700 rounded px-3 py-2 text-sm outline-none focus:border-[#767EE0] text-white"
              />
            </div>

            {/* Activity Type */}
            <div className="relative">
              <label className="text-xs font-medium mb-1 block">
                Activity Type <span className="text-[#A15353]">*</span>
              </label>
              <button
                onClick={() => setActivityTypeDropdownOpen(!activityTypeDropdownOpen)}
                className="w-full bg-[#23232C] border border-gray-700 text-white rounded px-3 py-2 text-sm flex justify-between items-center"
              >
                <span className={!activityType ? 'text-gray-500' : ''}>
                  {activityType || "Select Type"}
                </span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`w-3 h-3 transition-transform ${activityTypeDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              {activityTypeDropdownOpen && (
              <div className="absolute top-full mt-1 w-full bg-[#23232C] rounded border border-gray-700 z-10 max-h-60 overflow-y-auto">
                {filteredActivityTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setActivityType(type);
                      setActivityTypeDropdownOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-800 text-white"
                  >
                    {type}
                  </button>
                ))}
              </div>
              )}
            </div>

            {/* Task Number */}
            <div>
              <label className="text-xs font-medium mb-1 block">
                Task Number <span className="text-[#A15353]">*</span>
              </label>
              <input
                type="text"
                placeholder="Activity 1"
                value={taskNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d{1,2}$/.test(value)) {
                    setTaskNumber(value);
                  }
                }}
                className={`w-full bg-[#23232C] border rounded px-3 py-2 text-sm outline-none text-white placeholder:text-gray-500 ${
                  isDuplicate ? 'border-[#A15353]' : 'border-gray-700 focus:border-[#767EE0]'
                }`}
              />
              {isDuplicate && (
                <p className="text-[#A15353] text-xs mt-1">
                  ⚠️ {activityType} {taskNumber} already exists!
                </p>
              )}
              {activityType && existingTaskNumbers.length > 0 && (
                <p className="text-gray-500 text-xs mt-1">
                  Existing {activityType}s: {existingTaskNumbers.join(', ')}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-medium mb-1 block">
                Title <span className="text-[#A15353]">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#23232C] border border-gray-700 rounded px-3 py-2 text-sm outline-none focus:border-[#767EE0] text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {/* Assign To */}
            <div className="relative">
              <label className="text-xs font-medium mb-1 block">
                Assign To <span className="text-[#A15353]">*</span>
              </label>
              <button
                onClick={() => setAssignToDropdownOpen(!assignToDropdownOpen)}
                className="w-full bg-[#23232C] border border-gray-700 text-white rounded px-3 py-2 text-sm flex justify-between items-center"
              >
                <span>{assignTo === "wholeClass" ? "Whole Class" : "Individual Students"}</span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`w-3 h-3 transition-transform ${assignToDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              {assignToDropdownOpen && (
                <div className="absolute top-full mt-1 w-full bg-[#23232C] rounded border border-gray-700 z-10">
                  <button
                    onClick={() => {
                      setAssignTo("wholeClass");
                      setAssignToDropdownOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-800 text-white"
                  >
                    Whole Class
                  </button>
                  <button
                    onClick={() => {
                      setAssignTo("individual");
                      setAssignToDropdownOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-800 text-white"
                  >
                    Individual Students
                  </button>
                </div>
              )}
            </div>

            {/* Student Selection */}
            {assignTo === "individual" && (
              <div className="bg-[#23232C] border border-gray-700 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium">Select Students</label>
                  {!loadingStudents && realStudents.length > 0 && (
                    <button
                      onClick={handleSelectAllStudents}
                      className="text-xs text-[#00A15D] hover:text-[#00874E]"
                    >
                      {selectedStudents.length === realStudents.length ? "Deselect All" : "Select All"}
                    </button>
                  )}
                </div>
                
                {loadingStudents ? (
                  <div className="text-center py-3">
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-[#00A15D] border-r-transparent"></div>
                  </div>
                ) : realStudents.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">No students found</p>
                ) : (
                  <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                    {realStudents.map((student) => (
                      <div key={student.tracked_ID} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`student-${student.tracked_ID}`}
                          checked={selectedStudents.includes(student.tracked_ID)}
                          onChange={() => handleStudentSelection(student.tracked_ID)}
                          className="h-3 w-3 text-[#00A15D]"
                        />
                        <label 
                          htmlFor={`student-${student.tracked_ID}`}
                          className="text-xs flex-1 text-white"
                        >
                          {student.tracked_firstname} {student.tracked_lastname}
                          <span className="text-gray-500 text-xs block">ID: {student.tracked_ID}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {selectedStudents.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}

            {/* Points */}
            <div>
              <label className="text-xs font-medium mb-1 block">Points</label>
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
                className="w-full bg-[#23232C] border border-gray-700 rounded px-3 py-2 text-sm outline-none focus:border-[#767EE0] text-white placeholder:text-gray-500"
              />
            </div>

            {/* Link */}
            <div>
              <label className="text-xs font-medium mb-1 block">Link</label>
              <input
                type="text"
                placeholder="Enter link (optional)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-[#23232C] border border-gray-700 rounded px-3 py-2 text-sm outline-none focus:border-[#767EE0] text-white placeholder:text-gray-500"
              />
            </div>

            {/* Instruction */}
            <div>
              <label className="text-xs font-medium mb-1 block">Instruction</label>
              <textarea
                placeholder="Enter instruction..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full bg-[#23232C] border border-gray-700 rounded px-3 py-2 text-sm outline-none focus:border-[#767EE0] h-24 resize-none text-white placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Debug: Show available activity types */}
        <div className="mt-3 text-xs text-gray-500">
          Available activity types: {filteredActivityTypes.join(', ')}
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={creatingActivity || isDuplicate}
          className={`w-full mt-4 font-medium py-2.5 rounded text-sm transition-colors ${
            isDuplicate
              ? 'bg-[#A15353] hover:bg-[#8a4545] text-white cursor-not-allowed'
              : creatingActivity
              ? 'bg-gray-600 cursor-not-allowed text-white'
              : 'bg-[#00A15D] hover:bg-[#00874E] text-white'
          }`}
        >
          {creatingActivity ? (
            <div className="flex items-center justify-center">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
              Creating...
            </div>
          ) : isDuplicate ? (
            'Task Number Already Exists'
          ) : (
            'Create Activity'
          )}
        </button>
      </div>
    </div>
  );
};

export default ClassWorkCreate;