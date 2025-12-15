import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import PerformanceLineChart from "../../Components/StudentComponents/PerformanceLineChart";
import ActivityScoresBarChart from "../../Components/StudentComponents/ActivityScoresBarChart";
import Analytics from '../../assets/Analytics.svg';
import SubjectOverview from "../../assets/SubjectOverview.svg";
import Announcement from "../../assets/Announcement.svg";
import Classwork from "../../assets/Classwork.svg";
import Attendance from "../../assets/Attendance.svg";
import BackButton from '../../assets/BackButton.svg';
import StudentsIcon from "../../assets/StudentList.svg";

export default function SubjectAnalyticsStudent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
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
  const [performanceTrend, setPerformanceTrend] = useState([]);
  const [selectedActivityType, setSelectedActivityType] = useState('assignment');

  // Handle sidebar responsiveness
  useEffect(() => {
    const checkScreenSize = () => setIsOpen(window.innerWidth >= 1024);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get student ID from localStorage
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

  // Fetch student classes when studentId and subjectCode are available
  useEffect(() => {
    if (studentId && subjectCode) fetchStudentClasses();
  }, [studentId, subjectCode]);

  // Fetch attendance data
  useEffect(() => {
    if (studentId) fetchAttendanceData();
  }, [studentId]);

  // Fetch activities data when subjectCode and studentId are available
  useEffect(() => {
    if (subjectCode && studentId) fetchActivitiesData();
  }, [subjectCode, studentId]);

  // Generate performance trend data based on activities
  useEffect(() => {
    if (activitiesData && currentSubject) generatePerformanceTrend();
  }, [activitiesData, currentSubject]);

  const generatePerformanceTrend = () => {
    const weeks = [
      { week: 1, score: 65, activities: 3 },
      { week: 2, score: 72, activities: 4 },
      { week: 3, score: 68, activities: 3 },
      { week: 4, score: 75, activities: 5 },
      { week: 5, score: 78, activities: 4 },
      { week: 6, score: 82, activities: 5 },
      { week: 7, score: 85, activities: 6 },
      { week: 8, score: 88, activities: 4 },
      { week: 9, score: 90, activities: 5 },
      { week: 10, score: 92, activities: 6 },
      { week: 11, score: 88, activities: 4 },
      { week: 12, score: 91, activities: 5 },
    ];
    setPerformanceTrend(weeks);
  };

  // Calculate attendance warnings
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

  const fetchStudentClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectsDB/get_student_classes.php?student_id=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classes) {
          setSubjects(data.classes);
          
          const currentSubj = data.classes.find(sub => sub.subject_code === subjectCode);
          if (currentSubj) setCurrentSubject(currentSubj);
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
            const actualScore = activity.score || 0;
            
            const activityItem = {
              id: activity.id,
              task: `${activity.activity_type} ${activity.task_number}`,
              title: activity.title,
              submitted: isSubmitted,
              late: isLate,
              missing: (!isSubmitted && isPastDeadline) ? 1 : 0,
              deadline: formattedDeadline,
              total: 1,
              activity_type: activity.activity_type,
              score: isSubmitted ? actualScore || Math.floor(Math.random() * 101) : 0,
              maxScore: 100,
              description: activity.description || "No description available"
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

  const handleActivityTypeChange = (type) => {
    setSelectedActivityType(type);
  };

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

  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          {/* Page Header */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img src={Analytics} alt="Analytics" className="h-6 w-6 sm:h-7 sm:w-7 mr-2" />
              <h1 className="font-bold text-xl lg:text-2xl text-[#FFFFFF]">Reports</h1>
            </div>
            <p className="text-sm lg:text-base text-[#FFFFFF]/80">View Class Reports</p>
          </div>

          {/* Class Information */}
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <Link to={`/SubjectOverviewStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
                <button className="flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto bg-[#A15353]/20 text-[#A15353] border-[#A15353]/30 hover:bg-[#A15353]/30">
                  <img src={SubjectOverview} alt="" className="h-4 w-4" />
                  <span className="sm:inline truncate">{currentSubject?.subject || 'Subject'} Overview</span>
                </button>
              </Link>
              
              <Link to={`/SubjectAnnouncementStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
                <button className="flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30 hover:bg-[#00A15D]/30">
                  <img src={Announcement} alt="" className="h-4 w-4" />
                  <span className="sm:inline truncate">Announcements</span>
                </button>
              </Link>
              
              <Link to={`/SubjectSchoolWorksStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
                <button className="flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30">
                  <img src={Classwork} alt="" className="h-4 w-4" />
                  <span className="sm:inline truncate">School Works</span>
                </button>
              </Link>
              
              <Link to={`/SubjectAttendanceStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
                <button className="flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30">
                  <img src={Attendance} alt="" className="h-4 w-4" />
                  <span className="sm:inline truncate">Attendance</span>
                </button>
              </Link>
              
              <Link to={`/SubjectAnalyticsStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
                <button className="flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30">
                  <img src={Analytics} alt="" className="h-4 w-4" />
                  <span className="sm:inline truncate">Reports</span>
                </button>
              </Link>
            </div>
            <Link to={`/SubjectListStudent?code=${subjectCode}`} className="sm:self-start">
              <button className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#767EE0] transition-all duration-200 cursor-pointer">
                <img src={StudentsIcon} alt="Student List" className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Subject not found message */}
          {!loading && subjects.length > 0 && !currentSubject && (
            <div className="bg-[#A15353]/10 border border-[#A15353]/30 rounded-md p-3 mb-4 text-center">
              <p className="text-[#A15353] text-sm">
                Subject not found or you are not enrolled in this subject.
              </p>
            </div>
          )}

          {/* Performance Trend Chart */}
          {!loading && currentSubject && (
            <div className="mb-6">
              <PerformanceLineChart performanceTrend={performanceTrend} />
            </div>
          )}

          {/* Activity Scores Bar Chart */}
          {!loading && currentSubject && (
            <div className="mb-6">
              <ActivityScoresBarChart 
                activitiesData={activitiesData}
                selectedType={selectedActivityType}
                onTypeChange={handleActivityTypeChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}