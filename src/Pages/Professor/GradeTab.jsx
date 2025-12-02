import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import BackButton from '../../assets/BackButton(Light).svg';
import Search from "../../assets/Search.svg";
import ClassManagementIcon from '../../assets/ClassManagement(Light).svg'; 
import Announcement from '../../assets/Announcement(Light).svg';
import Classwork from '../../assets/Classwork(Light).svg';
import GradeIcon from '../../assets/Grade(Light).svg';
import AnalyticsIcon from '../../assets/Analytics(Light).svg';
import AttendanceIcon from '../../assets/Attendance(Light).svg';
import DownloadIcon from '../../assets/Download(Light).svg';

export default function GradeTab() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get("code");

  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // REAL grade data loaded from backend
  const [gradeData, setGradeData] = useState([]);

  // Fetch class info - use useCallback to prevent infinite re-renders
  const fetchClassInfo = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost/TrackEd/src/Pages/Professor/SubjectDetailsDB/get_students_by_section.php?subject_code=${subjectCode}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.success) {
        setClassInfo(result.class_info);
        return result.class_info;
      } else {
        throw new Error(result.message || "Failed to fetch class info");
      }
    } catch (error) {
      console.error("Error fetching class info:", error);
      setError("Failed to load class information");
      return null;
    }
  }, [subjectCode]);

  // Fetch REAL grade summary data - use useCallback
  const fetchGradeSummary = useCallback(async (classInfo) => {
    try {
      if (!classInfo || !classInfo.section || !classInfo.professor_ID) {
        console.log("Missing class info for grade summary");
        return;
      }

      console.log("Fetching grade summary for:", {
        subjectCode,
        section: classInfo.section,
        professor_ID: classInfo.professor_ID
      });

      const response = await fetch(
        `http://localhost/TrackEd/src/Pages/Professor/SubjectDetailsDB/get_grade_summary.php?subject_code=${subjectCode}&section=${classInfo.section}&professor_ID=${classInfo.professor_ID}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("Grade summary response:", result);

      if (result.success) {
        setGradeData(result.data);
        // Update classInfo with additional details from the grade summary
        if (result.class_info) {
          setClassInfo(prev => ({ ...prev, ...result.class_info }));
        }
        // Store summary data if needed
        if (result.summary) {
          console.log("Summary data:", result.summary);
        }
        
        // Debug info
        if (result.debug) {
          console.log("Debug info:", result.debug);
        }
      } else {
        console.error("Failed to fetch grade summary:", result.message);
        // Set empty data on error
        const activityTypes = ["Assignment", "Quiz", "Activity", "Project", "Laboratory"];
        const emptyData = activityTypes.map(type => ({
          activityType: type,
          assignedWorks: 0,
          submissions: 0,
          missedSubmissions: 0,
          totalScores: 0,
          sumGradedWorks: 0,
          percentage: "0%"
        }));
        setGradeData(emptyData);
      }
    } catch (error) {
      console.error("Error fetching grade summary:", error);
      // Set empty data on error
      const activityTypes = ["Assignment", "Quiz", "Activity", "Project", "Laboratory"];
      const emptyData = activityTypes.map(type => ({
        activityType: type,
        assignedWorks: 0,
        submissions: 0,
        missedSubmissions: 0,
        totalScores: 0,
        sumGradedWorks: 0,
        percentage: "0%"
      }));
      setGradeData(emptyData);
      setError("Failed to load grade data");
    }
  }, [subjectCode]);

  useEffect(() => {
    if (!subjectCode) {
      setError("No subject code provided");
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setError("Request timeout - taking too long to load");
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch class info first
        const classData = await fetchClassInfo();
        
        if (isMounted && classData) {
          // Then fetch grade summary with the class data
          await fetchGradeSummary(classData);
        }
        
        if (isMounted) {
          setLoading(false);
          clearTimeout(timeoutId);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading data:", error);
          setError("Failed to load data");
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [subjectCode, fetchClassInfo, fetchGradeSummary]);

  const handleDownload = () => {
    alert("Download functionality (CSV/PDF) will be implemented here.");
  };

  // Show error state
  if (error && !loading) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">
            <div className="text-red-500 text-lg mb-4">Error: {error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#00874E] text-white rounded-md hover:bg-[#006e3d] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
            <p className="mt-3 text-gray-600">Loading grade data...</p>
            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={GradeIcon}
                alt="Grade"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Grade
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              View and manage class grades - {classInfo?.subject} ({classInfo?.section})
            </p>
          </div>

          {/* Subject Information */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo?.subject_code || 'N/A'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Section:</span>
                <span>{classInfo?.section || 'N/A'}</span>
              </div>
              <div className="w-full flex justify-end">
                <Link to="/ClassManagement">
                  <img 
                    src={BackButton} 
                    alt="Back" 
                    className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                    title="Back to Class Management"
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full mt-4 sm:mt-5 gap-3">
            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Announcement Button - Full width on mobile, auto on larger */}
              <Link to={`/Class?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#e6f4ea] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4edd8] transition-all duration-300 cursor-pointer w-full sm:w-auto" title="Announcement">
                  <img 
                    src={Announcement} 
                    alt="" 
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span className="sm:inline">Announcement</span>
                </button>
              </Link>

              {/* Classwork, Attendance, Grade and Analytics - Grid on mobile, row on desktop */}
              <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:gap-4 sm:w-auto">
                <Link to={`/ClassworkTab?code=${subjectCode}`} className="min-w-0">
                  <button className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 bg-[#e6f0ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4e3ff] transition-all duration-300 cursor-pointer w-full" title="Class Work">
                    <img 
                      src={Classwork} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                    />
                    <span className="whitespace-nowrap truncate">Class work</span>
                  </button>
                </Link>

                <Link to={`/Attendance?code=${subjectCode}`} className="sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#fff4e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#ffebd4] transition-all duration-300 cursor-pointer w-full sm:w-auto" title="Attendance">
                    <img 
                      src={AttendanceIcon}
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Attendance</span>
                  </button>
                </Link>

                {/* Grade Button - Active State */}
                <Link to={`/GradeTab?code=${subjectCode}`} className="sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#ffe6e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-[#ff9999] hover:bg-[#ffd4d4] transition-all duration-300 cursor-pointer w-full sm:w-auto" title="Grade">
                    <img 
                      src={GradeIcon} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Grade</span>
                  </button>
                </Link>

                {/* Analytics Button */}
                <Link to={`/AnalyticsTab?code=${subjectCode}`} className="sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#f0e6ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#e6d4ff] transition-all duration-300 cursor-pointer w-full sm:w-auto" title="Analytics">
                    <img 
                      src={AnalyticsIcon} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Analytics</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Action buttons - Right aligned on mobile */}
            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
              {/* Download Button */}
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-gray font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] hover:shadow-lg transition-all duration-200 cursor-pointer"
                title="Download Grade Report"
              >
                <img 
                  src={DownloadIcon} 
                  alt="Download" 
                  className="h-4 w-4 sm:h-5 sm:w-5" 
                />
                <span className="hidden sm:inline">Download</span>
              </button>

              <Link to={`/StudentList?code=${subjectCode}`}>
                <button className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer" title="Student List">
                  <img 
                    src={ClassManagementIcon} 
                    alt="ClassManagement" 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                  />
                </button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 sm:mt-8">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search by activity type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 sm:h-12 rounded-md px-4 py-2.5 pr-12 shadow-md outline-none bg-white text-sm sm:text-base border-2 border-transparent focus:border-[#00874E] transition-colors"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" title="Search">
                <img
                  src={Search}
                  alt="Search"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </button>
            </div>
          </div>

          {/* Grade Table */}
          <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="sm:hidden text-xs text-gray-500 py-2 text-center bg-gray-50">
                ← Swipe to see all columns →
              </div>
              <div className="p-3 sm:p-4 md:p-5">
                <table className="table-auto w-full border-collapse text-left min-w-[800px]">
                  <thead>
                    <tr className="text-xs sm:text-sm lg:text-[1.125rem] font-semibold bg-gray-50">
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200">Class Works</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200 text-center">Assigned Works</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200 text-center">Submissions</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200 text-center">Missed Submissions</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200 text-center">Total Scores</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200 text-center">Sum of Graded Works</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200 text-center">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeData.map((item, index) => (
                      <tr
                        key={item.activityType}
                        className={`hover:bg-gray-50 text-xs sm:text-sm lg:text-base ${
                          index !== gradeData.length - 1 ? 'border-b border-gray-200' : ''
                        }`}
                      >
                        <td className="px-3 sm:px-4 md:px-6 py-3 font-medium text-gray-900">
                          {item.activityType}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 text-center text-gray-700">
                          {item.assignedWorks}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 text-center text-gray-700">
                          {item.submissions}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 text-center text-gray-700">
                          {item.missedSubmissions}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 text-center text-gray-700">
                          {item.totalScores}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 text-center text-gray-700">
                          {item.sumGradedWorks}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 text-center font-semibold">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            parseFloat(item.percentage) >= 70 
                              ? 'bg-green-100 text-green-800' 
                              : parseFloat(item.percentage) >= 50 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.percentage}
                          </span>
                        </td>
                      </tr>
                    ))} 
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Section */}
            <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Total Assigned</div>
                  <div className="text-lg font-bold text-[#00874E]">
                    {gradeData.reduce((sum, item) => sum + item.assignedWorks, 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Total Submissions</div>
                  <div className="text-lg font-bold text-[#00874E]">
                    {gradeData.reduce((sum, item) => sum + item.submissions, 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Overall Score</div>
                  <div className="text-lg font-bold text-[#00874E]">
                    {gradeData.reduce((sum, item) => sum + item.sumGradedWorks, 0).toFixed(1)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Overall Percentage</div>
                  <div className="text-lg font-bold text-[#00874E]">
                    {((gradeData.reduce((sum, item) => sum + item.sumGradedWorks, 0) / 
                       Math.max(gradeData.reduce((sum, item) => sum + item.totalScores, 0), 1)) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              {/* Class Information Display */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <div className="text-sm text-gray-600">
                  Showing data for: <span className="font-semibold">{classInfo?.subject} ({classInfo?.subject_code}) - Section {classInfo?.section}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Professor: {classInfo?.professor_name || `ID: ${classInfo?.professor_ID}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}