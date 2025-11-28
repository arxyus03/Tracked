import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import PerformanceAnalyticsStudent from "../../Components/PerformanceAnalyticsStudent";

import Analytics from '../../assets/Analytics(Light).svg';
import StudentsIcon from "../../assets/ClassManagement(Light).svg";
import Announcement from "../../assets/Announcement(Light).svg";
import Classwork from "../../assets/Classwork(Light).svg";
import Attendance from "../../assets/Attendance(Light).svg";
import BackButton from '../../assets/BackButton(Light).svg';

export default function SubjectAnalyticsStudent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(null);
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
      try {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setStudentId(userData.id);
          return userData.id;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
      return null;
    };

    getStudentId();
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
    if (!studentId || !subjectCode) return;

    const fetchStudentClasses = async () => {
      try {
        setLoading(true);
        console.log('Fetching classes for student:', studentId);
        const response = await fetch(`https://tracked.6minds.site/Student/SubjectsDB/get_student_classes.php?student_id=${studentId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Full API response:', data);
        
        if (data.success && data.classes) {
          console.log('Classes found:', data.classes);
          setSubjects(data.classes);
          
          // Find and set the current subject based on subjectCode from URL
          const currentSubj = data.classes.find(sub => sub.subject_code === subjectCode);
          if (currentSubj) {
            setCurrentSubject(currentSubj);
            console.log('Current subject set:', currentSubj);
          } else {
            console.error('Current subject not found in enrolled classes');
          }
        } else {
          console.error('Failed to fetch classes:', data.message);
          setSubjects([]);
        }
      } catch (error) {
        console.error('Error fetching student classes:', error);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentClasses();
  }, [studentId, subjectCode]);

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

  // Fetch activities data when subject is available
  useEffect(() => {
    const fetchActivitiesData = async () => {
      if (!subjectCode || !studentId) {
        console.log('Skipping activities fetch - no subject or student ID');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        console.log('Fetching activities for subject:', subjectCode, 'student:', studentId);
        const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_activities_student.php?student_id=${studentId}&subject_code=${subjectCode}`);
        
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
            projects: [],
            laboratories: []
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

            const isPastDeadline = activity.deadline && new Date(activity.deadline) < new Date();
            const isSubmitted = activity.submitted ? 1 : 0;
            const isLate = activity.late ? 1 : 0;
            
            const activityItem = {
              id: activity.id,
              task: `${activity.activity_type} ${activity.task_number}`,
              title: activity.title,
              submitted: isSubmitted,
              late: isLate,
              missing: (!isSubmitted && isPastDeadline) ? 1 : 0,
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
                organizedData.laboratories.push(activityItem);
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
  }, [subjectCode, studentId]);

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

  const { overallWarning } = calculateAttendanceWarnings;

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Student" />

        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header Section - Updated for Analytics */}
          <div className="mb-4 sm:mb-4">
            <div className="flex items-center mb-2">
              <img 
                src={Analytics} 
                alt="Analytics" 
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3" 
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Reports
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              View Class Reports
            </p>
          </div>

          {/* Subject Information - Updated with Back Button */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{currentSubject?.subject_code || subjectCode || 'Loading...'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span>{currentSubject?.subject || 'Loading...'}</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{currentSubject?.section || 'Loading...'}</span>
              </div>
              <Link to={"/Subjects"}>
                <img 
                  src={BackButton} 
                  alt="Back" 
                  className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Action Buttons - Copied from Announcements Page */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full mt-4 sm:mt-5 gap-3">
            {/* Navigation buttons - Stack on mobile, row on tablet/desktop */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Class Announcements Button - Active state with different background */}
              <Link to={`/SubjectAnnouncementStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#e6f4ea] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4edd8] transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={Announcement} 
                    alt="" 
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span className="sm:inline">Announcements</span>
                </button>
              </Link>

              {/* School Works and Attendance - Side by side on all screens */}
              <div className="flex gap-3 w-full sm:w-auto">
                <Link to={`/SubjectSchoolWorksStudent?code=${subjectCode}`} className="flex-1 min-w-0">
                  <button className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 bg-[#e6f0ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4e3ff] transition-all duration-300 cursor-pointer w-full">
                    <img 
                      src={Classwork} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                    />
                    <span className="whitespace-nowrap truncate">School Works</span>
                  </button>
                </Link>

                <Link to={`/SubjectAttendanceStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#fff4e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#ffebd4] transition-all duration-300 cursor-pointer w-full sm:w-auto">
                    <img 
                      src={Attendance} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Attendance</span>
                  </button>
                </Link>

                <Link to={`/SubjectAnalyticsStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#f0e6ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#e6d4ff] transition-all duration-300 cursor-pointer w-full sm:w-auto">
                    <img 
                      src={Analytics} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Reports</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Action buttons - Icons only on mobile/tablet, unchanged on desktop */}
            <div className="flex items-center gap-2 justify-end sm:justify-start mt-3 sm:mt-0 w-full sm:w-auto">
              <Link to={`/SubjectListStudent?code=${subjectCode}`}>
                <button className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer w-10 h-10 sm:w-auto sm:h-auto">
                  <img 
                    src={StudentsIcon} 
                    alt="Student List" 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                  />
                </button>
              </Link>
            </div>
          </div>

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

          {/* Show message when subject is not found */}
          {!loading && subjects.length > 0 && !currentSubject && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-red-800">
                Subject not found or you are not enrolled in this subject.
              </p>
            </div>
          )}

          {/* ActivityOverview component - Only show if subject is available */}
          {!loading && currentSubject && (
            <PerformanceAnalyticsStudent
              quizzesList={activitiesData.quizzes}
              assignmentsList={activitiesData.assignments}
              activitiesList={activitiesData.activities}
              projectsList={activitiesData.projects}
              laboratoriesList={activitiesData.laboratories}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              currentSubject={currentSubject}
              subjectCode={subjectCode}
            />
          )}
        </div>
      </div>
    </div>
  );
}