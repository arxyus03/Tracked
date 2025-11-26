import React, { useState, useEffect } from 'react';
import BackButton from '../assets/BackButton(Light).svg';
import ArrowDown from "../assets/ArrowDown(Light).svg";

const ClassWorkEdit = ({ 
  isOpen, 
  onClose, 
  onSave,
  activity,
  activityTypes = ["Assignment", "Quiz", "Activity", "Project", "Laboratory", "Announcement"],
  getCurrentDateTime
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
  
  const [activityTypeDropdownOpen, setActivityTypeDropdownOpen] = useState(false);
  const [assignToDropdownOpen, setAssignToDropdownOpen] = useState(false);

  // Dummy student data
  const dummyStudents = [
    { id: 1, name: "Alice Johnson", studentId: "20230001" },
    { id: 2, name: "Brian Smith", studentId: "20230002" },
    { id: 3, name: "Catherine Wong", studentId: "20230003" },
    { id: 4, name: "David Brown", studentId: "20230004" },
    { id: 5, name: "Emma Davis", studentId: "20230005" }
  ];

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

      // Format deadline for datetime-local input
      if (activity.deadline && activity.deadline !== "No deadline") {
        try {
          const date = new Date(activity.deadline);
          if (!isNaN(date.getTime())) {
            setDeadline(date.toISOString().slice(0, 16));
          }
        } catch (error) {
          console.warn('Error parsing deadline:', error);
        }
      } else {
        setDeadline("");
      }
    }
  }, [activity]);

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
    if (selectedStudents.length === dummyStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(dummyStudents.map(student => student.id));
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
      deadline,
      ...assignmentData
    });
  };

  if (!isOpen || !activity) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
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
      <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-4xl p-6 sm:p-8 relative modal-pop max-h-[95vh] overflow-y-auto">
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors cursor-pointer touch-manipulation"
        >
          <img
            src={BackButton}
            alt="BackButton"
            className="w-5 h-5"
          />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-1 pr-10">
          Edit School Work
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Update the activity details
        </p>
        <hr className="border-gray-200 mb-5" />

        {/* Modal Body - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Information */}
          <div className="space-y-5">
            {/* Activity Type Dropdown */}
            <div className="relative">
              <label className="text-sm font-semibold mb-2 block text-gray-700">
                Activity Type <span className="text-red-500">*</span>
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivityTypeDropdownOpen(!activityTypeDropdownOpen);
                }}
                className="w-full bg-white border-2 border-gray-300 text-black rounded-md px-4 py-3 flex items-center justify-between hover:border-[#00874E] active:border-[#00874E] focus:border-[#00874E] transition-colors cursor-pointer touch-manipulation"
              >
                <span className={`text-sm ${!activityType ? 'text-gray-500' : ''}`}>
                  {activityType || "Select Activity Type"}
                </span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`h-4 w-4 transition-transform ${activityTypeDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              {activityTypeDropdownOpen && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-xl border border-gray-200 z-10 overflow-hidden max-h-48 overflow-y-auto">
                  {activityTypes.map((type) => (
                    <button
                      key={type}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivityType(type);
                        setActivityTypeDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer touch-manipulation"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Task Number Input */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-gray-700">
                Task Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Activity 1"
                value={taskNumber}
                onChange={(e) => setTaskNumber(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none text-sm focus:border-[#00874E] transition-colors"
              />
            </div>

            {/* Title Input */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none text-sm focus:border-[#00874E] transition-colors"
              />
            </div>

            {/* Assign To Dropdown */}
            <div className="relative">
              <label className="text-sm font-semibold mb-2 block text-gray-700">
                Assign To <span className="text-red-500">*</span>
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAssignToDropdownOpen(!assignToDropdownOpen);
                }}
                className="w-full bg-white border-2 border-gray-300 text-black rounded-md px-4 py-3 flex items-center justify-between hover:border-[#00874E] active:border-[#00874E] focus:border-[#00874E] transition-colors cursor-pointer touch-manipulation"
              >
                <span className="text-sm">
                  {assignTo === "wholeClass" ? "Whole Class" : "Individual Students"}
                </span>
                <img 
                  src={ArrowDown} 
                  alt="" 
                  className={`h-4 w-4 transition-transform ${assignToDropdownOpen ? 'rotate-180' : ''}`} 
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
                    className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer touch-manipulation"
                  >
                    Whole Class
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssignTo("individual");
                      setAssignToDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer touch-manipulation"
                  >
                    Individual Students
                  </button>
                </div>
              )}
            </div>

            {/* Points and Deadline in a 2-column grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Points Input */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">Points</label>
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
                  className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Deadline Input */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={getCurrentDateTime()}
                  className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>
            </div>

            {/* Link Input */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-gray-700">Link</label>
              <input
                type="text"
                placeholder="Enter link (optional)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none text-sm focus:border-[#00874E] transition-colors"
              />
            </div>
          </div>

          {/* Right Column - Student Selection and Instructions */}
          <div className="space-y-5">
            {/* Student Selection (only show when individual is selected) */}
            {assignTo === "individual" && (
              <div className="border-2 border-gray-300 rounded-md p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Select Students
                  </label>
                  <button
                    onClick={handleSelectAllStudents}
                    className="text-xs text-[#00874E] hover:text-[#006B3D] font-medium cursor-pointer"
                  >
                    {selectedStudents.length === dummyStudents.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {dummyStudents.map((student) => (
                    <div key={student.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-md transition-colors">
                      <input
                        type="checkbox"
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                        className="h-4 w-4 text-[#00874E] border-gray-300 rounded focus:ring-[#00874E] cursor-pointer"
                      />
                      <label 
                        htmlFor={`student-${student.id}`}
                        className="flex-1 text-sm text-gray-700 cursor-pointer"
                      >
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-gray-500">ID: {student.studentId}</div>
                      </label>
                    </div>
                  ))}
                </div>

                {selectedStudents.length > 0 && (
                  <div className="mt-3 text-xs text-gray-600">
                    {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            )}

            {/* Instruction Textarea - Dynamic height based on content */}
            <div className={assignTo === "individual" ? "min-h-[200px]" : "min-h-[300px]"}>
              <label className="text-sm font-semibold mb-2 block text-gray-700">Instruction</label>
              <textarea
                placeholder="Enter instruction..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none resize-none text-sm focus:border-[#00874E] transition-colors h-full min-h-[120px]"
                rows={assignTo === "individual" ? 8 : 12}
              />
            </div>
          </div>
        </div>

        {/* Save Button - Full width below the columns */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            className="w-full bg-[#00A15D] hover:bg-[#00874E] active:bg-[#006B3D] text-white font-bold py-3 rounded-md transition-all duration-200 text-base cursor-pointer touch-manipulation active:scale-98"
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
  );
};

export default ClassWorkEdit;