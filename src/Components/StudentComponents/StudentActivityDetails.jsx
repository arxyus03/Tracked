import React, { useState, useEffect } from 'react';
import Close from "../../assets/Cross(Light).svg";
import Add from "../../assets/Add(Light).svg";
import FileIcon from "../../assets/File(Light).svg";
import ImageIcon from "../../assets/Image.svg";
import DownloadIcon from "../../assets/Download(Light).svg";
import MascotIcon from "../../assets/TrackED.svg";
import EmailIcon from "../../assets/Email.svg";
import DocIcon from "../../assets/Document.svg";
import PdfIcon from "../../assets/PDF.svg"; 
import VideoIcon from "../../assets/Video.svg";
import AudioIcon from "../../assets/Audio.svg"; 
import ArchiveIcon from "../../assets/Archive.svg"; 
import CrossIcon from "../../assets/Cross.svg";

const StudentActivityDetails = ({ 
  activity, 
  isOpen, 
  onClose, 
  studentId, 
  teacherEmail, 
  teacherName, 
  subjectName,
  onActivitySubmitted // New prop for activity submission callback
}) => {
  const [professorFiles, setProfessorFiles] = useState([]);
  const [studentFiles, setStudentFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activityDetails, setActivityDetails] = useState(null);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // New states for pending upload
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);
  const [showTurnInButtons, setShowTurnInButtons] = useState(false);
  
  // Error states for file loading
  const [imageError, setImageError] = useState(false);
  const [, setPendingFileError] = useState(false);
  const [professorFileErrors, setProfessorFileErrors] = useState({});

  // Email modal states (similar to StudentPerformanceSummary)
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const BACKEND_URL = 'https://tracked.6minds.site/Student/SubjectDetailsStudentDB';

  // Reset error states when files change
  useEffect(() => {
    setImageError(false);
  }, [studentFiles]);

  useEffect(() => {
    setPendingFileError(false);
  }, [pendingPreview]);

  useEffect(() => {
    // Initialize professor file errors
    if (professorFiles.length > 0) {
      const errors = {};
      professorFiles.forEach((file, index) => {
        if (file.file_url || file.url) {
          errors[index] = false;
        }
      });
      setProfessorFileErrors(errors);
    }
  }, [professorFiles]);

  // Check if activity is missed (deadline passed and not submitted)
  const isActivityMissed = () => {
    const currentActivity = activityDetails || activity;
    if (!currentActivity) return false;
    
    // If already submitted, it's not missed
    if (currentActivity.submitted === 1 || currentActivity.submitted === true || currentActivity.submitted === '1') {
      return false;
    }
    
    // Check if deadline has passed
    if (currentActivity.deadline && currentActivity.deadline !== "No deadline") {
      try {
        const deadlineDate = new Date(currentActivity.deadline);
        const now = new Date();
        return deadlineDate.getTime() < now.getTime();
      } catch {
        return false;
      }
    }
    
    return false;
  };

  // Check if activity is submitted
  const isActivitySubmitted = () => {
    const currentActivity = activityDetails || activity;
    if (!currentActivity) return false;
    return currentActivity.submitted === 1 || currentActivity.submitted === true || currentActivity.submitted === '1';
  };

  // Check if student can upload (not missed and not submitted)
  const canStudentUpload = () => {
    return !isActivityMissed() && !isActivitySubmitted();
  };

  // Get grade recommendation based on percentage
  const getGradeRecommendation = (percentage) => {
    if (percentage >= 90) {
      return {
        text: "Excellent work! You've mastered this activity. Keep up the great performance.",
        color: "text-[#00A15D]",
        bgColor: "bg-[#00A15D]/10",
        borderColor: "border-[#00A15D]/30",
        performanceLevel: "Excellent"
      };
    } else if (percentage >= 75) {
      return {
        text: "Good job! You have a solid understanding of the material. Review any minor mistakes for improvement.",
        color: "text-[#00A15D]",
        bgColor: "bg-[#00A15D]/10",
        borderColor: "border-[#00A15D]/30",
        performanceLevel: "Good"
      };
    } else if (percentage >= 60) {
      return {
        text: "Almost there! You passed but consider reviewing the material and professor's feedback to improve.",
        color: "text-[#FFA600]",
        bgColor: "bg-[#FFA600]/10",
        borderColor: "border-[#FFA600]/30",
        performanceLevel: "Needs Improvement"
      };
    } else {
      return {
        text: "Let's improve this! Consider reviewing the instructions, seeking help from your professor, and practicing similar tasks.",
        color: "text-[#A15353]",
        bgColor: "bg-[#A15353]/10",
        borderColor: "border-[#A15353]/30",
        performanceLevel: "Needs Work"
      };
    }
  };

  // Get activity type color - Updated to include Remedial and Exam
  const getActivityTypeColor = (type) => {
    const colors = {
      'Assignment': 'bg-[#767EE0]/20 text-[#767EE0]',
      'Quiz': 'bg-[#B39DDB]/20 text-[#B39DDB]',
      'Activity': 'bg-[#00A15D]/20 text-[#00A15D]',
      'Project': 'bg-[#FFA600]/20 text-[#FFA600]',
      'Laboratory': 'bg-[#A15353]/20 text-[#A15353]',
      'Exam': 'bg-[#FF5252]/20 text-[#FF5252]',
      'Remedial': 'bg-[#3B82F6]/20 text-[#3B82F6]'
    };
    return colors[type] || 'bg-[#FFFFFF]/10 text-[#FFFFFF]/80';
  };

  // Function to generate email message for missed activity
  const generateMissedActivityEmail = () => {
    const currentActivity = activityDetails || activity;
    const studentName = localStorage.getItem('user_name') || 'Student';
    
    const subject = `Missed Activity: ${currentActivity.title} - ${subjectName || 'Subject'}`;
    
    let message = `Dear ${teacherName || 'Professor'},\n\n`;
    message += `I am writing regarding the missed activity in ${subjectName || 'your class'}:\n\n`;
    message += `ACTIVITY DETAILS:\n`;
    message += `- Activity: ${currentActivity.title}\n`;
    message += `- Type: ${currentActivity.activity_type} #${currentActivity.task_number}\n`;
    message += `- Student ID: ${studentId}\n`;
    if (studentName) message += `- Student Name: ${studentName}\n`;
    if (subjectName) message += `- Subject: ${subjectName}\n`;
    if (currentActivity.deadline && currentActivity.deadline !== "No deadline") {
      message += `- Deadline: ${formatDate(currentActivity.deadline)}\n`;
    }
    message += `\n`;
    message += `I missed the deadline for this activity. Could you please advise if there is any way I can still submit this work or if there are alternative arrangements available?\n\n`;
    message += `Thank you for your understanding.\n\n`;
    message += `Sincerely,\n${studentName}\nStudent ID: ${studentId}`;
    
    return { subject, message };
  };

  // Function to generate email message for general activity question
  const generateActivityQuestionEmail = () => {
    const currentActivity = activityDetails || activity;
    const studentName = localStorage.getItem('user_name') || 'Student';
    const studentEmail = localStorage.getItem('user_email') || '';
    
    // Calculate percentage if grade exists
    const percentage = currentActivity.grade && currentActivity.points ? 
      Math.round((parseFloat(currentActivity.grade) / parseFloat(currentActivity.points)) * 100) : null;
    
    const subject = `Question about ${currentActivity.activity_type} ${currentActivity.task_number} - ${subjectName || 'Subject'}`;
    
    let message = `Dear ${teacherName || 'Professor'},\n\n`;
    message += `I have a question regarding the following activity:\n\n`;
    message += `STUDENT INFORMATION:\n`;
    message += `- Student ID: ${studentId}\n`;
    message += `- Student Name: ${studentName}\n`;
    if (studentEmail) message += `- Student Email: ${studentEmail}\n`;
    if (subjectName) message += `- Subject: ${subjectName}\n`;
    message += `\n`;
    message += `ACTIVITY DETAILS:\n`;
    message += `- Activity Type: ${currentActivity.activity_type}\n`;
    message += `- Task Number: ${currentActivity.task_number}\n`;
    message += `- Title: ${currentActivity.title}\n`;
    message += `- Deadline: ${currentActivity.deadline ? formatDate(currentActivity.deadline) : 'No deadline'}\n`;
    message += `- Status: ${isActivitySubmitted() ? 'Submitted' : isActivityMissed() ? 'Missed' : 'Not Submitted'}\n`;
    if (currentActivity.grade && currentActivity.points) {
      message += `- Score: ${currentActivity.grade}/${currentActivity.points}\n`;
    }
    if (percentage !== null) {
      message += `- Percentage: ${percentage}%\n`;
    }
    message += `\n`;
    message += `MY QUESTION:\n`;
    message += `[Please state your specific question about this activity here]\n\n`;
    message += `Thank you for your time and assistance.\n\n`;
    message += `Sincerely,\n${studentName}\nStudent ID: ${studentId}`;
    if (studentEmail) message += `\nEmail: ${studentEmail}`;
    
    return { subject, message };
  };

  // Handle email professor button click
  const handleEmailProfessorClick = (type = 'missed') => {
    if (!teacherEmail) {
      alert("Professor email not available. Please contact your professor directly.");
      return;
    }

    if (type === 'missed') {
      const { subject, message } = generateMissedActivityEmail();
      setEmailSubject(subject);
      setEmailMessage(message);
    } else {
      const { subject, message } = generateActivityQuestionEmail();
      setEmailSubject(subject);
      setEmailMessage(message);
    }
    
    setShowEmailModal(true);
  };

  // Send email using Gmail (similar to StudentPerformanceSummary)
  const handleSendEmail = () => {
    if (!teacherEmail) {
      alert("Professor email not available. Please contact your professor directly.");
      return;
    }

    // Encode subject and body for mailto link
    const encodedSubject = encodeURIComponent(emailSubject);
    const encodedBody = encodeURIComponent(emailMessage);
    
    // Create Gmail compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(teacherEmail)}&su=${encodedSubject}&body=${encodedBody}`;
    
    // Open Gmail in new tab
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    
    // Close modal
    setShowEmailModal(false);
  };

  // Email Modal Component
  const EmailModal = () => {
    return (
      <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[100] p-4">
        <div className="bg-[#15151C] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-[#FFFFFF]/10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#FFFFFF]/10">
            <div>
              <h3 className="text-lg font-semibold text-white">Email Professor</h3>
              <p className="text-sm text-[#FFFFFF]/60 mt-0.5">
                {teacherName || 'Professor'} • {teacherEmail || ''}
              </p>
            </div>
            <button
              onClick={() => setShowEmailModal(false)}
              className="p-1.5 hover:bg-[#23232C] rounded transition-colors cursor-pointer"
            >
              <img src={CrossIcon} alt="Close" className="w-5 h-5" />
            </button>
          </div>

          {/* Email Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-[#23232C] border border-[#FFFFFF]/20 rounded text-white text-sm focus:outline-none focus:border-[#767EE0]"
                  placeholder="Email subject"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 bg-[#23232C] border border-[#FFFFFF]/20 rounded text-white text-sm focus:outline-none focus:border-[#767EE0] resize-none"
                  placeholder="Write your message here..."
                />
              </div>

              {/* Email Preview Info */}
              <div className="bg-[#23232C]/50 rounded-lg p-3 border border-[#FFFFFF]/10">
                <h4 className="text-sm font-medium text-white mb-2">Email Preview</h4>
                <div className="space-y-2 text-xs text-[#FFFFFF]/70">
                  <p><strong className="text-white">To:</strong> {teacherEmail || 'Not available'}</p>
                  <p><strong className="text-white">From:</strong> {localStorage.getItem('user_email') || localStorage.getItem('user_name') || 'Student'}</p>
                  <p><strong className="text-white">Subject:</strong> {emailSubject || 'No subject'}</p>
                  <div className="mt-2 p-2 bg-[#15151C] rounded border border-[#FFFFFF]/5">
                    <p className="text-xs text-[#FFFFFF]/60 whitespace-pre-wrap">{emailMessage.substring(0, 150)}...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-[#FFFFFF]/10 bg-[#23232C]/30">
            <button
              onClick={() => setShowEmailModal(false)}
              className="px-4 py-2 text-sm font-medium text-[#FFFFFF]/70 bg-[#2D2D3A] border border-[#FFFFFF]/20 rounded hover:bg-[#374151] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={!emailSubject.trim() || !emailMessage.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded transition-colors cursor-pointer ${
                !emailSubject.trim() || !emailMessage.trim()
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#767EE0] to-[#5a62c4] hover:opacity-90'
              }`}
            >
              Send via Gmail
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (isOpen && activity && studentId) {
      fetchActivityDetails();
    }
  }, [isOpen, activity, studentId]);

  // Clean up pending preview URL on unmount
  useEffect(() => {
    return () => {
      if (pendingPreview) {
        URL.revokeObjectURL(pendingPreview);
      }
    };
  }, [pendingPreview]);

  const fetchActivityDetails = async () => {
    if (!activity?.id || !studentId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/get_activity_details_student.php?activity_id=${activity.id}&student_id=${studentId}`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setActivityDetails(result.activity);
          setProfessorFiles(result.professor_files || []);
          setStudentFiles(result.student_files || []);
        } else {
          setActivityDetails(activity);
        }
      } else {
        setActivityDetails(activity);
      }
    } catch (error) {
      console.error('Error:', error);
      setActivityDetails(activity);
    } finally {
      setIsLoading(false);
    }
  };

  // Format deadline date in UTC (as originally intended)
  const formatDate = (dateString) => {
    if (!dateString || dateString === "No deadline") return "No deadline";
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      // Format: Month Day, Year at HH:MM AM/PM (UTC)
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      };
      
      const formattedDate = date.toLocaleDateString('en-US', options);
      return formattedDate;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Format created date in Philippine Time (UTC+8)
  const formatCreatedDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "";
      }
      
      // Format: Month Day, Year at HH:MM AM/PM (Philippine Time)
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Manila'
      };
      
      const formattedDate = date.toLocaleDateString('en-US', options);
      return formattedDate;
    } catch (error) {
      console.error('Error formatting created date:', error);
      return "";
    }
  };

  const getDeadlineColor = (deadline) => {
    if (!deadline || deadline === "No deadline") return 'text-[#767EE0]';
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (timeDiff < 0) return 'text-[#A15353]';
    if (hoursDiff <= 24) return 'text-[#FFA600]';
    return 'text-[#00A15D]';
  };

  const getDeadlineLabel = (deadline) => {
    if (!deadline || deadline === "No deadline") return '';
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const timeDiff = deadlineDate.getTime() - now.getTime();
    if (timeDiff < 0) return 'Overdue';
    if (timeDiff <= 24 * 60 * 60 * 1000) return 'Urgent';
    return '';
  };

  // Get file icon based on file type
  const getFileIcon = (fileName, fileType) => {
    const name = fileName || '';
    const type = fileType || '';
    
    // Check by file extension first
    if (name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) || 
        type.startsWith('image/')) {
      return ImageIcon;
    } else if (name.match(/\.(pdf)$/i) || type.includes('pdf')) {
      return PdfIcon;
    } else if (name.match(/\.(doc|docx)$/i) || type.includes('word') || type.includes('document')) {
      return DocIcon;
    } else if (name.match(/\.(mp4|avi|mov|wmv|flv|mkv)$/i) || type.startsWith('video/')) {
      return VideoIcon;
    } else if (name.match(/\.(mp3|wav|ogg|flac|aac)$/i) || type.startsWith('audio/')) {
      return AudioIcon;
    } else if (name.match(/\.(zip|rar|7z|tar|gz)$/i) || type.includes('zip') || type.includes('compressed')) {
      return ArchiveIcon;
    } else {
      return FileIcon;
    }
  };

  // Check if file is an image
  const isImageFile = (file) => {
    const fileName = file.original_name || file.name || '';
    const fileUrl = file.file_url || file.url || '';
    const fileType = file.file_type || file.type || '';
    
    return fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) || 
           fileUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) ||
           fileType.startsWith('image/');
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = () => {
    // Check if student can upload
    if (!canStudentUpload()) {
      if (isActivityMissed()) {
        alert('Cannot upload: The deadline for this activity has passed.');
      } else if (isActivitySubmitted()) {
        alert('Cannot upload: This activity has already been submitted.');
      }
      return;
    }

    if (!studentId) {
      alert('Student ID not found');
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert('File must be < 50MB');
        return;
      }

      // Create preview for images only
      let previewUrl = null;
      if (isImageFile(file)) {
        previewUrl = URL.createObjectURL(file);
      }
      
      setPendingFile(file);
      setPendingPreview(previewUrl);
      setShowTurnInButtons(true);
    };
    
    input.click();
  };

  const handleTurnIn = async () => {
    if (!pendingFile || !studentId) {
      alert('No file to upload');
      return;
    }

    setIsUploading(true);
    
    try {
      // If student already has a file, delete it first
      if (studentFiles.length > 0) {
        for (const file of studentFiles) {
          await deleteFile(file.id, false);
        }
      }

      const formData = new FormData();
      formData.append('file', pendingFile);
      formData.append('activity_id', activity.id);
      formData.append('student_id', studentId);
      formData.append('file_type', 'student');

      const response = await fetch(`${BACKEND_URL}/upload-student-file.php`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      
      if (result.success) {
        alert('File uploaded successfully!');
        // Clear pending states
        setPendingFile(null);
        setShowTurnInButtons(false);
        if (pendingPreview) {
          URL.revokeObjectURL(pendingPreview);
          setPendingPreview(null);
        }
        // Refresh activity details
        fetchActivityDetails();
      } else {
        alert('Upload failed: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    // Clear pending states
    setPendingFile(null);
    setShowTurnInButtons(false);
    if (pendingPreview) {
      URL.revokeObjectURL(pendingPreview);
      setPendingPreview(null);
    }
  };

  const handleViewFile = (file) => {
    const fileUrl = file.file_url || file.url;
    if (fileUrl) {
      if (isImageFile(file)) {
        setSelectedImage({ url: fileUrl, name: file.original_name });
      } else {
        // For non-image files, open in new tab
        window.open(fileUrl, '_blank');
      }
    }
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  const deleteFile = async (fileId, showConfirm = true) => {
    // Check if student can modify files
    if (!canStudentUpload()) {
      if (isActivityMissed()) {
        alert('Cannot delete: The deadline for this activity has passed.');
      } else if (isActivitySubmitted()) {
        alert('Cannot delete: This activity has already been submitted.');
      }
      return;
    }

    if (showConfirm && !confirm('Delete this file?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/delete-student-file.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId })
      });
      const result = await response.json();
      if (result.success) {
        fetchActivityDetails();
      } else {
        alert('Delete failed');
      }
    } catch {
      alert('Delete failed');
    }
  };

  const handleSubmit = async () => {
    // Check if student can submit
    if (!canStudentUpload()) {
      if (isActivityMissed()) {
        alert('Cannot submit: The deadline for this activity has passed.');
      } else if (isActivitySubmitted()) {
        alert('Cannot submit: This activity has already been submitted.');
      }
      return;
    }

    if (studentFiles.length === 0) {
      alert('Upload a file first');
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/mark-as-submitted.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_id: activity.id,
          student_id: studentId
        })
      });
      const result = await response.json();
      if (result.success) {
        alert('Submitted!');
        fetchActivityDetails();
        
        // Notify parent component about activity submission
        if (onActivitySubmitted) {
          onActivitySubmitted(activity.id);
        }
      } else {
        alert('Submission failed');
      }
    } catch {
      alert('Submit error');
    }
  };

  const formatGrade = (grade) => {
    if (!grade || grade === '0') return null;
    const num = parseFloat(grade);
    return Math.floor(num) === num ? num : num.toFixed(1);
  };

  // Helper function to handle professor file errors
  const handleProfessorFileError = (index) => {
    setProfessorFileErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  if (!isOpen || !activity) return null;
  
  const currentActivity = activityDetails || activity;
  const hasGrade = currentActivity.grade && currentActivity.grade !== '0';
  const totalPoints = Math.floor(currentActivity.points || 0);
  const deadlineLabel = getDeadlineLabel(currentActivity.deadline);
  const missed = isActivityMissed();
  const submitted = isActivitySubmitted();
  const canUpload = canStudentUpload();
  
  // Calculate percentage if grade exists
  const percentage = hasGrade ? ((parseFloat(currentActivity.grade) / totalPoints) * 100).toFixed(0) : null;
  const gradeRecommendation = hasGrade ? getGradeRecommendation(parseInt(percentage)) : null;

  return (
    <>
      <div className="fixed inset-0 bg-[#23232C]/90 flex justify-center items-center z-50 p-2">
        <div className="bg-[#15151C] rounded-lg w-full max-w-2xl max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between p-3 border-b border-gray-800">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 ${getActivityTypeColor(currentActivity.activity_type)} text-xs font-medium rounded`}>
                  {currentActivity.activity_type} #{currentActivity.task_number}
                </span>
                {/* Added Edited label next to title */}
                {currentActivity.school_work_edited === 1 && (
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-[#3B82F6]/20 text-[#3B82F6]">
                    Edited
                  </span>
                )}
                {submitted && (
                  <span className="text-xs bg-[#00A15D] text-white px-2 py-0.5 rounded-full">
                    Submitted
                  </span>
                )}
                {missed && !submitted && (
                  <span className="text-xs bg-[#A15353] text-white px-2 py-0.5 rounded-full">
                    Missed
                  </span>
                )}
              </div>
              <h2 className="text-white font-bold truncate text-sm mt-1">
                {currentActivity.title}
              </h2>
              
              {/* Deadline and Created Date in header */}
              <div className="mt-2 space-y-1">
                {/* Deadline */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#FFFFFF]/60">Deadline:</span>
                  <span className={`text-xs font-medium ${getDeadlineColor(currentActivity.deadline)}`}>
                    {formatDate(currentActivity.deadline)}
                  </span>
                  {deadlineLabel && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#A15353]/20 text-[#A15353]">
                      {deadlineLabel}
                    </span>
                  )}
                </div>
                
                {/* Created Date (Posted Date) */}
                {currentActivity.created_at && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#FFFFFF]/60">Posted:</span>
                    <span className="text-xs font-medium text-[#FFFFFF]/80">
                      {formatCreatedDate(currentActivity.created_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[#FFA600] font-bold text-sm">{totalPoints} pts</div>
                <div className="text-gray-400 text-xs">Total Points</div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-800 rounded cursor-pointer ml-2"
              >
                <img src={Close} alt="Close" className="w-4 h-4 invert" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {isLoading ? (
              <div className="flex items-center justify-center p-6">
                <div className="w-8 h-8 border-2 border-[#767EE0] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Grade Section (only if has grade) */}
                {hasGrade && (
                  <div className="bg-[#23232C] rounded p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold text-sm">Your Grade</h3>
                      <span className="text-[#00A15D] text-sm font-medium">
                        {percentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <p className="text-white font-bold text-lg">
                        {formatGrade(currentActivity.grade)}/{totalPoints}
                      </p>
                    </div>
                    
                    {/* Grade Recommendation */}
                    {gradeRecommendation && (
                      <div className={`mt-3 p-3 rounded border ${gradeRecommendation.borderColor} ${gradeRecommendation.bgColor}`}>
                        <div className="flex items-start gap-3">
                          {/* Mascot Icon */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${gradeRecommendation.color.replace('text-', 'bg-')}/20 flex items-center justify-center`}>
                            <img src={MascotIcon} alt="Mascot" className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-xs font-bold mb-1 ${gradeRecommendation.color}`}>
                              {gradeRecommendation.performanceLevel}
                            </p>
                            <p className="text-white text-xs">
                              {gradeRecommendation.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Instructions with Scrollable Container */}
                <div className="bg-[#23232C] rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold text-sm">Instructions</h3>
                    {currentActivity.instruction && currentActivity.instruction.length > 150 && (
                      <button
                        onClick={() => setInstructionsExpanded(!instructionsExpanded)}
                        className="text-[#767EE0] text-xs font-medium cursor-pointer"
                      >
                        {instructionsExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                  
                  {/* Scrollable instructions container */}
                  <div className={`text-gray-200 text-sm whitespace-pre-wrap break-words overflow-y-auto custom-scrollbar ${
                    !instructionsExpanded && currentActivity.instruction && currentActivity.instruction.length > 150 
                      ? 'max-h-24' 
                      : ''
                  }`}>
                    {currentActivity.instruction || 'No instructions provided.'}
                  </div>
                  
                  {/* Link if exists */}
                  {currentActivity.link && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <a 
                        href={currentActivity.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#767EE0] text-sm font-medium break-all hover:underline flex items-center gap-1"
                      >
                        <img src={DownloadIcon} alt="Link" className="w-3 h-3 invert" />
                        <span>Reference Link</span>
                      </a>
                      <div className="text-xs text-gray-400 truncate mt-1">{currentActivity.link}</div>
                    </div>
                  )}
                </div>

                {/* Missed Activity Notice with Email Button */}
                {missed && !submitted && teacherEmail && (
                  <div className="bg-gradient-to-r from-[#A15353]/10 to-[#A15353]/5 border border-[#A15353]/30 rounded p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-[#A15353] font-semibold text-sm mb-1">Missed Activity</h3>
                        <p className="text-white text-xs">
                          The deadline for this activity has passed. You can contact your professor to request an extension or alternative arrangement.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEmailProfessorClick('missed')}
                      className="flex items-center justify-center gap-2 w-full mt-3 px-4 py-2 bg-gradient-to-r from-[#FFA600] to-[#FF8C00] text-white text-sm font-medium rounded cursor-pointer hover:opacity-90 transition-all duration-200 shadow"
                    >
                      <img src={EmailIcon} alt="Email" className="w-4 h-4" />
                      <span>Email Professor About This Activity</span>
                    </button>
                  </div>
                )}

                {/* Files Section */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Professor Files - Student can only view */}
                  <div className="bg-[#23232C] rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm">Professor's Files</h3>
                      <button
                        onClick={fetchActivityDetails}
                        className="text-[#767EE0] text-xs font-medium cursor-pointer"
                      >
                        Refresh
                      </button>
                    </div>
                    
                    {professorFiles.length > 0 ? (
                      <div className="space-y-3">
                        {/* Show professor's uploaded files */}
                        {professorFiles.map((file, index) => {
                          const isImage = isImageFile(file);
                          const hasError = professorFileErrors[index];
                          const fileIcon = getFileIcon(file.original_name, file.file_type);
                          
                          if (isImage && (file.file_url || file.url)) {
                            return (
                              <div key={index} className="space-y-3">
                                {/* Image preview - Show actual uploaded image */}
                                <div 
                                  className="w-full h-40 bg-[#15151C] rounded overflow-hidden cursor-pointer group relative"
                                  onClick={() => handleViewFile(file)}
                                >
                                  <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                    {!hasError ? (
                                      <img 
                                        src={file.file_url || file.url} 
                                        alt={file.original_name || 'Professor file'}
                                        className="w-full h-full object-contain"
                                        onError={() => handleProfessorFileError(index)}
                                        onLoad={() => setProfessorFileErrors(prev => ({ ...prev, [index]: false }))}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#23232C] to-[#15151C]">
                                        <img src={fileIcon} alt="File" className="w-8 h-8" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">View {isImage ? 'Image' : 'File'}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-medium truncate">
                                      {file.original_name}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                      {file.file_size ? formatFileSize(file.file_size) : ''}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          } else {
                            // Non-image files - show as clickable file items
                            return (
                              <div 
                                key={index}
                                className="flex items-center justify-between p-3 bg-[#15151C] rounded cursor-pointer hover:bg-[#15151C]/80 transition-colors"
                                onClick={() => handleViewFile(file)}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <img src={fileIcon} alt="File" className="w-6 h-6" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-medium truncate">
                                      {file.original_name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-gray-400 text-xs">
                                        {file.file_size ? formatFileSize(file.file_size) : ''}
                                      </p>
                                      {isImageFile(file) && (
                                        <span className="text-[#00A15D] text-xs bg-[#00A15D]/10 px-1.5 py-0.5 rounded">
                                          Image
                                        </span>
                                      )}
                                      {file.original_name?.match(/\.(pdf)$/i) && (
                                        <span className="text-[#FF4757] text-xs bg-[#FF4757]/10 px-1.5 py-0.5 rounded">
                                          PDF
                                        </span>
                                      )}
                                      {file.original_name?.match(/\.(doc|docx)$/i) && (
                                        <span className="text-[#2E8FF0] text-xs bg-[#2E8FF0]/10 px-1.5 py-0.5 rounded">
                                          DOC
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <img src={DownloadIcon} alt="Download" className="w-4 h-4 invert opacity-60" />
                              </div>
                            );
                          }
                        })}
                      </div>
                    ) : (
                      <div className="w-full h-40 border-2 border-dashed border-gray-700 rounded flex flex-col items-center justify-center bg-[#15151C]">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-700/20 to-gray-700/10 rounded-full flex items-center justify-center mb-2">
                          <img src={FileIcon} alt="File" className="w-5 h-5 invert" />
                        </div>
                        <p className="text-gray-400 text-sm font-medium">
                          No files from professor
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Student Files Section */}
                  <div className="bg-[#23232C] rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm">Your File</h3>
                      <span className="text-gray-400 text-xs">
                        {studentFiles.length > 0 ? 'Uploaded' : 'Not uploaded'}
                      </span>
                    </div>
                    
                    {!canUpload ? (
                      // CANNOT UPLOAD (missed or submitted) - View only
                      <div>
                        {studentFiles.length > 0 ? (
                          <div className="space-y-3">
                            {isImageFile(studentFiles[0]) ? (
                              // Image preview
                              <div 
                                className="w-full h-40 bg-[#15151C] rounded overflow-hidden cursor-pointer group relative"
                                onClick={() => handleViewFile(studentFiles[0])}
                              >
                                {/* Show actual uploaded image */}
                                {studentFiles[0].file_url || studentFiles[0].url ? (
                                  <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                    {!imageError ? (
                                      <img 
                                        src={studentFiles[0].file_url || studentFiles[0].url} 
                                        alt={studentFiles[0].original_name || 'Uploaded file'}
                                        className="w-full h-full object-contain"
                                        onError={() => setImageError(true)}
                                        onLoad={() => setImageError(false)}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#23232C] to-[#15151C]">
                                        <img src={getFileIcon(studentFiles[0].original_name, studentFiles[0].file_type)} alt="File" className="w-8 h-8" />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#23232C] to-[#15151C]">
                                    <img src={getFileIcon(studentFiles[0].original_name, studentFiles[0].file_type)} alt="File" className="w-8 h-8" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">View Image</span>
                                </div>
                              </div>
                            ) : (
                              // Non-image file display
                              <div 
                                className="flex items-center justify-between p-3 bg-[#15151C] rounded cursor-pointer hover:bg-[#15151C]/80 transition-colors"
                                onClick={() => handleViewFile(studentFiles[0])}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <img src={getFileIcon(studentFiles[0].original_name, studentFiles[0].file_type)} alt="File" className="w-6 h-6" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-medium truncate">
                                      {studentFiles[0].original_name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-gray-400 text-xs">
                                        {studentFiles[0].file_size ? formatFileSize(studentFiles[0].file_size) : ''}
                                      </p>
                                      {isImageFile(studentFiles[0]) && (
                                        <span className="text-[#00A15D] text-xs bg-[#00A15D]/10 px-1.5 py-0.5 rounded">
                                          Image
                                        </span>
                                      )}
                                      {studentFiles[0].original_name?.match(/\.(pdf)$/i) && (
                                        <span className="text-[#FF4757] text-xs bg-[#FF4757]/10 px-1.5 py-0.5 rounded">
                                          PDF
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <img src={DownloadIcon} alt="Download" className="w-4 h-4 invert opacity-60" />
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium truncate">
                                  {studentFiles[0].original_name}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {studentFiles[0].file_size ? formatFileSize(studentFiles[0].file_size) : ''}
                                </p>
                              </div>
                            </div>
                            <div className={`text-xs p-2 rounded ${
                              missed 
                                ? 'text-[#A15353] bg-[#A15353]/10' 
                                : 'text-[#00A15D] bg-[#00A15D]/10'
                            }`}>
                              {missed 
                                ? 'The deadline for this activity has passed. You can view your submission but cannot modify it.' 
                                : 'This activity has been submitted. You can view your submission but cannot modify it.'}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-40 border-2 border-dashed border-gray-700 rounded flex flex-col items-center justify-center bg-[#15151C]">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-700/20 to-gray-700/10 rounded-full flex items-center justify-center mb-2">
                              <img src={FileIcon} alt="File" className="w-5 h-5 invert" />
                            </div>
                            <p className="text-gray-400 text-sm font-medium">
                              {missed ? 'Activity Missed' : 'Submitted'}
                            </p>
                            <p className="text-gray-400 text-xs mt-1 text-center px-2">
                              {missed 
                                ? 'The deadline has passed. You cannot upload a file.' 
                                : 'You cannot modify a submitted activity.'}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      // CAN UPLOAD (active activity)
                      <>
                        {/* Show pending file preview with Turn In/Cancel buttons */}
                        {showTurnInButtons && pendingFile ? (
                          <div className="space-y-3">
                            {/* File preview */}
                            {pendingPreview && isImageFile(pendingFile) ? (
                              // Image preview
                              <div 
                                className="w-full h-40 bg-[#15151C] rounded overflow-hidden cursor-pointer group relative"
                                onClick={() => window.open(pendingPreview, '_blank')}
                              >
                                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                  <img 
                                    src={pendingPreview} 
                                    alt="Pending upload"
                                    className="w-full h-full object-contain"
                                    onError={() => setPendingFileError(true)}
                                    onLoad={() => setPendingFileError(false)}
                                  />
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">View Image</span>
                                </div>
                              </div>
                            ) : (
                              // Non-image file display
                              <div className="flex items-center justify-between p-3 bg-[#15151C] rounded">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <img src={getFileIcon(pendingFile.name, pendingFile.type)} alt="File" className="w-6 h-6" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-medium truncate">
                                      {pendingFile.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-gray-400 text-xs">
                                        {formatFileSize(pendingFile.size)}
                                      </p>
                                      {isImageFile(pendingFile) && (
                                        <span className="text-[#00A15D] text-xs bg-[#00A15D]/10 px-1.5 py-0.5 rounded">
                                          Image
                                        </span>
                                      )}
                                      {pendingFile.name.match(/\.(pdf)$/i) && (
                                        <span className="text-[#FF4757] text-xs bg-[#FF4757]/10 px-1.5 py-0.5 rounded">
                                          PDF
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium truncate">
                                  {pendingFile.name}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {formatFileSize(pendingFile.size)}
                                </p>
                              </div>
                            </div>
                            
                            {/* Turn In / Cancel buttons */}
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={handleCancelUpload}
                                className="flex-1 px-4 py-2 bg-[#A15353] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#A15353]/90 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleTurnIn}
                                disabled={isUploading}
                                className="flex-1 px-4 py-2 bg-[#00A15D] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#00A15D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isUploading ? 'Uploading...' : 'Turn In'}
                              </button>
                            </div>
                            
                            {isUploading && (
                              <div className="text-center">
                                <div className="w-4 h-4 border-2 border-[#00A15D] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-gray-400 text-xs mt-1">Uploading your file...</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          // No pending file - show uploaded file or upload area
                          <>
                            {studentFiles.length > 0 ? (
                              <div className="space-y-3">
                                {isImageFile(studentFiles[0]) ? (
                                  // Image preview
                                  <div 
                                    className="w-full h-40 bg-[#15151C] rounded overflow-hidden cursor-pointer group relative"
                                    onClick={() => handleViewFile(studentFiles[0])}
                                  >
                                    {studentFiles[0].file_url || studentFiles[0].url ? (
                                      <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                        {!imageError ? (
                                          <img 
                                            src={studentFiles[0].file_url || studentFiles[0].url} 
                                            alt={studentFiles[0].original_name || 'Uploaded file'}
                                            className="w-full h-full object-contain"
                                            onError={() => setImageError(true)}
                                            onLoad={() => setImageError(false)}
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#23232C] to-[#15151C]">
                                            <img src={getFileIcon(studentFiles[0].original_name, studentFiles[0].file_type)} alt="File" className="w-8 h-8" />
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#23232C] to-[#15151C]">
                                        <img src={getFileIcon(studentFiles[0].original_name, studentFiles[0].file_type)} alt="File" className="w-8 h-8" />
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="text-white font-medium text-sm">View Image</span>
                                    </div>
                                  </div>
                                ) : (
                                  // Non-image file display
                                  <div 
                                    className="flex items-center justify-between p-3 bg-[#15151C] rounded cursor-pointer hover:bg-[#15151C]/80 transition-colors"
                                    onClick={() => handleViewFile(studentFiles[0])}
                                  >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <img src={getFileIcon(studentFiles[0].original_name, studentFiles[0].file_type)} alt="File" className="w-6 h-6" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-medium truncate">
                                          {studentFiles[0].original_name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <p className="text-gray-400 text-xs">
                                            {studentFiles[0].file_size ? formatFileSize(studentFiles[0].file_size) : ''}
                                          </p>
                                          {isImageFile(studentFiles[0]) && (
                                            <span className="text-[#00A15D] text-xs bg-[#00A15D]/10 px-1.5 py-0.5 rounded">
                                              Image
                                            </span>
                                          )}
                                          {studentFiles[0].original_name?.match(/\.(pdf)$/i) && (
                                            <span className="text-[#FF4757] text-xs bg-[#FF4757]/10 px-1.5 py-0.5 rounded">
                                              PDF
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <img src={DownloadIcon} alt="Download" className="w-4 h-4 invert opacity-60" />
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-medium truncate">
                                      {studentFiles[0].original_name}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                      {studentFiles[0].file_size ? formatFileSize(studentFiles[0].file_size) : ''}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => deleteFile(studentFiles[0].id)}
                                    className="text-xs bg-[#A15353] text-white px-3 py-1 rounded cursor-pointer hover:bg-[#A15353]/90 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                                
                                <button
                                  onClick={handleFileSelect}
                                  className="w-full mt-2 py-2 bg-[#767EE0] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#767EE0]/90 transition-colors"
                                >
                                  Replace File
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="w-full h-40 border-2 border-dashed border-[#767EE0] rounded flex flex-col items-center justify-center cursor-pointer hover:border-[#00A15D] transition-colors group"
                                onClick={handleFileSelect}
                              >
                                <div className="w-12 h-12 bg-gradient-to-br from-[#767EE0]/20 to-[#767EE0]/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                  <img src={Add} alt="Add" className="w-5 h-5 invert" />
                                </div>
                                <p className="text-[#767EE0] text-sm font-medium">Select File</p>
                                <p className="text-gray-400 text-xs mt-1">Any file type - Max 50MB</p>
                                <div className="flex flex-wrap justify-center gap-1 mt-2">
                                  <span className="text-[#00A15D] text-[10px] bg-[#00A15D]/10 px-2 py-0.5 rounded">Images</span>
                                  <span className="text-[#FF4757] text-[10px] bg-[#FF4757]/10 px-2 py-0.5 rounded">PDF</span>
                                  <span className="text-[#2E8FF0] text-[10px] bg-[#2E8FF0]/10 px-2 py-0.5 rounded">DOC</span>
                                  <span className="text-[#FFA600] text-[10px] bg-[#FFA600]/10 px-2 py-0.5 rounded">Video</span>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-3 border-t border-gray-800">
            {/* Add email professor button */}
            {teacherEmail && (
              <button
                onClick={() => handleEmailProfessorClick('question')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#767EE0] to-[#5a62c4] text-white text-sm font-medium rounded-lg cursor-pointer hover:opacity-90 transition-all duration-200 shadow"
              >
                <img src={EmailIcon} alt="Email" className="w-4 h-4" />
                <span>Email Professor</span>
              </button>
            )}
            
            {canUpload && studentFiles.length > 0 && !showTurnInButtons && (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#00A15D] text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-[#00A15D]/90 transition-colors"
              >
                Mark as Submitted
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#00A15D] text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-[#00A15D]/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && <EmailModal />}

      {/* Image Viewer Modal (only for images) */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={handleCloseImage}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full z-10"
            >
              <img src={Close} alt="Close" className="w-5 h-5 invert" />
            </button>
            
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="max-w-full max-h-[85vh] object-contain rounded"
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded text-sm">
              {selectedImage.name}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentActivityDetails;