import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import StudentPerformanceSummary from "../../Components/StudentComponents/StudentPerformanceSummary";

// Import assets
import Announcement from "../../assets/Announcement.svg";
import BackButton from '../../assets/BackButton.svg';
import StudentsIcon from "../../assets/StudentList.svg";
import Classwork from "../../assets/Classwork.svg";
import Attendance from "../../assets/Attendance.svg";
import Analytics from "../../assets/Analytics.svg";
import SubjectOverview from "../../assets/SubjectOverview.svg";
import EmailIcon from "../../assets/Email.svg";
import DetailsIcon from "../../assets/Details.svg";

// SVG Icons
const PassedIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const LowGradeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const MissedIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const PendingIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const AllActivitiesIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

export default function SubjectOverviewStudent() {
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
  const [allActivitiesFlat, setAllActivitiesFlat] = useState([]);

  const [performanceData, setPerformanceData] = useState({
    percentage: 0,
    activitiesNeeded: [],
    lowGradeActivities: [],
    missedActivities: [],
    absences: 0,
    teacherEmail: "",
    teacherName: ""
  });

  const [expandedSections, setExpandedSections] = useState({
    passed: false,
    lowGrade: false,
    missed: false,
    pending: false,
    allActivities: false
  });

  const [currentPage, setCurrentPage] = useState({
    passed: 1,
    lowGrade: 1,
    missed: 1,
    pending: 1,
    allActivities: 1
  });

  const itemsPerPage = 10;

  // Handle screen size responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      setIsOpen(window.innerWidth >= 1024);
    };

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

  // Fetch initial data
  useEffect(() => {
    if (studentId && subjectCode) fetchStudentClasses();
  }, [studentId, subjectCode]);

  useEffect(() => {
    if (studentId) fetchAttendanceData();
  }, [studentId]);

  useEffect(() => {
    if (subjectCode && studentId) {
      fetchActivitiesData();
      fetchPerformanceData();
      fetchTeacherInfo();
    }
  }, [subjectCode, studentId]);

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
        isAtRisk
      };
    });

    return { overallWarning: hasOverallWarning, subjectWarnings };
  }, [attendanceData]);

  // Get subject-specific attendance
  const subjectAttendance = useMemo(() => {
    if (!currentSubject || !attendanceData.length) return { absent: 0, late: 0 };
    
    return attendanceData.find(sub => 
      sub.subject_name?.includes(currentSubject.subject) || 
      sub.subject_code === subjectCode
    ) || { absent: 0, late: 0 };
  }, [currentSubject, attendanceData, subjectCode]);

  // Categorize activities
  const categorizedActivities = useMemo(() => {
    if (!allActivitiesFlat.length) {
      return {
        passed: [],
        lowGrade: [],
        missed: [],
        pending: []
      };
    }

    const passed = [];
    const lowGrade = [];
    const missed = [];
    const pending = [];

    allActivitiesFlat.forEach(activity => {
      const isSubmitted = activity.submitted === 1 || activity.submitted === true;
      const isMissing = activity.missing === 1 || activity.missing === true;
      const hasGrade = activity.grade !== null && activity.grade !== undefined;
      const grade = hasGrade ? parseInt(activity.grade) : null;

      if (isMissing || (hasGrade && grade === 0)) {
        missed.push(activity);
      } else if (hasGrade && grade < 75 && grade > 0) {
        lowGrade.push(activity);
      } else if (hasGrade && grade >= 75) {
        passed.push(activity);
      } else if (isSubmitted && !hasGrade) {
        pending.push(activity);
      } else if (!isSubmitted && !isMissing) {
        pending.push(activity);
      }
    });

    return { passed, lowGrade, missed, pending };
  }, [allActivitiesFlat]);

  // Get activity status
  const getActivityStatus = (activity) => {
    const isSubmitted = activity.submitted === 1 || activity.submitted === true;
    const isMissing = activity.missing === 1 || activity.missing === true;
    const hasGrade = activity.grade !== null && activity.grade !== undefined;
    const grade = hasGrade ? parseInt(activity.grade) : null;

    if (isMissing || (hasGrade && grade === 0)) {
      return 'Missed';
    } else if (hasGrade && grade < 75 && grade > 0) {
      return 'Low Grade';
    } else if (hasGrade && grade >= 75) {
      return 'Passed';
    } else if (isSubmitted && !hasGrade) {
      return 'Pending (Submitted)';
    } else if (!isSubmitted && !isMissing) {
      return 'Pending (Not Submitted)';
    }
    return 'Unknown';
  };

  // Calculate performance summary
  const performanceSummary = useMemo(() => {
    if (!currentSubject || !activitiesData || !attendanceData.length) {
      return {
        percentage: 0,
        message: "Calculating your performance...",
        status: "loading",
        needsImprovement: false,
        critical: false,
        suggestions: [],
        ungradedActivities: [],
        missedOrZeroGradeActivities: [],
        lowGradeActivities: [],
        totalEffectiveAbsences: 0,
        passedActivities: []
      };
    }

    const allActivities = [
      ...activitiesData.quizzes,
      ...activitiesData.assignments,
      ...activitiesData.activities,
      ...activitiesData.projects,
      ...activitiesData.laboratories
    ];

    const gradedActivities = allActivities.filter(item => 
      item.score !== undefined && item.score !== null
    );
    
    let totalGradePercentage = 0;
    
    if (gradedActivities.length > 0) {
      const sumGrades = gradedActivities.reduce((sum, item) => sum + item.score, 0);
      totalGradePercentage = Math.round(sumGrades / gradedActivities.length);
    }

    const percentage = performanceData.percentage > 0 ? performanceData.percentage : totalGradePercentage;
    const equivalentAbsences = Math.floor(subjectAttendance.late / 3);
    const totalEffectiveAbsences = subjectAttendance.absent + equivalentAbsences;

    const ungradedActivities = allActivities.filter(item => 
      (item.score === undefined || item.score === null) && 
      !(item.missing === 1 || item.missing === true)
    );

    const missedOrZeroGradeActivities = allActivities.filter(item => 
      (item.missing === 1 || item.missing === true) || 
      (item.score !== undefined && item.score === 0)
    );

    const lowGradeActivities = allActivities.filter(item => 
      item.score !== undefined && 
      item.score !== null && 
      item.score > 0 && 
      item.score < 75
    );

    const passedActivities = allActivities.filter(item => 
      item.score !== undefined && 
      item.score !== null && 
      item.score >= 75
    );

    let message = "";
    let status = "";
    let needsImprovement = false;
    let critical = false;
    const suggestions = [];

    if (percentage >= 75) {
      message = "You're above the minimum passing grade! Keep up the good work! 🎉";
      status = "excellent";
    } else if (percentage >= 65) {
      message = "You're close to the minimum passing grade. Focus on improving low-grade activities!";
      status = "warning";
      needsImprovement = true;
      
      if (lowGradeActivities.length > 0) {
        suggestions.push({
          text: `Improve ${lowGradeActivities.length} activity with grade below 75%`,
          type: 'low-grades',
          count: lowGradeActivities.length
        });
      }
    } else {
      message = "You need to improve your performance. Consider the following actions:";
      status = "critical";
      needsImprovement = true;
      critical = percentage < 50;

      if (missedOrZeroGradeActivities.length > 0) {
        suggestions.push({
          text: `Review ${missedOrZeroGradeActivities.length} missed or zero-grade activity`,
          type: 'missed',
          count: missedOrZeroGradeActivities.length
        });
      }

      if (ungradedActivities.length > 0) {
        suggestions.push({
          text: `You have ${ungradedActivities.length} activity waiting for grading`,
          type: 'pending',
          count: ungradedActivities.length
        });
      }

      if (lowGradeActivities.length > 0) {
        suggestions.push({
          text: `Improve ${lowGradeActivities.length} activity with grade below 75%`,
          type: 'low-grades',
          count: lowGradeActivities.length
        });
      }

      if (totalEffectiveAbsences > 0) {
        suggestions.push({
          text: `Reduce absences (${subjectAttendance.absent} absents, ${subjectAttendance.late} lates)`,
          type: 'absences',
          count: totalEffectiveAbsences
        });
      }
    }

    if (percentage < 50) {
      message = "Passing the semester is challenging. Contact your teacher immediately for guidance!";
      status = "urgent";
      critical = true;
    }

    return {
      percentage,
      message,
      status,
      needsImprovement,
      critical,
      suggestions,
      totalEffectiveAbsences,
      ungradedCount: ungradedActivities.length,
      missedOrZeroCount: missedOrZeroGradeActivities.length,
      lowGradeCount: lowGradeActivities.length,
      passedCount: passedActivities.length,
      ungradedActivities,
      missedOrZeroGradeActivities,
      lowGradeActivities,
      passedActivities,
      allActivities
    };
  }, [currentSubject, activitiesData, attendanceData, subjectCode, subjectAttendance, performanceData.percentage]);

  // Helper functions
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    if (!expandedSections[section]) {
      setCurrentPage(prev => ({
        ...prev,
        [section]: 1
      }));
    }
  };

  const handlePageChange = (section, direction) => {
    setCurrentPage(prev => {
      const current = prev[section];
      const totalItems = section === 'allActivities' 
        ? allActivitiesFlat.length 
        : categorizedActivities[section].length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      
      if (direction === 'next' && current < totalPages) {
        return { ...prev, [section]: current + 1 };
      } else if (direction === 'prev' && current > 1) {
        return { ...prev, [section]: current - 1 };
      }
      return prev;
    });
  };

  // API functions
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

          const flatActivities = [];

          data.activities.forEach(activity => {
            let formattedDeadline = 'No deadline';
            if (activity.deadline) {
              const deadlineDate = new Date(activity.deadline);
              if (!isNaN(deadlineDate.getTime())) {
                formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
            }

            const isPastDeadline = activity.deadline && new Date(activity.deadline) < new Date();
            const isSubmitted = activity.submitted ? 1 : 0;
            const isLate = activity.late ? 1 : 0;
            
            const activityItem = {
              id: activity.id,
              task_number: activity.task_number || 1,
              activity_type: activity.activity_type,
              title: activity.title,
              submitted: isSubmitted,
              late: isLate,
              missing: (!isSubmitted && isPastDeadline) ? 1 : 0,
              deadline: formattedDeadline,
              deadline_raw: activity.deadline,
              total: 1,
              grade: activity.grade ? parseFloat(activity.grade) : null,
              points: activity.points ? parseFloat(activity.points) : 100,
              description: activity.description || "No description available",
              instruction: activity.instruction || "",
              link: activity.link || "",
              professor_file_url: activity.professor_file_url,
              professor_file_name: activity.professor_file_name,
              professor_file_count: activity.professor_file_count || 0
            };

            flatActivities.push(activityItem);

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
          setAllActivitiesFlat(flatActivities);
        } else {
          setActivitiesData({
            quizzes: [],
            assignments: [],
            activities: [],
            projects: [],
            laboratories: []
          });
          setAllActivitiesFlat([]);
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
      setAllActivitiesFlat([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    if (!subjectCode || !studentId) return;
    
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_performance_data.php?student_id=${studentId}&subject_code=${subjectCode}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPerformanceData(prev => ({
            ...prev,
            percentage: data.percentage || 0,
            lowGradeActivities: data.low_grade_activities || [],
            activitiesNeeded: data.activities_needed || []
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  const fetchTeacherInfo = async () => {
    if (!subjectCode) return;
    
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_teacher_info.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPerformanceData(prev => ({
            ...prev,
            teacherEmail: data.teacher_email || "",
            teacherName: data.teacher_name || ""
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching teacher info:', error);
    }
  };

  // Email functions
  const handleAskForExtraWork = () => {
    const { teacherEmail } = performanceData;
    const { percentage, missedOrZeroCount, ungradedCount, lowGradeCount, totalEffectiveAbsences } = performanceSummary;
    
    if (!teacherEmail) {
      alert("Teacher email not available. Please contact your teacher directly.");
      return;
    }

    const subject = encodeURIComponent(`Request for Extra Work - ${currentSubject?.subject || 'Subject'}`);
    
    let body = `Dear ${performanceData.teacherName || 'Teacher'},\n\n`;
    body += `I am writing to request additional work to improve my performance in ${currentSubject?.subject || 'this subject'}.\n\n`;
    body += `Current Status:\n`;
    body += `- Current grade percentage: ${percentage}%\n`;
    if (missedOrZeroCount > 0) body += `- Missed/zero-grade activities: ${missedOrZeroCount}\n`;
    if (ungradedCount > 0) body += `- Activities waiting for grading: ${ungradedCount}\n`;
    if (lowGradeCount > 0) body += `- Activities below 75%: ${lowGradeCount}\n`;
    if (totalEffectiveAbsences > 0) body += `- Effective absences: ${totalEffectiveAbsences}\n\n`;
    body += `I would appreciate any additional assignments or guidance you can provide to help me improve.\n\n`;
    body += `Thank you,\n${localStorage.getItem('user_name') || 'Student'}`;
    
    const mailtoLink = `mailto:${teacherEmail}?subject=${subject}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const handleEmailTeacherAboutActivity = (activity) => {
    const { teacherEmail } = performanceData;
    
    if (!teacherEmail) {
      alert("Teacher email not available. Please contact your teacher directly.");
      return;
    }

    const subject = encodeURIComponent(`Question about ${activity.activity_type} ${activity.task_number} - ${currentSubject?.subject || 'Subject'}`);
    
    let body = `Dear ${performanceData.teacherName || 'Teacher'},\n\n`;
    body += `I have a question regarding the following activity:\n\n`;
    body += `Activity: ${activity.activity_type} ${activity.task_number}\n`;
    body += `Title: ${activity.title}\n`;
    body += `Deadline: ${activity.deadline}\n`;
    body += `Grade: ${activity.grade !== null ? activity.grade + '/' + activity.points : 'Not graded yet'}\n\n`;
    body += `My question:\n\n`;
    body += `Thank you,\n${localStorage.getItem('user_name') || 'Student'}`;
    
    const mailtoLink = `mailto:${teacherEmail}?subject=${subject}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const handleViewActivityDetails = (activity) => {
    window.location.href = `/SubjectSchoolWorksStudent?code=${subjectCode}&activity=${activity.id}`;
  };

  const getProgressBarGradient = (percentage) => {
    if (percentage >= 75) {
      return 'linear-gradient(to right, #00A15D, #00C853)';
    } else if (percentage >= 65) {
      return 'linear-gradient(to right, #FF6B6B, #FFA600, #FFB74D)';
    } else if (percentage >= 50) {
      return 'linear-gradient(to right, #FF6B6B, #FFA600)';
    } else {
      return 'linear-gradient(to right, #FF4757, #FF6B6B)';
    }
  };

  // Render categorized activity table
  const renderActivityTable = (title, activities, type) => {
    if (!activities.length) return null;

    const isExpanded = expandedSections[type];
    const currentPageNum = currentPage[type];
    const totalPages = Math.ceil(activities.length / itemsPerPage);
    const startIndex = (currentPageNum - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedActivities = activities.slice(startIndex, endIndex);

    const getStatusColor = (activity) => {
      if (type === 'passed') return 'bg-[#00A15D]/20 text-[#00A15D]';
      if (type === 'lowGrade') return 'bg-[#FFA600]/20 text-[#FFA600]';
      if (type === 'missed') return 'bg-[#A15353]/20 text-[#A15353]';
      return 'bg-[#767EE0]/20 text-[#767EE0]';
    };

    const getStatusIcon = () => {
      switch (type) {
        case 'passed':
          return <PassedIcon />;
        case 'lowGrade':
          return <LowGradeIcon />;
        case 'missed':
          return <MissedIcon />;
        default:
          return <PendingIcon />;
      }
    };

    const getIconColor = () => {
      switch (type) {
        case 'passed':
          return 'text-[#00A15D]';
        case 'lowGrade':
          return 'text-[#FFA600]';
        case 'missed':
          return 'text-[#A15353]';
        default:
          return 'text-[#767EE0]';
      }
    };

    return (
      <div className="bg-[#15151C] rounded-lg border border-[#FFFFFF]/10 mb-3 overflow-hidden">
        <div 
          className={`cursor-pointer transition-all duration-200 ${
            isExpanded 
              ? 'p-3 border-b border-[#FFFFFF]/10' 
              : 'p-2 hover:bg-[#1E1E24]'
          }`}
          onClick={() => toggleSection(type)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 ${
                isExpanded 
                  ? 'w-8 h-8' 
                  : 'w-6 h-6'
              } rounded-full flex items-center justify-center ${
                type === 'passed' ? 'bg-[#00A15D]/20' :
                type === 'lowGrade' ? 'bg-[#FFA600]/20' :
                type === 'missed' ? 'bg-[#A15353]/20' :
                'bg-[#767EE0]/20'
              }`}>
                <div className={getIconColor()}>
                  {getStatusIcon()}
                </div>
              </div>
              <div>
                <h3 className={`font-semibold text-[#FFFFFF] ${
                  isExpanded 
                    ? 'text-base' 
                    : 'text-sm'
                }`}>
                  {title}
                </h3>
                <div className={`flex items-center gap-2 ${
                  isExpanded 
                    ? 'text-xs' 
                    : 'text-xs'
                } text-[#FFFFFF]/60`}>
                  <span>{activities.length} {activities.length === 1 ? 'activity' : 'activities'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <button className="text-[#FFFFFF] hover:text-[#FFFFFF]/80 transition-colors">
                {isExpanded ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 pt-0 animate-slideDown">
            <div className="overflow-x-auto mb-4">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-[#FFFFFF]/10">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Activity</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Title</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Deadline</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Grade</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActivities.map((activity) => (
                    <tr key={activity.id} className="border-b border-[#FFFFFF]/5 hover:bg-[#23232C]/30 transition-colors">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(activity)}`}>
                            {activity.activity_type} #{activity.task_number}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-xs text-[#FFFFFF] truncate max-w-[150px]">{activity.title}</td>
                      <td className="py-2 px-3 text-xs text-[#FFFFFF]/80">{activity.deadline}</td>
                      <td className="py-2 px-3">
                        {activity.grade !== null ? (
                          <div className="flex items-center">
                            <span className={`text-xs font-semibold ${
                              activity.grade >= 75 ? 'text-[#00A15D]' : 
                              activity.grade >= 50 ? 'text-[#FFA600]' : 
                              'text-[#A15353]'
                            }`}>
                              {activity.grade}/{activity.points}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#FFFFFF]/60">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewActivityDetails(activity)}
                            className="p-1 rounded hover:bg-[#FFFFFF]/10 transition-colors group"
                            title="View Details"
                          >
                            <img src={DetailsIcon} alt="Details" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                          </button>
                          <button
                            onClick={() => handleEmailTeacherAboutActivity(activity)}
                            className="p-1 rounded hover:bg-[#FFFFFF]/10 transition-colors group"
                            title="Email Teacher"
                          >
                            <img src={EmailIcon} alt="Email" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#FFFFFF]/10 pt-3">
                <div className="text-xs text-[#FFFFFF]/60">
                  Showing {startIndex + 1}-{Math.min(endIndex, activities.length)} of {activities.length} activities
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(type, 'prev')}
                    disabled={currentPageNum === 1}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      currentPageNum === 1
                        ? 'bg-[#15151C] text-[#FFFFFF]/30 cursor-not-allowed'
                        : 'bg-[#23232C] text-[#FFFFFF] hover:bg-[#2A2A35]'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPageNum <= 3) {
                        pageNum = i + 1;
                      } else if (currentPageNum >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPageNum - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(prev => ({ ...prev, [type]: pageNum }))}
                          className={`w-8 h-8 text-xs rounded-md transition-colors ${
                            currentPageNum === pageNum
                              ? 'bg-[#FF5252] text-white'
                              : 'bg-[#23232C] text-[#FFFFFF] hover:bg-[#2A2A35]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(type, 'next')}
                    disabled={currentPageNum === totalPages}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      currentPageNum === totalPages
                        ? 'bg-[#15151C] text-[#FFFFFF]/30 cursor-not-allowed'
                        : 'bg-[#23232C] text-[#FFFFFF] hover:bg-[#2A2A35]'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render all activities table
  const renderAllActivitiesTable = () => {
    if (!allActivitiesFlat.length) return null;

    const isExpanded = expandedSections.allActivities;
    const currentPageNum = currentPage.allActivities;
    const totalPages = Math.ceil(allActivitiesFlat.length / itemsPerPage);
    const startIndex = (currentPageNum - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedActivities = allActivitiesFlat.slice(startIndex, endIndex);

    const passedCount = categorizedActivities.passed.length;
    const lowGradeCount = categorizedActivities.lowGrade.length;
    const missedCount = categorizedActivities.missed.length;
    const pendingCount = categorizedActivities.pending.length;

    const gradedActivities = allActivitiesFlat.filter(a => a.grade !== null);
    const averageGrade = gradedActivities.length > 0 
      ? Math.round(gradedActivities.reduce((sum, a) => sum + a.grade, 0) / gradedActivities.length)
      : null;

    return (
      <div className="bg-[#15151C] rounded-lg border border-[#FFFFFF]/10 mb-3 overflow-hidden">
        <div 
          className={`cursor-pointer transition-all duration-200 ${
            isExpanded 
              ? 'p-3 border-b border-[#FFFFFF]/10' 
              : 'p-2 hover:bg-[#1E1E24]'
          }`}
          onClick={() => toggleSection('allActivities')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 ${
                isExpanded 
                  ? 'w-8 h-8' 
                  : 'w-6 h-6'
              } rounded-full flex items-center justify-center bg-[#FF5252]/20`}>
                <div className="text-[#FF5252]">
                  <AllActivitiesIcon />
                </div>
              </div>
              <div>
                <h3 className={`font-semibold text-[#FFFFFF] ${
                  isExpanded 
                    ? 'text-base' 
                    : 'text-sm'
                }`}>
                  All Activities
                </h3>
                <div className={`flex items-center gap-2 ${
                  isExpanded 
                    ? 'text-xs' 
                    : 'text-xs'
                } text-[#FFFFFF]/60`}>
                  <span>{allActivitiesFlat.length} total activities</span>
                  {averageGrade !== null && (
                    <>
                      <span className="text-[#FFFFFF]/30">•</span>
                      <span>Avg Grade: {averageGrade}%</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded bg-[#00A15D]/20 text-[#00A15D]">
                  {passedCount} Passed
                </span>
                <span className="px-2 py-1 text-xs rounded bg-[#FFA600]/20 text-[#FFA600]">
                  {lowGradeCount} Low
                </span>
                <span className="px-2 py-1 text-xs rounded bg-[#A15353]/20 text-[#A15353]">
                  {missedCount} Missed
                </span>
                <span className="px-2 py-1 text-xs rounded bg-[#767EE0]/20 text-[#767EE0]">
                  {pendingCount} Pending
                </span>
              </div>
              <button className="text-[#FFFFFF] hover:text-[#FFFFFF]/80 transition-colors">
                {isExpanded ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {!isExpanded && (
          <div className="sm:hidden px-2 pb-2">
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 text-xs rounded bg-[#00A15D]/20 text-[#00A15D]">
                {passedCount} Passed
              </span>
              <span className="px-2 py-1 text-xs rounded bg-[#FFA600]/20 text-[#FFA600]">
                {lowGradeCount} Low
              </span>
              <span className="px-2 py-1 text-xs rounded bg-[#A15353]/20 text-[#A15353]">
                {missedCount} Missed
              </span>
              <span className="px-2 py-1 text-xs rounded bg-[#767EE0]/20 text-[#767EE0]">
                {pendingCount} Pending
              </span>
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="p-3 pt-0 animate-slideDown">
            <div className="overflow-x-auto mb-4">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-[#FFFFFF]/10">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Activity</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Title</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Deadline</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Grade</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActivities.map((activity) => {
                    const status = getActivityStatus(activity);
                    return (
                      <tr key={activity.id} className="border-b border-[#FFFFFF]/5 hover:bg-[#23232C]/30 transition-colors">
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              status === 'Passed' ? 'bg-[#00A15D]/20 text-[#00A15D]' :
                              status === 'Low Grade' ? 'bg-[#FFA600]/20 text-[#FFA600]' :
                              status === 'Missed' ? 'bg-[#A15353]/20 text-[#A15353]' :
                              'bg-[#767EE0]/20 text-[#767EE0]'
                            }`}>
                              {activity.activity_type} #{activity.task_number}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-xs text-[#FFFFFF] truncate max-w-[150px]">{activity.title}</td>
                        <td className="py-2 px-3 text-xs text-[#FFFFFF]/80">{activity.deadline}</td>
                        <td className="py-2 px-3">
                          <span className="text-xs font-medium text-[#FFFFFF]">
                            {status}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {activity.grade !== null ? (
                            <div className="flex items-center">
                              <span className={`text-xs font-semibold ${
                                activity.grade >= 75 ? 'text-[#00A15D]' : 
                                activity.grade >= 50 ? 'text-[#FFA600]' : 
                                'text-[#A15353]'
                              }`}>
                                {activity.grade}/{activity.points}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#FFFFFF]/60">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewActivityDetails(activity)}
                              className="p-1 rounded hover:bg-[#FFFFFF]/10 transition-colors group"
                              title="View Details"
                            >
                              <img src={DetailsIcon} alt="Details" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                            </button>
                            <button
                              onClick={() => handleEmailTeacherAboutActivity(activity)}
                              className="p-1 rounded hover:bg-[#FFFFFF]/10 transition-colors group"
                              title="Email Teacher"
                            >
                              <img src={EmailIcon} alt="Email" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#FFFFFF]/10 pt-3">
                <div className="text-xs text-[#FFFFFF]/60">
                  Showing {startIndex + 1}-{Math.min(endIndex, allActivitiesFlat.length)} of {allActivitiesFlat.length} activities
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange('allActivities', 'prev')}
                    disabled={currentPageNum === 1}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      currentPageNum === 1
                        ? 'bg-[#15151C] text-[#FFFFFF]/30 cursor-not-allowed'
                        : 'bg-[#23232C] text-[#FFFFFF] hover:bg-[#2A2A35]'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPageNum <= 3) {
                        pageNum = i + 1;
                      } else if (currentPageNum >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPageNum - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(prev => ({ ...prev, allActivities: pageNum }))}
                          className={`w-8 h-8 text-xs rounded-md transition-colors ${
                            currentPageNum === pageNum
                              ? 'bg-[#FF5252] text-white'
                              : 'bg-[#23232C] text-[#FFFFFF] hover:bg-[#2A2A35]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange('allActivities', 'next')}
                    disabled={currentPageNum === totalPages}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      currentPageNum === totalPages
                        ? 'bg-[#15151C] text-[#FFFFFF]/30 cursor-not-allowed'
                        : 'bg-[#23232C] text-[#FFFFFF] hover:bg-[#2A2A35]'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render action button helper
  const renderActionButton = (to, icon, label, active = false, colorClass = "") => (
    <Link to={`${to}?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
      <button className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto ${
        active 
          ? 'bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30 hover:bg-[#FF5252]/30' 
          : colorClass
      }`}>
        <img src={icon} alt="" className="h-4 w-4" />
        <span className="sm:inline truncate">{label}</span>
      </button>
    </Link>
  );

  // Loading state
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

  // Main render
  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img src={SubjectOverview} alt="Subject Overview" className="h-6 w-6 sm:h-7 sm:w-7 mr-2" />
              <h1 className="font-bold text-xl lg:text-2xl text-[#FFFFFF]">Subject Overview</h1>
            </div>
            <p className="text-sm lg:text-base text-[#FFFFFF]/80">View {currentSubject?.subject || 'Subject'} overview and details</p>
          </div>

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

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="flex-1 sm:flex-initial min-w-0">
                <button className="flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30">
                  <img src={SubjectOverview} alt="" className="h-4 w-4" />
                  <span className="sm:inline truncate">{currentSubject?.subject || 'Subject'} Overview</span>
                </button>
              </div>
              
              {renderActionButton("/SubjectAnnouncementStudent", Announcement, "Announcements", false, "bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30 hover:bg-[#00A15D]/30")}
              {renderActionButton("/SubjectSchoolWorksStudent", Classwork, "School Works", false, "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30")}
              {renderActionButton("/SubjectAttendanceStudent", Attendance, "Attendance", false, "bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30")}
              {renderActionButton("/SubjectAnalyticsStudent", Analytics, "Reports", false, "bg-[#B39DDB]/20 text-[#B39DDB] border-[#B39DDB]/30 hover:bg-[#B39DDB]/30")}
            </div>
            <Link to={`/SubjectListStudent?code=${subjectCode}`} className="sm:self-start">
              <button className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 cursor-pointer">
                <img src={StudentsIcon} alt="Student List" className="h-4 w-4" />
              </button>
            </Link>
          </div>

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
                      Students with 3 accumulated absences will be dropped from the course. 
                      3 late arrivals are equivalent to one absent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && subjects.length > 0 && !currentSubject && (
            <div className="bg-[#A15353]/10 border border-[#A15353]/30 rounded-md p-3 mb-4 text-center">
              <p className="text-[#A15353] text-sm">
                Subject not found or you are not enrolled in this subject.
              </p>
            </div>
          )}

          {!loading && currentSubject && (
            <div className="space-y-4">
              <StudentPerformanceSummary
                performanceSummary={performanceSummary}
                performanceData={performanceData}
                currentSubject={currentSubject}
                handleAskForExtraWork={handleAskForExtraWork}
                getProgressBarGradient={getProgressBarGradient}
                subjectAttendance={subjectAttendance}
                studentId={studentId}
              />

              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#FFFFFF]">Activities Breakdown</h2>
                </div>
                
                {renderAllActivitiesTable()}
                {renderActivityTable("Passed Activities", categorizedActivities.passed, 'passed')}
                {renderActivityTable("Low Grade Activities", categorizedActivities.lowGrade, 'lowGrade')}
                {renderActivityTable("Missed Activities", categorizedActivities.missed, 'missed')}
                {renderActivityTable("Pending Activities", categorizedActivities.pending, 'pending')}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}