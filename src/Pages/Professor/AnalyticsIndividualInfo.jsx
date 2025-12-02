import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Analytics from "../../assets/Analytics(Light).svg";
import UserIcon from "../../assets/UserIcon(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";
import ArrowLeft from '../../assets/ArrowLeft.svg';
import ArrowRight from '../../assets/ArrowRight.svg';

export default function AnalyticsIndividualInfo() {
  const [isOpen, setIsOpen] = useState(true);
  const [submittedActivities, setSubmittedActivities] = useState([]);
  const [missedActivities, setMissedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const location = useLocation();

  // Pagination states
  const [submittedCurrentPage, setSubmittedCurrentPage] = useState(1);
  const [missedCurrentPage, setMissedCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get student data and subject code from navigation state
  const student = location.state?.student;
  const subjectCode = location.state?.subjectCode;
  const section = location.state?.section;

  // Log the received student data for debugging - MOVED TO TOP
  useEffect(() => {
    console.log("Received student data:", student);
    console.log("Received subject code:", subjectCode);
    console.log("Received section:", section);
  }, [student, subjectCode, section]);

  // Add safety check to handle cases where data might be missing - MOVED TO TOP
  useEffect(() => {
    if (!student && location.state) {
      // Try to get data from location state if student is not available
      const { student: stateStudent } = location.state;
      if (stateStudent) {
        console.log('Found student data in location state:', stateStudent);
      }
    }
  }, [location.state, student]);

  // Calculate attendance from student data
  const attendance = {
    present: student?.presentCount || 0,
    late: student?.lateCount || 0,
    absent: student?.absentCount || 0,
    total:
      (student?.presentCount || 0) +
      (student?.lateCount || 0) +
      (student?.absentCount || 0),
  };

  // Calculate submission rate
  const submissionRate =
    student?.totalActivities > 0
      ? Math.round((student?.submittedCount / student?.totalActivities) * 100)
      : 0;

  // Fetch student's specific activity data - MOVED TO TOP
  useEffect(() => {
    const fetchStudentActivities = async () => {
      if (!student?.id || !subjectCode) {
        console.log("❌ Missing student ID or subject code");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("📊 Fetching activities for student:", student.id);
        console.log("📚 Using subject code:", subjectCode);

        // Use your existing get_activities.php endpoint
        const activitiesUrl = `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_activities.php?subject_code=${subjectCode}`;

        console.log("📡 Fetching activities from:", activitiesUrl);

        const response = await fetch(activitiesUrl);

        if (!response.ok) {
          throw new Error(`Activities API failed: ${response.status}`);
        }

        const activitiesData = await response.json();
        console.log("✅ Activities API response:", activitiesData);

        // Add detailed logging of the first few activities to see their structure
        if (activitiesData.success && Array.isArray(activitiesData.activities)) {
          console.log("🔍 Sample activity structure:", activitiesData.activities.slice(0, 3));
          activitiesData.activities.slice(0, 3).forEach((activity, index) => {
            console.log(`Activity ${index + 1} structure:`, {
              id: activity.id,
              title: activity.title,
              activity_type: activity.activity_type,
              type: activity.type,
              category: activity.category,
              task_number: activity.task_number,
              deadline: activity.deadline
            });
          });
          
          processStudentActivities(activitiesData.activities, student.id);
        } else {
          console.log("❌ No activity data received or invalid format");
          setSubmittedActivities([]);
          setMissedActivities([]);
        }
      } catch (error) {
        console.error("💥 Error fetching student activities:", error);
        // Set empty arrays instead of throwing error
        setSubmittedActivities([]);
        setMissedActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentActivities();
  }, [student?.id, subjectCode]);

  // Process student activities function
// Process student activities function
  const processStudentActivities = (activities, studentId) => {
    const submitted = [];
    const missed = [];

    activities.forEach((activity) => {
      // Check if activity.students exists and is an array
      if (!activity.students || !Array.isArray(activity.students)) {
        console.log("⚠️ No students array found for activity:", activity.id);
        return;
      }

      // Find this student's submission in the activity
      const studentSubmission = activity.students.find(
        (s) => s.user_ID === studentId || s.student_ID === studentId
      );

      // Check if activity is past deadline
      const currentDate = new Date();
      const deadlineDate = activity.deadline ? new Date(activity.deadline) : null;
      const isPastDeadline = deadlineDate && deadlineDate < currentDate;

      // Get activity type with better handling
      let activityType = "activity"; // default
      
      // Try multiple possible fields for activity type
      if (activity.activity_type) {
        activityType = activity.activity_type.toLowerCase();
      } else if (activity.type) {
        activityType = activity.type.toLowerCase();
      } else if (activity.category) {
        activityType = activity.category.toLowerCase();
      }

      // Clean up the activity type
      activityType = activityType.trim();
      
      // Map common variations to standard types
      const typeMapping = {
        'quiz': 'quiz',
        'quizzes': 'quiz',
        'assignment': 'assignment',
        'assignments': 'assignment',
        'activity': 'activity',
        'activities': 'activity',
        'project': 'project',
        'projects': 'project',
        'laboratory': 'activity',
        'lab': 'activity',
        'exercise': 'activity',
        'task': 'activity'
      };

      activityType = typeMapping[activityType] || activityType;

      if (studentSubmission) {
        const activityItem = {
          id: activity.id,
          task: activity.task_number || `Activity ${activity.id}`,
          title: activity.title || "Untitled Activity",
          points: activity.points || 0,
          grade: studentSubmission.grade,
          due_date: activity.deadline,
          submitted_date: studentSubmission.submitted_at,
          submitted:
            studentSubmission.submitted === true ||
            studentSubmission.submitted === 1 ||
            studentSubmission.submitted === "1",
          late:
            studentSubmission.late === true ||
            studentSubmission.late === 1 ||
            studentSubmission.late === "1",
          activity_type: activityType,
          isPastDeadline: isPastDeadline,
        };

        if (activityItem.submitted) {
          // Submitted activities - include both on-time and late
          submitted.push(activityItem);
        } else if (isPastDeadline) {
          // Activity was not submitted AND past deadline = missed
          missed.push(activityItem);
        }
      } else {
        // Student not found in activity
        if (isPastDeadline) {
          // Past deadline and no submission = missed
          const activityItem = {
            id: activity.id,
            task: activity.task_number || `Activity ${activity.id}`,
            title: activity.title || "Untitled Activity",
            points: activity.points || 0,
            grade: null,
            due_date: activity.deadline,
            submitted_date: null,
            submitted: false,
            late: false,
            activity_type: activityType,
            isPastDeadline: isPastDeadline,
          };
          missed.push(activityItem);
        }
      }
    });

    console.log("📋 Processed student activities:", {
      submittedCount: submitted.length,
      missedCount: missed.length,
      submitted,
      missed,
    });

    // Debug: Log the activity types found
    console.log("🔍 Activity types found in submitted activities:");
    submitted.forEach(activity => {
      console.log(`- ${activity.title}: ${activity.activity_type}`);
    });
    console.log("🔍 Activity types found in missed activities:");
    missed.forEach(activity => {
      console.log(`- ${activity.title}: ${activity.activity_type}`);
    });

    setSubmittedActivities(submitted);
    setMissedActivities(missed);
  };

  // If no student data is passed, show a message or redirect
  if (!student) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div
          className={
            isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"
          }
        >
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 text-center">
            <p className="text-red-500 text-lg mb-4">No student data available.</p>
            <p className="text-sm text-gray-600 mb-4">
              This might happen if you navigated directly to this page or used the browser's back button.
            </p>
            <Link 
              to="/AnalyticsProf" 
              className="text-blue-500 hover:underline inline-block bg-blue-50 px-4 py-2 rounded-md"
            >
              Go back to Analytics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not submitted";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Format just the date part (without time)
  const formatDateOnly = (dateString) => {
    if (!dateString) return "No deadline";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Get activity type display name
  const getActivityTypeDisplay = (type) => {
    if (!type) return "Activity";
    
    const typeMap = {
      quiz: "Quiz",
      assignment: "Assignment",
      activity: "Activity",
      project: "Project",
      laboratory: "Laboratory",
      lab: "Lab",
      exercise: "Exercise",
      task: "Task"
    };
    
    // Return the mapped value or capitalize the first letter of the type
    return typeMap[type.toLowerCase()] || 
           type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  // Pagination calculations
  const submittedTotalPages = Math.ceil(submittedActivities.length / itemsPerPage);
  const submittedStartIndex = (submittedCurrentPage - 1) * itemsPerPage;
  const submittedEndIndex = submittedStartIndex + itemsPerPage;
  const currentSubmitted = submittedActivities.slice(submittedStartIndex, submittedEndIndex);

  const missedTotalPages = Math.ceil(missedActivities.length / itemsPerPage);
  const missedStartIndex = (missedCurrentPage - 1) * itemsPerPage;
  const missedEndIndex = missedStartIndex + itemsPerPage;
  const currentMissed = missedActivities.slice(missedStartIndex, missedEndIndex);

  // Pagination handlers
  const handleSubmittedPageChange = (page) => {
    setSubmittedCurrentPage(page);
  };

  const handleMissedPageChange = (page) => {
    setMissedCurrentPage(page);
  };

  // Pagination Component
  const Pagination = ({ currentPage, totalPages, onPageChange, dataLength }) => {
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2">
        <div className="text-xs sm:text-sm text-gray-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, dataLength)} of {dataLength} entries
        </div>
        
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center justify-center w-8 h-8 rounded-md border ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300' 
                : 'bg-white text-[#465746] border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <img src={ArrowLeft} alt="Previous" className="w-5 h-5" />
          </button>

          {/* Page Numbers */}
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`cursor-pointer flex items-center justify-center w-8 h-8 rounded-md border text-sm font-medium ${
                currentPage === page
                  ? 'bg-[#465746] text-white border-[#465746]'
                  : 'bg-white text-[#465746] border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center w-8 h-8 rounded-md border ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                : 'bg-white text-[#465746] border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <img src={ArrowRight} alt="Next" className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // Download Report Functionality
  const downloadReport = async () => {
    try {
      setDownloading(true);

      // Create report data
      const reportData = {
        student: {
          id: student.id,
          name: student.name,
          performance: {
            submittedCount: student.submittedCount || 0,
            missingCount: student.missingCount || 0,
            lateSubmissionCount: student.lateSubmissionCount || 0,
            submissionRate: submissionRate,
            attendance: attendance,
          },
        },
        activities: {
          submitted: submittedActivities,
          missed: missedActivities,
        },
        generatedAt: new Date().toLocaleString(),
      };

      // Create CSV content
      const csvContent = generateCSV(reportData);

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Student_Report_${student.id}_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Also create a PDF-like HTML report that can be printed
      generatePrintableReport(reportData);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Generate CSV content
  const generateCSV = (reportData) => {
    const { student, activities } = reportData;

    let csv = `Student Performance Report\n`;
    csv += `Generated on: ${reportData.generatedAt}\n\n`;

    // Student Information
    csv += `STUDENT INFORMATION\n`;
    csv += `Student ID,${student.id}\n`;
    csv += `Student Name,${student.name}\n\n`;

    // Performance Summary
    csv += `PERFORMANCE SUMMARY\n`;
    csv += `Activities Submitted,${student.performance.submittedCount}\n`;
    csv += `Activities Missed,${student.performance.missingCount}\n`;
    csv += `Late Submissions,${student.performance.lateSubmissionCount}\n`;
    csv += `Submission Rate,${student.performance.submissionRate}%\n`;
    csv += `Attendance Present,${student.performance.attendance.present}\n`;
    csv += `Attendance Late,${student.performance.attendance.late}\n`;
    csv += `Attendance Absent,${student.performance.attendance.absent}\n`;
    csv += `Total Classes,${student.performance.attendance.total}\n\n`;

    // Submitted Activities
    csv += `SUBMITTED ACTIVITIES\n`;
    csv += `Type,Task,Title,Submitted Date,Due Date,Grade,Points,Status\n`;
    activities.submitted.forEach((activity) => {
      csv += `"${getActivityTypeDisplay(activity.activity_type)}","${
        activity.task
      }","${activity.title}","${formatDate(
        activity.submitted_date
      )}","${formatDateOnly(activity.due_date)}","${
        activity.grade || "N/A"
      }","${activity.points}","On Time"\n`;
    });
    csv += `\n`;

    // Missed Activities
    csv += `MISSED ACTIVITIES\n`;
    csv += `Type,Task,Title,Due Date,Points,Status\n`;
    activities.missed.forEach((activity) => {
      csv += `"${getActivityTypeDisplay(activity.activity_type)}","${
        activity.task
      }","${activity.title}","${formatDateOnly(activity.due_date)}","${
        activity.points
      }","Not Submitted"\n`;
    });

    return csv;
  };

  // Generate printable HTML report
  const generatePrintableReport = (reportData) => {
    const { student, activities } = reportData;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Report - ${student.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #465746; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 30px; }
          .section-title { background-color: #465746; color: white; padding: 10px; font-weight: bold; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
          .summary-item { border: 1px solid #ddd; padding: 15px; text-align: center; }
          .submitted { color: #00A15D; }
          .missed { color: #FF6666; }
          .late { color: #FFC107; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Student Performance Report</h1>
          <p>Generated on: ${reportData.generatedAt}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Student Information</div>
          <p><strong>Student ID:</strong> ${student.id}</p>
          <p><strong>Student Name:</strong> ${student.name}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Performance Summary</div>
          <div class="summary-grid">
            <div class="summary-item submitted">
              <h3>Activities Submitted</h3>
              <p style="font-size: 24px; font-weight: bold;">${
                student.performance.submittedCount
              }</p>
            </div>
            <div class="summary-item missed">
              <h3>Activities Missed</h3>
              <p style="font-size: 24px; font-weight: bold;">${
                student.performance.missingCount
              }</p>
            </div>
            <div class="summary-item late">
              <h3>Late Submissions</h3>
              <p style="font-size: 24px; font-weight: bold;">${
                student.performance.lateSubmissionCount
              }</p>
            </div>
            <div class="summary-item">
              <h3>Submission Rate</h3>
              <p style="font-size: 24px; font-weight: bold;">${
                student.performance.submissionRate
              }%</p>
            </div>
          </div>
          
          <h3>Attendance Summary</h3>
          <div class="summary-grid">
            <div class="summary-item submitted">
              <h3>Present</h3>
              <p style="font-size: 24px; font-weight: bold;">${
                student.performance.attendance.present
              }</p>
            </div>
            <div class="summary-item late">
              <h3>Late</h3>
              <p style="font-size: 24px; font-weight: bold;">${
                student.performance.attendance.late
              }</p>
            </div>
            <div class="summary-item missed">
              <h3>Absent</h3>
              <p style="font-size: 24px; font-weight: bold;">${
                student.performance.attendance.absent
              }</p>
            </div>
            <div class="summary-item">
              <h3>Total Classes</h3>
              <p style="font-size: 24px; font-weight: bold;">${
                student.performance.attendance.total
              }</p>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title submitted">Submitted Activities (${
            activities.submitted.length
          })</div>
          ${
            activities.submitted.length > 0
              ? `
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Task</th>
                  <th>Title</th>
                  <th>Submitted Date</th>
                  <th>Due Date</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${activities.submitted
                  .map(
                    (activity) => `
                  <tr>
                    <td>${getActivityTypeDisplay(activity.activity_type)}</td>
                    <td>${activity.task}</td>
                    <td>${activity.title}</td>
                    <td>${formatDate(activity.submitted_date)}</td>
                    <td>${formatDateOnly(activity.due_date)}</td>
                    <td>${
                      activity.grade !== null
                        ? `${activity.grade}/${activity.points}`
                        : "Not graded"
                    }</td>
                    <td>On Time</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          `
              : "<p>No submitted activities found.</p>"
          }
        </div>
        
        <div class="section">
          <div class="section-title missed">Missed Activities (${
            activities.missed.length
          })</div>
          ${
            activities.missed.length > 0
              ? `
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Task</th>
                  <th>Title</th>
                  <th>Due Date</th>
                  <th>Points</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${activities.missed
                  .map(
                    (activity) => `
                  <tr>
                    <td>${getActivityTypeDisplay(activity.activity_type)}</td>
                    <td>${activity.task}</td>
                    <td>${activity.title}</td>
                    <td>${formatDateOnly(activity.due_date)}</td>
                    <td>${activity.points}</td>
                    <td>Not Submitted</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          `
              : "<p>No missed activities found.</p>"
          }
        </div>
        
        <div class="footer">
          <p>Report generated by TrackEd Analytics System</p>
          <p>This is an automated report. For detailed information, please contact the professor.</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`
          transition-all duration-300
          ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}
        `}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* PAGE CONTENT */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8 text-[#465746]">
          {/* HEADER */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={Analytics}
                alt="Analytics"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">
                Analytics
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-sm sm:text-base lg:text-lg">
              Individual Student Information
            </p>
            <Link to="/AnalyticsProf">
              <img
                src={BackButton}
                alt="BackButton"
                className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 cursor-pointer"
              />
            </Link>
          </div>

          <hr className="border-[#465746]/30 mb-4 sm:mb-5" />

          {/* STUDENT INFO */}
          <div className="flex items-center bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5 gap-3 sm:gap-4">
            <img
              src={UserIcon}
              alt="User"
              className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
            />
            <div>
              <p className="text-xs sm:text-sm lg:text-base">
                Student No: {student.id}
              </p>
              <p className="font-bold text-base sm:text-lg lg:text-xl">
                {student.name}
              </p>
              {section && (
                <p className="text-xs text-gray-600 mt-1">
                  Section: {section}
                </p>
              )}
            </div>
          </div>

          {/* STUDENT PERFORMANCE SUMMARY */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5">
            <p className="font-bold mb-3 text-base sm:text-lg lg:text-xl">
              Performance Summary
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-center text-xs sm:text-sm lg:text-base">
              <div className="p-2 sm:p-3 bg-green-50 rounded-md">
                <p className="font-semibold text-green-600 mb-1 sm:mb-2">
                  Submitted
                </p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {submittedActivities.length}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-red-50 rounded-md">
                <p className="font-semibold text-red-500 mb-1 sm:mb-2">
                  Missed
                </p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {missedActivities.length}
                </span>
              </div>
            </div>
          </div>

          {/* DOWNLOAD BUTTON */}
          <div className="flex justify-end mb-4 sm:mb-5">
            <button
              onClick={downloadReport}
              disabled={downloading}
              className=" cursor-pointer font-bold px-4 sm:px-5 py-2 bg-white rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 text-xs sm:text-sm lg:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00874E]"></div>
                  Generating Report...
                </>
              ) : (
                "Download Report"
              )}
            </button>
          </div>

          {/* SUBMITTED ACTIVITIES */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5">
            <p className="font-bold text-[#00874E] mb-3 text-base sm:text-lg lg:text-xl">
              Submitted Activities ({submittedActivities.length})
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              Activities submitted on time
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading submitted activities...</p>
              </div>
            ) : currentSubmitted.length > 0 ? (
              <>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                    <div className="overflow-hidden rounded-lg border border-gray-300">
                      <table className="min-w-full text-left border-collapse text-xs sm:text-sm lg:text-base">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-2 sm:p-3 font-bold">Type</th>
                            <th className="p-2 sm:p-3 font-bold">Task</th>
                            <th className="p-2 sm:p-3 font-bold">Title</th>
                            <th className="p-2 sm:p-3 font-bold whitespace-nowrap">
                              Submitted Date
                            </th>
                            <th className="p-2 sm:p-3 font-bold whitespace-nowrap">
                              Due Date
                            </th>
                            <th className="p-2 sm:p-3 text-center font-bold">
                              Grade
                            </th>
                            <th className="p-2 sm:p-3 text-center font-bold">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentSubmitted.map((activity, index) => (
                            <tr
                              key={activity.id || index}
                              className="hover:bg-gray-50 border-t border-gray-200"
                            >
                              <td className="p-2 sm:p-3 whitespace-nowrap">
                                {getActivityTypeDisplay(activity.activity_type)}
                              </td>
                              <td className="p-2 sm:p-3 whitespace-nowrap">
                                {activity.task}
                              </td>
                              <td className="p-2 sm:p-3">{activity.title}</td>
                              <td className="p-2 sm:p-3 whitespace-nowrap">
                                {formatDate(activity.submitted_date)}
                              </td>
                              <td className="p-2 sm:p-3 whitespace-nowrap">
                                {formatDateOnly(activity.due_date)}
                              </td>
                              <td className="p-2 sm:p-3 text-center font-semibold">
                                {activity.grade !== null
                                  ? `${activity.grade}/${activity.points}`
                                  : "Not graded"}
                              </td>
                              <td className="p-2 sm:p-3 text-center">
                                <span className="text-green-600 font-semibold">
                                  On Time
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <Pagination
                  currentPage={submittedCurrentPage}
                  totalPages={submittedTotalPages}
                  onPageChange={handleSubmittedPageChange}
                  dataLength={submittedActivities.length}
                />
              </>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No submitted activities found for this student.
                </p>
              </div>
            )}
          </div>

          {/* MISSED ACTIVITIES */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5">
            <p className="font-bold text-red-500 mb-3 text-base sm:text-lg lg:text-xl">
              Missed Activities ({missedActivities.length})
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              Activities past deadline that were not submitted
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading missed activities...</p>
              </div>
            ) : currentMissed.length > 0 ? (
              <>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                    <div className="overflow-hidden rounded-lg border border-gray-300">
                      <table className="min-w-full text-left border-collapse text-xs sm:text-sm lg:text-base">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-2 sm:p-3 font-bold">Type</th>
                            <th className="p-2 sm:p-3 font-bold">Task</th>
                            <th className="p-2 sm:p-3 font-bold">Title</th>
                            <th className="p-2 sm:p-3 font-bold whitespace-nowrap">
                              Due Date
                            </th>
                            <th className="p-2 sm:p-3 text-center font-bold">
                              Points
                            </th>
                            <th className="p-2 sm:p-3 text-center font-bold">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMissed.map((activity, index) => (
                            <tr
                              key={activity.id || index}
                              className="hover:bg-gray-50 border-t border-gray-200"
                            >
                              <td className="p-2 sm:p-3 whitespace-nowrap">
                                {getActivityTypeDisplay(activity.activity_type)}
                              </td>
                              <td className="p-2 sm:p-3 whitespace-nowrap">
                                {activity.task}
                              </td>
                              <td className="p-2 sm:p-3">{activity.title}</td>
                              <td className="p-2 sm:p-3 whitespace-nowrap">
                                {formatDateOnly(activity.due_date)}
                              </td>
                              <td className="p-2 sm:p-3 text-center">
                                {activity.points}
                              </td>
                              <td className="p-2 sm:p-3 text-center">
                                <span className="text-red-600 font-semibold">
                                  Missed
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <Pagination
                  currentPage={missedCurrentPage}
                  totalPages={missedTotalPages}
                  onPageChange={handleMissedPageChange}
                  dataLength={missedActivities.length}
                />
              </>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No missed activities found for this student.
                </p>
              </div>
            )}
          </div>

          {/* ATTENDANCE */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-6 sm:mb-8 lg:mb-10">
            <p className="font-bold mb-3 sm:mb-4 text-base sm:text-lg lg:text-xl">
              Attendance
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />
            {/* UPDATED ATTENDANCE LINK - FIXED */}
            <Link
              to={`/AnalyticsAttendanceInfo?student_id=${student.id}&subject_code=${subjectCode}`}
              state={{ 
                student: student, 
                subjectCode: subjectCode, 
                section: section 
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center text-xs sm:text-sm lg:text-base">
                <div className="p-2 sm:p-3 bg-green-50 rounded-md hover:bg-green-100 transition-colors cursor-pointer">
                  <p className="font-semibold text-green-600 mb-1 sm:mb-2">
                    Present
                  </p>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {attendance.present}
                  </span>
                </div>
                <div className="p-2 sm:p-3 bg-yellow-50 rounded-md hover:bg-yellow-100 transition-colors cursor-pointer">
                  <p className="font-semibold text-yellow-500 mb-1 sm:mb-2">
                    Late
                  </p>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {attendance.late}
                  </span>
                </div>
                <div className="p-2 sm:p-3 bg-red-50 rounded-md hover:bg-red-100 transition-colors cursor-pointer">
                  <p className="font-semibold text-red-500 mb-1 sm:mb-2">
                    Absent
                  </p>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {attendance.absent}
                  </span>
                </div>
                <div className="p-2 sm:p-3 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors cursor-pointer">
                  <p className="font-semibold text-blue-500 mb-1 sm:mb-2">
                    Total Classes
                  </p>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {attendance.total}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}