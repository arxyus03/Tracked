import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import PerformanceAnalyticsStudent from "../../Components/PerformanceAnalyticsStudent";

// Import the two components for side-by-side layout
import StudentActivityOverview from "../../Components/StudentActivityOverview";
import StudentActivityList from "../../Components/StudentActivityList";

// ========== IMPORT ASSETS ==========
import Analytics from '../../assets/Analytics.svg';
import StudentsIcon from "../../assets/StudentList.svg";
import Announcement from "../../assets/Announcement.svg";
import Classwork from "../../assets/Classwork.svg";
import Attendance from "../../assets/Attendance.svg";
import BackButton from '../../assets/BackButton.svg';

// ========== MAIN COMPONENT ==========
export default function SubjectAnalyticsStudent() {
  // ========== STATE VARIABLES ==========
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
    projects: [],
    laboratories: []
  });
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState("");

  // States for side-by-side components
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  const [activityCurrentPage, setActivityCurrentPage] = useState(1);
  const [animationProgress, setAnimationProgress] = useState(0);

  // ========== USE EFFECTS ==========
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setStudentId(userData.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (studentId && subjectCode) fetchStudentClasses();
  }, [studentId, subjectCode]);

  useEffect(() => {
    if (studentId) fetchAttendanceData();
  }, [studentId]);

  useEffect(() => {
    if (subjectCode && studentId) fetchActivitiesData();
  }, [subjectCode, studentId]);

  // Animate pie chart on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(1);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // ========== CALCULATIONS ==========
  const calculateAttendanceWarnings = useMemo(() => {
    if (!attendanceData.length) return { overallWarning: false, subjectWarnings: [] };

    let hasOverallWarning = false;
    const subjectWarnings = attendanceData.map(subject => {
      const equivalentAbsences = Math.floor(subject.late / 3);
      const totalEffectiveAbsences = subject.absent + equivalentAbsences;
      
      const hasWarning = totalEffectiveAbsences >= 2;
      const isAtRisk = totalEffectiveAbsences >= 3;
      
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

  // Calculate segments for pie chart
  const { segments, statusTotal } = useMemo(() => {
    // Combine all activities
    const allActivities = [
      ...activitiesData.quizzes,
      ...activitiesData.assignments,
      ...activitiesData.activities,
      ...activitiesData.projects,
      ...activitiesData.laboratories
    ];

    // Calculate status counts
    const submittedCount = allActivities.filter(item => item.submitted === 1 || item.submitted === true).length;
    const missedCount = allActivities.filter(item => item.missing === 1 || item.missing === true).length;
    const pendingCount = allActivities.filter(item => 
      !(item.submitted === 1 || item.submitted === true) && 
      !(item.missing === 1 || item.missing === true)
    ).length;

    const total = submittedCount + missedCount + pendingCount;

    return {
      segments: [
        { label: "Submitted", value: submittedCount, color: "#00A15D" },
        { label: "Pending", value: pendingCount, color: "#767EE0" },
        { label: "Missed", value: missedCount, color: "#A15353" }
      ],
      statusTotal: total
    };
  }, [activitiesData]);

  // Get displayed list based on selected filter
  const displayedList = useMemo(() => {
    if (selectedFilter === '') {
      // Return all activities combined
      return [
        ...activitiesData.quizzes,
        ...activitiesData.assignments,
        ...activitiesData.activities,
        ...activitiesData.projects,
        ...activitiesData.laboratories
      ];
    } else if (selectedFilter === 'Quizzes') {
      return activitiesData.quizzes;
    } else if (selectedFilter === 'Assignment') {
      return activitiesData.assignments;
    } else if (selectedFilter === 'Activities') {
      return activitiesData.activities;
    } else if (selectedFilter === 'Projects') {
      return activitiesData.projects;
    } else if (selectedFilter === 'Laboratory') {
      return activitiesData.laboratories;
    }
    return [];
  }, [selectedFilter, activitiesData]);

  // ========== API CALL FUNCTIONS ==========
  const fetchStudentClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectsDB/get_student_classes.php?student_id=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classes) {
          setSubjects(data.classes);
          
          const currentSubj = data.classes.find(sub => sub.subject_code === subjectCode);
          if (currentSubj) {
            setCurrentSubject(currentSubj);
          }
        } else {
          setSubjects([]);
        }
      }
    } catch (error) {
      console.error('Error fetching student classes:', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    if (!studentId) return;

    try {
      const response = await fetch(`https://tracked.6minds.site/Student/AttendanceStudentDB/get_attendance_student.php?student_id=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAttendanceData(data.attendance_summary);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const fetchActivitiesData = async () => {
    if (!subjectCode || !studentId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_activities_student.php?student_id=${studentId}&subject_code=${subjectCode}`);
      
      if (response.ok) {
        const data = await response.json();
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
            projects: [],
            laboratories: []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching activities data:', error);
      setActivitiesData({
        quizzes: [],
        assignments: [],
        activities: [],
        projects: [],
        laboratories: []
      });
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER HELPERS ==========
  const renderActionButton = (to, icon, label, active = false, colorClass = "") => (
    <Link to={`${to}?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
      <button className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto ${
        active 
          ? 'bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30' 
          : colorClass
      }`}>
        <img src={icon} alt="" className="h-4 w-4" />
        <span className="sm:inline truncate">{label}</span>
      </button>
    </Link>
  );

  // ========== LOADING STATE ==========
  if (!studentId || loading) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 text-center text-[#FFFFFF]">
            <p>Loading student data...</p>
          </div>
        </div>
      </div>
    );
  }

  const { overallWarning } = calculateAttendanceWarnings;

  // ========== MAIN RENDER ==========
  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* ========== MAIN CONTENT ========== */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          
          {/* ========== PAGE HEADER ========== */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img src={Analytics} alt="Analytics" className="h-6 w-6 sm:h-7 sm:w-7 mr-2" />
              <h1 className="font-bold text-xl lg:text-2xl text-[#FFFFFF]">Reports</h1>
            </div>
            <p className="text-sm lg:text-base text-[#FFFFFF]/80">View Class Reports</p>
          </div>

          {/* ========== CLASS INFORMATION ========== */}
          <div className="flex flex-col gap-1 text-sm text-[#FFFFFF]/80 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span>{currentSubject?.subject || 'Loading...'}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{currentSubject?.section || 'Loading...'}</span>
              </div>
              <Link to="/Subjects">
                <img 
                  src={BackButton} 
                  alt="Back" 
                  className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" 
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#FFFFFF]/30 mb-4" />

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {renderActionButton("/SubjectAnnouncementStudent", Announcement, "Announcements", false, "bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30 hover:bg-[#00A15D]/30")}
              {renderActionButton("/SubjectSchoolWorksStudent", Classwork, "School Works", false, "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30")}
              {renderActionButton("/SubjectAttendanceStudent", Attendance, "Attendance", false, "bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30")}
              {renderActionButton("/SubjectAnalyticsStudent", Analytics, "Reports", true)}
            </div>
            <Link to={`/SubjectListStudent?code=${subjectCode}`} className="sm:self-start">
              <button className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 cursor-pointer">
                <img src={StudentsIcon} alt="Student List" className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* ========== ATTENDANCE WARNING BANNER - Smaller ========== */}
          {overallWarning && (
            <div className="bg-[#FFA600]/10 border border-[#FFA600]/30 rounded-md p-3 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-[#FFA600]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-medium text-[#FFA600]">
                    Attendance Warning
                  </h3>
                  <div className="mt-1 text-xs text-[#FFA600]/90">
                    <p>
                      You have attendance warnings in some subjects. Students with 3 accumulated absences will be dropped from the course. 
                      3 late arrivals are equivalent to one absent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== SUBJECT NOT FOUND MESSAGE - Smaller ========== */}
          {!loading && subjects.length > 0 && !currentSubject && (
            <div className="bg-[#A15353]/10 border border-[#A15353]/30 rounded-md p-3 mb-4 text-center">
              <p className="text-[#A15353] text-sm">
                Subject not found or you are not enrolled in this subject.
              </p>
            </div>
          )}

          {/* ========== SIDE-BY-SIDE LAYOUT (Activity Overview + Activity List) ========== */}
          {!loading && currentSubject && (
            <div className="space-y-4">
              {/* Side-by-side components at the top */}
              <div className="flex flex-col lg:flex-row gap-3">
                {/* Left Side - Activity Overview (40%) */}
                <div className="lg:w-2/5">
                  <StudentActivityOverview
                    quizzesCount={activitiesData.quizzes.length}
                    assignmentsCount={activitiesData.assignments.length}
                    activitiesCount={activitiesData.activities.length}
                    projectsCount={activitiesData.projects.length}
                    laboratoriesCount={activitiesData.laboratories.length}
                    totalTasksCount={displayedList.length}
                    selectedFilter={selectedFilter}
                    setSelectedFilter={setSelectedFilter}
                    animationProgress={animationProgress}
                    segments={segments}
                    statusTotal={statusTotal}
                  />
                </div>
                
                {/* Right Side - Activity List (60%) */}
                <div className="lg:w-3/5">
                  <StudentActivityList
                    displayedList={displayedList}
                    selectedFilter={selectedFilter}
                    currentSubject={currentSubject}
                    subjectCode={subjectCode}
                    activitySearchTerm={activitySearchTerm}
                    setActivitySearchTerm={setActivitySearchTerm}
                    activityCurrentPage={activityCurrentPage}
                    setActivityCurrentPage={setActivityCurrentPage}
                    itemsPerPage={8}
                  />
                </div>
              </div>

              {/* Advanced Performance Analytics below - Smaller */}
              <div className="mt-4">
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}