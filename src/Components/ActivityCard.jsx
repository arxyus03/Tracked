import React, { useState } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";
import Archive from "../assets/Archive(Light).svg";

export default function ActivityCard({ 
  activity, 
  isEditing, 
  onGradeChange, 
  onSubmissionChange, 
  onSave, 
  onMarkAllSubmitted, 
  onEditToggle,
  onEditSchoolWork,
  onArchive 
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Determine status based on student submissions
  const allSubmitted = activity.students?.every(student => student.submitted) || false;
  const status = allSubmitted ? "All Submitted" : "Not All Submitted";

  const handleSave = () => {
    if (onSave && activity.students) {
      onSave(activity.students);
    }
  };

  const handleMarkAllSubmitted = () => {
    if (onMarkAllSubmitted) {
      onMarkAllSubmitted();
    }
  };

  const handleEditToggle = () => {
    if (onEditToggle) {
      onEditToggle();
    }
  };

  const handleEditSchoolWork = () => {
    if (onEditSchoolWork) {
      onEditSchoolWork(activity);
    }
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    if (onArchive) {
      onArchive(activity);
    }
  };

  const handleGradeInputChange = (studentId, value) => {
    if (onGradeChange) {
      // Remove .0 from whole numbers when typing
      let processedValue = value;
      if (value && value.includes('.')) {
        const num = parseFloat(value);
        if (num === Math.floor(num)) {
          processedValue = Math.floor(num).toString();
        }
      }
      onGradeChange(studentId, processedValue);
      
      // Auto-mark as submitted when a grade is entered
      if (value && value > 0) {
        if (onSubmissionChange) {
          onSubmissionChange(studentId, 'submitted');
        }
      }
    }
  };

  const handleStatusChange = (studentId, statusType) => {
    if (onSubmissionChange) {
      onSubmissionChange(studentId, statusType);
      
      // FIX: Automatically set grade to 0 when marking as missed
      if (statusType === 'missed' && onGradeChange) {
        onGradeChange(studentId, '0');
      }
      
      // FIX: Clear grade when marking as submitted/late without a grade
      if ((statusType === 'submitted' || statusType === 'late') && onGradeChange) {
        // Only clear if current grade is 0 or empty
        const currentStudent = activity.students?.find(s => (s.user_ID || s.id) === studentId);
        if (currentStudent && (!currentStudent.grade || currentStudent.grade === '0')) {
          onGradeChange(studentId, '');
        }
      }
    }
  };

  const getStudentStatus = (student) => {
    if (student.late) return 'late';
    if (student.submitted) return 'submitted';
    return 'missed';
  };

  // Format grade for display - remove .0 from whole numbers
  const formatGrade = (grade) => {
    if (grade === null || grade === undefined || grade === '') return '';
    
    const num = parseFloat(grade);
    if (isNaN(num)) return grade;
    
    // If it's a whole number, display without decimals
    if (num === Math.floor(num)) {
      return Math.floor(num).toString();
    }
    
    // Otherwise display with decimals
    return num.toString();
  };

  // Check if grade exceeds maximum points
  const isGradeExceeded = (grade) => {
    if (!grade || grade === '' || !activity.points) return false;
    
    const numGrade = parseFloat(grade);
    return numGrade > activity.points;
  };

  // Format date for display with time
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    try {
      const date = new Date(dateString);
      
      // Check if the date has time component
      const hasTime = dateString.includes(' ') || dateString.includes('T');
      
      if (hasTime) {
        // Format with time
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) + ' | ' + date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } else {
        // Format without time (legacy date-only format)
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    } catch {
      return dateString;
    }
  };

  // Function to render link
  const renderLink = () => {
    if (!activity.link) return null;
    
    return (
      <div className="flex items-start gap-2 mt-1">
        <span className="text-xs sm:text-sm font-semibold text-[#465746] whitespace-nowrap">Link:</span>
        <a 
          href={activity.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline break-words flex-1"
        >
          {activity.link}
        </a>
      </div>
    );
  };

  return (
    <div className={`bg-[#fff] rounded-md shadow-md p-3 sm:p-4 mb-4 w-full mt-5 border-2 ${
      !isEditing ? 'border-transparent' : 'border-[#00874E]'
    }`}>
      {/* Card Header */}
      <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pr-10">
          
          {/* Title section */}
          <div className="flex flex-col text-sm sm:text-base lg:text-[1.125rem] flex-1 min-w-0">
            <span className="font-bold text-base sm:text-lg">{activity.title || activity.task_number}</span>
            <span className="text-xs sm:text-sm text-gray-600 mt-1">
              {activity.instruction || activity.description}
            </span>
            
            {/* NEW: Activity Type, Task Number, and Link */}
            <div className="flex flex-col gap-1.5 mt-2">
              {/* Activity Type and Task Number */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {activity.activity_type && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-semibold text-[#465746] whitespace-nowrap">Type:</span>
                    <span className="text-xs sm:text-sm text-[#465746] capitalize">{activity.activity_type.toLowerCase()}</span>
                  </div>
                )}
                {activity.task_number && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-semibold text-[#465746] whitespace-nowrap">Task:</span>
                    <span className="text-xs sm:text-sm text-[#465746] uppercase">{activity.task_number}</span>
                  </div>
                )}
              </div>
              
              {/* Link */}
              {renderLink()}
              
              {/* Points */}
              {activity.points && (
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#465746] whitespace-nowrap">Total Points:</span>
                  <span className="text-xs sm:text-sm text-[#465746]">{activity.points}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status and Deadline section - stack on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 md:gap-4 text-sm sm:text-base lg:text-[1.125rem]">
            <div className="flex items-center gap-2">
              <p className="font-bold whitespace-nowrap text-xs sm:text-sm">Status:</p>
              <p className={`whitespace-nowrap text-xs sm:text-sm lg:text-base ${allSubmitted ? 'text-[#00A15D]' : 'text-[#EF4444]'}`}>
                {status}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-[#EF4444] whitespace-nowrap text-xs sm:text-sm">Deadline:</p>
              <p className="whitespace-nowrap text-xs sm:text-sm lg:text-base">
                {formatDate(activity.deadline)}
              </p>
            </div>
          </div>
        </div>

        {/* Arrow - absolute positioned on upper right */}
        <img
          src={ArrowDown}
          alt="Expand"
          className={`h-5 w-5 sm:h-6 sm:w-6 transform transition-transform duration-300 
                      absolute top-0 right-0
                      ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Archive Button - Only show when card is NOT expanded, positioned at lower right */}
      {!isOpen && (
        <div className="mt-3 flex justify-end">
          <button 
            onClick={handleArchive}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-md hover:bg-gray-300 transition-all duration-200 cursor-pointer"
          >
            <img 
              src={Archive} 
              alt="Archive" 
              className="h-4 w-4" 
            />
            Archive
          </button>
        </div>
      )}

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-3 pt-3 space-y-4">
          {/* Student Table */}
          <div className="overflow-x-auto relative">
            {/* Scroll hint for mobile */}
            <div className="sm:hidden text-xs text-gray-500 mb-2 text-center">
              ← Swipe to see all columns →
            </div>
            
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="text-left text-xs sm:text-sm lg:text-[1.125rem] font-semibold">
                  <th className="p-2">Student No.</th>
                  <th className="p-2">Student Name</th>
                  <th className="p-2 text-center">
                    <span className="hidden sm:inline">Score</span>
                    <span className="sm:hidden">Pts</span>
                    {activity.points ? ` / ${activity.points}` : ''}
                  </th>
                  <th className="p-2 text-center text-[#00A15D]">Submitted</th>
                  <th className="p-2 text-center text-[#767EE0]">Late</th>
                  <th className="p-2 text-center text-[#EF4444]">Missed</th>
                </tr>
              </thead>
              <tbody>
                {activity.students?.length > 0 ? (
                  activity.students.map((student) => {
                    const currentStatus = getStudentStatus(student);
                    const gradeExceeded = isGradeExceeded(student.grade);
                    // FIX: Include activity ID in the radio name to make it unique per activity
                    const radioName = `status-${activity.id}-${student.user_ID || student.id}`;
                    
                    return (
                      <tr key={student.user_ID || student.id} className="hover:bg-gray-50">
                        <td className="p-2 text-xs sm:text-sm lg:text-base">{student.user_ID || student.no}</td>
                        <td className="p-2 text-xs sm:text-sm lg:text-base">{student.user_Name || student.name}</td>
                        <td className="p-2 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                className={`w-14 sm:w-16 rounded border px-1 sm:px-2 py-1.5 sm:py-1 text-xs sm:text-sm text-center ${
                                  !isEditing ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                } ${
                                  gradeExceeded ? 'border-red-500 border-2 bg-red-50' : ''
                                }`}
                                placeholder="0"
                                value={formatGrade(student.grade)}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleGradeInputChange(student.user_ID || student.id, value);
                                }}
                                onBlur={(e) => {
                                  const value = e.target.value;
                                  if (value && value > 0 && !student.submitted) {
                                    handleStatusChange(student.user_ID || student.id, 'submitted');
                                  }
                                }}
                                disabled={!isEditing}
                                max={activity.points || 100}
                                min="0"
                                step="1"
                              />
                              {activity.points && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  / {activity.points}
                                </span>
                              )}
                            </div>
                            {gradeExceeded && (
                              <span className="text-xs text-red-500 mt-1 whitespace-nowrap font-medium">
                                Exceeded max!
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* Submitted */}
                        <td className="p-2 text-center w-10">
                          <input
                            type="radio"
                            name={radioName}
                            className="appearance-none w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#00A15D] rounded-md checked:bg-[#00A15D] cursor-pointer disabled:cursor-not-allowed"
                            checked={currentStatus === 'submitted'}
                            onChange={() => handleStatusChange(student.user_ID || student.id, 'submitted')}
                            disabled={!isEditing}
                          />
                        </td>
                        
                        {/* Late */}
                        <td className="p-2 text-center w-10">
                          <input
                            type="radio"
                            name={radioName}
                            className="appearance-none w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#767EE0] rounded-md checked:bg-[#767EE0] cursor-pointer disabled:cursor-not-allowed"
                            checked={currentStatus === 'late'}
                            onChange={() => handleStatusChange(student.user_ID || student.id, 'late')}
                            disabled={!isEditing}
                          />
                        </td>
                        
                        {/* Missed */}
                        <td className="p-2 text-center w-10">
                          <input
                            type="radio"
                            name={radioName}
                            className="appearance-none w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#EF4444] rounded-md checked:bg-[#EF4444] cursor-pointer disabled:cursor-not-allowed"
                            checked={currentStatus === 'missed'}
                            onChange={() => handleStatusChange(student.user_ID || student.id, 'missed')}
                            disabled={!isEditing}
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500 text-xs sm:text-sm">
                      No students found for this activity. Students: {activity.students?.length || 0}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* EDIT RECORDS, EDIT SCHOOL WORKS, MARK ALL, SAVE Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            {!isEditing ? (
              <>
                <button 
                  onClick={handleEditToggle}
                  className="w-full sm:w-auto px-4 py-2 bg-[#979797] text-[#fff] text-sm sm:text-base font-bold rounded-md hover:border-2 hover:border-[#007846] transition-all duration-200 cursor-pointer"
                >
                  Edit Records
                </button>
                <button 
                  onClick={handleEditSchoolWork}
                  className="w-full sm:w-auto px-4 py-2 bg-[#979797] text-[#fff] text-sm sm:text-base font-bold rounded-md hover:border-2 hover:border-[#007846] transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  Edit School Works
                </button>
                {!allSubmitted && (
                  <button 
                    onClick={handleMarkAllSubmitted}
                    className="w-full sm:w-auto px-4 py-2 bg-[#979797] text-[#fff] text-sm sm:text-base font-bold rounded-md hover:border-2 hover:border-[#007846] transition-all duration-200 cursor-pointer whitespace-nowrap"
                  >
                    Mark All Submitted
                  </button>
                )}
              </>
            ) : (
              <button 
                onClick={handleSave}
                className="w-full sm:w-auto px-4 py-2 bg-[#00A15D] text-[#fff] text-sm sm:text-base font-bold rounded-md hover:border-2 hover:border-[#007846] transition-all duration-200 cursor-pointer"
              >
                Save
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}