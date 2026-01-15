import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import ClassRankingOverall from "../../Components/ProfessorComponents/ClassRankingOverall";
import ActivitiesCard from "../../Components/ProfessorComponents/ActivitiesCard";

// Import assets
import SubjectOverviewIcon from "../../assets/SubjectOverview.svg";
import Announcement from "../../assets/Announcement.svg";
import BackButton from '../../assets/BackButton.svg';
import ClassManagementIcon from "../../assets/ClassManagement.svg";
import Classwork from "../../assets/Classwork.svg";
import GradeIcon from "../../assets/Grade.svg";
import AnalyticsIcon from "../../assets/Analytics.svg";
import Attendance from "../../assets/Attendance.svg";
import CopyIcon from "../../assets/Copy.svg";
import SuccessIcon from '../../assets/Success(Green).svg';

export default function SubjectOverviewProfessor() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classStats, setClassStats] = useState({
    overallAverage: 0,
    attendanceRate: 0,
    totalStudents: 0,
    atRiskStudents: 0,
    passedStudents: 0,
    failingStudents: 0
  });
  
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme detection
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Check initial theme
    handleThemeChange();
    
    // Listen for theme changes
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsOpen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (subjectCode) {
      fetchClassData();
    }
  }, [subjectCode]);

  const fetchClassData = async () => {
    setLoading(true);
    try {
      const professorId = getProfessorId();
      
      // Fetch all data at once
      const response = await fetch(
        `https://tracked.6minds.site/Professor/SubjectOverviewProfDB/get_class_overview_data.php?subject_code=${subjectCode}&professor_ID=${professorId}`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setClassInfo(result.class_info);
          setClassStats(result.class_stats);
          
          // Transform student performances for the ranking component
          const studentsWithStatus = result.student_performances.map(student => ({
            id: student.student_ID,
            name: student.name,
            average: student.final_performance,
            status: getStudentStatus(student.final_performance),
            email: student.email,
            academic_percentage: student.academic_percentage,
            attendance_percentage: student.attendance_percentage
          }));
          
          setStudentPerformance(studentsWithStatus);
        }
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
      // Fallback to dummy data for development
      setClassInfo({
        subject_code: subjectCode,
        subject: 'Sample Subject',
        section: 'A',
        year_level: '4th Year'
      });
      setClassStats({
        overallAverage: 85.5,
        attendanceRate: 92.3,
        totalStudents: 35,
        atRiskStudents: 5,
        passedStudents: 28,
        failingStudents: 2
      });
      setStudentPerformance(generateDummyStudents());
    } finally {
      setLoading(false);
    }
  };

  const generateDummyStudents = () => {
    const names = [
      "Miguel Tan", "Juan Dela Cruz", "Anna Lim", "Maria Santos", "Carlos Garcia", "Pedro Reyes",
      "Sofia Mendoza", "Luis Torres", "Isabel Cruz", "James Wong", "Elena Lopez", "Antonio Rivera",
      "Gabriela Reyes", "Roberto Santos", "Carmen Lim", "Fernando Garcia", "Andrea Tan", "Rafael Cruz"
    ];
    
    return names.map((name, index) => ({
      id: index + 1,
      name,
      average: Math.floor(Math.random() * (100 - 50) + 50),
      status: getStudentStatus(Math.floor(Math.random() * (100 - 50) + 50)),
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
      academic_percentage: Math.floor(Math.random() * (100 - 50) + 50),
      attendance_percentage: Math.floor(Math.random() * (100 - 70) + 70)
    }));
  };

  const getStudentStatus = (average) => {
    if (average >= 90) return 'excellent';
    if (average >= 75) return 'good';
    if (average >= 60) return 'needs-improvement';
    return 'at-risk';
  };

  const getProfessorId = () => {
    try {
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        return userData.id;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    return null;
  };

  const copySubjectCode = () => {
    if (classInfo?.subject_code) {
      navigator.clipboard.writeText(classInfo.subject_code)
        .then(() => {
          const originalText = document.querySelector('.copy-text');
          if (originalText) {
            originalText.textContent = 'Copied!';
            setTimeout(() => {
              originalText.textContent = 'Copy';
            }, 2000);
          }
        })
        .catch(err => console.error('Failed to copy: ', err));
    }
  };

  const getClassStatus = () => {
    // Use the calculated overall average from the database
    const overallAverage = classStats.overallAverage;
    
    if (overallAverage >= 80) {
      return { status: "Excellent", color: "#00A15D", bgColor: "#00A15D/20" };
    } else if (overallAverage >= 70) {
      return { status: "Good", color: "#FFA600", bgColor: "#FFA600/20" };
    } else {
      return { status: "Needs Attention", color: "#A15353", bgColor: "#A15353/20" };
    }
  };

  // Theme-based colors
  const getBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-white" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-white/80" : "text-gray-600";
  };

  const getDividerColor = () => {
    return isDarkMode ? "border-white/30" : "border-gray-200";
  };

  const getCopyButtonHoverColor = () => {
    return isDarkMode ? "hover:bg-[#15151C]" : "hover:bg-gray-100";
  };

  const getTooltipBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-800";
  };

  const getClassStatusBackgroundColor = () => {
    const classStatus = getClassStatus();
    return isDarkMode ? `${classStatus.bgColor}` : `${classStatus.color}/10`;
  };

  const renderActionButton = (to, icon, label, active = false, colorClass = "") => {
    let buttonClass;
    if (active) {
      buttonClass = isDarkMode 
        ? 'bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30' 
        : 'bg-[#FF5252]/10 text-[#FF5252] border-[#FF5252]/20';
    } else {
      buttonClass = isDarkMode 
        ? `${colorClass}/20 text-${colorClass} border-${colorClass}/30 hover:${colorClass}/30`
        : `${colorClass}/10 text-${colorClass} border-${colorClass}/20 hover:${colorClass}/20`;
    }

    return (
      <Link to={`${to}?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
        <button className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto ${buttonClass}`}>
          <img src={icon} alt="" className="h-4 w-4" style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }} />
          <span className="sm:inline truncate">{label}</span>
        </button>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${getBackgroundColor()}`}>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00A15D] border-r-transparent"></div>
            <p className={`mt-3 ${getSecondaryTextColor()}`}>Loading subject overview...</p>
          </div>
        </div>
      </div>
    );
  }

  const classStatus = getClassStatus();

  return (
    <div className={`min-h-screen ${getBackgroundColor()}`}>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img src={SubjectOverviewIcon} alt="Subject Overview" className="h-6 w-6 sm:h-7 sm:w-7 mr-2" style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }} />
              <h1 className={`font-bold text-xl lg:text-2xl ${getTextColor()}`}>Subject Overview</h1>
            </div>
            <p className={`text-sm lg:text-base ${getSecondaryTextColor()}`}>Overview of class performance and statistics</p>
          </div>

          <div className={`flex flex-col gap-1 text-sm mb-4 ${getSecondaryTextColor()}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT CODE:</span>
              <div className="flex items-center gap-2">
                <span className={getTextColor()}>{classInfo?.subject_code || 'N/A'}</span>
                {classInfo?.subject_code && (
                  <button onClick={copySubjectCode} className={`p-1 ${getSecondaryTextColor()} ${getCopyButtonHoverColor()} rounded transition-colors cursor-pointer`} title="Copy subject code">
                    <img src={CopyIcon} alt="Copy" className="w-4 h-4" style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span className={getTextColor()}>{classInfo?.subject || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span className={getTextColor()}>{classInfo?.section || 'N/A'}</span>
              </div>
              <div className="flex justify-end">
                <Link to="/ClassManagement">
                  <img src={BackButton} alt="Back to Class Management" className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }} />
                </Link>
              </div>
            </div>
          </div>

          <hr className={`${getDividerColor()} mb-4`} />

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {renderActionButton("/SubjectOverviewProfessor", SubjectOverviewIcon, "Subject Overview", true)}
              {renderActionButton("/Class", Announcement, "Announcements", false, "[#767EE0]")}
              {renderActionButton("/ClassworkTab", Classwork, "Class Work", false, "[#767EE0]")}
              {renderActionButton("/Attendance", Attendance, "Attendance", false, "[#FFA600]")}
              {renderActionButton("/GradeTab", GradeIcon, "Grade", false, "[#00A15D]")}
              {renderActionButton("/AnalyticsTab", AnalyticsIcon, "Analytics", false, "[#B39DDB]")}
            </div>
            
            <div className="flex items-center gap-2 justify-end sm:justify-start">
              <Link to={`/StudentList?code=${subjectCode}`}>
                <div className="relative group">
                  <button className={`p-2 rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 flex-shrink-0 cursor-pointer ${isDarkMode ? 'bg-[#15151C]' : 'bg-white border-gray-200'}`}>
                    <img src={ClassManagementIcon} alt="ClassManagement" className="h-4 w-4" style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }} />
                  </button>
                  <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 ${getTooltipBackgroundColor()}`}>
                    Student List
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <div className={`rounded-lg p-4 border ${isDarkMode ? `border-[${classStatus.color}]/30` : `border-[${classStatus.color}]/20`} ${getClassStatusBackgroundColor()}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? classStatus.bgColor : `${classStatus.color}/10`}`}>
                    <img src={SuccessIcon} alt="Success" className="h-5 w-5" style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${getTextColor()}`}>Class Status: {classStatus.status}</h3>
                    <p className={`text-sm ${getSecondaryTextColor()}`}>Based on overall performance and attendance metrics</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: classStatus.color }}>
                    {classStats.overallAverage.toFixed(1)}%
                  </div>
                  <div className={`text-sm ${getSecondaryTextColor()}`}>Overall Class Average</div>
                </div>
              </div>
            </div>
          </div>

          {/* Use the ActivitiesCard component */}
          <ActivitiesCard subjectCode={subjectCode} isDarkMode={isDarkMode} />

          {/* Use the ClassRankingOverall component */}
          <ClassRankingOverall
            studentPerformance={studentPerformance}
            classInfo={classInfo}
            classStats={classStats}
            subjectCode={subjectCode}
            isDarkMode={isDarkMode}
          />

        </div>
      </div>
    </div>
  );
}