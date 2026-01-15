import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import ClassPerformanceTrend from '../../Components/ProfessorComponents/ClassPerformanceTrend';
import ClassAverageScores from '../../Components/ProfessorComponents/ClassAverageScores';

import BackButton from '../../assets/BackButton.svg';
import ClassManagementIcon from "../../assets/ClassManagement.svg"; 
import Announcement from "../../assets/Announcement.svg";
import Classwork from "../../assets/Classwork.svg";
import GradeIcon from "../../assets/Grade.svg";
import AnalyticsIcon from "../../assets/Analytics.svg";
import AttendanceIcon from '../../assets/Attendance.svg';
import SubjectOverview from "../../assets/SubjectOverview.svg";

export default function AnalyticsTab() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get("code");
  const [selectedActivityType, setSelectedActivityType] = useState('assignment');
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [classAveragesData, setClassAveragesData] = useState({
    assignments: [],
    quizzes: [],
    activities: [],
    projects: [],
    laboratories: []
  });
  const [isDarkMode, setIsDarkMode] = useState(false); // Added theme state

  // Listen for theme changes
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

  // Fetch students and class info
  useEffect(() => {
    if (!subjectCode) return;

    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `https://tracked.6minds.site/Professor/SubjectAnalyticsProfDB/fetch_students.php?code=${subjectCode}`
        );
        const data = await response.json();
        
        if (data.success) {
          setStudents(data.students);
          setClassInfo(data.classInfo || {});
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [subjectCode]);

  // Fetch class averages data
  const fetchClassAverages = async (type) => {
    if (!subjectCode) return;

    try {
      const response = await fetch(
        `https://tracked.6minds.site/Professor/SubjectAnalyticsProfDB/fetch_class_averages.php?code=${subjectCode}&type=${type}`
      );
      const data = await response.json();
      
      if (data.success) {
        setClassAveragesData(prev => ({
          ...prev,
          [type]: data.activities
        }));
      }
    } catch (error) {
      console.error('Error fetching class averages:', error);
    }
  };

  // Fetch initial class averages
  useEffect(() => {
    if (!subjectCode) return;

    // Fetch all activity types
    const activityTypes = ['assignment', 'quiz', 'activity', 'project', 'laboratory'];
    activityTypes.forEach(type => {
      fetchClassAverages(type);
    });
  }, [subjectCode]);

  const handleActivityTypeChange = (type) => {
    setSelectedActivityType(type);
    // Refresh data for this type
    fetchClassAverages(type);
  };

  // Theme-based styles
  const getBackgroundColor = () => {
    return isDarkMode ? "bg-[#0A0A0F]" : "bg-gray-50";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/80" : "text-gray-600";
  };

  const getBorderColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/20" : "border-gray-200";
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${getBackgroundColor()}`}>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#767EE0] mx-auto mb-4"></div>
              <p className={getTextColor()}>Loading analytics data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getBackgroundColor()}`}>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={AnalyticsIcon}
                alt="Analytics"
                className="h-7 w-7 sm:h-7 sm:w-7 mr-2 sm:mr-3"
                style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
              />
              <h1 className={`font-bold text-sm sm:text-2xl ${getTextColor()}`}>
                Student Progress Tracking System
              </h1>
            </div>
            <p className={`text-sm sm:text-base ${getSecondaryTextColor()}`}>
              Integrated Academic Data Analytics & Performance Insights
            </p>
          </div>

          {/* Subject Information */}
          <div className={`flex flex-col gap-1 text-sm ${getSecondaryTextColor()} mb-4`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{subjectCode || 'N/A'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo.subject || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{classInfo.section || 'N/A'}</span>
              </div>
              <div className="flex justify-end">
                <Link to="/ClassManagement">
                  <img 
                    src={BackButton} 
                    alt="Back" 
                    className={`h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity ${isDarkMode ? 'brightness-0 invert' : 'brightness-0 opacity-60'}`}
                    title="Back to Class Management"
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className={`${getBorderColor()} mb-4`} />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {/* Subject Overview Button */}
              <Link to={`/SubjectOverviewProfessor?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#FF5252]/20 text-[#FF5252] border-2 border-[#FF5252]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#FF5252]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={SubjectOverview} 
                    alt="" 
                    className={`h-4 w-4 ${isDarkMode ? 'brightness-0 invert' : 'brightness-0 opacity-60'}`}
                  />
                  <span className="sm:inline">Subject Overview</span>
                </button>
              </Link>

              {/* Announcement Button */}
              <Link to={`/Class?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#00A15D]/20 text-[#00A15D] border-2 border-[#00A15D]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#00A15D]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={Announcement} 
                    alt="" 
                    className={`h-4 w-4 ${isDarkMode ? 'brightness-0 invert' : 'brightness-0 opacity-60'}`}
                  />
                  <span className="sm:inline">Announcements</span>
                </button>
              </Link>

              {/* Classwork Button */}
              <Link to={`/ClassworkTab?code=${subjectCode}`} className="min-w-0">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#767EE0]/20 text-[#767EE0] border-2 border-[#767EE0]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#767EE0]/30 transition-all duration-300 cursor-pointer w-full">
                  <img 
                    src={Classwork} 
                    alt="" 
                    className={`h-4 w-4 flex-shrink-0 ${isDarkMode ? 'brightness-0 invert' : 'brightness-0 opacity-60'}`}
                  />
                  <span className="whitespace-nowrap truncate">Class Work</span>
                </button>
              </Link>

              {/* Attendance Button */}
              <Link to={`/Attendance?code=${subjectCode}`} className="sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#FFA600]/20 text-[#FFA600] border-2 border-[#FFA600]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#FFA600]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={AttendanceIcon}
                    alt="" 
                    className={`h-4 w-4 ${isDarkMode ? 'brightness-0 invert' : 'brightness-0 opacity-60'}`}
                  />
                  <span className="sm:inline">Attendance</span>
                </button>
              </Link>

              {/* Grade Button */}
              <Link to={`/GradeTab?code=${subjectCode}`} className="sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#A15353]/20 text-[#A15353] border-2 border-[#A15353]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#A15353]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={GradeIcon} 
                    alt="" 
                    className={`h-4 w-4 ${isDarkMode ? 'brightness-0 invert' : 'brightness-0 opacity-60'}`}
                  />
                  <span className="sm:inline">Grade</span>
                </button>
              </Link>

              {/* Analytics Button - Active */}
              <Link to={`/AnalyticsTab?code=${subjectCode}`} className="sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#B39DDB]/20 text-[#B39DDB] border-2 border-[#B39DDB]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#B39DDB]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={AnalyticsIcon} 
                    alt="" 
                    className={`h-4 w-4 ${isDarkMode ? 'brightness-0 invert' : 'brightness-0 opacity-60'}`}
                  />
                  <span className="sm:inline">Analytics</span>
                </button>
              </Link>
            </div>

            {/* Icon Buttons */}
            <div className="flex items-center gap-2 justify-end sm:justify-start">
              <Link to={`/StudentList?code=${subjectCode}`}>
                <button className={`p-2 ${isDarkMode ? 'bg-[#2A2A35] hover:border-[#00A15D]' : 'bg-gray-100 hover:border-[#00A15D] border-gray-300'} rounded-md shadow-md border-2 border-transparent hover:transition-all duration-200 flex-shrink-0 cursor-pointer`} title="Student List">
                  <img 
                    src={ClassManagementIcon} 
                    alt="ClassManagement" 
                    className={`h-4 w-4 ${isDarkMode ? 'brightness-0 invert' : 'brightness-0 opacity-60'}`}
                  />
                </button>
              </Link>
            </div>
          </div>

          {/* Class Performance Trend - Now with real data */}
          <div className="mb-6">
            <ClassPerformanceTrend 
              students={students}
              subjectCode={subjectCode}
              useMockData={students.length === 0}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Class Average Scores - Now with real data */}
          <div className="mb-6">
            <ClassAverageScores
              activitiesData={classAveragesData}
              selectedType={selectedActivityType}
              onTypeChange={handleActivityTypeChange}
              subjectCode={subjectCode}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}