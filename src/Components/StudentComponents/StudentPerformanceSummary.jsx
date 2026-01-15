import React, { useState, useEffect } from 'react';
import EmailIcon from '../../assets/Email.svg';
import WarningIcon from '../../assets/Warning.svg';
import CheckCircleIcon from '../../assets/CheckCircle.svg';
import TrackEdIcon from '../../assets/TrackEd.svg';
import CrossIcon from '../../assets/Cross.svg';

import StudentActivityDetails from './StudentActivityDetails';

const StudentPerformanceSummary = ({
  performanceSummary,
  performanceData,
  currentSubject,
  subjectAttendance,
  studentId,
  studentName,
  studentEmail,
  performanceDataLoading = false,
  onActivitySubmitted,
  isDarkMode = false // Add theme prop
}) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [, setCurrentCategory] = useState('');
  const [expandedSuggestionsSection, setExpandedSuggestionsSection] = useState(false);
  const [expandedIndividualSuggestions, setExpandedIndividualSuggestions] = useState({});
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailType, setEmailType] = useState('extra_work');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [selectedActivityForEmail, setSelectedActivityForEmail] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [formattedStudentName, setFormattedStudentName] = useState('');
  const [localPerformanceSummary, setLocalPerformanceSummary] = useState(performanceSummary);

  // Theme-based style functions
  const getBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/80" : "text-gray-600";
  };

  const getMutedTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/50" : "text-gray-500";
  };

  const getDividerColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/10" : "border-gray-200";
  };

  const getCardBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getHoverBackground = () => {
    return isDarkMode ? "hover:bg-[#23232C]/50" : "hover:bg-gray-100";
  };

  const getInputBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-100";
  };

  const getInputBorderColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/20" : "border-gray-300";
  };

  const getModalBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getModalBorderColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/10" : "border-gray-200";
  };

  // Update localPerformanceSummary when prop changes
  useEffect(() => {
    setLocalPerformanceSummary(performanceSummary);
  }, [performanceSummary]);

  // Track when data is ready to prevent button disappearance
  useEffect(() => {
    const hasPerformanceData = performanceSummary && typeof performanceSummary.percentage === 'number';
    const hasTeacherData = performanceData && Object.keys(performanceData).length > 0;
    
    setIsDataReady(hasPerformanceData && hasTeacherData);
    
    if (studentName) {
      setFormattedStudentName(formatStudentName(studentName));
    }
  }, [performanceSummary, performanceData, studentName]);

  // Function to remove activity from suggestions
  const removeActivityFromSuggestions = (activityId) => {
    if (!localPerformanceSummary?.suggestionsData) return;

    const updatedSummary = { ...localPerformanceSummary };
    
    const suggestionTypes = ['missed', 'failed', 'low', 'pending'];
    
    suggestionTypes.forEach(type => {
      if (updatedSummary.suggestionsData[type]) {
        updatedSummary.suggestionsData[type] = updatedSummary.suggestionsData[type].filter(
          activity => activity.id !== activityId
        );
      }
    });

    if (updatedSummary.suggestions) {
      updatedSummary.suggestions = updatedSummary.suggestions.map(suggestion => {
        const activities = updatedSummary.suggestionsData[suggestion.type];
        if (Array.isArray(activities)) {
          return {
            ...suggestion,
            count: activities.length
          };
        }
        return suggestion;
      }).filter(suggestion => suggestion.count > 0);

      updatedSummary.missedCount = updatedSummary.suggestionsData.missed?.length || 0;
      updatedSummary.failedCount = updatedSummary.suggestionsData.failed?.length || 0;
      updatedSummary.lowCount = updatedSummary.suggestionsData.low?.length || 0;
      updatedSummary.pendingCount = updatedSummary.suggestionsData.pending?.length || 0;
    }

    setLocalPerformanceSummary(updatedSummary);
  };

  // Handle activity submission from details modal
  const handleActivitySubmitted = (activityId) => {
    removeActivityFromSuggestions(activityId);
    
    if (onActivitySubmitted) {
      onActivitySubmitted(activityId);
    }
  };

  // Function to get color based on current performance percentage
  const getPerformanceColor = (percentage) => {
    if (percentage >= 75) return 'text-[#00A15D]';
    if (percentage >= 71 && percentage <= 74) return 'text-[#FFA600]';
    return 'text-[#A15353]';
  };

  // Function to get border color for the circle
  const getPerformanceBorderColor = (percentage) => {
    if (percentage >= 75) return 'border-[#00A15D]';
    if (percentage >= 71 && percentage <= 74) return 'border-[#FFA600]';
    return 'border-[#A15353]';
  };

  // Function to get progress bar gradient based on percentage
  const getCurrentPerformanceGradient = (percentage) => {
    if (percentage >= 75) return 'linear-gradient(to right, #00A15D, #00C853)';
    if (percentage >= 71 && percentage <= 74) return 'linear-gradient(to right, #FFA600, #FFD700)';
    return 'linear-gradient(to right, #A15353, #FF4757)';
  };

  // Function to format percentage - 2 digits for circle, 2 decimal places for gauge
  const formatPercentageForCircle = (percentage) => {
    return Math.round(percentage);
  };

  const formatPercentageForGauge = (percentage) => {
    return percentage.toFixed(2);
  };

  const toggleIndividualSuggestion = (type) => {
    setExpandedIndividualSuggestions(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleViewActivityFromSuggestion = (activity) => {
    setSelectedActivity(activity);
    setShowActivityDetails(true);
  };

  // Format student name to "Surname, First Name Middle Initial."
  const formatStudentName = (fullName) => {
    if (!fullName) return 'Student';
    
    const nameParts = fullName.trim().split(' ');
    const cleanNameParts = nameParts.filter(part => part.trim() !== '');
    
    if (cleanNameParts.length === 0) return fullName;
    if (cleanNameParts.length === 1) return cleanNameParts[0];
    
    const surname = cleanNameParts[cleanNameParts.length - 1];
    const firstName = cleanNameParts[0];
    const middleParts = cleanNameParts.slice(1, -1);
    
    let middleInitials = '';
    if (middleParts.length > 0) {
      middleInitials = middleParts.map(part => {
        const cleanPart = part.replace(/[^\w]/g, '');
        return cleanPart.charAt(0) + '.';
      }).join(' ');
    }
    
    let result = `${surname}, ${firstName}`;
    if (middleInitials) {
      result += ` ${middleInitials}`;
    }
    
    return result.trim();
  };

  // Calculate attendance warnings
  const calculateAttendanceWarnings = (attendanceData = subjectAttendance) => {
    if (!attendanceData) return { isAtRisk: false, isCritical: false, totalEffectiveAbsences: 0 };
    
    const absent = attendanceData.absent || 0;
    const late = attendanceData.late || 0;
    
    const equivalentAbsences = Math.floor(late / 3);
    const totalEffectiveAbsences = absent + equivalentAbsences;
    
    const isAtRisk = totalEffectiveAbsences >= 2;
    const isCritical = totalEffectiveAbsences >= 3;
    
    return {
      isAtRisk,
      isCritical,
      totalEffectiveAbsences,
      absent,
      late,
      equivalentAbsences
    };
  };

  // Generate email message based on type
  const generateEmailMessage = (type, activity = null) => {
    const teacherName = performanceData?.teacherName || '';
    const { percentage, missedCount, pendingCount, lowCount, totalEffectiveAbsences } = localPerformanceSummary || {};
    
    const finalFormattedName = formattedStudentName || formatStudentName(studentName);
    
    let subject = '';
    let message = '';
    
    switch(type) {
      case 'extra_work':
        subject = `Request for Extra Work - ${currentSubject?.subject || 'Subject'} (${currentSubject?.subject_code || ''})`;
        message = `Dear ${teacherName || 'Professor'},

I am writing to request additional work to improve my performance in ${currentSubject?.subject || 'this subject'} (${currentSubject?.subject_code || ''}).

STUDENT INFORMATION:
- Student ID: ${studentId}
- Student Name: ${finalFormattedName}
${studentEmail ? `- Student Email: ${studentEmail}\n` : ''}- Subject: ${currentSubject?.subject || ''}
- Section: ${currentSubject?.section || ''}
- Subject Code: ${currentSubject?.subject_code || ''}

CURRENT PERFORMANCE:
- Current Grade Percentage: ${percentage}% (75% academic + 25% attendance)
- Academic Performance Only: ${performanceData?.academic_percentage?.toFixed(2) || 0}%
- Attendance Performance: ${performanceData?.attendance_percentage?.toFixed(2) || 0}%
${missedCount > 0 ? `- Missed Activities: ${missedCount}\n` : ''}${pendingCount > 0 ? `- Pending Activities: ${pendingCount}\n` : ''}${lowCount > 0 ? `- Activities with 75-79%: ${lowCount}\n` : ''}${totalEffectiveAbsences > 0 ? `- Effective Absences: ${totalEffectiveAbsences}\n` : ''}

REQUEST:
I would appreciate any additional assignments, remedial work, or guidance you can provide to help me improve my performance in this subject.

Thank you for your consideration.

Sincerely,
${finalFormattedName}
Student ID: ${studentId}
${studentEmail ? `Email: ${studentEmail}` : ''}`;
        break;

      case 'contact':
        subject = `Urgent: Concern about performance in ${currentSubject?.subject || 'Subject'}`;
        message = `Dear ${teacherName || 'Professor'},

I am writing to express my concern about my current performance in ${currentSubject?.subject || 'this subject'} (${currentSubject?.subject_code || ''}).

STUDENT INFORMATION:
- Student ID: ${studentId}
- Student Name: ${finalFormattedName}
${studentEmail ? `- Student Email: ${studentEmail}\n` : ''}- Subject: ${currentSubject?.subject || ''}
- Section: ${currentSubject?.section || ''}
- Subject Code: ${currentSubject?.subject_code || ''}

CURRENT PERFORMANCE:
- Current Grade Percentage: ${percentage}% (75% academic + 25% attendance)
- Academic Performance Only: ${performanceData?.academic_percentage?.toFixed(2) || 0}%
- Attendance Performance: ${performanceData?.attendance_percentage?.toFixed(2) || 0}%

CONCERN:
I am concerned about my current performance and would like to discuss strategies for improvement. I am committed to doing whatever it takes to succeed in this subject.

REQUEST:
I would appreciate the opportunity to meet with you or receive guidance on how I can improve my performance.

Thank you for your time and understanding.

Sincerely,
${finalFormattedName}
Student ID: ${studentId}
${studentEmail ? `Email: ${studentEmail}` : ''}`;
        break;

      case 'specific_activity': {
        if (activity) {
          const percentage = activity.grade !== null && activity.points > 0 ? 
            Math.round((activity.grade / activity.points) * 100) : null;
          
          subject = `Question about ${activity.activity_type} ${activity.task_number} - ${currentSubject?.subject || 'Subject'}`;
          message = `Dear ${teacherName || 'Professor'},

I have a question regarding the following activity:

STUDENT INFORMATION:
- Student ID: ${studentId}
- Student Name: ${finalFormattedName}
${studentEmail ? `- Student Email: ${studentEmail}\n` : ''}- Subject: ${currentSubject?.subject || ''}
- Section: ${currentSubject?.section || ''}
- Subject Code: ${currentSubject?.subject_code || ''}

ACTIVITY DETAILS:
- Activity Type: ${activity.activity_type}
- Task Number: ${activity.task_number}
- Title: ${activity.title}
- Deadline: ${activity.deadline ? new Date(activity.deadline).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'No deadline'}
- Status: ${activity.status}
- Score: ${activity.grade !== null ? `${activity.grade}/${activity.points}` : 'Not graded yet'}
${percentage !== null ? `- Percentage: ${percentage}%\n` : ''}

MY QUESTION:
[Please state your specific question about this activity here]

Thank you for your time and assistance.

Sincerely,
${finalFormattedName}
Student ID: ${studentId}
${studentEmail ? `Email: ${studentEmail}` : ''}`;
        }
        break;
      }

      case 'absences': {
        const attendanceWarnings = calculateAttendanceWarnings();
        const { absent, late, totalEffectiveAbsences: effectiveAbsences, isAtRisk, isCritical } = attendanceWarnings;
        
        subject = `Concern about Attendance - ${currentSubject?.subject || 'Subject'} (${currentSubject?.subject_code || ''})`;
        
        let concernMessage = '';
        if (isCritical) {
          concernMessage = `🚨 URGENT: I have reached ${effectiveAbsences} effective absences, which may result in being dropped from the course. I urgently need to discuss this situation with you.`;
        } else if (isAtRisk) {
          concernMessage = `⚠️ WARNING: I have ${effectiveAbsences} effective absences, which puts me at risk of being dropped if I reach 3 absences. I would like to discuss how to improve my attendance.`;
        } else if (late >= 2) {
          concernMessage = `⚠️ NOTICE: I have ${late} late arrivals. Since 3 late arrivals = 1 absence, I'm concerned about accumulating an absence and would like to discuss my attendance.`;
        } else if (absent === 2) {
          concernMessage = `⚠️ WARNING: I have ${absent} absences. Since 3 accumulated absences may result in being dropped, I would like to discuss my attendance status.`;
        } else {
          concernMessage = `I am concerned about my attendance record and would like to discuss how this may affect my performance and what I can do to improve.`;
        }
        
        message = `Dear ${teacherName || 'Professor'},

I am writing to discuss my attendance in ${currentSubject?.subject || 'this subject'} (${currentSubject?.subject_code || ''}).

STUDENT INFORMATION:
- Student ID: ${studentId}
- Student Name: ${finalFormattedName}
${studentEmail ? `- Student Email: ${studentEmail}\n` : ''}- Subject: ${currentSubject?.subject || ''}
- Section: ${currentSubject?.section || ''}
- Subject Code: ${currentSubject?.subject_code || ''}

ATTENDANCE RECORD:
- Absences: ${absent}
- Late Arrivals: ${late}
- Equivalent Absences from Lates: ${Math.floor(late / 3)}
- Remaining Lates (Not Converted): ${late % 3}
- Total Effective Absences: ${effectiveAbsences} (Absent + Late/3)
- Note: 3 late arrivals are equivalent to 1 absence

ATTENDANCE POLICY REMINDER:
• 3 accumulated absences will result in being dropped from the class
• 3 late arrivals = 1 absence (converted automatically)
• Remaining lates that don't make a full absence are tracked separately

CONCERN:
${concernMessage}

REQUEST:
I would appreciate guidance on how to manage my attendance better and any suggestions you may have. I am committed to improving my attendance and performance in this subject.

Thank you for your understanding.

Sincerely,
${finalFormattedName}
Student ID: ${studentId}
${studentEmail ? `Email: ${studentEmail}` : ''}`;
        break;
      }

      default:
        subject = `Regarding ${currentSubject?.subject || 'Subject'}`;
        message = `Dear ${teacherName || 'Professor'},

I would like to discuss my performance in ${currentSubject?.subject || 'this subject'}.

STUDENT INFORMATION:
- Student ID: ${studentId}
- Student Name: ${finalFormattedName}
${studentEmail ? `- Student Email: ${studentEmail}\n` : ''}- Subject: ${currentSubject?.subject || ''}
- Section: ${currentSubject?.section || ''}
- Subject Code: ${currentSubject?.subject_code || ''}

Thank you for your time.

Sincerely,
${finalFormattedName}
Student ID: ${studentId}
${studentEmail ? `Email: ${studentEmail}` : ''}`;
    }
    
    return { subject, message };
  };

  // New: Open email modal for specific activity
  const handleEmailActivityFromSuggestion = (activity) => {
    setSelectedActivityForEmail(activity);
    setEmailType('specific_activity');
    
    const { subject, message } = generateEmailMessage('specific_activity', activity);
    setEmailSubject(subject);
    setEmailMessage(message);
    setShowEmailModal(true);
  };

  // New: Open email modal for extra work request
  const handleOpenExtraWorkEmail = () => {
    setEmailType('extra_work');
    const { subject, message } = generateEmailMessage('extra_work');
    setEmailSubject(subject);
    setEmailMessage(message);
    setShowEmailModal(true);
  };

  // New: Open email modal for general contact
  const handleOpenContactEmail = () => {
    setEmailType('contact');
    const { subject, message } = generateEmailMessage('contact');
    setEmailSubject(subject);
    setEmailMessage(message);
    setShowEmailModal(true);
  };

  // New: Open email modal for absences
  const handleOpenAbsencesEmail = () => {
    setEmailType('absences');
    const { subject, message } = generateEmailMessage('absences');
    setEmailSubject(subject);
    setEmailMessage(message);
    setShowEmailModal(true);
  };

  // New: Handle email type change in modal
  const handleEmailTypeChange = (type) => {
    setEmailType(type);
    if (type === 'specific_activity' && selectedActivityForEmail) {
      const { subject, message } = generateEmailMessage('specific_activity', selectedActivityForEmail);
      setEmailSubject(subject);
      setEmailMessage(message);
    } else {
      const { subject, message } = generateEmailMessage(type);
      setEmailSubject(subject);
      setEmailMessage(message);
    }
  };

  // New: Send email using Gmail
  const handleSendEmail = () => {
    const teacherEmail = performanceData?.teacherEmail;
    
    if (!teacherEmail) {
      alert("Professor email not available. Please contact your professor directly.");
      return;
    }

    const encodedSubject = encodeURIComponent(emailSubject);
    const encodedBody = encodeURIComponent(emailMessage);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(teacherEmail)}&su=${encodedSubject}&body=${encodedBody}`;
    
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    
    setShowEmailModal(false);
  };

  const getActivityStatusColor = (activity) => {
    switch(activity.status) {
      case 'passed': return 'text-[#00A15D]';
      case 'low': return 'text-[#FFA600]';
      case 'failed': return 'text-[#A15353]';
      case 'missed': return 'text-[#A15353]';
      case 'pending': return 'text-[#767EE0]';
      default: return getTextColor();
    }
  };

  const renderIndividualSuggestionDropdown = (suggestion, activities) => {
    const isExpanded = expandedIndividualSuggestions[suggestion.type];
    
    if (!activities || activities.length === 0) return null;

    if (suggestion.type === 'absences') {
      const attendanceWarnings = calculateAttendanceWarnings();
      const { isAtRisk, isCritical, totalEffectiveAbsences, absent, late } = attendanceWarnings;
      
      return (
        <div className="mb-1">
          <div 
            className={`cursor-pointer p-1.5 rounded ${getHoverBackground()} transition-colors`}
            onClick={() => toggleIndividualSuggestion(suggestion.type)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isCritical ? 'bg-[#A15353] animate-pulse' :
                  isAtRisk ? 'bg-[#FFA600]' :
                  'bg-[#FF6B6B]'
                }`}></div>
                <span className={`text-xs flex-1 min-w-0 truncate ${getSecondaryTextColor()} group-hover:${getTextColor()} transition-colors`}>
                  {suggestion.text}
                  {isCritical && ' 🚨'}
                  {isAtRisk && !isCritical && ' ⚠️'}
                </span>
                {totalEffectiveAbsences > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    isCritical ? 'bg-[#A15353]/20 text-[#A15353]' :
                    isAtRisk ? 'bg-[#FFA600]/20 text-[#FFA600]' :
                    'bg-[#FF6B6B]/20 text-[#FF6B6B]'
                  }`}>
                    {totalEffectiveAbsences}
                  </span>
                )}
              </div>
              <button className={`${getSecondaryTextColor()} ${isDarkMode ? 'hover:text-[#FFFFFF]' : 'hover:text-gray-900'} transition-colors ml-2`}>
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className={`ml-3 pl-3 border-l ${getDividerColor()} mt-1 mb-1 animate-slideDown`}>
              <div className={`p-2 ${getCardBackgroundColor()} rounded text-xs ${getSecondaryTextColor()}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Absences:</span>
                    <span className={`font-semibold ${absent > 0 ? 'text-[#A15353]' : getTextColor()}`}>
                      {absent}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Late Arrivals:</span>
                    <span className={`font-semibold ${late > 0 ? 'text-[#FFA600]' : getTextColor()}`}>
                      {late}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Effective Absences:</span>
                    <span className={`font-semibold ${
                      totalEffectiveAbsences >= 3 ? 'text-[#A15353]' :
                      totalEffectiveAbsences >= 2 ? 'text-[#FFA600]' :
                      getTextColor()
                    }`}>
                      {totalEffectiveAbsences} / 3
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-[#FFFFFF]/60 mb-1">
                      <span>0 (Safe)</span>
                      <span>1-2 (Warning)</span>
                      <span>3+ (Droppable)</span>
                    </div>
                    <div className={`w-full ${isDarkMode ? 'bg-[#FFFFFF]/10' : 'bg-gray-200'} rounded-full h-1.5`}>
                      <div 
                        className={`h-1.5 rounded-full ${
                          totalEffectiveAbsences >= 3 ? 'bg-[#A15353]' :
                          totalEffectiveAbsences >= 2 ? 'bg-[#FFA600]' :
                          totalEffectiveAbsences >= 1 ? 'bg-[#FFA600]/50' :
                          'bg-[#00A15D]'
                        }`}
                        style={{ width: `${Math.min(100, (totalEffectiveAbsences / 3) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {isCritical && (
                    <div className="mt-2 p-2 bg-[#A15353]/20 border border-[#A15353]/30 rounded">
                      <p className="text-[10px] font-semibold text-[#A15353]">
                        🚨 CRITICAL - DROPPABLE STATUS
                      </p>
                      <p className="text-[10px] text-[#A15353]/90 mt-0.5">
                        You have reached {totalEffectiveAbsences} effective absences. Students with 3 accumulated absences will be dropped from the course.
                      </p>
                    </div>
                  )}
                  
                  {isAtRisk && !isCritical && (
                    <div className="mt-2 p-2 bg-[#FFA600]/20 border border-[#FFA600]/30 rounded">
                      <p className="text-[10px] font-semibold text-[#FFA600]">
                        ⚠️ AT RISK
                      </p>
                      <p className="text-[10px] text-[#FFA600]/90 mt-0.5">
                        You have {totalEffectiveAbsences} effective absences. 1 more leads to being droppable.
                      </p>
                    </div>
                  )}
                  
                  {late >= 2 && late < 3 && (
                    <div className="mt-2 p-2 bg-[#FFA600]/20 border border-[#FFA600]/30 rounded">
                      <p className="text-[10px] font-semibold text-[#FFA600]">
                        ⚠️ LATE WARNING
                      </p>
                      <p className="text-[10px] text-[#FFA600]/90 mt-0.5">
                        You have {late} late arrivals. 3 late arrivals = 1 absence.
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-2 text-[10px] text-[#FFFFFF]/50">
                    <p>• 3 late arrivals = 1 absence</p>
                    <p>• 3 accumulated absences = Dropped from class</p>
                  </div>
                  
                  <div className="mt-2">
                    <button
                      onClick={handleOpenAbsencesEmail}
                      className="flex items-center justify-center gap-1 px-2 py-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] text-white text-[10px] font-semibold rounded hover:opacity-90 transition-all duration-200 w-full"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Email Professor About Absences</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="mb-1">
        <div 
          className={`cursor-pointer p-1.5 rounded ${getHoverBackground()} transition-colors`}
          onClick={() => toggleIndividualSuggestion(suggestion.type)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                suggestion.type === 'missed' ? 'bg-[#A15353]' :
                suggestion.type === 'failed' ? 'bg-[#A15353]' :
                suggestion.type === 'low' ? 'bg-[#FFA600]' :
                'bg-[#767EE0]'
              }`}></div>
              <span className={`text-xs flex-1 min-w-0 truncate ${getSecondaryTextColor()} group-hover:${getTextColor()} transition-colors`}>
                {suggestion.text}
              </span>
              {suggestion.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                  suggestion.type === 'missed' ? 'bg-[#A15353]/20 text-[#A15353]' :
                  suggestion.type === 'failed' ? 'bg-[#A15353]/20 text-[#A15353]' :
                  suggestion.type === 'low' ? 'bg-[#FFA600]/20 text-[#FFA600]' :
                  'bg-[#767EE0]/20 text-[#767EE0]'
                }`}>
                  {suggestion.count}
                </span>
              )}
            </div>
            <button className={`${getSecondaryTextColor()} ${isDarkMode ? 'hover:text-[#FFFFFF]' : 'hover:text-gray-900'} transition-colors ml-2`}>
              {isExpanded ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className={`ml-3 pl-3 border-l ${getDividerColor()} mt-1 mb-1 animate-slideDown`}>
            <div className="space-y-1">
              {activities.map((activity, index) => (
                <div key={activity.id || index} className={`p-2 ${getCardBackgroundColor()} rounded`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                        activity.status === 'passed' ? 'bg-[#00A15D]/20 text-[#00A15D]' :
                        activity.status === 'low' ? 'bg-[#FFA600]/20 text-[#FFA600]' :
                        activity.status === 'failed' ? 'bg-[#A15353]/20 text-[#A15353]' :
                        activity.status === 'missed' ? 'bg-[#A15353]/20 text-[#A15353]' :
                        'bg-[#767EE0]/20 text-[#767EE0]'
                      }`}>
                        {activity.activity_type} #{activity.task_number}
                      </span>
                      <span className={`text-xs font-medium ${getTextColor()} truncate max-w-[120px]`}>
                        {activity.title}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`flex items-center justify-between text-[10px] ${getSecondaryTextColor()}`}>
                    <div>
                      {activity.deadline && (
                        <span>Due: {new Date(activity.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                      {activity.grade !== null && (
                        <span className="ml-2">
                          Score: {activity.grade}/{activity.points}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewActivityFromSuggestion(activity)}
                        className={`p-0.5 rounded ${isDarkMode ? 'hover:bg-[#FFFFFF]/10' : 'hover:bg-gray-200'} transition-colors group`}
                        title="View Details"
                      >
                        <svg className={`w-3 h-3 opacity-70 group-hover:opacity-100 ${getSecondaryTextColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEmailActivityFromSuggestion(activity)}
                        className={`p-0.5 rounded ${isDarkMode ? 'hover:bg-[#FFFFFF]/10' : 'hover:bg-gray-200'} transition-colors group`}
                        title="Email Professor"
                      >
                        <svg className={`w-3 h-3 opacity-70 group-hover:opacity-100 ${getSecondaryTextColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Show loading skeleton if performance data is still loading
  if (performanceDataLoading || !isDataReady) {
    return (
      <div className={`p-3 ${getBackgroundColor()} rounded-lg border ${getDividerColor()}`}>
        <div className="flex items-start gap-3 mb-2">
          <div className="relative flex-shrink-0">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br ${isDarkMode ? 'from-[#23232C] to-[#1A1A22]' : 'from-gray-100 to-gray-200'} border-2 ${isDarkMode ? 'border-[#FFFFFF]/20' : 'border-gray-300'}`}>
              <div className={`animate-pulse ${isDarkMode ? 'bg-[#FFFFFF]/10' : 'bg-gray-300'} w-16 h-8 rounded`}></div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0 pt-2">
            <div className={`animate-pulse ${isDarkMode ? 'bg-[#FFFFFF]/10' : 'bg-gray-300'} w-32 h-3 rounded mb-2`}></div>
            <div className={`animate-pulse ${isDarkMode ? 'bg-[#FFFFFF]/10' : 'bg-gray-300'} w-full h-8 rounded mb-2`}></div>
            
            <div className="flex gap-1.5 mt-2">
              <div className={`animate-pulse ${isDarkMode ? 'bg-[#FFFFFF]/10' : 'bg-gray-300'} w-32 h-6 rounded`}></div>
              <div className={`animate-pulse ${isDarkMode ? 'bg-[#FFFFFF]/10' : 'bg-gray-300'} w-28 h-6 rounded`}></div>
            </div>
          </div>
        </div>
        
        <div className="mb-2">
          <div className={`flex justify-between text-xs ${getTextColor()} mb-0.5`}>
            <div className={`animate-pulse ${isDarkMode ? 'bg-[#FFFFFF]/10' : 'bg-gray-300'} w-24 h-3 rounded`}></div>
            <div className={`animate-pulse ${isDarkMode ? 'bg-[#FFFFFF]/10' : 'bg-gray-300'} w-16 h-3 rounded`}></div>
          </div>
          <div className={`w-full h-1.5 ${isDarkMode ? 'bg-[#23232C]' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div className={`animate-pulse ${isDarkMode ? 'bg-[#FFFFFF]/10' : 'bg-gray-300'} h-full rounded-full w-1/2`}></div>
          </div>
        </div>
      </div>
    );
  }

  // Email Modal Component
  const EmailModal = () => {
    const getButtonLabel = () => {
      switch(emailType) {
        case 'extra_work': return 'Request Extra Work';
        case 'contact': return 'Contact Professor';
        case 'specific_activity': return 'Ask About Activity';
        case 'absences': return 'Discuss Absences';
        default: return 'Send Email';
      }
    };

    return (
      <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
        <div className={`${getModalBackgroundColor()} rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border ${getModalBorderColor()}`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${getModalBorderColor()}`}>
            <div>
              <h3 className={`text-lg font-semibold ${getTextColor()}`}>Email Professor</h3>
              <p className={`text-sm ${getSecondaryTextColor()} mt-0.5`}>
                {performanceData?.teacherName || 'Professor'} • {performanceData?.teacherEmail || ''}
              </p>
            </div>
            <button
              onClick={() => setShowEmailModal(false)}
              className={`p-1.5 ${isDarkMode ? 'hover:bg-[#23232C]' : 'hover:bg-gray-100'} rounded transition-colors cursor-pointer`}
            >
              <img src={CrossIcon} alt="Close" className="w-5 h-5" style={!isDarkMode ? { filter: 'invert(0.5)' } : {}} />
            </button>
          </div>

          {/* Email Type Selection */}
          <div className={`p-4 border-b ${getModalBorderColor()}`}>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleEmailTypeChange('extra_work')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  emailType === 'extra_work'
                    ? 'bg-[#FFA600] text-white'
                    : `${getInputBackgroundColor()} ${getSecondaryTextColor()} ${isDarkMode ? 'hover:bg-[#2A2A35] hover:text-white' : 'hover:bg-gray-200 hover:text-gray-900'}`
                }`}
              >
                Ask for Extra Work
              </button>
              <button
                onClick={() => handleEmailTypeChange('contact')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  emailType === 'contact'
                    ? 'bg-[#A15353] text-white'
                    : `${getInputBackgroundColor()} ${getSecondaryTextColor()} ${isDarkMode ? 'hover:bg-[#2A2A35] hover:text-white' : 'hover:bg-gray-200 hover:text-gray-900'}`
                }`}
              >
                Contact Professor
              </button>
              {selectedActivityForEmail && (
                <button
                  onClick={() => handleEmailTypeChange('specific_activity')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    emailType === 'specific_activity'
                      ? 'bg-[#767EE0] text-white'
                      : `${getInputBackgroundColor()} ${getSecondaryTextColor()} ${isDarkMode ? 'hover:bg-[#2A2A35] hover:text-white' : 'hover:bg-gray-200 hover:text-gray-900'}`
                }`}
                >
                  About Specific Activity
                </button>
              )}
              <button
                onClick={() => handleEmailTypeChange('absences')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  emailType === 'absences'
                    ? 'bg-[#FF6B6B] text-white'
                    : `${getInputBackgroundColor()} ${getSecondaryTextColor()} ${isDarkMode ? 'hover:bg-[#2A2A35] hover:text-white' : 'hover:bg-gray-200 hover:text-gray-900'}`
                }`}
              >
                Discuss Absences
              </button>
            </div>
          </div>

          {/* Email Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className={`block text-sm font-medium ${getTextColor()} mb-1`}>Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className={`w-full px-3 py-2 ${getInputBackgroundColor()} border ${getInputBorderColor()} rounded ${getTextColor()} text-sm focus:outline-none focus:border-[#767EE0]`}
                  placeholder="Email subject"
                />
              </div>

              {/* Message */}
              <div>
                <label className={`block text-sm font-medium ${getTextColor()} mb-1`}>Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={12}
                  className={`w-full px-3 py-2 ${getInputBackgroundColor()} border ${getInputBorderColor()} rounded ${getTextColor()} text-sm focus:outline-none focus:border-[#767EE0] resize-none`}
                  placeholder="Write your message here..."
                />
              </div>

              {/* Email Preview Info */}
              <div className={`${getCardBackgroundColor()} rounded-lg p-3 border ${getDividerColor()}`}>
                <h4 className={`text-sm font-medium ${getTextColor()} mb-2`}>Email Preview</h4>
                <div className={`space-y-2 text-xs ${getSecondaryTextColor()}`}>
                  <p><strong className={getTextColor()}>To:</strong> {performanceData?.teacherEmail || 'Not available'}</p>
                  <p><strong className={getTextColor()}>From:</strong> {studentEmail || `${formattedStudentName} (Student ID: ${studentId})`}</p>
                  <p><strong className={getTextColor()}>Subject:</strong> {emailSubject || 'No subject'}</p>
                  <div className={`mt-2 p-2 ${getBackgroundColor()} rounded border ${getDividerColor()}`}>
                    <p className={`text-xs ${getMutedTextColor()} whitespace-pre-wrap`}>{emailMessage.substring(0, 150)}...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`flex justify-end gap-2 p-4 border-t ${getModalBorderColor()} ${isDarkMode ? 'bg-[#23232C]/30' : 'bg-gray-50'}`}>
            <button
              onClick={() => setShowEmailModal(false)}
              className={`px-4 py-2 text-sm font-medium ${getSecondaryTextColor()} ${isDarkMode ? 'bg-[#2D2D3A]' : 'bg-gray-200'} border ${getInputBorderColor()} rounded ${isDarkMode ? 'hover:bg-[#374151]' : 'hover:bg-gray-300'} transition-colors cursor-pointer`}
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={!emailSubject.trim() || !emailMessage.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded transition-colors cursor-pointer ${
                !emailSubject.trim() || !emailMessage.trim()
                  ? 'bg-gray-600 cursor-not-allowed'
                  : emailType === 'extra_work' ? 'bg-gradient-to-r from-[#FFA600] to-[#E59400] hover:opacity-90' :
                    emailType === 'contact' ? 'bg-gradient-to-r from-[#A15353] to-[#8B3A3A] hover:opacity-90' :
                    emailType === 'specific_activity' ? 'bg-gradient-to-r from-[#767EE0] to-[#5a62c4] hover:opacity-90' :
                    emailType === 'absences' ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] hover:opacity-90' :
                    'bg-gradient-to-r from-[#00A15D] to-[#00874E] hover:opacity-90'
              }`}
            >
              {getButtonLabel()} via Gmail
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main Container */}
      <div className={`p-3 ${getBackgroundColor()} rounded-lg border ${getDividerColor()}`}>
        {/* First Row: Big Percentage + Message */}
        <div className="flex items-start gap-3 mb-2">
          {/* Big Percentage Circle */}
          <div className="relative flex-shrink-0">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br ${isDarkMode ? 'from-[#23232C] to-[#1A1A22]' : 'from-gray-100 to-gray-200'} border-2 shadow-xl ${getPerformanceBorderColor(localPerformanceSummary?.percentage || 0)}`}>
              <span className={`text-4xl font-bold ${getPerformanceColor(localPerformanceSummary?.percentage || 0)}`}>
                {formatPercentageForCircle(localPerformanceSummary?.percentage || 0)}%
              </span>
            </div>
            
            {/* Show warning icon if 70% and below */}
            {(localPerformanceSummary?.percentage || 0) <= 70 && (
              <div className="absolute -top-1 -right-1">
                <img src={WarningIcon} alt="Failing" className="w-5 h-5" />
              </div>
            )}
            
            {/* Show check icon if above 75% */}
            {(localPerformanceSummary?.percentage || 0) >= 75 && (
              <div className="absolute -top-1 -right-1">
                <img src={CheckCircleIcon} alt="Excellent" className="w-5 h-5" />
              </div>
            )}
          </div>
          
          {/* Message Area */}
          <div className="flex-1 min-w-0 pt-2">
            <h3 className={`text-xs font-semibold ${getTextColor()} mb-1`}>Current Performance</h3>
            <div className="flex items-center gap-1.5">
              {(localPerformanceSummary?.status === "warning" || localPerformanceSummary?.status === "urgent") && (
                <img src={TrackEdIcon} alt="Warning" className="w-3 h-3 flex-shrink-0"
                  style={!isDarkMode ? { filter: 'invert(0.5)' } : {}} />
              )}
              <p className={`text-xs flex-1 min-w-0 ${
                localPerformanceSummary?.status === "excellent" ? "text-[#00A15D]" :
                localPerformanceSummary?.status === "warning" ? "text-[#FFA600]" :
                localPerformanceSummary?.status === "urgent" ? "text-[#A15353]" :
                "text-[#A15353]"
              }`}>
                {localPerformanceSummary?.message || 'Loading performance data...'}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-1.5 mt-2">
              {localPerformanceSummary?.needsImprovement && (
                <button
                  onClick={handleOpenExtraWorkEmail}
                  disabled={!performanceData?.teacherEmail}
                  className={`flex items-center justify-center gap-1 px-3 py-1 text-white text-xs font-semibold rounded hover:opacity-90 transition-all duration-200 shadow whitespace-nowrap ${
                    performanceData?.teacherEmail 
                      ? 'bg-gradient-to-r from-[#FFA600] to-[#FF8C00]' 
                      : 'bg-gradient-to-r from-[#767EE0] to-[#6369B5] opacity-50 cursor-not-allowed'
                  }`}
                  title={performanceData?.teacherEmail ? 'Ask for extra work' : 'Professor email not available'}
                >
                  <img src={EmailIcon} alt="Email" className="w-3 h-3"
                    style={!isDarkMode ? { filter: 'invert(1)' } : {}} />
                  <span>
                    {performanceData?.teacherEmail ? 'Ask for Extra Work' : 'Email Unavailable'}
                  </span>
                </button>
              )}
              
              {localPerformanceSummary?.critical && (
                <button
                  onClick={handleOpenContactEmail}
                  disabled={!performanceData?.teacherEmail}
                  className={`flex items-center justify-center gap-1 px-3 py-1 text-white text-xs font-semibold rounded hover:opacity-90 transition-all duration-200 shadow whitespace-nowrap ${
                    performanceData?.teacherEmail 
                      ? 'bg-gradient-to-r from-[#A15353] to-[#8B3A3A]' 
                      : 'bg-gradient-to-r from-[#767EE0] to-[#6369B5] opacity-50 cursor-not-allowed'
                  }`}
                  title={performanceData?.teacherEmail ? 'Contact professor' : 'Professor email not available'}
                >
                  <img src={WarningIcon} alt="Warning" className="w-3 h-3"
                    style={!isDarkMode ? { filter: 'invert(1)' } : {}} />
                  <span>
                    {performanceData?.teacherEmail ? 'Contact Professor' : 'Email Unavailable'}
                  </span>
                </button>
              )}
              
              {/* Show generic contact button */}
              {!localPerformanceSummary?.needsImprovement && !localPerformanceSummary?.critical && performanceData?.teacherEmail && (
                <button
                  onClick={handleOpenContactEmail}
                  className="flex items-center justify-center gap-1 px-3 py-1 bg-gradient-to-r from-[#767EE0] to-[#5a62c4] text-white text-xs font-semibold rounded hover:opacity-90 transition-all duration-200 shadow whitespace-nowrap"
                >
                  <img src={EmailIcon} alt="Email" className="w-3 h-3"
                    style={!isDarkMode ? { filter: 'invert(1)' } : {}} />
                  <span>Contact Professor</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Second Row: Progress Bar */}
        <div className="mb-2">
          <div className={`flex justify-between text-xs ${getTextColor()} mb-0.5`}>
            <span>Current Performance</span>
            <span className={`font-medium ${getPerformanceColor(localPerformanceSummary?.percentage || 0)}`}>
              {formatPercentageForGauge(localPerformanceSummary?.percentage || 0)}%
            </span>
          </div>
          <div className={`w-full h-1.5 ${isDarkMode ? 'bg-[#23232C]' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(localPerformanceSummary?.percentage || 0, 100)}%`,
                background: getCurrentPerformanceGradient(localPerformanceSummary?.percentage || 0)
              }}
            ></div>
          </div>
          <div className={`flex justify-between text-[10px] ${getSecondaryTextColor()} mt-0.5`}>
            <span>0%</span>
            <span>70%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Failing Warning Message (70% and below) */}
        {(localPerformanceSummary?.percentage || 0) <= 70 && (
          <div className="bg-[#A15353]/20 border border-[#A15353]/30 rounded-md p-2 mb-2">
            <div className="flex items-center gap-2">
              <img src={WarningIcon} alt="Warning" className="w-3 h-3" />
              <span className="text-xs font-medium text-[#A15353]">
                Failing Warning: Your current performance is below 71%
              </span>
              {performanceData?.teacherEmail && (
                <button
                  onClick={handleOpenContactEmail}
                  className="ml-auto flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#A15353] to-[#8B3A3A] text-white text-[10px] font-semibold rounded hover:opacity-90 transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email Professor</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Third Row: Suggestions Section as a Dropdown */}
        {localPerformanceSummary?.suggestions && localPerformanceSummary.suggestions.length > 0 && (
          <div className={`pt-2 border-t ${getDividerColor()}`}>
            <div 
              className="cursor-pointer transition-all duration-200 mb-1"
              onClick={() => setExpandedSuggestionsSection(!expandedSuggestionsSection)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-[#FF5252]/20">
                    <div className="text-[#FF5252]">
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold ${getTextColor()}`}>
                      Suggestions
                    </h3>
                    <div className={`text-xs ${getSecondaryTextColor()}`}>
                      {localPerformanceSummary.suggestions.length} suggestion{localPerformanceSummary.suggestions.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <button className={`${getTextColor()} ${isDarkMode ? 'hover:text-[#FFFFFF]/80' : 'hover:text-gray-700'} transition-colors`}>
                    {expandedSuggestionsSection ? (
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

            {expandedSuggestionsSection && (
              <div className="mt-2 animate-slideDown">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${getSecondaryTextColor()}`}>Click on suggestions to expand:</span>
                  <span className={`text-[10px] ${getSecondaryTextColor()}`}>
                    Passing grade: 75%
                  </span>
                </div>
                <ul className={`text-xs ${getSecondaryTextColor()} space-y-1`}>
                  {localPerformanceSummary.suggestions.map((suggestion, index) => {
                    let activities = [];
                    switch (suggestion.type) {
                      case 'missed':
                        activities = localPerformanceSummary.suggestionsData?.missed || [];
                        break;
                      case 'failed':
                        activities = localPerformanceSummary.suggestionsData?.failed || [];
                        break;
                      case 'low':
                        activities = localPerformanceSummary.suggestionsData?.low || [];
                        break;
                      case 'pending':
                        activities = localPerformanceSummary.suggestionsData?.pending || [];
                        break;
                      case 'absences':
                        activities = localPerformanceSummary.suggestionsData?.absences || [];
                        break;
                      default:
                        activities = [];
                    }

                    return (
                      <li key={index}>
                        {renderIndividualSuggestionDropdown(suggestion, activities)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && <EmailModal />}

      {/* Student Activity Details Modal */}
      {showActivityDetails && selectedActivity && studentId && (
        <StudentActivityDetails
          activity={selectedActivity}
          isOpen={showActivityDetails}
          onClose={() => {
            setShowActivityDetails(false);
            setSelectedActivity(null);
            setCurrentCategory('');
          }}
          onActivitySubmitted={(activityId) => {
            handleActivitySubmitted(activityId);
            setShowActivityDetails(false);
            setSelectedActivity(null);
            setCurrentCategory('');
          }}
          studentId={studentId}
          teacherEmail={performanceData?.teacherEmail}
          teacherName={performanceData?.teacherName}
          subjectName={currentSubject?.subject}
          gradeInfo={{
            grade: selectedActivity.grade,
            maxScore: selectedActivity.points || 100,
            gradeDisplay: selectedActivity.grade !== null ? 
              `${selectedActivity.grade}/${selectedActivity.points}` : 'Not Graded',
            gradeColor: getActivityStatusColor(selectedActivity)
          }}
          isDarkMode={isDarkMode}
        />
      )}
      
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-5px);
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
    </>
  );
};

export default StudentPerformanceSummary;