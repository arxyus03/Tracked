import React, { useState, useEffect } from 'react';
import ArrowDown from "../assets/ArrowDown(Light).svg";
import FileIcon from "../assets/File(Light).svg";
import FolderGreen from "../assets/Folder(Green).svg";
import EmailIcon from "../assets/Email(Light).svg";
import Close from "../assets/Close.svg";
import Cross from "../assets/Cross(Light).svg";
import Delete from "../assets/Delete.svg";
import DetailsIcon from "../assets/Details(Light).svg";
import StudentActivitiesDetails from './StudentActivitiesDetails';

const ClassWorkSubmissions = ({ 
  activity, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [filter, setFilter] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [localStudents, setLocalStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (activity && activity.students) {
      setLocalStudents([...activity.students]);
      // Auto-select first student on mobile if none selected
      if (isMobile && activity.students.length > 0 && !selectedStudent) {
        setSelectedStudent({ 
          id: activity.students[0].user_ID, 
          name: activity.students[0].user_Name 
        });
      }
    }
  }, [activity, isMobile]);

  const filterOptions = [
    "All",
    "Assigned",
    "Submitted",
    "Missed",
    "Graded",
    "Not Graded"
  ];

  // Calculate status counts
  const statusCounts = {
    assigned: localStudents.length,
    submitted: localStudents.filter(student => student.submitted).length,
    missed: localStudents.filter(student => 
      !student.submitted && activity.deadline && new Date(activity.deadline) < new Date()
    ).length
  };

  const filteredStudents = localStudents.filter(student => {
    switch (filter) {
      case "Assigned":
        return true;
      case "Submitted":
        return student.submitted;
      case "Missed":
        return !student.submitted && activity.deadline && new Date(activity.deadline) < new Date();
      case "Graded":
        return student.grade != null && student.grade !== '';
      case "Not Graded":
        return student.submitted && (student.grade == null || student.grade === '');
      default:
        return true;
    }
  });

  const handleGradeChange = (studentId, value) => {
    const wholeNumberValue = value.replace(/[.,]/g, '');
    setLocalStudents(prev => prev.map(student =>
      student.user_ID === studentId
        ? { ...student, grade: wholeNumberValue }
        : student
    ));
  };

  const handleSave = () => {
    onSave(localStudents);
  };

  const handleEmailStudent = (studentEmail) => {
    if (studentEmail) {
      window.open(`mailto:${studentEmail}?subject=Regarding ${activity.title}`, '_blank');
    }
  };

  const handleFileUpload = (studentId, studentName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const newFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadDate: new Date().toISOString(),
          uploadedBy: 'Professor'
        };

        setUploadedFiles(prev => ({
          ...prev,
          [studentId]: newFile
        }));

        console.log(`Uploaded photo for student ${studentName}:`, file);
      }
    };
    input.click();
  };

  const handleViewPhoto = (studentId, studentName) => {
    setSelectedStudent({ id: studentId, name: studentName });
    setImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedStudent(null);
  };

  const handleDeletePhoto = (studentId) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[studentId];
      return newFiles;
    });
    setImageViewerOpen(false);
  };

  const getStudentPhoto = (studentId) => {
    return uploadedFiles[studentId] || null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Pie chart data for selected student
  const getStudentAnalytics = (student) => {
    if (!student) return null;
    
    const totalPoints = activity.points || 100;
    const studentGrade = student.grade ? parseFloat(student.grade) : 0;
    const remainingPoints = totalPoints - studentGrade;
    
    return {
      data: [
        { label: 'Earned', value: studentGrade, color: '#10B981' },
        { label: 'Remaining', value: remainingPoints, color: '#EF4444' }
      ],
      percentage: totalPoints > 0 ? Math.round((studentGrade / totalPoints) * 100) : 0
    };
  };

  const renderPieChart = (analytics) => {
    if (!analytics) return null;
    
    const { data, percentage } = analytics;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    let cumulativePercent = 0;
    
    return (
      <svg width={isMobile ? "100" : "200"} height={isMobile ? "100" : "200"} viewBox="0 0 42 42" className="mx-auto">
        {data.map((segment, index) => {
          const percent = (segment.value / total) * 100;
          const dashArray = `${percent} ${100 - percent}`;
          const dashOffset = -cumulativePercent;
          cumulativePercent += percent;
          
          return (
            <circle
              key={index}
              cx="21"
              cy="21"
              r="15.91549430918954"
              fill="transparent"
              stroke={segment.color}
              strokeWidth="3"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 21 21)"
            />
          );
        })}
        <text x="21" y="21" textAnchor="middle" dominantBaseline="middle" className={`${isMobile ? 'text-[.3rem]' : 'text-[.5rem]'} font-bold fill-gray-700`}>
          {percentage}%
        </text>
      </svg>
    );
  };

  // Handle status rectangle clicks
  const handleStatusClick = (status) => {
    setFilter(status);
  };

  if (!isOpen || !activity) return null;

  const currentStudentPhoto = selectedStudent ? getStudentPhoto(selectedStudent.id) : null;
  const studentAnalytics = selectedStudent ? 
    getStudentAnalytics(localStudents.find(s => s.user_ID === selectedStudent.id)) : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-2 sm:p-3 md:p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col mx-1 sm:mx-2 md:mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200">
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
                Student Submissions - {activity.title}
              </h2>
              <p className="text-xs sm:text-sm mt-1">
                {activity.activity_type} #{activity.task_number} 
              </p>
              <p className="text-xs sm:text-sm text-red-600 font-bold mt-1">
                • Due {activity.deadline ? new Date(activity.deadline)
                .toLocaleDateString() : 'No deadline'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer flex-shrink-0 ml-2"
            >
              <img src={Cross} alt="Close" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Main Content */}
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} flex-1 overflow-hidden`}>
            {/* Left Panel - Students List */}
            <div className={`${isMobile ? 'w-full' : 'w-1/2'} ${isMobile ? 'flex-1' : ''} border-r border-gray-200 flex flex-col`}>
              {/* Instructions */}
              <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2">Instructions</h3>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {activity.instructions || 'No instructions provided for this activity.'}
                </p>
              </div>

              {/* Status Rectangles */}
              <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
                <div className="flex gap-2 sm:gap-3 md:gap-4">
                  <button
                    onClick={() => handleStatusClick("Assigned")}
                    className={`flex-1 border rounded-lg p-2 sm:p-3 md:p-4 text-center transition-all duration-200 cursor-pointer ${
                      filter === "Assigned" 
                        ? "bg-yellow-100 border-yellow-300 shadow-md" 
                        : "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                    }`}
                  >
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-800">{statusCounts.assigned}</div>
                    <div className="text-xs sm:text-sm text-yellow-700">Assigned</div>
                  </button>
                  <button
                    onClick={() => handleStatusClick("Submitted")}
                    className={`flex-1 border rounded-lg p-2 sm:p-3 md:p-4 text-center transition-all duration-200 cursor-pointer ${
                      filter === "Submitted" 
                        ? "bg-green-100 border-green-300 shadow-md" 
                        : "bg-green-50 border-green-200 hover:bg-green-100"
                    }`}
                  >
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-800">{statusCounts.submitted}</div>
                    <div className="text-xs sm:text-sm text-green-700">Submitted</div>
                  </button>
                  <button
                    onClick={() => handleStatusClick("Missed")}
                    className={`flex-1 border rounded-lg p-2 sm:p-3 md:p-4 text-center transition-all duration-200 cursor-pointer ${
                      filter === "Missed" 
                        ? "bg-red-100 border-red-300 shadow-md" 
                        : "bg-red-50 border-red-200 hover:bg-red-100"
                    }`}
                  >
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-800">{statusCounts.missed}</div>
                    <div className="text-xs sm:text-sm text-red-700">Missed</div>
                  </button>
                </div>
              </div>

              {/* Filter Section */}
              <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="relative">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mr-2">Filter:</label>
                    <button
                      onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      {filter}
                      <img
                        src={ArrowDown}
                        alt=""
                        className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {filterDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-32 sm:w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        {filterOptions.map(option => (
                          <button
                            key={option}
                            onClick={() => {
                              setFilter(option);
                              setFilterDropdownOpen(false);
                            }}
                            className={`block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-100 cursor-pointer ${
                              filter === option ? 'bg-gray-50 font-medium' : ''
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-xs sm:text-sm text-gray-600">
                    Showing {filteredStudents.length} of {localStudents.length} students
                  </div>
                </div>
              </div>

              {/* Students List */}
              <div className="flex-1 overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => {
                        const studentPhoto = getStudentPhoto(student.user_ID);
                        const hasPhoto = !!studentPhoto;
                        const isSelected = selectedStudent?.id === student.user_ID;

                        return (
                          <tr 
                            key={student.user_ID} 
                            className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                            onClick={() => setSelectedStudent({ id: student.user_ID, name: student.user_Name })}
                          >
                            <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                {student.user_Name}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">
                                {student.user_Email || 'No email'}
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                              <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${
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
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={activity.points || 100}
                                  value={student.grade || ''}
                                  onChange={(e) => handleGradeChange(student.user_ID, e.target.value)}
                                  className="w-10 sm:w-12 px-1.5 sm:px-2 py-0.5 sm:py-1 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  onClick={(e) => e.stopPropagation()}
                                  step="1"
                                />
                                {activity.points && (
                                  <span className="text-xs text-gray-500 ml-1">/ {activity.points}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1 sm:gap-2">
                                {/* Folder Icon with Tooltip */}
                                <div className="relative group">
                                  <button
                                    onClick={() => hasPhoto ? 
                                      handleViewPhoto(student.user_ID, student.user_Name) : 
                                      handleFileUpload(student.user_ID, student.user_Name)
                                    }
                                    className="p-0.5 sm:p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                                  >
                                    <img 
                                      src={hasPhoto ? FolderGreen : FileIcon} 
                                      alt={hasPhoto ? "View Photo" : "Upload Photo"} 
                                      className="w-4 h-4 sm:w-5 sm:h-5" 
                                    />
                                  </button>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    {hasPhoto ? "View Photo" : "Add Photo"}
                                  </div>
                                </div>

                                {/* Email Icon with Tooltip */}
                                <div className="relative group">
                                  <button
                                    onClick={() => handleEmailStudent(student.user_Email)}
                                    className="p-0.5 sm:p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                                  >
                                    <img src={EmailIcon} alt="Email" className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </button>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    Email Student
                                  </div>
                                </div>

                                {/* Details Icon with Tooltip */}
                                <div className="relative group">
                                  <button
                                    onClick={() => setDetailsModalOpen(true)}
                                    className="p-0.5 sm:p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                                  >
                                    <img src={DetailsIcon} alt="Details" className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </button>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    View Details
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredStudents.length === 0 && (
                  <div className="text-center py-6 text-xs sm:text-sm text-gray-500">
                    No students found for the selected filter.
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Analytics - Scrollable on mobile */}
            <div className={`${isMobile ? 'w-full border-t border-gray-200' : 'w-1/2'} ${isMobile ? 'max-h-96 overflow-y-auto' : ''} p-3 sm:p-4 md:p-6`}>
              {selectedStudent ? (
                <div className={`${isMobile ? 'min-h-0' : 'h-full'} flex flex-col`}>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Analytics - {selectedStudent.name}
                  </h3>
                  
                  {/* Pie Chart */}
                  <div className={`${isMobile ? 'flex-shrink-0' : 'flex-1'} flex flex-col items-center justify-center mb-4 sm:mb-6`}>
                    {studentAnalytics ? (
                      <>
                        {renderPieChart(studentAnalytics)}
                        <div className="mt-3 sm:mt-4 md:mt-6 text-center">
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">
                            Grade Distribution
                          </p>
                          <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mt-2">
                            {studentAnalytics.data.map((item, index) => (
                              <div key={index} className="flex items-center gap-1">
                                <div 
                                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-xs text-gray-600">
                                  {item.label}: {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-xs sm:text-sm text-gray-500">
                        No grade data available for this student.
                      </div>
                    )}
                  </div>

                  {/* Student Details */}
                  <div className="mt-3 sm:mt-4 md:mt-6 p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">Student Details</h4>
                    <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                      <p className="truncate">Email: {localStudents.find(s => s.user_ID === selectedStudent.id)?.user_Email || 'N/A'}</p>
                      <p>Status: {
                        (() => {
                          const student = localStudents.find(s => s.user_ID === selectedStudent.id);
                          if (student.submitted) {
                            return student.late ? 'Late Submission' : 'Submitted';
                          }
                          return activity.deadline && new Date(activity.deadline) < new Date() ? 'Missed' : 'Assigned';
                        })()
                      }</p>
                      <p>Current Grade: {localStudents.find(s => s.user_ID === selectedStudent.id)?.grade || 'Not graded'}</p>
                    </div>
                  </div>

                  {/* Additional information that might appear on scroll */}
                  {isMobile && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700 text-center">
                        Scroll to see more analytics information
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs sm:text-sm text-gray-500">
                  {isMobile && localStudents.length > 0 ? "Tap a student to view analytics" : "Select a student to view analytics"}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 cursor-pointer"
            >
              Save Grades
            </button>
          </div>
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {imageViewerOpen && selectedStudent && currentStudentPhoto && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-2 sm:p-3 md:p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={handleCloseImageViewer}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 p-2 sm:p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10 cursor-pointer"
            >
              <img src={Close} alt="Close" className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </button>

            <button
              onClick={() => handleDeletePhoto(selectedStudent.id)}
              className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 p-2 sm:p-3 transition-colors z-10 cursor-pointer"
              title="Delete Photo"
            >
              <img src={Delete} alt="Delete" className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </button>

            <div className="relative max-w-[95vw] max-h-[85vh] w-auto h-auto">
              <img
                src={currentStudentPhoto.url}
                alt={currentStudentPhoto.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{
                  maxWidth: 'min(95vw, 1200px)',
                  maxHeight: 'min(85vh, 800px)',
                  width: 'auto',
                  height: 'auto'
                }}
              />
            </div>

            <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md text-xs sm:text-sm backdrop-blur-sm">
              {currentStudentPhoto.name} • {formatFileSize(currentStudentPhoto.size)} • {selectedStudent.name}
            </div>
          </div>
        </div>
      )}

      {/* Student Activities Details Modal */}
      <StudentActivitiesDetails
        activity={activity}
        students={localStudents}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </>
  );
};

export default ClassWorkSubmissions;