import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Analytics from "../../assets/Analytics(Light).svg";
import UserIcon from "../../assets/UserIcon(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";

export default function AnalyticsIndividualInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [submittedActivities, setSubmittedActivities] = useState([]);
  const [missedActivities, setMissedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const location = useLocation();
  
  // Get student data and subject code from navigation state
  const student = location.state?.student;
  const subjectCode = location.state?.subjectCode || '';
  
  // If no student data is passed, show a message or redirect
  if (!student) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen}/>
          <div className="p-8 text-center">
            <p className="text-red-500 text-lg">No student data available.</p>
            <Link to="/AnalyticsProf" className="text-blue-500 hover:underline">
              Go back to Analytics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate attendance from student data
  const attendance = {
    present: student.presentCount || 0,
    late: student.lateCount || 0,
    absent: student.absentCount || 0,
    total: (student.presentCount || 0) + (student.lateCount || 0) + (student.absentCount || 0),
  };

  // Calculate submission rate
  const submissionRate = student.totalActivities > 0 
    ? Math.round((student.submittedCount / student.totalActivities) * 100)
    : 0;

  // Fetch student's specific activity data
  useEffect(() => {
    const fetchStudentActivities = async () => {
      if (!student.id) {
        console.log('❌ No student ID available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📊 Fetching activities for student:', student.id);
        console.log('📚 Using subject code:', subjectCode);

        if (!subjectCode) {
          console.log('⚠️ No subject code available, using fallback data');
          // Use fallback data if no subject code
          setSubmittedActivities(getFallbackSubmittedActivities());
          setMissedActivities(getFallbackMissedActivities());
          setLoading(false);
          return;
        }

        // Use your existing get_activities.php endpoint
        const activitiesUrl = `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_activities.php?subject_code=${subjectCode}`;
        
        console.log('📡 Fetching activities from:', activitiesUrl);
        
        const response = await fetch(activitiesUrl);
        
        if (!response.ok) {
          throw new Error(`Activities API failed: ${response.status}`);
        }
        
        const activitiesData = await response.json();
        console.log('✅ Activities API response:', activitiesData);

        // Process the activities data for this specific student
        if (activitiesData.success && Array.isArray(activitiesData.activities)) {
          processStudentActivities(activitiesData.activities, student.id);
        } else {
          console.log('❌ No activity data received or invalid format');
          setSubmittedActivities(getFallbackSubmittedActivities());
          setMissedActivities(getFallbackMissedActivities());
        }

      } catch (error) {
        console.error('💥 Error fetching student activities:', error);
        // Fallback to sample data if API fails
        setSubmittedActivities(getFallbackSubmittedActivities());
        setMissedActivities(getFallbackMissedActivities());
      } finally {
        setLoading(false);
      }
    };

    fetchStudentActivities();
  }, [student.id, subjectCode]);

  const processStudentActivities = (activities, studentId) => {
    const submitted = [];
    const missed = [];

    activities.forEach(activity => {
      // Find this student's submission in the activity
      const studentSubmission = activity.students?.find(s => 
        s.user_ID === studentId || s.student_ID === studentId
      );

      if (studentSubmission) {
        const activityItem = {
          id: activity.id,
          task: activity.task_number || `Activity ${activity.id}`,
          title: activity.title || 'Untitled Activity',
          points: activity.points || 0,
          grade: studentSubmission.grade,
          due_date: activity.deadline,
          submitted_date: studentSubmission.submitted_at,
          submitted: studentSubmission.submitted,
          late: studentSubmission.late,
          activity_type: activity.activity_type || 'activity'
        };

        if (studentSubmission.submitted) {
          // Activity was submitted
          submitted.push(activityItem);
        } else {
          // Activity was missed (not submitted)
          missed.push(activityItem);
        }
      } else {
        // Student not found in activity - treat as missed
        const activityItem = {
          id: activity.id,
          task: activity.task_number || `Activity ${activity.id}`,
          title: activity.title || 'Untitled Activity',
          points: activity.points || 0,
          grade: null,
          due_date: activity.deadline,
          submitted_date: null,
          submitted: false,
          late: false,
          activity_type: activity.activity_type || 'activity'
        };
        missed.push(activityItem);
      }
    });

    console.log('📋 Processed student activities:', { 
      submittedCount: submitted.length, 
      missedCount: missed.length,
      submitted, 
      missed 
    });
    
    setSubmittedActivities(submitted);
    setMissedActivities(missed);
  };

  // Fallback data when API is not available
  const getFallbackSubmittedActivities = () => {
    return [
      { 
        id: 1, 
        task: "Activity 1", 
        title: "Mockup Design", 
        points: 10, 
        grade: 9,
        due_date: "2025-01-05 23:59:00",
        submitted_date: "2025-01-05 15:30:00",
        submitted: true,
        late: false,
        activity_type: "assignment"
      },
      { 
        id: 2, 
        task: "Quiz 1", 
        title: "UX Research Concepts", 
        points: 15, 
        grade: 14,
        due_date: "2025-01-12 23:59:00",
        submitted_date: "2025-01-12 10:15:00", 
        submitted: true,
        late: false,
        activity_type: "quiz"
      },
    ];
  };

  const getFallbackMissedActivities = () => {
    return [
      { 
        id: 3, 
        task: "Activity 3", 
        title: "Wireframe Submission", 
        points: 10, 
        grade: null,
        due_date: "2025-01-20 23:59:00",
        submitted_date: null,
        submitted: false,
        late: false,
        activity_type: "assignment"
      },
    ];
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not submitted';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Format just the date part (without time)
  const formatDateOnly = (dateString) => {
    if (!dateString) return 'No deadline';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get activity type display name
  const getActivityTypeDisplay = (type) => {
    const typeMap = {
      'quiz': 'Quiz',
      'assignment': 'Assignment',
      'activity': 'Activity',
      'project': 'Project'
    };
    return typeMap[type] || 'Activity';
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
            attendance: attendance
          }
        },
        activities: {
          submitted: submittedActivities,
          missed: missedActivities
        },
        generatedAt: new Date().toLocaleString()
      };

      // Create CSV content
      const csvContent = generateCSV(reportData);
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `Student_Report_${student.id}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Also create a PDF-like HTML report that can be printed
      generatePrintableReport(reportData);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error generating report. Please try again.');
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
    activities.submitted.forEach(activity => {
      csv += `"${getActivityTypeDisplay(activity.activity_type)}","${activity.task}","${activity.title}","${formatDate(activity.submitted_date)}","${formatDateOnly(activity.due_date)}","${activity.grade || 'N/A'}","${activity.points}","${activity.late ? 'Late' : 'On Time'}"\n`;
    });
    csv += `\n`;
    
    // Missed Activities
    csv += `MISSED ACTIVITIES\n`;
    csv += `Type,Task,Title,Due Date,Points,Status\n`;
    activities.missed.forEach(activity => {
      csv += `"${getActivityTypeDisplay(activity.activity_type)}","${activity.task}","${activity.title}","${formatDateOnly(activity.due_date)}","${activity.points}","Not Submitted"\n`;
    });
    
    return csv;
  };

  // Generate printable HTML report
  const generatePrintableReport = (reportData) => {
    const { student, activities } = reportData;
    
    const printWindow = window.open('', '_blank');
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
              <p style="font-size: 24px; font-weight: bold;">${student.performance.submittedCount}</p>
            </div>
            <div class="summary-item missed">
              <h3>Activities Missed</h3>
              <p style="font-size: 24px; font-weight: bold;">${student.performance.missingCount}</p>
            </div>
            <div class="summary-item late">
              <h3>Late Submissions</h3>
              <p style="font-size: 24px; font-weight: bold;">${student.performance.lateSubmissionCount}</p>
            </div>
            <div class="summary-item">
              <h3>Submission Rate</h3>
              <p style="font-size: 24px; font-weight: bold;">${student.performance.submissionRate}%</p>
            </div>
          </div>
          
          <h3>Attendance Summary</h3>
          <div class="summary-grid">
            <div class="summary-item submitted">
              <h3>Present</h3>
              <p style="font-size: 24px; font-weight: bold;">${student.performance.attendance.present}</p>
            </div>
            <div class="summary-item late">
              <h3>Late</h3>
              <p style="font-size: 24px; font-weight: bold;">${student.performance.attendance.late}</p>
            </div>
            <div class="summary-item missed">
              <h3>Absent</h3>
              <p style="font-size: 24px; font-weight: bold;">${student.performance.attendance.absent}</p>
            </div>
            <div class="summary-item">
              <h3>Total Classes</h3>
              <p style="font-size: 24px; font-weight: bold;">${student.performance.attendance.total}</p>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title submitted">Submitted Activities (${activities.submitted.length})</div>
          ${activities.submitted.length > 0 ? `
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
                ${activities.submitted.map(activity => `
                  <tr>
                    <td>${getActivityTypeDisplay(activity.activity_type)}</td>
                    <td>${activity.task}</td>
                    <td>${activity.title}</td>
                    <td>${formatDate(activity.submitted_date)}</td>
                    <td>${formatDateOnly(activity.due_date)}</td>
                    <td>${activity.grade !== null ? `${activity.grade}/${activity.points}` : 'Not graded'}</td>
                    <td>${activity.late ? 'Late' : 'On Time'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>No submitted activities found.</p>'}
        </div>
        
        <div class="section">
          <div class="section-title missed">Missed Activities (${activities.missed.length})</div>
          ${activities.missed.length > 0 ? `
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
                ${activities.missed.map(activity => `
                  <tr>
                    <td>${getActivityTypeDisplay(activity.activity_type)}</td>
                    <td>${activity.task}</td>
                    <td>${activity.title}</td>
                    <td>${formatDateOnly(activity.due_date)}</td>
                    <td>${activity.points}</td>
                    <td>Not Submitted</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>No missed activities found.</p>'}
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

  // Log the received student data for debugging
  useEffect(() => {
    console.log("Received student data:", student);
    console.log("Received subject code:", subjectCode);
  }, [student, subjectCode]);

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen}/>

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
            <Link to="/AnalyticsProf" className="lg:hidden">
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
            </div>
          </div>

          {/* STUDENT PERFORMANCE SUMMARY */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5">
            <p className="font-bold mb-3 text-base sm:text-lg lg:text-xl">
              Performance Summary
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center text-xs sm:text-sm lg:text-base">
              <div className="p-2 sm:p-3 bg-green-50 rounded-md">
                <p className="font-semibold text-green-600 mb-1 sm:mb-2">Activities Submitted</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {student.submittedCount || 0}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-red-50 rounded-md">
                <p className="font-semibold text-red-500 mb-1 sm:mb-2">Activities Missed</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {student.missingCount || 0}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-50 rounded-md">
                <p className="font-semibold text-yellow-500 mb-1 sm:mb-2">Late Submissions</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {student.lateSubmissionCount || 0}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-md">
                <p className="font-semibold text-blue-500 mb-1 sm:mb-2">Submission Rate</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {submissionRate}%
                </span>
              </div>
            </div>
          </div>

          {/* DOWNLOAD BUTTON */}
          <div className="flex justify-end mb-4 sm:mb-5">
            <button 
              onClick={downloadReport}
              disabled={downloading}
              className=" cursor-pointer font-bold px-4 sm:px-5 py-2 bg-white rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] hover:scale-105 transition-all duration-200 text-xs sm:text-sm lg:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00874E]"></div>
                  Generating Report...
                </>
              ) : (
                'Download Report'
              )}
            </button>
          </div>

          {/* SUBMITTED ACTIVITIES */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5">
            <p className="font-bold text-[#00874E] mb-3 text-base sm:text-lg lg:text-xl">
              Submitted Activities ({submittedActivities.length})
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading submitted activities...</p>
              </div>
            ) : submittedActivities.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <div className="overflow-hidden rounded-lg border border-gray-300">
                    <table className="min-w-full text-left border-collapse text-xs sm:text-sm lg:text-base">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 sm:p-3 font-bold">Type</th>
                          <th className="p-2 sm:p-3 font-bold">Task</th>
                          <th className="p-2 sm:p-3 font-bold">Title</th>
                          <th className="p-2 sm:p-3 font-bold whitespace-nowrap">Submitted Date</th>
                          <th className="p-2 sm:p-3 font-bold whitespace-nowrap">Due Date</th>
                          <th className="p-2 sm:p-3 text-center font-bold">Grade</th>
                          <th className="p-2 sm:p-3 text-center font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submittedActivities.map((activity, index) => (
                          <tr key={activity.id || index} className="hover:bg-gray-50 border-t border-gray-200">
                            <td className="p-2 sm:p-3 whitespace-nowrap">
                              {getActivityTypeDisplay(activity.activity_type)}
                            </td>
                            <td className="p-2 sm:p-3 whitespace-nowrap">{activity.task}</td>
                            <td className="p-2 sm:p-3">{activity.title}</td>
                            <td className="p-2 sm:p-3 whitespace-nowrap">
                              {formatDate(activity.submitted_date)}
                            </td>
                            <td className="p-2 sm:p-3 whitespace-nowrap">
                              {formatDateOnly(activity.due_date)}
                            </td>
                            <td className="p-2 sm:p-3 text-center font-semibold">
                              {activity.grade !== null ? `${activity.grade}/${activity.points}` : 'Not graded'}
                            </td>
                            <td className="p-2 sm:p-3 text-center">
                              {activity.late ? (
                                <span className="text-yellow-600 font-semibold">Late</span>
                              ) : (
                                <span className="text-green-600 font-semibold">On Time</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No submitted activities found for this student.</p>
              </div>
            )}
          </div>

          {/* MISSED ACTIVITIES */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5">
            <p className="font-bold text-red-500 mb-3 text-base sm:text-lg lg:text-xl">
              Missed Activities ({missedActivities.length})
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading missed activities...</p>
              </div>
            ) : missedActivities.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <div className="overflow-hidden rounded-lg border border-gray-300">
                    <table className="min-w-full text-left border-collapse text-xs sm:text-sm lg:text-base">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 sm:p-3 font-bold">Type</th>
                          <th className="p-2 sm:p-3 font-bold">Task</th>
                          <th className="p-2 sm:p-3 font-bold">Title</th>
                          <th className="p-2 sm:p-3 font-bold whitespace-nowrap">Due Date</th>
                          <th className="p-2 sm:p-3 text-center font-bold">Points</th>
                          <th className="p-2 sm:p-3 text-center font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {missedActivities.map((activity, index) => (
                          <tr key={activity.id || index} className="hover:bg-gray-50 border-t border-gray-200">
                            <td className="p-2 sm:p-3 whitespace-nowrap">
                              {getActivityTypeDisplay(activity.activity_type)}
                            </td>
                            <td className="p-2 sm:p-3 whitespace-nowrap">{activity.task}</td>
                            <td className="p-2 sm:p-3">{activity.title}</td>
                            <td className="p-2 sm:p-3 whitespace-nowrap">
                              {formatDateOnly(activity.due_date)}
                            </td>
                            <td className="p-2 sm:p-3 text-center">{activity.points}</td>
                            <td className="p-2 sm:p-3 text-center">
                              <span className="text-red-600 font-semibold">Not Submitted</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No missed activities found for this student.</p>
              </div>
            )}
          </div>

          {/* ATTENDANCE */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-6 sm:mb-8 lg:mb-10">
            <p className="font-bold mb-3 sm:mb-4 text-base sm:text-lg lg:text-xl">
              Attendance
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />
            <Link to="/AnalyticsAttendanceInfo" state={{ student: student }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center text-xs sm:text-sm lg:text-base">
                <div className="p-2 sm:p-3 bg-green-50 rounded-md hover:bg-green-100 transition-colors cursor-pointer">
                  <p className="font-semibold text-green-600 mb-1 sm:mb-2">Present</p>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {attendance.present}
                  </span>
                </div>
                <div className="p-2 sm:p-3 bg-yellow-50 rounded-md hover:bg-yellow-100 transition-colors cursor-pointer">
                  <p className="font-semibold text-yellow-500 mb-1 sm:mb-2">Late</p>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {attendance.late}
                  </span>
                </div>
                <div className="p-2 sm:p-3 bg-red-50 rounded-md hover:bg-red-100 transition-colors cursor-pointer">
                  <p className="font-semibold text-red-500 mb-1 sm:mb-2">Absent</p>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {attendance.absent}
                  </span>
                </div>
                <div className="p-2 sm:p-3 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors cursor-pointer">
                  <p className="font-semibold text-blue-500 mb-1 sm:mb-2">Total Classes</p>
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