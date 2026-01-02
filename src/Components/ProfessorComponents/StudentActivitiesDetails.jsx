import React, { useState, useEffect } from 'react';
import Cross from "../../assets/Cross.svg";
import EmailIcon from "../../assets/Email.svg";
import ArrowDown from "../../assets/ArrowDown.svg";
import Nothing from "../../assets/Nothing.svg";
import NoSubmission from "../../assets/NoSubmission.svg";
import Missed from "../../assets/Missing.svg";
import FileIcon from "../../assets/File.svg";
import ImageIcon from "../../assets/Image.svg";
import DownloadIcon from "../../assets/Download(Light).svg";

const StudentActivitiesDetails = ({ 
  activity, 
  students, 
  isOpen, 
  onClose, 
  subjectCode,
  professorName // Add this prop
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activityFilter, setActivityFilter] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [studentActivities, setStudentActivities] = useState({});
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [professorFiles, setProfessorFiles] = useState({});
  const [studentFiles, setStudentFiles] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [, setSelectedActivityDetails] = useState(null);

  // Set first student as default when component opens
  useEffect(() => {
    if (isOpen && students && students.length > 0) {
      setSelectedStudent(students[0]);
    }
  }, [isOpen, students]);

  // Fetch student activities when component opens or selected student changes
  useEffect(() => {
    if (isOpen && subjectCode && selectedStudent) {
      fetchStudentActivities();
    }
  }, [isOpen, subjectCode, selectedStudent]);

  // Helper function to calculate student status consistently
  const calculateStudentStatus = (student, activityItem) => {
    const now = new Date();
    const deadline = activityItem.deadline ? new Date(activityItem.deadline) : null;
    
    if (student.submitted) {
      return student.late ? 'Late' : 'Submitted';
    } else if (deadline && deadline < now) {
      return 'Missed';
    } else {
      return 'Assigned';
    }
  };

  const fetchStudentActivities = async () => {
    try {
      setLoadingActivities(true);
      
      // Fetch all activities for this subject to get student performance data
      const response = await fetch(`https://tracked.6minds.site/Professor/SubjectDetailsDB/get_activities.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched activities for student details:', result);
        
        if (result.success) {
          const activitiesData = result.activities || [];
          const studentActivityMap = {};
          const professorFileMap = {};
          const studentFileMap = {};
          
          // Initialize all students with empty activity array
          students.forEach(student => {
            studentActivityMap[student.user_ID] = [];
            studentFileMap[student.user_ID] = {};
          });
          
          // Populate each student's activities and files
          activitiesData.forEach(activityItem => {
            // Store professor files for this activity
            if (activityItem.professor_files && activityItem.professor_files.length > 0) {
              professorFileMap[activityItem.id] = activityItem.professor_files;
            }
            
            if (activityItem.students) {
              activityItem.students.forEach(student => {
                if (studentActivityMap[student.user_ID]) {
                  studentActivityMap[student.user_ID].push({
                    id: activityItem.id,
                    title: activityItem.title,
                    dueDate: activityItem.deadline,
                    status: calculateStudentStatus(student, activityItem),
                    grade: student.grade ? `${student.grade}/${activityItem.points || 100}` : 'Not graded',
                    type: activityItem.activity_type,
                    points: activityItem.points || 0,
                    submitted: student.submitted,
                    late: student.late
                  });
                  
                  // Store student files for this activity
                  if (student.student_files && student.student_files.length > 0) {
                    if (!studentFileMap[student.user_ID]) {
                      studentFileMap[student.user_ID] = {};
                    }
                    studentFileMap[student.user_ID][activityItem.id] = student.student_files;
                  }
                }
              });
            }
          });
          
          setStudentActivities(studentActivityMap);
          setProfessorFiles(professorFileMap);
          setStudentFiles(studentFileMap);
        } else {
          console.error('Error fetching activities:', result.message);
          setStudentActivities({});
        }
      } else {
        throw new Error('Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching student activities:', error);
      setStudentActivities({});
    } finally {
      setLoadingActivities(false);
    }
  };

  // Fetch activity details including files
  const fetchActivityDetails = async (activityId, studentId) => {
    if (!activityId || !studentId) return;
    
    try {
      const response = await fetch(
        `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_activity_details_professor.php?activity_id=${activityId}&student_id=${studentId}`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSelectedActivityDetails(result);
        }
      }
    } catch (error) {
      console.error('Error fetching activity details:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-[#00A15D]/20 text-[#00A15D] border border-[#00A15D]/30';
      case 'Late': return 'bg-[#FFA600]/20 text-[#FFA600] border border-[#FFA600]/30';
      case 'Missed': return 'bg-[#A15353]/20 text-[#A15353] border border-[#A15353]/30';
      case 'Assigned': return 'bg-gray-700 text-gray-300 border border-gray-600';
      default: return 'bg-gray-700 text-gray-300 border border-gray-600';
    }
  };

  const handleEmailStudent = (studentEmail, studentName) => {
    if (studentEmail) {
      const subject = `Regarding Student Performance`;
      // Extract professor surname from full name
      const professorSurname = professorName ? professorName.split(' ').pop() : 'Professor';
      const body = `Dear ${studentName},\n\nI would like to discuss your academic performance and activities.\n\nBest regards,\nProf. ${professorSurname}`;
      
      // Gmail compose URL
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(studentEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open Gmail in a new tab
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('No email address found for this student.');
    }
  };

  // Filter activities based on selected filter
  const getFilteredActivities = (activities) => {
    if (!activities) return [];
    
    switch (activityFilter) {
      case 'Submitted':
        return activities.filter(activity => activity.status === 'Submitted' || activity.status === 'Late');
      case 'Missed':
        return activities.filter(activity => activity.status === 'Missed');
      case 'Assigned':
        return activities.filter(activity => activity.status === 'Assigned');
      case 'All':
      default:
        return activities;
    }
  };

  // Calculate student statistics
  const getStudentStatistics = (studentId) => {
    const activities = studentActivities[studentId] || [];
    const totalActivities = activities.length;
    const submittedActivities = activities.filter(act => act.status === 'Submitted' || act.status === 'Late').length;
    const missedActivities = activities.filter(act => act.status === 'Missed').length;
    const assignedActivities = activities.filter(act => act.status === 'Assigned').length;
    const averageGrade = activities.length > 0 
      ? activities.reduce((sum, act) => {
          if (act.grade && act.grade !== 'Not graded') {
            const [earned, total] = act.grade.split('/').map(Number);
            return sum + (earned / total) * 100;
          }
          return sum;
        }, 0) / activities.length
      : 0;

    return {
      totalActivities,
      submittedActivities,
      missedActivities,
      assignedActivities,
      submissionRate: totalActivities > 0 ? (submittedActivities / totalActivities) * 100 : 0,
      averageGrade: Math.round(averageGrade)
    };
  };

  // Handle viewing files for a specific activity
  const handleViewActivityFiles = (activityItem) => {
    if (selectedStudent) {
      fetchActivityDetails(activityItem.id, selectedStudent.user_ID);
    }
  };

  // Handle viewing image
  const handleViewImage = (file) => {
    const fileUrl = file.file_url || file.url;
    if (fileUrl) {
      setSelectedImage({ url: fileUrl, name: file.original_name });
    }
  };

  // Handle close image
  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
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
  const studentStats = selectedStudent ? getStudentStatistics(selectedStudent.user_ID) : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[70] p-2">
        <div className="bg-[#15151C] rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col mx-auto border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-[#FFFFFF] truncate">
                Student Activities - {activity?.title || 'All Activities'}
              </h2>
              <p className="text-xs text-[#FFFFFF]/60 mt-0.5 truncate">
                View student activities and performance across all assignments
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 hover:bg-gray-800 rounded transition-colors cursor-pointer ml-1"
            >
              <img src={Cross} alt="Close" className="w-4 h-4" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Left Panel - Students List */}
            <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-700 flex flex-col">
              <div className="p-2.5 border-b border-gray-700">
                <h3 className="text-sm font-semibold text-[#FFFFFF]">Students</h3>
                <p className="text-xs text-[#FFFFFF]/60 mt-0.5">
                  {students.length} students in class
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loadingActivities ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-[#767EE0] border-r-transparent"></div>
                    <p className="ml-2 text-xs text-[#FFFFFF]/60">Loading student data...</p>
                  </div>
                ) : (
                  <div className="p-2.5 space-y-2">
                    {students.map((student) => {
                      const isSelected = selectedStudent?.user_ID === student.user_ID;
                      const stats = getStudentStatistics(student.user_ID);
                      const currentActivityStatus = activity ? calculateStudentStatus(student, activity) : 'N/A';
                      
                      return (
                        <div
                          key={student.user_ID}
                          className={`p-2.5 border rounded-md cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-[#767EE0] bg-[#767EE0]/10' 
                              : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                          }`}
                          onClick={() => setSelectedStudent(student)}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[#FFFFFF] text-xs truncate">
                                {student.user_Name}
                              </h4>
                              <p className="text-xs text-[#FFFFFF]/60 mt-0.5 truncate">
                                {student.user_Email}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-[#FFFFFF]/60">
                                <span>Activities: {stats.totalActivities}</span>
                                <span>Submitted: {stats.submittedActivities}</span>
                                {stats.averageGrade > 0 && (
                                  <span>Avg: {stats.averageGrade}%</span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                              <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded ${getStatusColor(currentActivityStatus)}`}>
                                {currentActivityStatus}
                              </span>
                              <span className="text-xs text-[#FFFFFF]/40">
                                {Math.round(stats.submissionRate)}% submitted
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Student Activities */}
            <div className="w-full lg:w-1/2 p-2.5 lg:p-3">
              {selectedStudent ? (
                <div className="h-full flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#FFFFFF] truncate">
                        {selectedStudent.user_Name}'s Activities
                      </h3>
                      <p className="text-xs text-[#FFFFFF]/60 mt-0.5 truncate">
                        {selectedStudent.user_Email}
                      </p>
                      {studentStats && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs text-[#FFFFFF]/60">
                          <span className="bg-[#00A15D]/20 text-[#00A15D] px-1.5 py-0.5 rounded text-xs">
                            Submitted: {studentStats.submittedActivities}
                          </span>
                          <span className="bg-[#A15353]/20 text-[#A15353] px-1.5 py-0.5 rounded text-xs">
                            Missed: {studentStats.missedActivities}
                          </span>
                          <span className="bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded text-xs">
                            Assigned: {studentStats.assignedActivities}
                          </span>
                          <span className="bg-[#767EE0]/20 text-[#767EE0] px-1.5 py-0.5 rounded text-xs">
                            Total: {studentStats.totalActivities}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col xs:flex-row gap-1.5 mt-2 sm:mt-0">
                      {/* Activity Filter Dropdown */}
                      <div className="relative activity-filter-dropdown">
                        <button
                          onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                          className="flex items-center justify-between w-full xs:w-auto font-medium px-2.5 py-1.5 bg-gray-800 rounded-md border border-gray-700 hover:border-gray-600 transition-all duration-200 text-xs cursor-pointer text-[#FFFFFF]"
                        >
                          <span>{activityFilter}</span>
                          <img
                            src={ArrowDown}
                            alt=""
                            className={`ml-1.5 h-3 w-3 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {filterDropdownOpen && (
                          <div className="absolute top-full mt-1 right-0 xs:left-0 bg-[#15151C] rounded-md shadow-lg border border-gray-700 z-10 overflow-hidden min-w-[110px]">
                            {["All", "Submitted", "Missed", "Assigned"].map((option) => (
                              <button
                                key={option}
                                className={`block w-full text-left px-2.5 py-1.5 text-xs hover:bg-gray-800 cursor-pointer transition-colors text-[#FFFFFF] ${
                                  activityFilter === option ? 'bg-gray-800 font-semibold' : ''
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
                        onClick={() => handleEmailStudent(selectedStudent.user_Email, selectedStudent.user_Name)}
                        className="w-full xs:w-auto border border-gray-700 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer hover:bg-gray-800 flex-shrink-0 text-xs text-[#FFFFFF]"
                      >
                        <img src={EmailIcon} alt="Email" className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </button>
                    </div>
                  </div>

                  {/* Activity Count */}
                  <div className="mb-2">
                    <p className="text-xs text-[#FFFFFF]/60">
                      Showing {filteredActivities.length} of {currentStudentActivities.length} activities
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {loadingActivities ? (
                      <div className="flex items-center justify-center h-24">
                        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-[#767EE0] border-r-transparent"></div>
                        <p className="ml-2 text-xs text-[#FFFFFF]/60">Loading activities...</p>
                      </div>
                    ) : filteredActivities.length > 0 ? (
                      <div className="space-y-2">
                        {filteredActivities.map((activityItem) => {
                          // Get files for this activity
                          const activityProfessorFiles = professorFiles[activityItem.id] || [];
                          const activityStudentFiles = selectedStudent ? 
                            (studentFiles[selectedStudent.user_ID] || {})[activityItem.id] || [] : [];
                          
                          return (
                            <div key={activityItem.id} className="border border-gray-700 rounded-md p-2.5 hover:bg-gray-800/50 transition-colors">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-[#FFFFFF] text-xs break-words">
                                    {activityItem.title}
                                  </h4>
                                  <div className="flex flex-col xs:flex-row xs:items-center gap-1 mt-1 text-xs text-[#FFFFFF]/60">
                                    <span>Due: {activityItem.dueDate ? new Date(activityItem.dueDate).toLocaleDateString() : 'No deadline'}</span>
                                    <span className="hidden xs:inline">•</span>
                                    <span>{activityItem.type}</span>
                                    <span className="hidden xs:inline">•</span>
                                    <span className={`font-medium ${
                                      activityItem.grade === 'Not graded' ? 'text-gray-400' : 'text-[#00A15D]'
                                    }`}>
                                      {activityItem.grade}
                                    </span>
                                  </div>
                                  {activityItem.points > 0 && (
                                    <div className="mt-0.5 text-xs text-gray-500">
                                      Max points: {activityItem.points}
                                    </div>
                                  )}
                                </div>
                                <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded ${getStatusColor(activityItem.status)} flex-shrink-0 self-start sm:self-auto mt-1 sm:mt-0`}>
                                  {activityItem.status}
                                </span>
                              </div>

                              {/* Files Section - Only show if there are files */}
                              {(activityProfessorFiles.length > 0 || activityStudentFiles.length > 0) && (
                                <div className="mt-2 pt-2 border-t border-gray-700">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {/* Professor Files */}
                                    {activityProfessorFiles.length > 0 && (
                                      <div>
                                        <p className="text-xs text-gray-400 mb-1">Professor Files:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {activityProfessorFiles.slice(0, 3).map((file, idx) => (
                                            <button
                                              key={idx}
                                              onClick={() => handleViewImage(file)}
                                              className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs text-[#FFFFFF] hover:bg-gray-700 transition-colors cursor-pointer"
                                            >
                                              <img src={FileIcon} alt="File" className="w-3 h-3" />
                                              <span className="truncate max-w-[80px]">
                                                {file.original_name.split('.').shift()}
                                              </span>
                                            </button>
                                          ))}
                                          {activityProfessorFiles.length > 3 && (
                                            <span className="text-xs text-gray-500">
                                              +{activityProfessorFiles.length - 3} more
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Student Files */}
                                    {activityStudentFiles.length > 0 && (
                                      <div>
                                        <p className="text-xs text-gray-400 mb-1">Student Files:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {activityStudentFiles.slice(0, 3).map((file, idx) => (
                                            <button
                                              key={idx}
                                              onClick={() => handleViewImage(file)}
                                              className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs text-[#FFFFFF] hover:bg-gray-700 transition-colors cursor-pointer"
                                            >
                                              <img src={ImageIcon} alt="Image" className="w-3 h-3" />
                                              <span className="truncate max-w-[80px]">
                                                {file.original_name.split('.').shift()}
                                              </span>
                                            </button>
                                          ))}
                                          {activityStudentFiles.length > 3 && (
                                            <span className="text-xs text-gray-500">
                                              +{activityStudentFiles.length - 3} more
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-[#FFFFFF]/60 text-xs text-center px-3">
                        <div className="mb-1.5">
                          {activityFilter === "All" ? 
                            <img src={Nothing} alt="No activities" className="w-24 h-24" /> : 
                            activityFilter === "Submitted" ? 
                            <img src={NoSubmission} alt="No submissions" className="w-24 h-24" /> : 
                            activityFilter === "Assigned" ?
                            <img src={Nothing} alt="No assigned" className="w-24 h-24" /> :
                            <img src={Missed} alt="No missed" className="w-24 h-24" />
                          }
                        </div>
                        <p className="text-sm">
                          {activityFilter === "All" 
                            ? "No activities found for this student." 
                            : activityFilter === "Submitted"
                            ? "No submitted activities found."
                            : activityFilter === "Assigned"
                            ? "No assigned activities found."
                            : "No missed activities found."
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-[#FFFFFF]/60 text-xs text-center px-3">
                  Select a student to view their activities and performance
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-3 border-t border-gray-700 bg-gray-800/50">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium text-[#FFFFFF] bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[80] p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={handleCloseImage}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full z-10"
            >
              <img src={Cross} alt="Close" className="w-5 h-5 invert" />
            </button>
            
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="max-w-full max-h-[85vh] object-contain rounded"
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded text-sm">
              {selectedImage.name}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentActivitiesDetails;