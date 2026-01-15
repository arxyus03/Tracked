import React, { useState, useEffect } from 'react';
import BackButton from '../../assets/BackButton.svg';
import ArrowDown from "../../assets/ArrowDown.svg";

const ClassWorkEdit = ({ 
  isOpen, 
  onClose, 
  onSave,
  activity,
  activityTypes = ["Assignment", "Quiz", "Activity", "Project", "Laboratory", "Remedial", "Exam", "Announcement"],
  getCurrentDateTime,
  subjectCode,
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
  
  const [activityTypeDropdownOpen, setActivityTypeDropdownOpen] = useState(false);
  const [assignToDropdownOpen, setAssignToDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen && subjectCode) {
      fetchClassStudents();
    }
  }, [isOpen, subjectCode]);

  useEffect(() => {
    if (activity) {
      setActivityType(activity.activity_type || "");
      setTaskNumber(activity.task_number || "");
      setTitle(activity.title || "");
      setInstruction(activity.instruction || "");
      setLink(activity.link || "");
      setPoints(activity.points || "");
      setAssignTo("wholeClass");
      setSelectedStudents([]);

      if (activity.deadline && activity.deadline !== "No deadline") {
        try {
          const date = new Date(activity.deadline);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            const localDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
            setDeadline(localDateTimeString);
          }
        } catch (error) {
          console.warn('Error parsing deadline:', error);
          setDeadline("");
        }
      } else {
        setDeadline("");
      }
    }
  }, [activity]);

  const fetchClassStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await fetch(`https://tracked.6minds.site/Professor/SubjectDetailsDB/get_students_by_section.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched students for edit:', result);
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

  const handleSave = () => {
    if (!activityType || !taskNumber || !title) {
      alert("Please fill in all required fields (Activity Type, Task Number, and Title)");
      return;
    }

    if (points < 0) {
      alert("Points cannot be negative. Please enter a value of 0 or higher.");
      return;
    }

    if (deadline) {
      const selectedDate = new Date(deadline);
      const now = new Date();
      if (selectedDate < now) {
        alert("Deadline cannot be in the past. Please select a current or future date.");
        return;
      }
    }

    const assignmentData = {
      assignTo,
      selectedStudents: assignTo === "individual" ? selectedStudents : []
    };

    onSave({
      activityType,
      taskNumber,
      title,
      instruction,
      link,
      points: points || 0,
      deadline,
      ...assignmentData
    });
  };

  if (!isOpen || !activity) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 overlay-fade p-3"
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
      <div className={`rounded-lg shadow-2xl w-full max-w-3xl p-4 relative modal-pop max-h-[90vh] overflow-y-auto border ${
        isDarkMode 
          ? 'bg-[#15151C] text-white border-gray-700' 
          : 'bg-white text-gray-900 border-gray-300'
      }`}>
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className={`absolute top-3 right-3 p-1.5 rounded transition-colors cursor-pointer touch-manipulation ${
            isDarkMode ? 'hover:bg-[#23232C] active:bg-[#2D2D3A]' : 'hover:bg-gray-100 active:bg-gray-200'
          }`}
        >
          <img
            src={BackButton}
            alt="BackButton"
            className="w-4 h-4"
            style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
          />
        </button>

        <h2 className={`text-lg font-bold mb-0.5 pr-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Edit School Work
        </h2>
        <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Update the activity details
        </p>
        <hr className={`mb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="relative">
              <label className={`text-xs font-semibold mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Activity Type <span className="text-[#A15353]">*</span>
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivityTypeDropdownOpen(!activityTypeDropdownOpen);
                }}
                className={`w-full border rounded px-3 py-2 flex items-center justify-between transition-colors cursor-pointer touch-manipulation text-xs ${
                  isDarkMode 
                    ? 'bg-[#23232C] border-gray-600 text-white hover:border-[#767EE0] active:border-[#767EE0] focus:border-[#767EE0]' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 hover:border-[#767EE0] active:border-[#767EE0] focus:border-[#767EE0]'
                }`}
              >
                <span className={`${!activityType ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') : ''}`}>
                  {activityType || "Select Activity Type"}
                </span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`h-3 w-3 transition-transform ${activityTypeDropdownOpen ? 'rotate-180' : ''}`}
                  style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                />
              </button>
              {activityTypeDropdownOpen && (
                <div className={`absolute top-full mt-0.5 w-full rounded shadow-xl border z-10 overflow-hidden max-h-32 overflow-y-auto ${
                  isDarkMode ? 'bg-[#23232C] border-gray-600' : 'bg-white border-gray-300'
                }`}>
                  {activityTypes.map((type) => (
                    <button
                      key={type}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivityType(type);
                        setActivityTypeDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer touch-manipulation ${
                        isDarkMode 
                          ? 'hover:bg-[#2D2D3A] active:bg-[#374151] text-white' 
                          : 'hover:bg-gray-100 active:bg-gray-200 text-gray-900'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className={`text-xs font-semibold mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Task Number <span className="text-[#A15353]">*</span>
              </label>
              <input
                type="text"
                placeholder="Activity 1"
                value={taskNumber}
                onChange={(e) => setTaskNumber(e.target.value)}
                className={`w-full border rounded px-3 py-2 outline-none text-xs focus:border-[#767EE0] transition-colors placeholder:text-gray-500 ${
                  isDarkMode 
                    ? 'bg-[#23232C] border-gray-600 text-white placeholder:text-gray-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-semibold mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title <span className="text-[#A15353]">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full border rounded px-3 py-2 outline-none text-xs focus:border-[#767EE0] transition-colors placeholder:text-gray-500 ${
                  isDarkMode 
                    ? 'bg-[#23232C] border-gray-600 text-white placeholder:text-gray-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
              />
            </div>

            <div className="relative">
              <label className={`text-xs font-semibold mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Assign To <span className="text-[#A15353]">*</span>
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAssignToDropdownOpen(!assignToDropdownOpen);
                }}
                className={`w-full border rounded px-3 py-2 flex items-center justify-between transition-colors cursor-pointer touch-manipulation text-xs ${
                  isDarkMode 
                    ? 'bg-[#23232C] border-gray-600 text-white hover:border-[#767EE0] active:border-[#767EE0] focus:border-[#767EE0]' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 hover:border-[#767EE0] active:border-[#767EE0] focus:border-[#767EE0]'
                }`}
              >
                <span>
                  {assignTo === "wholeClass" ? "Whole Class" : "Individual Students"}
                </span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`h-3 w-3 transition-transform ${assignToDropdownOpen ? 'rotate-180' : ''}`}
                  style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                />
              </button>
              {assignToDropdownOpen && (
                <div className={`absolute top-full mt-0.5 w-full rounded shadow-xl border z-10 overflow-hidden ${
                  isDarkMode ? 'bg-[#23232C] border-gray-600' : 'bg-white border-gray-300'
                }`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssignTo("wholeClass");
                      setAssignToDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer touch-manipulation ${
                      isDarkMode 
                        ? 'hover:bg-[#2D2D3A] active:bg-[#374151] text-white' 
                        : 'hover:bg-gray-100 active:bg-gray-200 text-gray-900'
                    }`}
                  >
                    Whole Class
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssignTo("individual");
                      setAssignToDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer touch-manipulation ${
                      isDarkMode 
                        ? 'hover:bg-[#2D2D3A] active:bg-[#374151] text-white' 
                        : 'hover:bg-gray-100 active:bg-gray-200 text-gray-900'
                    }`}
                  >
                    Individual Students
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Points</label>
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
                  className={`w-full border rounded px-3 py-2 outline-none text-xs focus:border-[#767EE0] transition-colors placeholder:text-gray-500 ${
                    isDarkMode 
                      ? 'bg-[#23232C] border-gray-600 text-white placeholder:text-gray-500' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={getCurrentDateTime()}
                  className={`w-full border rounded px-3 py-2 outline-none text-xs focus:border-[#767EE0] transition-colors ${
                    isDarkMode 
                      ? 'bg-[#23232C] border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`text-xs font-semibold mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Link</label>
              <input
                type="text"
                placeholder="Enter link (optional)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className={`w-full border rounded px-3 py-2 outline-none text-xs focus:border-[#767EE0] transition-colors placeholder:text-gray-500 ${
                  isDarkMode 
                    ? 'bg-[#23232C] border-gray-600 text-white placeholder:text-gray-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
              />
            </div>
          </div>

          <div className="space-y-3">
            {assignTo === "individual" && (
              <div className={`border rounded p-3 ${
                isDarkMode ? 'border-gray-600 bg-[#23232C]' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Students
                  </label>
                  {!loadingStudents && realStudents.length > 0 && (
                    <button
                      onClick={handleSelectAllStudents}
                      className="text-xs text-[#767EE0] hover:text-[#5a62c4] font-medium cursor-pointer"
                    >
                      {selectedStudents.length === realStudents.length ? "Deselect All" : "Select All"}
                    </button>
                  )}
                </div>
                
                {loadingStudents ? (
                  <div className="text-center py-2">
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border border-solid border-[#767EE0] border-r-transparent"></div>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Loading students...</p>
                  </div>
                ) : realStudents.length === 0 ? (
                  <div className={`text-center py-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    No students found in this class.
                  </div>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {realStudents.map((student) => (
                      <div key={student.tracked_ID} className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                        isDarkMode ? 'hover:bg-[#2D2D3A]' : 'hover:bg-gray-100'
                      }`}>
                        <input
                          type="checkbox"
                          id={`student-${student.tracked_ID}`}
                          checked={selectedStudents.includes(student.tracked_ID)}
                          onChange={() => handleStudentSelection(student.tracked_ID)}
                          className={`h-3 w-3 text-[#767EE0] rounded focus:ring-[#767EE0] cursor-pointer ${
                            isDarkMode ? 'border-gray-600 bg-[#2D2D3A]' : 'border-gray-400 bg-white'
                          }`}
                        />
                        <label 
                          htmlFor={`student-${student.tracked_ID}`}
                          className={`flex-1 text-xs cursor-pointer ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-900'
                          }`}
                        >
                          <div className="font-medium">
                            {student.tracked_firstname} {student.tracked_lastname}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>ID: {student.tracked_ID}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {selectedStudents.length > 0 && (
                  <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            )}

            <div className={assignTo === "individual" ? "min-h-[150px]" : "min-h-[220px]"}>
              <label className={`text-xs font-semibold mb-1 block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Instruction</label>
              <textarea
                placeholder="Enter instruction..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className={`w-full border rounded px-3 py-2 outline-none resize-none text-xs focus:border-[#767EE0] transition-colors h-full min-h-[100px] placeholder:text-gray-500 ${
                  isDarkMode 
                    ? 'bg-[#23232C] border-gray-600 text-white placeholder:text-gray-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400'
                }`}
                rows={assignTo === "individual" ? 6 : 10}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleSave}
            className="w-full bg-[#00A15D] hover:bg-[#00874E] active:bg-[#006B3D] text-white font-bold py-2 rounded transition-all duration-200 text-sm cursor-pointer touch-manipulation active:scale-98"
          >
            Save Changes
          </button>
        </div>
      </div>

      <style>{`
        .overlay-fade { animation: overlayFade .15s ease-out both; }
        @keyframes overlayFade { from { opacity: 0 } to { opacity: 1 } }

        .modal-pop {
          transform-origin: center;
          animation: popIn .2s cubic-bezier(.2,.8,.2,1) both;
        }
        @keyframes popIn {
          from { opacity: 0; transform: translateY(-6px) scale(.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
};

export default ClassWorkEdit;