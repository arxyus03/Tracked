import React, { useState } from 'react';
import BackButton from '../assets/BackButton(Light).svg';
import ArrowDown from "../assets/ArrowDown(Light).svg";

const ClassWorkCreate = ({ 
  isOpen, 
  onClose, 
  onCreateActivity,
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
  const [assignTo, setAssignTo] = useState("wholeClass"); // "wholeClass" or "individual"
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

  const handleCreate = () => {
    // Validate required fields
    if (!activityType || !taskNumber || !title) {
      alert("Please fill in all required fields (Activity Type, Task Number, and Title)");
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
            {/* Deadline Input - MOVED TO TOP */}
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
                onChange={(e) => setTaskNumber(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-md px-3 sm:px-4 py-2.5 sm:py-3 outline-none text-xs sm:text-sm focus:border-[#00874E] transition-colors"
              />
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

            {/* Points Input - Now standalone since deadline was moved */}
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
                  <button
                    onClick={handleSelectAllStudents}
                    className="text-xs text-[#00874E] hover:text-[#006B3D] font-medium cursor-pointer"
                  >
                    {selectedStudents.length === dummyStudents.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pr-2">
                  {dummyStudents.map((student) => (
                    <div key={student.id} className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-white rounded-md transition-colors">
                      <input
                        type="checkbox"
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                        className="h-3 w-3 sm:h-4 sm:w-4 text-[#00874E] border-gray-300 rounded focus:ring-[#00874E] cursor-pointer flex-shrink-0"
                      />
                      <label 
                        htmlFor={`student-${student.id}`}
                        className="flex-1 text-xs sm:text-sm text-gray-700 cursor-pointer min-w-0"
                      >
                        <div className="font-medium truncate">{student.name}</div>
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

            {/* Instruction Textarea - Dynamic height based on content and screen size */}
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

        {/* Create Button - Full width below the columns */}
        <div className="mt-4 sm:mt-5 lg:mt-6">
          <button
            onClick={handleCreate}
            className="w-full bg-[#00A15D] hover:bg-[#00874E] active:bg-[#006B3D] text-white font-bold py-2.5 sm:py-3 rounded-md transition-all duration-200 text-sm sm:text-base cursor-pointer touch-manipulation active:scale-98"
          >
            Create Activity
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

        /* Custom breakpoint for extra small screens */
        @media (min-width: 475px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default ClassWorkCreate;