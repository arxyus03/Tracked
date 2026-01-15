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
  creatingActivity = false,
  isDarkMode = true
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
  const [, setLoadingActivities] = useState(false);
  
  const [activityTypeDropdownOpen, setActivityTypeDropdownOpen] = useState(false);
  const [assignToDropdownOpen, setAssignToDropdownOpen] = useState(false);

  const filteredActivityTypes = activityTypes.filter(type => type !== "Announcement");

  useEffect(() => {
    if (isOpen) {
      const style = document.createElement('style');
      style.innerHTML = `
        .deadline-input::-webkit-calendar-picker-indicator {
          filter: ${isDarkMode ? 'invert(1)' : 'invert(0.5)'};
          cursor: pointer;
        }
        .deadline-input::-moz-calendar-picker-indicator {
          filter: ${isDarkMode ? 'invert(1)' : 'invert(0.5)'};
          cursor: pointer;
        }
        .deadline-input::-webkit-datetime-edit {
          color: ${isDarkMode ? 'white' : 'black'};
        }
        .deadline-input::-webkit-datetime-edit-fields-wrapper {
          color: ${isDarkMode ? 'white' : 'black'};
        }
        .deadline-input::-webkit-datetime-edit-text {
          color: ${isDarkMode ? 'white' : 'black'};
          padding: 0 0.3em;
        }
        .deadline-input::-webkit-datetime-edit-month-field,
        .deadline-input::-webkit-datetime-edit-day-field,
        .deadline-input::-webkit-datetime-edit-year-field,
        .deadline-input::-webkit-datetime-edit-hour-field,
        .deadline-input::-webkit-datetime-edit-minute-field,
        .deadline-input::-webkit-datetime-edit-ampm-field {
          color: ${isDarkMode ? 'white' : 'black'};
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
  }, [isOpen, isDarkMode]);

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

    if (assignTo === "individual" && selectedStudents.length === 0) {
      alert("Please select at least one student for individual assignment");
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
      <div className={`rounded-lg w-full max-w-2xl mx-2 p-4 sm:p-5 relative max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-[#15151C] text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create School Work</h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fill in the details to create a new activity</p>
          </div>
          <button
            onClick={handleClose}
            className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <img 
              src={BackButton} 
              alt="Close" 
              className="w-4 h-4"
              style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={getCurrentDateTime()}
                className={`deadline-input w-full border rounded px-3 py-2 text-sm outline-none ${
                  isDarkMode 
                    ? 'bg-[#23232C] border-gray-700 focus:border-[#767EE0] text-white' 
                    : 'bg-gray-50 border-gray-300 focus:border-[#767EE0] text-gray-900'
                }`}
              />
            </div>

            <div className="relative">
              <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Activity Type <span className="text-[#A15353]">*</span>
              </label>
              <button
                onClick={() => setActivityTypeDropdownOpen(!activityTypeDropdownOpen)}
                className={`w-full border rounded px-3 py-2 text-sm flex justify-between items-center ${
                  isDarkMode 
                    ? 'bg-[#23232C] border-gray-700 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              >
                <span className={!activityType ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') : ''}>
                  {activityType || "Select Type"}
                </span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`w-3 h-3 transition-transform ${activityTypeDropdownOpen ? 'rotate-180' : ''}`}
                  style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                />
              </button>
              {activityTypeDropdownOpen && (
                <div className={`absolute top-full mt-1 w-full rounded border z-10 max-h-60 overflow-y-auto ${
                  isDarkMode ? 'bg-[#23232C] border-gray-700' : 'bg-white border-gray-300'
                }`}>
                  {filteredActivityTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setActivityType(type);
                        setActivityTypeDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm ${
                        isDarkMode 
                          ? 'text-white hover:bg-gray-800' 
                          : 'text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                className={`w-full border rounded px-3 py-2 text-sm outline-none placeholder:text-gray-500 ${
                  isDarkMode 
                    ? 'bg-[#23232C] text-white placeholder:text-gray-500' 
                    : 'bg-gray-50 text-gray-900 placeholder:text-gray-400'
                } ${
                  isDuplicate 
                    ? 'border-[#A15353]' 
                    : (isDarkMode ? 'border-gray-700 focus:border-[#767EE0]' : 'border-gray-300 focus:border-[#767EE0]')
                }`}
              />
              {isDuplicate && (
                <p className="text-[#A15353] text-xs mt-1">
                  ⚠️ {activityType} {taskNumber} already exists!
                </p>
              )}
              {activityType && existingTaskNumbers.length > 0 && (
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  Existing {activityType}s: {existingTaskNumbers.join(', ')}
                </p>
              )}
            </div>

            <div>
              <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title <span className="text-[#A15353]">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm outline-none placeholder:text-gray-500 ${
                  isDarkMode 
                    ? 'bg-[#23232C] border-gray-700 focus:border-[#767EE0] text-white' 
                    : 'bg-gray-50 border-gray-300 focus:border-[#767EE0] text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Assign To <span className="text-[#A15353]">*</span>
              </label>
              <button
                onClick={() => setAssignToDropdownOpen(!assignToDropdownOpen)}
                className={`w-full border rounded px-3 py-2 text-sm flex justify-between items-center ${
                  isDarkMode 
                    ? 'bg-[#23232C] border-gray-700 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              >
                <span>{assignTo === "wholeClass" ? "Whole Class" : "Individual Students"}</span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`w-3 h-3 transition-transform ${assignToDropdownOpen ? 'rotate-180' : ''}`}
                  style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                />
              </button>
              {assignToDropdownOpen && (
                <div className={`absolute top-full mt-1 w-full rounded border z-10 ${
                  isDarkMode ? 'bg-[#23232C] border-gray-700' : 'bg-white border-gray-300'
                }`}>
                  <button
                    onClick={() => {
                      setAssignTo("wholeClass");
                      setAssignToDropdownOpen(false);
                      setSelectedStudents([]);
                    }}
                    className={`block w-full text-left px-3 py-2 text-sm ${
                      isDarkMode 
                        ? 'text-white hover:bg-gray-800' 
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Whole Class
                  </button>
                  <button
                    onClick={() => {
                      setAssignTo("individual");
                      setAssignToDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 text-sm ${
                      isDarkMode 
                        ? 'text-white hover:bg-gray-800' 
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Individual Students
                  </button>
                </div>
              )}
            </div>

            {assignTo === "individual" && (
              <div className={`border rounded p-3 ${
                isDarkMode ? 'bg-[#23232C] border-gray-700' : 'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Students <span className="text-[#A15353]">*</span>
                  </label>
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
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Loading students...</p>
                  </div>
                ) : realStudents.length === 0 ? (
                  <p className={`text-xs text-center py-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>No students found in this class</p>
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
                          className={`text-xs flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                        >
                          {student.tracked_firstname} {student.tracked_lastname}
                          <span className={`text-xs block ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>ID: {student.tracked_ID}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {selectedStudents.length > 0 && (
                  <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                  </p>
                )}
                {selectedStudents.length === 0 && assignTo === "individual" && (
                  <p className="text-xs text-[#A15353] mt-2">
                    ⚠️ Please select at least one student
                  </p>
                )}
              </div>
            )}

            <div>
              <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Points</label>
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
                className={`w-full border rounded px-3 py-2 text-sm outline-none placeholder:text-gray-500 ${
                  isDarkMode 
                    ? 'bg-[#23232C] border-gray-700 focus:border-[#767EE0] text-white' 
                    : 'bg-gray-50 border-gray-300 focus:border-[#767EE0] text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Link</label>
              <input
                type="text"
                placeholder="Enter link (optional)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm outline-none placeholder:text-gray-500 ${
                  isDarkMode 
                    ? 'bg-[#23232C] border-gray-700 focus:border-[#767EE0] text-white' 
                    : 'bg-gray-50 border-gray-300 focus:border-[#767EE0] text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Instruction</label>
              <textarea
                placeholder="Enter instruction..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm outline-none h-24 resize-none placeholder:text-gray-500 ${
                  isDarkMode 
                    ? 'bg-[#23232C] border-gray-700 focus:border-[#767EE0] text-white' 
                    : 'bg-gray-50 border-gray-300 focus:border-[#767EE0] text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={creatingActivity || isDuplicate || (assignTo === "individual" && selectedStudents.length === 0)}
          className={`w-full mt-4 font-medium py-2.5 rounded text-sm transition-colors ${
            isDuplicate || (assignTo === "individual" && selectedStudents.length === 0)
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
          ) : assignTo === "individual" && selectedStudents.length === 0 ? (
            'Select Students First'
          ) : (
            'Create Activity'
          )}
        </button>
      </div>
    </div>
  );
};

export default ClassWorkCreate;