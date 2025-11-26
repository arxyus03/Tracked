import React, { useState } from 'react';
import Cross from "../assets/Cross(Light).svg";
import EmailIcon from "../assets/Email(Light).svg";
import ArrowDown from "../assets/ArrowDown(Light).svg";
import Nothing from "../assets/Nothing.svg";
import NoSubmission from "../assets/NoSubmission.svg";
import Missing from "../assets/Missing.svg";

const StudentActivitiesDetails = ({ activity, students, isOpen, onClose }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activityFilter, setActivityFilter] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Mock data for student activities - in real app, this would come from props or API
  const studentActivities = {
    // studentId: array of activities
    1: [
      {
        id: 1,
        title: "Math Homework Chapter 1",
        dueDate: "2024-01-15",
        status: "Submitted",
        grade: "45/50",
        type: "Homework"
      },
      {
        id: 2,
        title: "Science Lab Report",
        dueDate: "2024-01-20",
        status: "Late",
        grade: "38/50",
        type: "Lab Report"
      },
      {
        id: 3,
        title: "History Essay",
        dueDate: "2024-02-01",
        status: "Submitted",
        grade: "48/50",
        type: "Essay"
      },
      {
        id: 4,
        title: "Physics Quiz",
        dueDate: "2024-01-10",
        status: "Missed",
        grade: "0/20",
        type: "Quiz"
      }
    ],
    2: [
      {
        id: 1,
        title: "Math Homework Chapter 1",
        dueDate: "2024-01-15",
        status: "Missed",
        grade: "0/50",
        type: "Homework"
      },
      {
        id: 2,
        title: "Science Lab Report",
        dueDate: "2024-01-20",
        status: "Submitted",
        grade: "45/50",
        type: "Lab Report"
      },
      {
        id: 3,
        title: "English Assignment",
        dueDate: "2024-01-25",
        status: "Submitted",
        grade: "40/50",
        type: "Assignment"
      }
    ]
    // Add more student activities as needed
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-green-100 text-green-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Missed': return 'bg-red-100 text-red-800';
      case 'Assigned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEmailStudent = (studentEmail) => {
    if (studentEmail) {
      window.open(`mailto:${studentEmail}?subject=Regarding Student Performance`, '_blank');
    }
  };

  // Filter activities based on selected filter
  const getFilteredActivities = (activities) => {
    if (!activities) return [];
    
    switch (activityFilter) {
      case 'Submitted':
        return activities.filter(activity => activity.status === 'Submitted' || activity.status === 'Late');
      case 'Missing':
        return activities.filter(activity => activity.status === 'Missed');
      case 'All':
      default:
        return activities;
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownOpen && !event.target.closest('.activity-filter-dropdown')) {
        setFilterDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [filterDropdownOpen]);

  if (!isOpen) return null;

  const currentStudentActivities = selectedStudent ? 
    studentActivities[selectedStudent.user_ID] || [] : [];
  
  const filteredActivities = getFilteredActivities(currentStudentActivities);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[70] p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              Student Activities - {activity.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
              View all student activities and submissions
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer ml-2"
          >
            <img src={Cross} alt="Close" className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Panel - Students List */}
          <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Students</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {students.length} students assigned
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                {students.map((student) => {
                  const isSelected = selectedStudent?.user_ID === student.user_ID;
                  return (
                    <div
                      key={student.user_ID}
                      className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {student.user_Name}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                            {student.user_Email}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                          student.submitted
                            ? student.late
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                            : activity.deadline && new Date(activity.deadline) < new Date()
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.submitted
                            ? student.late ? 'Late' : 'Submitted'
                            : activity.deadline && new Date(activity.deadline) < new Date()
                            ? 'Missed'
                            : 'Assigned'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - Student Activities */}
          <div className="w-full lg:w-1/2 p-3 sm:p-4 lg:p-6">
            {selectedStudent ? (
              <div className="h-full flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {selectedStudent.user_Name}'s Activities
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                      {selectedStudent.user_Email}
                    </p>
                  </div>
                  <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                    {/* Activity Filter Dropdown */}
                    <div className="relative activity-filter-dropdown">
                      <button
                        onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                        className="flex items-center justify-between w-full xs:w-auto font-medium px-3 sm:px-4 py-2 bg-white rounded-md shadow-sm border border-gray-300 hover:border-gray-400 transition-all duration-200 text-sm cursor-pointer"
                      >
                        <span>{activityFilter}</span>
                        <img
                          src={ArrowDown}
                          alt=""
                          className={`ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {filterDropdownOpen && (
                        <div className="absolute top-full mt-1 right-0 xs:left-0 bg-white rounded-md shadow-lg border border-gray-200 z-10 overflow-hidden min-w-[120px]">
                          {["All", "Submitted", "Missing"].map((option) => (
                            <button
                              key={option}
                              className={`block w-full text-left px-3 sm:px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${
                                activityFilter === option ? 'bg-gray-50 font-semibold' : ''
                              }`}
                              onClick={() => {
                                setActivityFilter(option);
                                setFilterDropdownOpen(false);
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleEmailStudent(selectedStudent.user_Email)}
                      className="w-full xs:w-auto border border-gray-200 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors cursor-pointer hover:bg-gray-50 flex-shrink-0 text-sm"
                    >
                      <img src={EmailIcon} alt="Email" className="w-4 h-4" />
                      <span>Email</span>
                    </button>
                  </div>
                </div>

                {/* Activity Count */}
                <div className="mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Showing {filteredActivities.length} of {currentStudentActivities.length} activities
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filteredActivities.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {filteredActivities.map((activityItem) => (
                        <div key={activityItem.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                {activityItem.title}
                              </h4>
                              <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mt-2 text-xs sm:text-sm text-gray-600">
                                <span>Due: {new Date(activityItem.dueDate).toLocaleDateString()}</span>
                                <span className="hidden xs:inline">•</span>
                                <span>{activityItem.type}</span>
                                <span className="hidden xs:inline">•</span>
                                <span>{activityItem.grade}</span>
                              </div>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activityItem.status)} flex-shrink-0 self-start sm:self-auto`}>
                              {activityItem.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm sm:text-base text-center px-4">
                      <div className="mb-2">
                        {activityFilter === "All" ? <img src={Nothing} alt="Close" className="w-30 h-30 sm:w-40 sm:h-40" /> : activityFilter === "Submitted" ? <img src={NoSubmission} alt="Close" className="w-30 h-30 sm:w-40 sm:h-40" /> : <img src={Missing} alt="Close" className="w-30 h-30 sm:w-40 sm:h-40" />}
                      </div>
                      <p>
                        {activityFilter === "All" 
                          ? "No activities found for this student." 
                          : activityFilter === "Submitted"
                          ? "No submitted activities found."
                          : "No missing activities found."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm sm:text-base text-center px-4">
                Select a student to view their activities
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentActivitiesDetails;