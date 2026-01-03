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
  subjectCode
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

  // Fetch real students when component opens and subjectCode is available
  useEffect(() => {
    if (isOpen && subjectCode) {
      fetchClassStudents();
    }
  }, [isOpen, subjectCode]);

  // Initialize form with activity data
  useEffect(() => {
    if (activity) {
      setActivityType(activity.activity_type || "");
      setTaskNumber(activity.task_number || "");
      setTitle(activity.title || "");
      setInstruction(activity.instruction || "");
      setLink(activity.link || "");
      setPoints(activity.points || "");
      setAssignTo("wholeClass"); // Default to whole class for edit
      setSelectedStudents([]); // Reset selected students for edit

      // FIXED: Use the exact same deadline format as ClassworkTab.jsx
      if (activity.deadline && activity.deadline !== "No deadline") {
        try {
          const date = new Date(activity.deadline);
          if (!isNaN(date.getTime())) {
            // Convert to local datetime string in the exact same format
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            // Format: YYYY-MM-DDTHH:mm (local time)
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
    // Validate required fields
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

    // Prepare assignment data
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
      deadline, // This will preserve the exact deadline format
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
      <div className="bg-[#15151C] text-white rounded-lg shadow-2xl w-full max-w-3xl p-4 relative modal-pop max-h-[90vh] overflow-y-auto border border-gray-700">
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 p-1.5 hover:bg-[#23232C] active:bg-[#2D2D3A] rounded transition-colors cursor-pointer touch-manipulation"
        >
          <img
            src={BackButton}
            alt="BackButton"
            className="w-4 h-4"
          />
        </button>

        <h2 className="text-lg font-bold mb-0.5 pr-8">
          Edit School Work
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          Update the activity details
        </p>
        <hr className="border-gray-700 mb-4" />

        {/* Modal Body - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Basic Information */}
          <div className="space-y-3">
            {/* Activity Type Dropdown */}
            <div className="relative">
              <label className="text-xs font-semibold mb-1 block text-gray-300">
                Activity Type <span className="text-[#A15353]">*</span>
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivityTypeDropdownOpen(!activityTypeDropdownOpen);
                }}
                className="w-full bg-[#23232C] border border-gray-600 text-white rounded px-3 py-2 flex items-center justify-between hover:border-[#767EE0] active:border-[#767EE0] focus:border-[#767EE0] transition-colors cursor-pointer touch-manipulation text-xs"
              >
                <span className={`${!activityType ? 'text-gray-500' : ''}`}>
                  {activityType || "Select Activity Type"}
                </span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`h-3 w-3 transition-transform ${activityTypeDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              {activityTypeDropdownOpen && (
                <div className="absolute top-full mt-0.5 w-full bg-[#23232C] rounded shadow-xl border border-gray-600 z-10 overflow-hidden max-h-32 overflow-y-auto">
                  {activityTypes.map((type) => (
                    <button
                      key={type}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivityType(type);
                        setActivityTypeDropdownOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-xs hover:bg-[#2D2D3A] active:bg-[#374151] transition-colors cursor-pointer touch-manipulation"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Task Number Input */}
            <div>
              <label className="text-xs font-semibold mb-1 block text-gray-300">
                Task Number <span className="text-[#A15353]">*</span>
              </label>
              <input
                type="text"
                placeholder="Activity 1"
                value={taskNumber}
                onChange={(e) => setTaskNumber(e.target.value)}
                className="w-full bg-[#23232C] border border-gray-600 rounded px-3 py-2 outline-none text-xs focus:border-[#767EE0] transition-colors text-white placeholder:text-gray-500"
              />
            </div>

            {/* Title Input */}
            <div>
              <label className="text-xs font-semibold mb-1 block text-gray-300">
                Title <span className="text-[#A15353]">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#23232C] border border-gray-600 rounded px-3 py-2 outline-none text-xs focus:border-[#767EE0] transition-colors text-white placeholder:text-gray-500"
              />
            </div>

            {/* Assign To Dropdown */}
            <div className="relative">
              <label className="text-xs font-semibold mb-1 block text-gray-300">
                Assign To <span className="text-[#A15353]">*</span>
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAssignToDropdownOpen(!assignToDropdownOpen);
                }}
                className="w-full bg-[#23232C] border border-gray-600 text-white rounded px-3 py-2 flex items-center justify-between hover:border-[#767EE0] active:border-[#767EE0] focus:border-[#767EE0] transition-colors cursor-pointer touch-manipulation text-xs"
              >
                <span>
                  {assignTo === "wholeClass" ? "Whole Class" : "Individual Students"}
                </span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`h-3 w-3 transition-transform ${assignToDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              {assignToDropdownOpen && (
                <div className="absolute top-full mt-0.5 w-full bg-[#23232C] rounded shadow-xl border border-gray-600 z-10 overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssignTo("wholeClass");
                      setAssignToDropdownOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-[#2D2D3A] active:bg-[#374151] transition-colors cursor-pointer touch-manipulation"
                  >
                    Whole Class
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssignTo("individual");
                      setAssignToDropdownOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-[#2D2D3A] active:bg-[#374151] transition-colors cursor-pointer touch-manipulation"
                  >
                    Individual Students
                  </button>
                </div>
              )}
            </div>

            {/* Points and Deadline in a 2-column grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Points Input */}
              <div>
                <label className="text-xs font-semibold mb-1 block text-gray-300">Points</label>
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
                  className="w-full bg-[#23232C] border border-gray-600 rounded px-3 py-2 outline-none text-xs focus:border-[#767EE0] transition-colors text-white placeholder:text-gray-500"
                />
              </div>

              {/* Deadline Input */}
              <div>
                <label className="text-xs font-semibold mb-1 block text-gray-300">Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={getCurrentDateTime()}
                  className="w-full bg-[#23232C] border border-gray-600 rounded px-3 py-2 outline-none text-xs focus:border-[#767EE0] transition-colors text-white"
                />
              </div>
            </div>

            {/* Link Input */}
            <div>
              <label className="text-xs font-semibold mb-1 block text-gray-300">Link</label>
              <input
                type="text"
                placeholder="Enter link (optional)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-[#23232C] border border-gray-600 rounded px-3 py-2 outline-none text-xs focus:border-[#767EE0] transition-colors text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Right Column - Student Selection and Instructions */}
          <div className="space-y-3">
            {/* Student Selection (only show when individual is selected) */}
            {assignTo === "individual" && (
              <div className="border border-gray-600 rounded p-3 bg-[#23232C]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-300">
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
                    <p className="text-xs text-gray-500 mt-1">Loading students...</p>
                  </div>
                ) : realStudents.length === 0 ? (
                  <div className="text-center py-2 text-xs text-gray-500">
                    No students found in this class.
                  </div>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {realStudents.map((student) => (
                      <div key={student.tracked_ID} className="flex items-center gap-2 p-1.5 hover:bg-[#2D2D3A] rounded transition-colors">
                        <input
                          type="checkbox"
                          id={`student-${student.tracked_ID}`}
                          checked={selectedStudents.includes(student.tracked_ID)}
                          onChange={() => handleStudentSelection(student.tracked_ID)}
                          className="h-3 w-3 text-[#767EE0] border-gray-600 rounded focus:ring-[#767EE0] cursor-pointer bg-[#2D2D3A]"
                        />
                        <label 
                          htmlFor={`student-${student.tracked_ID}`}
                          className="flex-1 text-xs text-gray-300 cursor-pointer"
                        >
                          <div className="font-medium">
                            {student.tracked_firstname} {student.tracked_lastname}
                          </div>
                          <div className="text-xs text-gray-500">ID: {student.tracked_ID}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {selectedStudents.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            )}

            {/* Instruction Textarea - Dynamic height based on content */}
            <div className={assignTo === "individual" ? "min-h-[150px]" : "min-h-[220px]"}>
              <label className="text-xs font-semibold mb-1 block text-gray-300">Instruction</label>
              <textarea
                placeholder="Enter instruction..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full bg-[#23232C] border border-gray-600 rounded px-3 py-2 outline-none resize-none text-xs focus:border-[#767EE0] transition-colors h-full min-h-[100px] text-white placeholder:text-gray-500"
                rows={assignTo === "individual" ? 6 : 10}
              />
            </div>
          </div>
        </div>

        {/* Save Button - Full width below the columns */}
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