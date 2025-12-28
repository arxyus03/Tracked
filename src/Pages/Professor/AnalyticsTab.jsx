import React, { useState } from 'react';
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

  // Dummy performance trend data (class averages)
  const performanceTrendData = [
    { week: 1, score: 65, activities: 3 },
    { week: 2, score: 72, activities: 4 },
    { week: 3, score: 68, activities: 5 },
    { week: 4, score: 80, activities: 4 },
    { week: 5, score: 85, activities: 3 },
    { week: 6, score: 82, activities: 4 },
    { week: 7, score: 88, activities: 5 },
    { week: 8, score: 90, activities: 3 },
  ];

  // Dummy class average scores data
  const classAveragesData = {
    assignments: [
      { id: 1, task: "Assignment 1", score: 85, submitted: true, late: false, deadline: "2024-01-15" },
      { id: 2, task: "Assignment 2", score: 78, submitted: true, late: true, deadline: "2024-01-22" },
      { id: 3, task: "Assignment 3", score: 92, submitted: true, late: false, deadline: "2024-01-29" },
      { id: 4, task: "Assignment 4", score: 88, submitted: true, late: false, deadline: "2024-02-05" },
      { id: 5, task: "Assignment 5", score: 82, submitted: true, late: false, deadline: "2024-02-12" },
      { id: 6, task: "Assignment 6", score: 90, submitted: true, late: false, deadline: "2024-02-19" },
    ],
    quizzes: [
      { id: 1, task: "Quiz 1", score: 90, submitted: true, late: false, deadline: "2024-01-10" },
      { id: 2, task: "Quiz 2", score: 85, submitted: true, late: false, deadline: "2024-01-17" },
      { id: 3, task: "Quiz 3", score: 87, submitted: true, late: false, deadline: "2024-01-24" },
      { id: 4, task: "Quiz 4", score: 91, submitted: true, late: false, deadline: "2024-01-31" },
    ],
    activities: [
      { id: 1, task: "Activity 1", score: 95, submitted: true, late: false, deadline: "2024-01-12" },
      { id: 2, task: "Activity 2", score: 89, submitted: true, late: false, deadline: "2024-01-19" },
      { id: 3, task: "Activity 3", score: 93, submitted: true, late: false, deadline: "2024-01-26" },
    ],
    projects: [
      { id: 1, task: "Project 1", score: 82, submitted: true, late: false, deadline: "2024-02-01" },
      { id: 2, task: "Project 2", score: 88, submitted: true, late: false, deadline: "2024-02-15" },
    ],
    laboratories: [
      { id: 1, task: "Lab 1", score: 91, submitted: true, late: false, deadline: "2024-01-08" },
      { id: 2, task: "Lab 2", score: 86, submitted: true, late: false, deadline: "2024-01-15" },
      { id: 3, task: "Lab 3", score: 93, submitted: true, late: false, deadline: "2024-01-22" },
      { id: 4, task: "Lab 4", score: 89, submitted: true, late: false, deadline: "2024-01-29" },
    ]
  };

  const handleActivityTypeChange = (type) => {
    setSelectedActivityType(type);
  };

  return (
    <div className="min-h-screen">
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
              />
              <h1 className="font-bold text-sm sm:text-2xl text-[#FFFFFF]">
                Student Progress Tracking System
              </h1>
            </div>
            <p className="text-sm sm:text-base text-[#FFFFFF]/80">
              Integrated Academic Data Analytics & Performance Insights
            </p>
          </div>

          {/* Subject Information */}
          <div className="flex flex-col gap-1 text-sm text-[#FFFFFF]/80 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{subjectCode || 'N/A'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span>N/A</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>N/A</span>
              </div>
              <div className="flex justify-end">
                <Link to="/ClassManagement">
                  <img 
                    src={BackButton} 
                    alt="Back" 
                    className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity brightness-0 invert" 
                    title="Back to Class Management"
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-[#FFFFFF]/20 mb-4" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {/* Subject Overview Button */}
              <Link to={`/SubjectOverviewProfessor?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#FF5252]/20 text-[#FF5252] border-2 border-[#FF5252]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#FF5252]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={SubjectOverview} 
                    alt="" 
                    className="h-4 w-4 brightness-0 invert"
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
                    className="h-4 w-4 brightness-0 invert"
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
                    className="h-4 w-4 flex-shrink-0 brightness-0 invert"
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
                    className="h-4 w-4 brightness-0 invert"
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
                    className="h-4 w-4 brightness-0 invert"
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
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span className="sm:inline">Analytics</span>
                </button>
              </Link>
            </div>

            {/* Icon Buttons */}
            <div className="flex items-center gap-2 justify-end sm:justify-start">
              <Link to={`/StudentList?code=${subjectCode}`}>
                <button className="p-2 bg-[#2A2A35] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 flex-shrink-0 cursor-pointer" title="Student List">
                  <img 
                    src={ClassManagementIcon} 
                    alt="ClassManagement" 
                    className="h-4 w-4 brightness-0 invert" 
                  />
                </button>
              </Link>
            </div>
          </div>

          {/* Class Performance Trend */}
          <div className="mb-6">
            <ClassPerformanceTrend performanceTrend={performanceTrendData} />
          </div>

          {/* Class Average Scores */}
          <div className="mb-6">
            <ClassAverageScores
              activitiesData={classAveragesData}
              selectedType={selectedActivityType}
              onTypeChange={handleActivityTypeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}