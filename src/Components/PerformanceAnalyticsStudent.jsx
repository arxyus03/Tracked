import React, { useMemo, useState, useEffect } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";

// Import the new components
import AdvancedPerformanceReports from "./StudentAdvancedPerformanceReports";
import ActivityOverview from "./StudentComponents/StudentActivityOverview";
import ActivityList from "./StudentComponents/StudentActivityList";

export default function PerformanceAnalyticsStudent({
  quizzesList = [],
  assignmentsList = [],
  activitiesList = [],
  projectsList = [],
  laboratoriesList = [],
  selectedFilter,
  setSelectedFilter,
  currentSubject,
  subjectCode
}) {
  // counts used for the left "Created Task" panel (number of tasks)
  const quizzesCount = quizzesList.length;
  const assignmentsCount = assignmentsList.length;
  const activitiesCount = activitiesList.length;
  const projectsCount = projectsList.length;
  const laboratoriesCount = laboratoriesList.length;
  const totalTasksCount = quizzesCount + assignmentsCount + activitiesCount + projectsCount + laboratoriesCount;

  const [animationProgress, setAnimationProgress] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  // Collapsible Insights State
  const [expandedInsights, setExpandedInsights] = useState(false);
  const [displayedInsights, setDisplayedInsights] = useState([]);

  // Activity List States
  const [activityCurrentPage, setActivityCurrentPage] = useState(1);
  const [activitySearchTerm, setActivitySearchTerm] = useState("");

  // Fetch attendance data for current subject
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setAttendanceLoading(true);
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const userId = user.id;
          
          if (userId && subjectCode) {
            console.log('Fetching attendance for subject:', subjectCode);
            const response = await fetch(`https://tracked.6minds.site/Student/AttendanceStudentDB/get_attendance_student.php?student_id=${userId}`);
            
            if (response.ok) {
              const data = await response.json();
              console.log('Attendance API response:', data);
              
              if (data.success && data.attendance_summary && data.attendance_summary.length > 0) {
                // Find attendance data for the current subject
                const currentSubjectAttendance = data.attendance_summary.find(
                  subject => subject.subject_code === subjectCode
                );
                
                if (currentSubjectAttendance) {
                  console.log('Current subject attendance:', currentSubjectAttendance);
                  const present = currentSubjectAttendance.present || 0;
                  const late = currentSubjectAttendance.late || 0;
                  const totalClasses = currentSubjectAttendance.total_classes || 0;
                  
                  // Calculate attendance rate: (present + late) / total_classes * 100
                  const rate = totalClasses > 0 ? Math.round(((present + late) / totalClasses) * 100) : 0;
                  setAttendanceRate(rate);
                  console.log('Calculated attendance rate:', rate);
                } else {
                  console.log('No attendance data found for current subject');
                  setAttendanceRate(0);
                }
              } else {
                console.log('No attendance summary data available');
                setAttendanceRate(0);
              }
            } else {
              console.error('Failed to fetch attendance data');
              setAttendanceRate(0);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setAttendanceRate(0);
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchAttendanceData();
  }, [subjectCode]);

  // Utility function to count Submitted, Assigned, Missed
  const sumStatusCounts = (list) => {
    let submitted = 0, assigned = 0, missed = 0;
    
    list.forEach(it => {
      const isSubmitted = it.submitted === 1 || it.submitted === true;
      const isMissing = it.missing === 1 || it.missing === true;
      
      if (isSubmitted) {
        submitted++;
      } else if (isMissing) {
        missed++;
      } else {
        assigned++;
      }
    });
    
    return { submitted, assigned, missed };
  };

  // ADVANCED ANALYTICS CALCULATIONS
  const calculateAdvancedAnalytics = useMemo(() => {
    const allActivities = [
      ...quizzesList,
      ...assignmentsList,
      ...activitiesList,
      ...projectsList,
      ...laboratoriesList
    ];

    // Basic metrics
    const totalActivities = allActivities.length;
    const submittedActivities = allActivities.filter(a => a.submitted).length;
    const missedActivities = allActivities.filter(a => a.missing).length;
    const assignedActivities = allActivities.filter(a => !a.submitted && !a.missing).length;

    // Performance score (0-100)
    const completionRate = totalActivities > 0 ? (submittedActivities / totalActivities) * 100 : 0;
    const performanceScore = Math.round(completionRate);

    // Risk assessment
    let riskLevel = "LOW";
    let riskScore = 0;
    
    if (missedActivities > totalActivities * 0.3) {
      riskLevel = "HIGH";
      riskScore = 80;
    } else if (missedActivities > totalActivities * 0.15) {
      riskLevel = "MEDIUM";
      riskScore = 50;
    } else {
      riskLevel = "LOW";
      riskScore = 20;
    }

    // Trend analysis
    const activitiesWithDates = allActivities
      .filter(a => a.deadline && a.deadline !== 'No deadline')
      .map(a => ({
        ...a,
        deadlineDate: new Date(a.deadline)
      }))
      .sort((a, b) => a.deadlineDate - b.deadlineDate);

    const recentActivities = activitiesWithDates.slice(-5);
    const recentCompletionRate = recentActivities.length > 0 ? 
      (recentActivities.filter(a => a.submitted).length / recentActivities.length) * 100 : 0;

    const trend = recentCompletionRate > completionRate ? "improving" : 
                 recentCompletionRate < completionRate ? "declining" : "stable";

    // Activity type performance
    const typePerformance = {
      activities: calculateTypePerformance(activitiesList),
      assignments: calculateTypePerformance(assignmentsList),
      quizzes: calculateTypePerformance(quizzesList),
      laboratories: calculateTypePerformance(laboratoriesList),
      projects: calculateTypePerformance(projectsList)
    };

    // Submission patterns
    const submissionPatterns = analyzeSubmissionPatterns(allActivities);

    return {
      // Basic metrics
      totalActivities,
      submittedActivities,
      missedActivities,
      assignedActivities,
      
      // Performance metrics
      performanceScore,
      completionRate: Math.round(completionRate),
      
      // Risk assessment
      riskLevel,
      riskScore,
      
      // Trend analysis
      trend,
      recentCompletionRate: Math.round(recentCompletionRate),
      
      // Activity progress
      activityProgress: `${submittedActivities}/${totalActivities}`,
      activityProgressPercentage: totalActivities > 0 ? Math.round((submittedActivities / totalActivities) * 100) : 0,
      
      // Comparative analytics
      typePerformance,
      
      // Behavioral analytics
      submissionPatterns,
      
      // Insights
      insights: generateInsights({
        performanceScore,
        riskLevel,
        trend,
        missedActivities,
        completionRate,
        submittedActivities,
        totalActivities
      })
    };
  }, [quizzesList, assignmentsList, activitiesList, projectsList, laboratoriesList]);

  // Insight display logic
  useEffect(() => {
    const prioritizedInsights = [...calculateAdvancedAnalytics.insights]
      .sort((a, b) => {
        const priority = { critical: 4, warning: 3, info: 2, positive: 1 };
        return priority[b.type] - priority[a.type];
      });
    
    setDisplayedInsights(expandedInsights ? prioritizedInsights : prioritizedInsights.slice(0, 2));
  }, [calculateAdvancedAnalytics.insights, expandedInsights]);

  // Helper function for type performance
  function calculateTypePerformance(activityList) {
    if (activityList.length === 0) return { score: 0, completion: 0 };
    
    const completed = activityList.filter(a => a.submitted).length;
    
    return {
      score: Math.round((completed / activityList.length) * 100),
      completion: Math.round((completed / activityList.length) * 100)
    };
  }

  // Analyze submission patterns
  function analyzeSubmissionPatterns(activities) {
    const submittedActivities = activities.filter(a => a.submitted && a.deadline && a.deadline !== 'No deadline');
    
    if (submittedActivities.length === 0) {
      return {
        averageSubmissionTime: "No data",
        submissionConsistency: "No data"
      };
    }

    const submissionDates = submittedActivities.map(a => new Date(a.deadline).getTime());
    const dateVariation = Math.max(...submissionDates) - Math.min(...submissionDates);
    const consistency = dateVariation < (30 * 24 * 60 * 60 * 1000) ? "Consistent" : "Variable";

    return {
      submissionConsistency: consistency,
      totalSubmitted: submittedActivities.length
    };
  }

  // Generate actionable insights
  function generateInsights(metrics) {
    const insights = [];

    if (metrics.performanceScore < 60) {
      insights.push({
        type: "warning",
        message: "Your current performance is below satisfactory levels. Focus on completing pending activities.",
        suggestion: "Prioritize missed activities and create a study schedule."
      });
    }

    if (metrics.riskLevel === "HIGH") {
      insights.push({
        type: "critical",
        message: "High risk of subject failure detected. Immediate action required.",
        suggestion: "Contact your professor and develop a recovery plan."
      });
    }

    if (metrics.missedActivities > 0) {
      insights.push({
        type: "info",
        message: `You have ${metrics.missedActivities} missed activity(ies).`,
        suggestion: "Check if submissions are still possible and prioritize completion."
      });
    }

    if (metrics.trend === "improving") {
      insights.push({
        type: "positive",
        message: "Your performance is improving! Keep up the good work.",
        suggestion: "Maintain this momentum by staying organized."
      });
    } else if (metrics.trend === "declining") {
      insights.push({
        type: "warning",
        message: "Recent performance shows a declining trend.",
        suggestion: "Identify challenges and seek help if needed."
      });
    }

    // Add insight about activity completion progress
    if (metrics.submittedActivities < metrics.totalActivities && metrics.submittedActivities > 0) {
      insights.push({
        type: "info",
        message: `You've completed ${metrics.submittedActivities} out of ${metrics.totalActivities} activities.`,
        suggestion: "Focus on completing the remaining assigned activities to improve your performance."
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: "positive",
        message: "You're maintaining good academic performance!",
        suggestion: "Continue your current study habits."
      });
    }

    return insights;
  }

  // compute status counts depending on selected filter
  const statusCounts = useMemo(() => {
    if (!selectedFilter || selectedFilter === "") {
      const q = sumStatusCounts(quizzesList);
      const a = sumStatusCounts(assignmentsList);
      const act = sumStatusCounts(activitiesList);
      const p = sumStatusCounts(projectsList);
      const lab = sumStatusCounts(laboratoriesList);
      return {
        submitted: q.submitted + a.submitted + act.submitted + p.submitted + lab.submitted,
        assigned:   q.assigned   + a.assigned   + act.assigned   + p.assigned + lab.assigned,
        missed:    q.missed    + a.missed    + act.missed    + p.missed + lab.missed,
      };
    } else if (selectedFilter === "Quizzes") {
      return sumStatusCounts(quizzesList);
    } else if (selectedFilter === "Assignment") {
      return sumStatusCounts(assignmentsList);
    } else if (selectedFilter === "Activities") {
      return sumStatusCounts(activitiesList);
    } else if (selectedFilter === "Projects") {
      return sumStatusCounts(projectsList);
    } else if (selectedFilter === "Laboratory") {
      return sumStatusCounts(laboratoriesList);
    } else {
      return { submitted: 0, assigned: 0, missed: 0 };
    }
  }, [selectedFilter, quizzesList, assignmentsList, activitiesList, projectsList, laboratoriesList]);

  // Combine all activities when "Overall" is selected
  const displayedList = useMemo(() => {
    if (selectedFilter === 'Assignment') {
      return assignmentsList || [];
    } else if (selectedFilter === 'Activities') {
      return activitiesList || [];
    } else if (selectedFilter === 'Projects') {
      return projectsList || [];
    } else if (selectedFilter === 'Laboratory') {
      return laboratoriesList || [];
    } else if (selectedFilter === '') {
      return [
        ...(quizzesList || []),
        ...(assignmentsList || []),
        ...(activitiesList || []),
        ...(projectsList || []),
        ...(laboratoriesList || [])
      ];
    } else {
      return quizzesList || [];
    }
  }, [selectedFilter, quizzesList, assignmentsList, activitiesList, projectsList, laboratoriesList]);

  // segments for pie: Submitted, Assigned, Missed
  const segments = useMemo(() => [
    { label: "Submitted", value: statusCounts.submitted, color: "#00A15D" },
    { label: "Assigned", value: statusCounts.assigned, color: "#2196F3" },
    { label: "Missed", value: statusCounts.missed, color: "#EF4444" },
  ], [statusCounts]);

  // total for the current segments (statusTotal)
  const statusTotal = segments.reduce((acc, s) => acc + (s.value || 0), 0);

  // Animation effect when filter changes or component mounts
  useEffect(() => {
    setAnimationProgress(0);
    const duration = 300;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setAnimationProgress(currentStep / steps);
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [selectedFilter, quizzesList, assignmentsList, activitiesList, projectsList, laboratoriesList]);

  // Calculate submission rate
  const submissionRateData = useMemo(() => {
    const allActivities = [
      ...quizzesList,
      ...assignmentsList,
      ...activitiesList,
      ...projectsList,
      ...laboratoriesList
    ];

    const totalActivities = allActivities.length;
    const submittedActivities = allActivities.filter(a => a.submitted).length;
    
    const submissionRate = totalActivities > 0 ? Math.round((submittedActivities / totalActivities) * 100) : 0;
    
    return {
      submissionRate,
      submittedActivities,
      totalActivities,
      displayText: `${submittedActivities}/${totalActivities}`
    };
  }, [quizzesList, assignmentsList, activitiesList, projectsList, laboratoriesList]);

  return (
    <div>
      {/* Advanced Performance Reports */}
      <AdvancedPerformanceReports
        calculateAdvancedAnalytics={calculateAdvancedAnalytics}
        animationProgress={animationProgress}
        attendanceRate={attendanceRate}
        attendanceLoading={attendanceLoading}
        currentSubject={currentSubject}
        submissionRateData={submissionRateData}
        expandedInsights={expandedInsights}
        setExpandedInsights={setExpandedInsights}
        displayedInsights={displayedInsights}
      />
    </div>
  );
}