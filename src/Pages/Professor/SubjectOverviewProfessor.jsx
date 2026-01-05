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
      const classResponse = await fetch(
        `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_students_by_section.php?subject_code=${subjectCode}`
      );
      
      if (classResponse.ok) {
        const classResult = await classResponse.json();
        if (classResult.success) {
          setClassInfo(classResult.class_info);
          await Promise.all([
            fetchClassStatistics(classResult.class_info),
            fetchAllStudentsWithDetails(classResult.class_info)
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStatistics = async (classInfo) => {
    try {
      const professorId = getProfessorId();
      const response = await fetch(
        `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_class_statistics.php?subject_code=${subjectCode}&section=${classInfo.section}&professor_ID=${professorId}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setClassStats(result.stats);
        } else {
          setClassStats({
            overallAverage: 85.5,
            attendanceRate: 92.3,
            totalStudents: 35,
            atRiskStudents: 5,
            passedStudents: 28,
            failingStudents: 2
          });
        }
      }
    } catch (error) {
      console.error('Error fetching class statistics:', error);
      setClassStats({
        overallAverage: 85.5,
        attendanceRate: 92.3,
        totalStudents: 35,
        atRiskStudents: 5,
        passedStudents: 28,
        failingStudents: 2
      });
    }
  };

  const fetchAllStudentsWithDetails = async (classInfo) => {
    try {
      const professorId = getProfessorId();
      const response = await fetch(
        `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_all_students_with_details.php?subject_code=${subjectCode}&section=${classInfo.section}&professor_ID=${professorId}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const studentsWithStatus = result.students.map(student => ({
            ...student,
            status: getStudentStatus(student.average)
          }));
          setStudentPerformance(studentsWithStatus);
        } else {
          const dummyStudents = generateDummyStudents();
          setStudentPerformance(dummyStudents);
        }
      }
    } catch (error) {
      console.error('Error fetching all students:', error);
      setStudentPerformance(generateDummyStudents().slice(0, 6));
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
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@university.edu`
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
    const { overallAverage, attendanceRate, atRiskStudents } = classStats;
    
    if (overallAverage >= 85 && attendanceRate >= 90 && atRiskStudents <= 2) {
      return { status: "Excellent", color: "#00A15D", bgColor: "#00A15D/20" };
    } else if (overallAverage >= 75 && attendanceRate >= 80 && atRiskStudents <= 5) {
      return { status: "Good", color: "#FFA600", bgColor: "#FFA600/20" };
    } else {
      return { status: "Needs Attention", color: "#A15353", bgColor: "#A15353/20" };
    }
  };

  const renderActionButton = (to, icon, label, active = false, colorClass = "") => (
    <Link to={`${to}?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
      <button className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto ${
        active 
          ? 'bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30' 
          : colorClass
      }`}>
        <img src={icon} alt="" className="h-4 w-4" />
        <span className="sm:inline truncate">{label}</span>
      </button>
    </Link>
  );

  if (loading) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 text-center text-white">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00A15D] border-r-transparent"></div>
            <p className="mt-3 text-white/80">Loading subject overview...</p>
          </div>
        </div>
      </div>
    );
  }

  const classStatus = getClassStatus();

  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img src={SubjectOverviewIcon} alt="Subject Overview" className="h-6 w-6 sm:h-7 sm:w-7 mr-2" />
              <h1 className="font-bold text-xl lg:text-2xl text-white">Subject Overview</h1>
            </div>
            <p className="text-sm lg:text-base text-gray-400">Overview of class performance and statistics</p>
          </div>

          <div className="flex flex-col gap-1 text-sm text-gray-400 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT CODE:</span>
              <div className="flex items-center gap-2">
                <span>{classInfo?.subject_code || 'N/A'}</span>
                {classInfo?.subject_code && (
                  <button onClick={copySubjectCode} className="p-1 text-gray-400 hover:text-white hover:bg-[#15151C] rounded transition-colors cursor-pointer" title="Copy subject code">
                    <img src={CopyIcon} alt="Copy" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{classInfo?.section || 'N/A'}</span>
              </div>
              <div className="flex justify-end">
                <Link to="/ClassManagement">
                  <img src={BackButton} alt="Back to Class Management" className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-gray-700 mb-4" />

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {renderActionButton("/SubjectOverviewProfessor", SubjectOverviewIcon, "Subject Overview", true)}
              {renderActionButton("/Class", Announcement, "Announcements", false, "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30")}
              {renderActionButton("/ClassworkTab", Classwork, "Class Work", false, "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30")}
              {renderActionButton("/Attendance", Attendance, "Attendance", false, "bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30")}
              {renderActionButton("/GradeTab", GradeIcon, "Grade", false, "bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30 hover:bg-[#00A15D]/30")}
              {renderActionButton("/AnalyticsTab", AnalyticsIcon, "Analytics", false, "bg-[#B39DDB]/20 text-[#B39DDB] border-[#B39DDB]/30 hover:bg-[#B39DDB]/30")}
            </div>
            
            <div className="flex items-center gap-2 justify-end sm:justify-start">
              <Link to={`/StudentList?code=${subjectCode}`}>
                <div className="relative group">
                  <button className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 flex-shrink-0 cursor-pointer">
                    <img src={ClassManagementIcon} alt="ClassManagement" className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Student List
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <div className={`bg-[#15151C] border border-[${classStatus.color}]/30 rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${classStatus.bgColor}`}>
                    <img src={SuccessIcon} alt="Success" className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Class Status: {classStatus.status}</h3>
                    <p className="text-sm text-gray-400">Based on overall performance and attendance metrics</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white" style={{ color: classStatus.color }}>
                    {classStats.overallAverage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">Overall Class Average</div>
                </div>
              </div>
            </div>
          </div>

          {/* Use the ActivitiesCard component */}
          <ActivitiesCard classStats={classStats} subjectCode={subjectCode} />

          {/* Use the ClassRankingOverall component */}
          <ClassRankingOverall
            studentPerformance={studentPerformance}
            classInfo={classInfo}
            classStats={classStats}
            subjectCode={subjectCode}
          />

        </div>
      </div>
    </div>
  );
}