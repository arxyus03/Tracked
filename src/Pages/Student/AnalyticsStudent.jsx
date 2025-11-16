import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import ActivityOverviewStudent from "../../Components/ActivityOverviewStudent";

import Analytics from '../../assets/Analytics(Light).svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import Search from "../../assets/Search.svg";
import Details from '../../assets/Details(Light).svg';
import Check from '../../assets/CheckTable.svg';

export default function AnalyticsStudent() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubject, setOpenSubject] = useState(false);
  const [setOpenSection] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [activitiesData, setActivitiesData] = useState({
    quizzes: [],
    assignments: [],
    activities: [],
    projects: []
  });
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState("");

  // Get student ID from localStorage
  useEffect(() => {
    const getStudentId = () => {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.tracked_ID) {
            return user.tracked_ID;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      return '202210718';
    };

    const id = getStudentId();
    setStudentId(id);
    console.log('Using student ID:', id);
  }, []);

  // Calculate attendance warnings
  const calculateAttendanceWarnings = useMemo(() => {
    if (!attendanceData.length) return { overallWarning: false, subjectWarnings: [] };

    let hasOverallWarning = false;
    const subjectWarnings = attendanceData.map(subject => {
      // Convert late arrivals to equivalent absences (3 late = 1 absent)
      const equivalentAbsences = Math.floor(subject.late / 3);
      const totalEffectiveAbsences = subject.absent + equivalentAbsences;
      
      // Check if student has warning (2 or more effective absences)
      const hasWarning = totalEffectiveAbsences >= 2;
      const isAtRisk = totalEffectiveAbsences >= 3; // 3 absences = dropped
      
      if (hasWarning) hasOverallWarning = true;

      return {
        ...subject,
        equivalentAbsences,
        totalEffectiveAbsences,
        hasWarning,
        isAtRisk,
        warningMessage: isAtRisk 
          ? `CRITICAL: You have ${totalEffectiveAbsences} effective absences (${subject.absent} absents + ${equivalentAbsences} from ${subject.late} lates). You are at risk of being dropped!`
          : hasWarning
          ? `Warning: You have ${totalEffectiveAbsences} effective absences (${subject.absent} absents + ${equivalentAbsences} from ${subject.late} lates)`
          : null
      };
    });

    return { overallWarning: hasOverallWarning, subjectWarnings };
  }, [attendanceData]);

  // Fetch student classes when studentId is available
  useEffect(() => {
    if (!studentId) return;

    const fetchStudentClasses = async () => {
      try {
        console.log('Fetching classes for student:', studentId);
        const response = await fetch(`https://tracked.6minds.site/Student/SubjectsDB/get_student_classes.php?student_id=${studentId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Classes data from API:', data);
        
        if (data.success && data.classes) {
          setSubjects(data.classes);
          if (data.classes.length > 0) {
            setSelectedSubject(data.classes[0].subject_code);
            console.log('Default subject set to:', data.classes[0].subject_code, 'Name:', data.classes[0].subject);
          } else {
            console.log('No classes found for this student');
          }
        } else {
          console.error('Failed to fetch classes:', data.message);
        }
      } catch (error) {
        console.error('Error fetching student classes:', error);
      }
    };

    fetchStudentClasses();
  }, [studentId]);

  // Fetch attendance data when studentId is available
  useEffect(() => {
    if (!studentId) return;

    const fetchAttendanceData = async () => {
      try {
        console.log('Fetching attendance for student:', studentId);
        const response = await fetch(`https://tracked.6minds.site/Student/AttendanceStudentDB/get_attendance_student.php?student_id=${studentId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Attendance data:', data);
        
        if (data.success) {
          setAttendanceData(data.attendance_summary);
        } else {
          console.error('Failed to fetch attendance:', data.message);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchAttendanceData();
  }, [studentId]);

  // Fetch activities data when subject changes
  useEffect(() => {
    const fetchActivitiesData = async () => {
      if (!selectedSubject || !studentId) {
        console.log('Skipping activities fetch - no subject or student ID');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        console.log('Fetching activities for subject:', selectedSubject, 'student:', studentId);
        const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_activities_student.php?student_id=${studentId}&subject_code=${selectedSubject}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Activities data:', data);
        
        if (data.success) {
          const organizedData = {
            quizzes: [],
            assignments: [],
            activities: [],
            projects: []
          };

          data.activities.forEach(activity => {
            let formattedDeadline = 'No deadline';
            if (activity.deadline) {
              const deadlineDate = new Date(activity.deadline);
              if (!isNaN(deadlineDate.getTime())) {
                formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
              }
            }

            const activityItem = {
              id: activity.id,
              task: `${activity.activity_type} ${activity.task_number}`,
              title: activity.title,
              submitted: activity.submitted ? 1 : 0,
              missing: activity.submitted ? 0 : 1,
              deadline: formattedDeadline,
              total: 1
            };

            switch (activity.activity_type.toLowerCase()) {
              case 'quiz':
                organizedData.quizzes.push(activityItem);
                break;
              case 'assignment':
                organizedData.assignments.push(activityItem);
                break;
              case 'activity':
                organizedData.activities.push(activityItem);
                break;
              case 'project':
                organizedData.projects.push(activityItem);
                break;
              case 'laboratory':
                organizedData.activities.push(activityItem);
                break;
              default:
                organizedData.activities.push(activityItem);
            }
          });

          setActivitiesData(organizedData);
        } else {
          setActivitiesData({
            quizzes: [],
            assignments: [],
            activities: [],
            projects: []
          });
        }
      } catch (error) {
        console.error('Error fetching activities data:', error);
        setActivitiesData({
          quizzes: [],
          assignments: [],
          activities: [],
          projects: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivitiesData();
  }, [selectedSubject, studentId]);

  const displayedList = selectedFilter === 'Assignment'
    ? activitiesData.assignments || []
    : selectedFilter === 'Activities'
    ? activitiesData.activities || []
    : selectedFilter === 'Projects'
    ? activitiesData.projects || []
    : activitiesData.quizzes || [];

  const displayedLabel = selectedFilter === '' ? 'Quizzes' : selectedFilter;

  const getCurrentSubjectName = () => {
    const subject = subjects.find(sub => sub.subject_code === selectedSubject);
    if (subject) {
      return `${subject.subject || 'Unknown Subject'} (${subject.section})`;
    }
    return 'Select Subject';
  };

  const handleSubjectSelect = (subjectCode) => {
    setSelectedSubject(subjectCode);
    setOpenSubject(false);
    console.log('Subject changed to:', subjectCode);
  };

  // Show loading if no student ID yet
  if (!studentId) {
    return (
      <div>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Loading..." />
          <div className="p-8 text-center">
            <p className="text-[#465746]">Loading student data...</p>
          </div>
        </div>
      </div>
    );
  }

  const { overallWarning, subjectWarnings } = calculateAttendanceWarnings;

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Student" />

        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img 
                src={Analytics} 
                alt="Analytics" 
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3" 
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Analytics
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
              <div className="text-sm sm:text-base lg:text-lg text-[#465746]">
                <span>My Performance</span>
              </div>
              <div className="flex items-center text-sm sm:text-base lg:text-lg text-[#465746] self-end sm:self-auto">
                <span>2nd Semester 2024 - 2025</span>
                <img src={ArrowDown} alt="ArrowDown" className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-4 sm:mb-5" />

          {/* Overall Attendance Warning Banner */}
          {overallWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 sm:mb-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Attendance Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      You have attendance warnings in some subjects. Students with 3 accumulated absences will be dropped from the course. 
                      3 late arrivals are equivalent to one absent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter and Search Section */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 justify-between items-stretch lg:items-center mb-4 sm:mb-5">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
              <div className="relative w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
                <button
                  onClick={() => { setOpenSubject(!openSubject); setOpenSection(false); }}
                  className="flex w-full items-center justify-between font-bold px-3 py-2 sm:py-2.5 bg-[#fff] rounded-md cursor-pointer shadow-md text-sm sm:text-base text-[#465746]">
                  <span>{getCurrentSubjectName()}</span>
                  <img 
                    src={ArrowDown} 
                    alt="ArrowDown" 
                    className="h-4 w-4 sm:h-5 sm:w-5 ml-2" 
                  />
                </button>
                {openSubject && subjects.length > 0 && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-full shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto">
                    {subjects.map((subject) => (
                      <button 
                        key={subject.subject_code}
                        className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-sm sm:text-base text-[#465746]"
                        onClick={() => handleSubjectSelect(subject.subject_code)}
                      >
                        {subject.subject || 'Unknown Subject'} ({subject.section})
                      </button>
                    ))}
                  </div>
                )}
                {openSubject && subjects.length === 0 && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-full shadow-lg border border-gray-200 z-10">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No subjects found
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative w-full lg:w-64 xl:w-80">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none bg-white text-xs sm:text-sm text-[#465746]"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <img src={Search} alt="Search" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </button>
            </div>
          </div>

          {/* ActivityOverview component */}
          <ActivityOverviewStudent
            quizzesList={activitiesData.quizzes}
            assignmentsList={activitiesData.assignments}
            activitiesList={activitiesData.activities}
            projectsList={activitiesData.projects}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />

          {/* ACTIVITY LIST */}
          <div className="bg-[#fff] p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mt-4 sm:mt-5 text-[#465746]">
            <p className="font-bold mb-3 sm:mb-4 text-base sm:text-lg lg:text-xl">
              {displayedLabel} - {getCurrentSubjectName()}
            </p>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-[#465746]">Loading activities...</p>
              </div>
            ) : displayedList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#465746]">No {displayedLabel.toLowerCase()} found for {getCurrentSubjectName()}.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="min-w-full border-collapse text-xs sm:text-sm lg:text-base">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-2 sm:p-3 font-bold">Task</th>
                        <th className="text-left p-2 sm:p-3 font-bold">Title</th>
                        <th className="text-left p-2 sm:p-3 font-bold text-[#00A15D]">Submitted</th>
                        <th className="text-left p-2 sm:p-3 font-bold text-[#FF6666]">Missing</th>
                        <th className="text-left p-2 sm:p-3 font-bold">Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedList.map(item => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-2 sm:p-3 whitespace-nowrap">{item.task}</td>
                          <td className="p-2 sm:p-3">{item.title}</td>
                          <td className="p-2 sm:p-3 text-[#00A15D]">
                            {item.submitted ? (
                              <img src={Check} alt="Submitted" className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td className="p-2 sm:p-3 text-[#FF6666]">
                            {item.missing ? "Missing" : ""}
                          </td>
                          <td className="p-2 sm:p-3 whitespace-nowrap">{item.deadline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Student Attendance Tracking */}
          <div className="bg-[#fff] rounded-lg sm:rounded-xl shadow-md mt-4 sm:mt-5 p-4 sm:p-5 text-[#465746]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-base sm:text-lg lg:text-xl font-bold">
                Attendance:
              </p>
              {overallWarning && (
                <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Attendance Warnings
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm lg:text-base mb-3 sm:mb-4">
              Note: Students with 
              <span className='text-[#FF6666] font-bold'> 3 accumulated absences </span>
              will be dropped from the course. 
              <span className='text-[#767EE0] font-bold'> 3 late arrivals </span>
              are equivalent to one absent.
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />
            {attendanceData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#465746]">No attendance data available.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="min-w-full border-collapse text-xs sm:text-sm lg:text-base">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold">Subject</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#00A15D]">Present</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#767EE0]">Late</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#FF6666]">Absent</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold whitespace-nowrap">Effective Absences</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold whitespace-nowrap">Total Classes</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectWarnings.map((subject) => (
                        <tr key={subject.subject_code} className={`border-b ${subject.isAtRisk ? 'bg-red-50' : subject.hasWarning ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="font-medium">{subject.subject_name} ({subject.section})</span>
                              {subject.warningMessage && (
                                <div className={`text-xs sm:text-sm ${subject.isAtRisk ? 'text-red-600' : 'text-yellow-600'}`}>
                                  <span className='font-bold'>⚠️ {subject.isAtRisk ? 'CRITICAL' : 'Warning'}:</span>
                                  <span> {subject.warningMessage.split(':')[1]}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#00A15D] font-medium">{subject.present}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#767EE0] font-medium">{subject.late}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FF6666] font-medium">{subject.absent}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold">
                            <span className={subject.totalEffectiveAbsences >= 3 ? 'text-red-600' : subject.totalEffectiveAbsences >= 2 ? 'text-yellow-600' : 'text-gray-600'}>
                              {subject.totalEffectiveAbsences}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              ({subject.absent} + {subject.equivalentAbsences})
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{subject.total_classes}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <Link to={`/AttendanceHistoryStudent?subject_code=${subject.subject_code}&student_id=${studentId}`}>
                              <img src={Details} alt="Details" className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:opacity-70" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}