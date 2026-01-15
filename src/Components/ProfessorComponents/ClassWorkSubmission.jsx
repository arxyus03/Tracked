import React, { useState, useEffect, useRef } from 'react';
import ArrowDown from "../../assets/ArrowDown.svg";
import EmailIcon from "../../assets/Email.svg";
import Close from "../../assets/Close.svg";
import Cross from "../../assets/Cross.svg";
import DetailsIcon from "../../assets/Details.svg";
import ClockIcon from "../../assets/Deadline.svg";
import FileIcon from "../../assets/File.svg";
import ImageIcon from "../../assets/Image.svg";
import PdfIcon from "../../assets/PDF.svg";
import DocIcon from "../../assets/Document.svg";
import VideoIcon from "../../assets/Video.svg";
import AudioIcon from "../../assets/Audio.svg";
import ArchiveIcon from "../../assets/Archive.svg";
import DownloadIcon from "../../assets/Download(Light).svg";
import TrackEd from "../../assets/TrackEd.svg";
import TimeIcon from "../../assets/Clock.svg";

import StudentActivitiesDetails from './StudentActivitiesDetails';

const ClassWorkSubmission = ({ 
  activity, 
  isOpen, 
  onClose, 
  onSave,
  professorName,
  isDarkMode = true
}) => {
  const [filter, setFilter] = useState("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [localStudents, setLocalStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [instructionExpanded, setInstructionExpanded] = useState(false);
  const [activeView, setActiveView] = useState('students');
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [, setAssignTo] = useState("wholeClass");
  
  const [uploadedFilesList, setUploadedFilesList] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [fileRefreshKey, setFileRefreshKey] = useState(0);
  
  const scrollContainerRef = useRef(null);
  const filterButtonRef = useRef(null);
  const BACKEND_URL = 'https://tracked.6minds.site/Professor/SubjectDetailsDB';

  const CircularProgressBar = ({ percentage, color, size = 120, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className={`fill-none ${isDarkMode ? 'stroke-gray-700' : 'stroke-gray-300'}`}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="fill-none transition-all duration-1000 ease-out"
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${color}40)`
            }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-2xl font-bold"
            style={{ color: color }}
          >
            {percentage}%
          </span>
          <span className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Score
          </span>
        </div>
      </div>
    );
  };

  const formatDeadline = (dateString) => {
    if (!dateString || dateString === "No deadline") return "No deadline";
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
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

  const formatCreatedDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return "";
      }
      
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    return () => {
      const fileInputs = document.querySelectorAll('input[type="file"].dynamic-file-input');
      fileInputs.forEach(input => {
        if (input.parentNode) {
          input.parentNode.removeChild(input);
        }
      });
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterButtonRef.current && !filterButtonRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchActivityDetails = async () => {
    if (!activity?.id) return;
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/get_activity_details.php?activity_id=${activity.id}`
      );
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      
      if (result.success) {
        if (result.assign_to) {
          setAssignTo(result.assign_to);
        }
        
        const assignedStudents = result.students || [];
        
        const gradesResponse = await fetch(
          `${BACKEND_URL}/get_activity_grades.php?activity_id=${activity.id}`
        );
        
        if (gradesResponse.ok) {
          const gradesResult = await gradesResponse.json();
          
          if (gradesResult.success && gradesResult.grades) {
            const gradeMap = {};
            gradesResult.grades.forEach(grade => {
              let gradeValue = grade.grade;
              if (gradeValue !== null) {
                const gradeStr = gradeValue.toString();
                if (gradeStr.includes('.')) {
                  const [whole, decimal] = gradeStr.split('.');
                  if (decimal === '00' || decimal === '0' || decimal === '') {
                    gradeValue = whole;
                  } else {
                    gradeValue = parseFloat(gradeStr).toString();
                  }
                }
              }
              
              gradeMap[grade.student_ID] = {
                grade: gradeValue !== null ? gradeValue.toString() : '',
                submitted: grade.submitted === 1,
                late: grade.late === 1,
                submitted_at: grade.submitted_at,
                uploaded_file_url: grade.uploaded_file_url,
                uploaded_file_name: grade.uploaded_file_name
              };
            });
            
            const updatedStudents = assignedStudents.map(student => {
              const savedGrade = gradeMap[student.user_ID || student.tracked_ID];
              
              if (savedGrade) {
                return {
                  ...student,
                  user_ID: student.user_ID || student.tracked_ID,
                  user_Name: student.user_Name || `${student.tracked_firstname} ${student.tracked_lastname}`,
                  user_Email: student.user_Email || student.tracked_email,
                  grade: savedGrade.grade,
                  submitted: savedGrade.submitted,
                  late: savedGrade.late,
                  submitted_at: savedGrade.submitted_at,
                  uploaded_file_url: savedGrade.uploaded_file_url,
                  uploaded_file_name: savedGrade.uploaded_file_name
                };
              } else {
                return {
                  ...student,
                  user_ID: student.user_ID || student.tracked_ID,
                  user_Name: student.user_Name || `${student.tracked_firstname} ${student.tracked_lastname}`,
                  user_Email: student.user_Email || student.tracked_email,
                  grade: null,
                  submitted: false,
                  late: false,
                  submitted_at: null,
                  uploaded_file_url: null,
                  uploaded_file_name: null
                };
              }
            });
            
            setLocalStudents(updatedStudents);
            
            if (updatedStudents.length > 0 && !selectedStudent) {
              const firstStudent = updatedStudents[0];
              setSelectedStudent({ 
                id: firstStudent.user_ID, 
                name: firstStudent.user_Name 
              });
              fetchUploadedFiles(firstStudent.user_ID);
            }
          } else {
            const updatedStudents = assignedStudents.map(student => ({
              ...student,
              user_ID: student.user_ID || student.tracked_ID,
              user_Name: student.user_Name || `${student.tracked_firstname} ${student.tracked_lastname}`,
              user_Email: student.user_Email || student.tracked_email,
              grade: null,
              submitted: false,
              late: false,
              submitted_at: null,
              uploaded_file_url: null,
              uploaded_file_name: null
            }));
            
            setLocalStudents(updatedStudents);
            
            if (updatedStudents.length > 0 && !selectedStudent) {
              const firstStudent = updatedStudents[0];
              setSelectedStudent({ 
                id: firstStudent.user_ID, 
                name: firstStudent.user_Name 
              });
              fetchUploadedFiles(firstStudent.user_ID);
            }
          }
        }
      } else {
        const assignedStudents = activity.students || [];
        setLocalStudents(assignedStudents);
        
        if (assignedStudents.length > 0 && !selectedStudent) {
          const firstStudent = assignedStudents[0];
          setSelectedStudent({ 
            id: firstStudent.user_ID, 
            name: firstStudent.user_Name 
          });
          fetchUploadedFiles(firstStudent.user_ID);
        }
      }
    } catch (error) {
      console.error('Error fetching activity details:', error);
      const assignedStudents = activity.students || [];
      setLocalStudents(assignedStudents);
      
      if (assignedStudents.length > 0 && !selectedStudent) {
        const firstStudent = assignedStudents[0];
        setSelectedStudent({ 
          id: firstStudent.user_ID, 
          name: firstStudent.user_Name 
        });
        fetchUploadedFiles(firstStudent.user_ID);
      }
    }
  };

  const getFileIcon = (fileName, fileType) => {
    const name = fileName || '';
    const type = fileType || '';
    
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

  const isImageFile = (file) => {
    if (!file) return false;
    
    if (file.type?.startsWith('image/')) return true;
    
    if (file.name) {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      return imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    }
    
    if (file.url) {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      return imageExtensions.some(ext => file.url.toLowerCase().includes(ext));
    }
    
    return false;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0 || bytes === undefined || bytes === null) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFileToServer = async (file, studentId, uploadedBy = 'professor') => {
    if (!file) {
      console.error('No file provided');
      return null;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('activity_id', activity.id);
      formData.append('student_id', studentId);
      formData.append('uploaded_by', uploadedBy);

      const response = await fetch(`${BACKEND_URL}/upload-file.php`, {
        method: 'POST',
        body: formData
      });

      const responseText = await response.text();
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Server returned invalid JSON response');
      }
      
      if (result.success) {
        const newFile = {
          id: result.file?.id || Date.now(),
          name: result.file?.original_name || file.name,
          fileName: result.file?.file_name || file.name,
          url: result.file?.file_url || result.file?.url || result.url,
          size: result.file?.size || file.size,
          type: result.file?.type || file.type,
          uploaded_at: result.file?.uploaded_at || new Date().toISOString(),
          uploadedBy: uploadedBy
        };

        setUploadedFilesList(prev => {
          const currentFiles = prev[studentId] || { professor: [], student: [], all: [] };
          
          const updatedFiles = {
            professor: uploadedBy === 'professor' 
              ? [...currentFiles.professor, newFile] 
              : currentFiles.professor,
            student: uploadedBy === 'student' 
              ? [...currentFiles.student, newFile] 
              : currentFiles.student,
            all: [...currentFiles.all, newFile]
          };
          
          return {
            ...prev,
            [studentId]: updatedFiles
          };
        });

        if (uploadedBy === 'professor') {
          setLocalStudents(prev => prev.map(student =>
            student.user_ID === studentId
              ? {
                  ...student,
                  uploaded_file_url: newFile.url,
                  uploaded_file_name: newFile.name
                }
              : student
          ));
        }

        alert('File uploaded successfully!');
        
        setTimeout(() => {
          fetchUploadedFiles(studentId);
          setFileRefreshKey(prev => prev + 1);
          setRefreshTrigger(prev => prev + 1);
        }, 500);

        return newFile;
      } else {
        throw new Error(result.message || result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file: ' + error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const fetchUploadedFiles = async (studentId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/get-uploaded-files.php?activity_id=${activity.id}&student_id=${studentId}`
      );
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      
      if (result.success && result.files) {
        const filesMap = {
          professor: [],
          student: [],
          all: []
        };
        
        result.files.forEach(file => {
          const fileObj = {
            id: file.id,
            name: file.original_name || file.file_name,
            fileName: file.file_name,
            url: file.file_url || file.url,
            size: file.file_size,
            type: file.file_type,
            uploaded_at: file.uploaded_at,
            uploadedBy: file.uploaded_by || 'professor'
          };
          
          filesMap.all.push(fileObj);
          if (file.uploaded_by === 'professor') {
            filesMap.professor.push(fileObj);
          } else if (file.uploaded_by === 'student') {
            filesMap.student.push(fileObj);
          }
        });
        
        setUploadedFilesList(prev => ({
          ...prev,
          [studentId]: filesMap
        }));
        
        if (filesMap.professor.length > 0) {
          const latestProfessorFile = filesMap.professor[0];
          setLocalStudents(prev => prev.map(student =>
            student.user_ID === studentId
              ? {
                  ...student,
                  uploaded_file_url: latestProfessorFile.url,
                  uploaded_file_name: latestProfessorFile.name
                }
              : student
          ));
        }
      } else {
        setUploadedFilesList(prev => ({
          ...prev,
          [studentId]: {
            professor: [],
            student: [],
            all: []
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching uploaded files for student', studentId, ':', error);
      setUploadedFilesList(prev => ({
        ...prev,
        [studentId]: {
          professor: [],
          student: [],
          all: []
        }
      }));
    }
  };

  const handleDeleteFile = async (fileId, studentId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/delete-file.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId })
      });

      const responseText = await response.text();
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        if (responseText.toLowerCase().includes('success')) {
          result = { success: true, message: 'File deleted successfully' };
        } else {
          throw new Error('Server returned invalid response');
        }
      }
      
      if (result.success) {
        setUploadedFilesList(prev => {
          const studentFiles = prev[studentId];
          if (studentFiles) {
            const updatedFiles = {
              professor: studentFiles.professor.filter(file => file.id !== fileId),
              student: studentFiles.student.filter(file => file.id !== fileId),
              all: studentFiles.all.filter(file => file.id !== fileId)
            };
            
            return {
              ...prev,
              [studentId]: updatedFiles
            };
          }
          return prev;
        });
        
        setLocalStudents(prev => prev.map(student =>
          student.user_ID === studentId
            ? {
                ...student,
                uploaded_file_url: null,
                uploaded_file_name: null
              }
            : student
        ));
        
        alert('File deleted successfully');
        
        setTimeout(() => {
          fetchUploadedFiles(studentId);
          setFileRefreshKey(prev => prev + 1);
          setRefreshTrigger(prev => prev + 1);
        }, 300);
      } else {
        alert('Error deleting file: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file. Please try again. Error: ' + error.message);
    }
  };

  useEffect(() => {
    if (activity && activity.id) {
      fetchActivityDetails();
    }
  }, [activity, refreshTrigger, fileRefreshKey]);

  useEffect(() => {
    if (isMobile && selectedStudent && scrollContainerRef.current) {
      setActiveView('analytics');
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            left: scrollContainerRef.current.scrollWidth / 2,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [selectedStudent, isMobile]);

  const handleViewFile = (file) => {
    if (file?.url) {
      if (isImageFile(file)) {
        setViewingPhoto(file);
        setPhotoViewerOpen(true);
      } else {
        window.open(file.url, '_blank', 'noopener,noreferrer');
      }
    } else {
      alert('No file URL available');
    }
  };

  const handleProfessorFileUpload = async (studentId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.multiple = false;
    input.className = 'dynamic-file-input';
    input.style.display = 'none';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        if (input.parentNode) input.parentNode.removeChild(input);
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        if (input.parentNode) input.parentNode.removeChild(input);
        return;
      }

      try {
        const uploadedFile = await uploadFileToServer(file, studentId, 'professor');
        if (uploadedFile) {
          console.log('File uploaded successfully:', uploadedFile);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed: ' + error.message);
      } finally {
        if (input.parentNode) input.parentNode.removeChild(input);
      }
    };
    
    document.body.appendChild(input);
    input.click();
  };

  const filterOptions = ["All", "Submitted", "Assigned", "Missed", "Graded", "Not Graded"];

  const calculateStudentStatus = (student, activity) => {
    const currentTime = new Date();
    const activityDeadline = activity.deadline ? new Date(activity.deadline) : null;
    
    if (student.submitted) return 'Submitted';
    if (activityDeadline && activityDeadline < currentTime) return 'Missed';
    return 'Assigned';
  };

  const statusCounts = {
    submitted: localStudents.filter(student => calculateStudentStatus(student, activity) === 'Submitted').length,
    assigned: localStudents.filter(student => calculateStudentStatus(student, activity) === 'Assigned').length,
    missed: localStudents.filter(student => calculateStudentStatus(student, activity) === 'Missed').length
  };

  const filteredStudents = localStudents.filter(student => {
    const status = calculateStudentStatus(student, activity);
    
    switch (filter) {
      case "Submitted": return status === 'Submitted';
      case "Assigned": return status === 'Assigned';
      case "Missed": return status === 'Missed';
      case "Graded": return student.grade != null && student.grade !== '';
      case "Not Graded": return status === 'Submitted' && (student.grade == null || student.grade === '');
      default: return true;
    }
  });

  const handleGradeChange = (studentId, value) => {
    const maxPoints = activity.points || 100;
    
    let numericValue = value.replace(/[^0-9.]/g, '');
    
    if (numericValue.length > 1 && numericValue[0] === '0' && numericValue[1] !== '.') {
      numericValue = numericValue.substring(1);
    }
    
    if (numericValue === '') {
      setLocalStudents(prev => prev.map(student =>
        student.user_ID === studentId ? { ...student, grade: '' } : student
      ));
      return;
    }
    
    if (numericValue.includes('.')) {
      numericValue = numericValue.split('.')[0];
    }
    
    let intValue = parseInt(numericValue, 10);
    if (isNaN(intValue)) intValue = 0;
    
    if (intValue > maxPoints) intValue = maxPoints;
    if (intValue < 0) intValue = 0;
    
    setLocalStudents(prev => prev.map(student =>
      student.user_ID === studentId ? { ...student, grade: intValue.toString() } : student
    ));
  };

  const handleGradeBlur = (studentId, value) => {
    const maxPoints = activity.points || 100;
    
    if (value === '' || value === null || value === undefined) {
      setLocalStudents(prev => prev.map(student =>
        student.user_ID === studentId ? { ...student, grade: '' } : student
      ));
      return;
    }
    
    let cleanValue = value.toString().replace(/[^0-9]/g, '');
    
    if (cleanValue === '') {
      setLocalStudents(prev => prev.map(student =>
        student.user_ID === studentId ? { ...student, grade: '' } : student
      ));
      return;
    }
    
    let numericValue = parseInt(cleanValue, 10);
    if (isNaN(numericValue)) numericValue = 0;
    if (numericValue < 0) numericValue = 0;
    if (numericValue > maxPoints) numericValue = maxPoints;
    numericValue = Math.floor(numericValue);
    
    setLocalStudents(prev => prev.map(student =>
      student.user_ID === studentId ? { ...student, grade: numericValue.toString() } : student
    ));
  };

  const renderProgressBar = (analytics) => {
    if (!analytics) return null;
    
    const { percentage, progressColor, grade, totalPoints } = analytics;
    
    return (
      <div className="w-full flex flex-col items-center mb-4">
        <div className="mb-4">
          <CircularProgressBar 
            percentage={percentage} 
            color={progressColor}
            size={140}
            strokeWidth={12}
          />
        </div>
        
        <div className="text-center mb-3">
          <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {grade}/{totalPoints}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Points Earned
          </div>
        </div>
        
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Performance Level</span>
            <span 
              className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: `${progressColor}20`,
                color: progressColor,
                border: `1px solid ${progressColor}40`
              }}
            >
              {analytics.performanceLevel}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress</span>
            <div className="flex items-center gap-2">
              <div className={`w-24 h-2 rounded-full overflow-hidden ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`}>
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: progressColor,
                    boxShadow: `0 0 8px ${progressColor}40`
                  }}
                />
              </div>
              <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{percentage}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    try {
      const saveData = {
        activity_ID: activity.id,
        students: localStudents.map(student => {
          const hasGrade = student.grade && student.grade !== '';
          const shouldMarkAsSubmitted = hasGrade && !student.submitted;
          
          return {
            user_ID: student.user_ID,
            grade: student.grade || null,
            submitted: student.submitted || shouldMarkAsSubmitted,
            late: false,
            uploaded_file_url: student.uploaded_file_url || null,
            uploaded_file_name: student.uploaded_file_name || null
          };
        })
      };

      console.log('Saving data with files:', saveData);

      const response = await fetch(`${BACKEND_URL}/update_activity_grades.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        const updatedStudents = localStudents.map(student => {
          const hasGrade = student.grade && student.grade !== '';
          const shouldMarkAsSubmitted = hasGrade && !student.submitted;
          
          return {
            ...student,
            submitted: student.submitted || shouldMarkAsSubmitted,
            late: false
          };
        });
        
        setLocalStudents(updatedStudents);
        if (onSave) onSave(updatedStudents);
        
        fetchActivityDetails();
        if (selectedStudent?.id) {
          fetchUploadedFiles(selectedStudent.id);
        }
        
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
      } else {
        alert('Error saving grades: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Error saving grades. Please try again. Error: ' + error.message);
    }
  };

  const handleEmailStudent = (studentEmail, studentName) => {
    if (studentEmail) {
      const subject = `Regarding ${activity.title}`;
      const professorSurname = professorName ? professorName.split(' ').pop() : 'Professor';
      const body = `Dear ${studentName},\n\nI would like to discuss your submission for "${activity.title}".\n\nBest regards,\nProf. ${professorSurname}`;
      
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(studentEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('No email address found for this student.');
    }
  };

  const getProfessorFileCount = (studentId) => uploadedFilesList[studentId]?.professor?.length || 0;

  const getStudentFileCount = (studentId) => uploadedFilesList[studentId]?.student?.length || 0;

  const getStudentAnalytics = (student) => {
    if (!student) return null;
    
    const totalPoints = activity.points || 100;
    const studentGrade = student.grade ? parseFloat(student.grade) : 0;
    const percentage = totalPoints > 0 ? Math.round((studentGrade / totalPoints) * 100) : 0;
    
    let performanceLevel, feedback, showMascot = false;
    let progressColor, textColor, bgColor, borderColor;
    
    if (percentage >= 95) {
      performanceLevel = "Perfect Score!";
      feedback = "Outstanding work! Student has mastered this material.";
      showMascot = true;
      progressColor = "#00A15D";
      textColor = "#00A15D";
      bgColor = isDarkMode ? "bg-[#00A15D]/10" : "bg-[#00A15D]/5";
      borderColor = isDarkMode ? "border-[#00A15D]/20" : "border-[#00A15D]/10";
    } else if (percentage >= 85) {
      performanceLevel = "Excellent";
      feedback = "Great job! Minor improvements could make it perfect.";
      progressColor = "#00A15D";
      textColor = "#00A15D";
      bgColor = isDarkMode ? "bg-[#00A15D]/10" : "bg-[#00A15D]/5";
      borderColor = isDarkMode ? "border-[#00A15D]/20" : "border-[#00A15D]/10";
    } else if (percentage >= 75) {
      performanceLevel = "Good";
      feedback = "Solid understanding. Focus on details and accuracy.";
      progressColor = "#FFA600";
      textColor = "#FFA600";
      bgColor = isDarkMode ? "bg-[#FFA600]/10" : "bg-[#FFA600]/5";
      borderColor = isDarkMode ? "border-[#FFA600]/20" : "border-[#FFA600]/10";
    } else if (percentage >= 65) {
      performanceLevel = "Average";
      feedback = "Needs improvement. Review key concepts and practice more.";
      progressColor = "#F97316";
      textColor = "#F97316";
      bgColor = isDarkMode ? "bg-[#F97316]/10" : "bg-[#F97316]/5";
      borderColor = isDarkMode ? "border-[#F97316]/20" : "border-[#F97316]/10";
    } else if (percentage >= 50) {
      performanceLevel = "Below Average";
      feedback = "Requires attention. Consider additional support and review.";
      progressColor = "#A15353";
      textColor = "#A15353";
      bgColor = isDarkMode ? "bg-[#A15353]/10" : "bg-[#A15353]/5";
      borderColor = isDarkMode ? "border-[#A15353]/20" : "border-[#A15353]/10";
    } else {
      performanceLevel = "Needs Help";
      feedback = "Significant improvement needed. Schedule a meeting to discuss.";
      showMascot = true;
      progressColor = "#A15353";
      textColor = "#A15353";
      bgColor = isDarkMode ? "bg-[#A15353]/10" : "bg-[#A15353]/5";
      borderColor = isDarkMode ? "border-[#A15353]/20" : "border-[#A15353]/10";
    }
    
    return {
      percentage,
      performanceLevel,
      feedback,
      totalPoints,
      grade: studentGrade,
      showMascot,
      progressColor,
      textColor,
      bgColor,
      borderColor
    };
  };

  const handleStatusClick = (status) => setFilter(status);

  const scrollToStudents = () => {
    if (isMobile && scrollContainerRef.current) {
      setActiveView('students');
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const scrollToAnalytics = () => {
    if (isMobile && scrollContainerRef.current) {
      setActiveView('analytics');
      scrollContainerRef.current.scrollTo({ left: scrollContainerRef.current.scrollWidth / 2, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (isMobile && scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const containerWidth = scrollContainerRef.current.clientWidth;
      setActiveView(scrollLeft < containerWidth / 2 ? 'students' : 'analytics');
    }
  };

  const getFileTypeBadge = (fileName) => {
    if (!fileName) return null;
    
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) {
      return { text: 'IMAGE', color: isDarkMode ? 'bg-[#00A15D]/10 text-[#00A15D]' : 'bg-[#00A15D]/5 text-[#00A15D]' };
    } else if (fileName.match(/\.(pdf)$/i)) {
      return { text: 'PDF', color: isDarkMode ? 'bg-[#FF4757]/10 text-[#FF4757]' : 'bg-[#FF4757]/5 text-[#FF4757]' };
    } else if (fileName.match(/\.(doc|docx)$/i)) {
      return { text: 'DOC', color: isDarkMode ? 'bg-[#2E8FF0]/10 text-[#2E8FF0]' : 'bg-[#2E8FF0]/5 text-[#2E8FF0]' };
    } else if (fileName.match(/\.(mp4|avi|mov|wmv|flv|mkv)$/i)) {
      return { text: 'VIDEO', color: isDarkMode ? 'bg-[#FFA600]/10 text-[#FFA600]' : 'bg-[#FFA600]/5 text-[#FFA600]' };
    } else if (fileName.match(/\.(mp3|wav|ogg|flac|aac)$/i)) {
      return { text: 'AUDIO', color: isDarkMode ? 'bg-[#B39DDB]/10 text-[#B39DDB]' : 'bg-[#B39DDB]/5 text-[#B39DDB]' };
    } else if (fileName.match(/\.(zip|rar|7z|tar|gz)$/i)) {
      return { text: 'ARCHIVE', color: isDarkMode ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-[#F97316]/5 text-[#F97316]' };
    } else {
      return { text: 'FILE', color: isDarkMode ? 'bg-gray-700/20 text-gray-400' : 'bg-gray-300 text-gray-600' };
    }
  };

  const renderFileItem = (file, studentId, isProfessorFile = true) => {
    const isImage = isImageFile(file);
    const fileIcon = getFileIcon(file.name, file.type);
    const fileBadge = getFileTypeBadge(file.name);
    
    return (
      <div key={file.id} className={`flex items-start justify-between p-2 rounded mb-2 hover:transition-colors ${
        isDarkMode 
          ? 'bg-[#15151C] hover:bg-[#1a1a24]' 
          : 'bg-gray-50 hover:bg-gray-100'
      }`}>
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {isImage && file.url ? (
            <div 
              className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleViewFile(file)}
            >
              <img 
                src={file.url} 
                alt={file.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/64/374151/FFFFFF?text=${file.name.substring(0, 1).toUpperCase()}`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1">
                <span className="text-xs text-white bg-black/50 px-1 rounded">Click to expand</span>
              </div>
            </div>
          ) : (
            <div className={`w-10 h-10 flex items-center justify-center rounded flex-shrink-0 ${
              isDarkMode ? 'bg-[#23232C]' : 'bg-gray-100'
            }`}>
              <img 
                src={fileIcon} 
                alt="File" 
                className="w-5 h-5"
                style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <p 
                className={`text-xs font-medium truncate cursor-pointer hover:text-[#767EE0] ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
                onClick={() => handleViewFile(file)}
                title={file.name}
              >
                {file.name}
              </p>
              {fileBadge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${fileBadge.color}`}>
                  {fileBadge.text}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatFileSize(file.size)}</p>
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {file.uploadedBy === 'professor' ? 'Professor' : 'Student'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => handleViewFile(file)}
            className="text-xs bg-[#767EE0] text-white px-2 py-1 rounded hover:bg-[#5a62c4] cursor-pointer transition-colors flex items-center gap-1"
            title={isImage ? "View image" : "Open file"}
          >
            {isImage ? (
              <>
                <img src={ImageIcon} alt="View" className="w-3 h-3" />
                <span>View</span>
              </>
            ) : (
              <>
                <img src={DownloadIcon} alt="Open" className="w-3 h-3 invert" />
                <span>Open</span>
              </>
            )}
          </button>
          {isProfessorFile && (
            <button
              onClick={() => handleDeleteFile(file.id, studentId)}
              className="text-xs bg-[#A15353] text-white px-2 py-1 rounded hover:bg-[#8a3d3d] cursor-pointer transition-colors flex items-center gap-1"
              title="Delete file"
            >
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderInstructionWithLinks = (instruction) => {
    if (!instruction) return 'No instructions provided for this activity.';
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = instruction.split(urlRegex);
    
    if (parts.length === 1) return instruction;
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" 
            className="text-[#767EE0] hover:text-[#5a62c4] hover:underline break-all">
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const hasLinkInInstruction = (instruction) => {
    if (!instruction) return false;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(instruction);
  };

  if (!isOpen || !activity) return null;

  const studentAnalytics = selectedStudent ? 
    getStudentAnalytics(localStudents.find(s => s.user_ID === selectedStudent.id)) : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-2">
        <div className={`rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col mx-1 border ${
          isDarkMode ? 'bg-[#15151C] border-gray-700' : 'bg-white border-gray-300'
        } min-w-0`}>
          <div className={`flex items-center justify-between p-3 border-b flex-shrink-0 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-300'
          }`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[#767EE0] font-bold text-sm">
                  {activity.activity_type} #{activity.task_number}
                </span>
                {activity.school_work_edited === 1 && (
                  <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                    isDarkMode ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'bg-[#3B82F6]/10 text-[#3B82F6]'
                  }`}>
                    Edited
                  </span>
                )}
                <h2 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Student Submissions - {activity.title}</h2>
              </div>
              
              <div className="space-y-1 mt-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <img 
                      src={ClockIcon} 
                      alt="Deadline" 
                      className="w-3 h-3"
                      style={{ filter: 'invert(0.5)' }}
                    />
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>Deadline:</span>
                  </div>
                  <span className={`text-xs font-medium ${getDeadlineColor(activity.deadline)}`}>
                    {formatDeadline(activity.deadline)}
                  </span>
                </div>
                
                {activity.created_at && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <img 
                        src={TimeIcon} 
                        alt="Posted" 
                        className="w-3 h-3 opacity-60"
                        style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                      />
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>Posted:</span>
                    </div>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                      {formatCreatedDate(activity.created_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button onClick={onClose} className={`p-1 rounded transition-colors cursor-pointer flex-shrink-0 ml-1 ${
                isDarkMode ? 'hover:bg-[#23232C]' : 'hover:bg-gray-100'
              }`}>
                <img 
                  src={Cross} 
                  alt="Close" 
                  className="w-4 h-4"
                  style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                />
              </button>
            </div>
          </div>

          {isMobile && (
            <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} flex-shrink-0`}>
              <button onClick={scrollToStudents} className={`flex-1 py-2 text-center text-xs font-medium transition-colors ${
                  activeView === 'students' 
                    ? (isDarkMode ? 'text-[#767EE0] border-b-2 border-[#767EE0] bg-[#767EE0]/10' : 'text-[#767EE0] border-b-2 border-[#767EE0] bg-[#767EE0]/5')
                    : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#23232C]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')
                }`}>
                Students List
              </button>
              <button onClick={scrollToAnalytics} className={`flex-1 py-2 text-center text-xs font-medium transition-colors ${
                  activeView === 'analytics' 
                    ? (isDarkMode ? 'text-[#767EE0] border-b-2 border-[#767EE0] bg-[#767EE0]/10' : 'text-[#767EE0] border-b-2 border-[#767EE0] bg-[#767EE0]/5')
                    : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#23232C]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')
                }`} disabled={!selectedStudent}>
                Analytics
              </button>
            </div>
          )}

          <div ref={scrollContainerRef} className={`flex-1 overflow-auto ${isMobile ? 'overflow-x-auto snap-x snap-mandatory' : ''}`} onScroll={handleScroll}>
            <div className={`flex ${isMobile ? 'w-[200%] flex-row' : 'w-full flex-row'} min-h-0`}>
              <div className={`${isMobile ? 'w-1/2 flex-shrink-0 snap-start' : 'w-1/2'} h-full border-r flex flex-col overflow-hidden ${
                isDarkMode ? 'border-gray-700' : 'border-gray-300'
              }`}>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3">
                    <h3 className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Instructions</h3>
                    <div className="relative">
                      <div className={`text-xs whitespace-pre-wrap break-words ${
                        instructionExpanded ? '' : 'max-h-16 overflow-hidden'
                      } ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {renderInstructionWithLinks(activity.instruction)}
                      </div>
                      {activity.instruction && activity.instruction.length > 150 ? (
                        <button onClick={() => setInstructionExpanded(!instructionExpanded)}
                          className="text-xs text-[#767EE0] hover:text-[#5a62c4] font-medium mt-0.5 cursor-pointer">
                          {instructionExpanded ? 'Show less' : 'Show more'}
                        </button>
                      ) : null}
                    </div>
                    
                    {activity.link && !hasLinkInInstruction(activity.instruction) && (
                      <div className="mt-2">
                        <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reference Link:</p>
                        <a href={activity.link} target="_blank" rel="noopener noreferrer"
                          className="text-[#767EE0] hover:text-[#5a62c4] hover:underline text-xs break-all">
                          {activity.link}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="px-3 pb-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleStatusClick("Submitted")} className={`flex-1 border rounded p-2 text-center transition-all duration-200 cursor-pointer ${
                          filter === "Submitted" 
                            ? (isDarkMode ? "bg-[#00A15D]/20 border-[#00A15D] shadow-md" : "bg-[#00A15D]/10 border-[#00A15D] shadow-sm")
                            : (isDarkMode ? "bg-[#00A15D]/10 border-[#00A15D]/30 hover:bg-[#00A15D]/15" : "bg-[#00A15D]/5 border-[#00A15D]/20 hover:bg-[#00A15D]/10")
                        }`}>
                        <div className="text-base font-bold text-[#00A15D]">{statusCounts.submitted}</div>
                        <div className="text-xs text-[#00A15D]">Submitted</div>
                      </button>
                      <button onClick={() => handleStatusClick("Assigned")} className={`flex-1 border rounded p-2 text-center transition-all duration-200 cursor-pointer ${
                          filter === "Assigned" 
                            ? (isDarkMode ? "bg-[#767EE0]/20 border-[#767EE0] shadow-md" : "bg-[#767EE0]/10 border-[#767EE0] shadow-sm")
                            : (isDarkMode ? "bg-[#767EE0]/15 border-[#767EE0]/30 hover:bg-[#767EE0]/20" : "bg-[#767EE0]/5 border-[#767EE0]/20 hover:bg-[#767EE0]/10")
                        }`}>
                        <div className="text-base font-bold text-[#767EE0]">{statusCounts.assigned}</div>
                        <div className="text-xs text-[#767EE0]">Assigned</div>
                      </button>
                      <button onClick={() => handleStatusClick("Missed")} className={`flex-1 border rounded p-2 text-center transition-all duration-200 cursor-pointer ${
                          filter === "Missed" 
                            ? (isDarkMode ? "bg-[#A15353]/20 border-[#A15353] shadow-md" : "bg-[#A15353]/10 border-[#A15353] shadow-sm")
                            : (isDarkMode ? "bg-[#A15353]/10 border-[#A15353]/30 hover:bg-[#A15353]/15" : "bg-[#A15353]/5 border-[#A15353]/20 hover:bg-[#A15353]/10")
                        }`}>
                        <div className="text-base font-bold text-[#A15353]">{statusCounts.missed}</div>
                        <div className="text-xs text-[#A15353]">Missed</div>
                      </button>
                    </div>
                  </div>

                  <div className="px-3 pb-3 relative">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <div className="relative" ref={filterButtonRef}>
                        <label className={`text-xs font-medium mr-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Filter:</label>
                        <button onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                          className={`flex items-center gap-1 px-2 py-1 border rounded text-xs font-medium cursor-pointer ${
                            isDarkMode 
                              ? 'bg-[#23232C] border-gray-600 text-white hover:bg-[#2D2D3A]' 
                              : 'bg-gray-50 border-gray-300 text-gray-900 hover:bg-gray-100'
                          }`}>
                          {filter}
                          <img 
                            src={ArrowDown} 
                            alt="" 
                            className={`w-3 h-3 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`}
                            style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                          />
                        </button>

                        {filterDropdownOpen && (
                          <div className={`absolute top-full left-0 mt-1 w-32 rounded shadow-lg border z-20 ${
                            isDarkMode ? 'bg-[#23232C] border-gray-600' : 'bg-white border-gray-300'
                          }`}>
                            {filterOptions.map(option => (
                              <button key={option} onClick={() => { setFilter(option); setFilterDropdownOpen(false); }}
                                className={`block w-full text-left px-3 py-1.5 text-xs hover:transition-colors cursor-pointer ${
                                  filter === option 
                                    ? (isDarkMode ? 'bg-[#2D2D3A] font-medium text-white' : 'bg-gray-100 font-medium text-gray-900')
                                    : (isDarkMode ? 'text-white hover:bg-[#2D2D3A]' : 'text-gray-900 hover:bg-gray-100')
                                }`}>
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Showing {filteredStudents.length} of {localStudents.length} students
                      </div>
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1 min-h-0">
                    <div className="w-full">
                      <table className="w-full">
                        <thead className={`sticky top-0 z-10 ${
                          isDarkMode ? 'bg-[#23232C]' : 'bg-gray-100'
                        }`}>
                          <tr>
                            <th className={`px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wider w-[40%] ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>Student</th>
                            <th className={`px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wider w-[20%] ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>Status</th>
                            <th className={`px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wider w-[20%] ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>Grade</th>
                            <th className={`px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wider w-[20%] ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {filteredStudents.map((student) => {
                            const studentId = student.user_ID;
                            const isSelected = selectedStudent?.id === studentId;
                            const status = calculateStudentStatus(student, activity);
                            const maxPoints = activity.points || 100;
                            const hasGrade = student.grade && student.grade !== '' && student.grade !== '0';
                            const gradeInputBorderClass = hasGrade 
                              ? 'border-[#00A15D] focus:border-[#00874E]' 
                              : 'border-[#A15353] focus:border-[#8a3d3d]';

                            let displayGrade = student.grade || '';
                            if (displayGrade && displayGrade.includes('.')) {
                              const [whole, decimal] = displayGrade.split('.');
                              if (decimal === '00' || decimal === '0' || decimal === '') {
                                displayGrade = whole;
                              }
                            }

                            return (
                              <tr key={studentId} className={`hover:transition-colors cursor-pointer ${
                                isSelected 
                                  ? (isDarkMode ? 'bg-[#767EE0]/10' : 'bg-[#767EE0]/5') 
                                  : (isDarkMode ? 'hover:bg-[#2D2D3A]' : 'hover:bg-gray-50')
                              }`}
                                onClick={() => {
                                  setSelectedStudent({ id: studentId, name: student.user_Name });
                                  fetchUploadedFiles(studentId);
                                }}>
                                <td className="px-3 py-2 w-[40%]">
                                  <div className={`text-xs font-medium break-words ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}>{student.user_Name}</div>
                                  <div className={`text-xs break-words ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}>{student.user_Email || 'No email'}</div>
                                </td>
                                <td className="px-3 py-2 w-[20%] whitespace-nowrap">
                                  <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                                    status === 'Submitted' 
                                      ? (isDarkMode ? 'bg-[#00A15D]/20 text-[#00A15D]' : 'bg-[#00A15D]/10 text-[#00A15D]')
                                      : status === 'Missed' 
                                      ? (isDarkMode ? 'bg-[#A15353]/20 text-[#A15353]' : 'bg-[#A15353]/10 text-[#A15353]')
                                      : (isDarkMode ? 'bg-[#767EE0]/15 text-[#767EE0]' : 'bg-[#767EE0]/10 text-[#767EE0]')
                                  }`}>
                                    {status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 w-[20%] whitespace-nowrap">
                                  <div className="flex items-center">
                                    <input 
                                      type="number" 
                                      min="0" 
                                      max={maxPoints} 
                                      value={displayGrade}
                                      onChange={(e) => handleGradeChange(studentId, e.target.value)}
                                      onBlur={(e) => handleGradeBlur(studentId, e.target.value)}
                                      className={`w-12 px-1 py-0.5 border rounded text-xs focus:outline-none transition-colors duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${gradeInputBorderClass} ${
                                        isDarkMode ? 'bg-[#23232C] text-white' : 'bg-white text-gray-900'
                                      }`}
                                      onClick={(e) => e.stopPropagation()} 
                                      step="1" 
                                      placeholder="0" 
                                    />
                                    {maxPoints && <span className={`text-xs ml-0.5 ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>/ {maxPoints}</span>}
                                  </div>
                                </td>
                                <td className="px-3 py-2 w-[20%]" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-start gap-1 flex-wrap">
                                    <button onClick={(e) => { e.stopPropagation(); handleEmailStudent(student.user_Email, student.user_Name); }}
                                      className={`cursor-pointer p-0.5 ${
                                        isDarkMode 
                                          ? 'text-gray-400 hover:text-[#767EE0]' 
                                          : 'text-gray-600 hover:text-[#767EE0]'
                                      }`} title="Email Student">
                                      <img 
                                        src={EmailIcon} 
                                        alt="Email" 
                                        className="w-3.5 h-3.5"
                                        style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                                      />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setDetailsModalOpen(true); }}
                                      className={`cursor-pointer p-0.5 ${
                                        isDarkMode 
                                          ? 'text-gray-400 hover:text-[#767EE0]' 
                                          : 'text-gray-600 hover:text-[#767EE0]'
                                      }`} title="View Details">
                                      <img 
                                        src={DetailsIcon} 
                                        alt="Details" 
                                        className="w-3.5 h-3.5"
                                        style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                                      />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {filteredStudents.length === 0 && (
                        <div className={`text-center py-4 text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-600'
                        }`}>No students found for the selected filter.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${isMobile ? 'w-1/2 flex-shrink-0 snap-start' : 'w-1/2'} h-full flex flex-col overflow-hidden`}>
                <div className="flex-1 overflow-y-auto">
                  {selectedStudent ? (
                    <div className="h-full flex flex-col p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analytics - {selectedStudent.name}</h3>
                        {isMobile && (
                          <button onClick={scrollToStudents} className="text-xs text-[#767EE0] hover:text-[#5a62c4] font-medium cursor-pointer">
                            ← Back to List
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-center justify-center mb-3">
                        {studentAnalytics ? (
                          <>
                            {renderProgressBar(studentAnalytics)}
                            
                            <div className="mt-3 text-center w-full">
                              <div className={`inline-block px-4 py-3 rounded-lg w-full max-w-xs ${studentAnalytics.bgColor} ${studentAnalytics.borderColor}`}>
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  {studentAnalytics.showMascot && (
                                    <img 
                                      src={TrackEd} 
                                      alt="TrackEd Mascot" 
                                      className="w-5 h-5 opacity-80"
                                      style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                                    />
                                  )}
                                  <p 
                                    className="text-xs font-semibold"
                                    style={{ color: studentAnalytics.textColor }}
                                  >
                                    {studentAnalytics.performanceLevel}
                                  </p>
                                </div>
                                <p className={`text-xs max-w-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{studentAnalytics.feedback}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <img 
                              src={TrackEd} 
                              alt="TrackEd Mascot" 
                              className="w-16 h-16 mb-2 opacity-50"
                              style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                            />
                            <div className={`text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                              No grade data available for this student.
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={`rounded-lg p-3 ${
                        isDarkMode ? 'bg-[#23232C]' : 'bg-gray-50'
                      }`}>
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`rounded ${
                            isDarkMode ? 'bg-[#23232C]' : 'bg-white'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Professor's Files</h5>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{getProfessorFileCount(selectedStudent.id)} file(s)</span>
                            </div>
                            
                            {getProfessorFileCount(selectedStudent.id) > 0 ? (
                              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {uploadedFilesList[selectedStudent.id]?.professor?.map((file) => 
                                  renderFileItem(file, selectedStudent.id, true)
                                )}
                              </div>
                            ) : (
                              <div className={`w-full h-32 border-2 border-dashed rounded flex flex-col items-center justify-center ${
                                isDarkMode 
                                  ? 'bg-[#15151C] border-gray-700' 
                                  : 'bg-gray-50 border-gray-300'
                              }`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                  isDarkMode 
                                    ? 'bg-gradient-to-br from-gray-700/20 to-gray-700/10' 
                                    : 'bg-gradient-to-br from-gray-300/20 to-gray-300/10'
                                }`}>
                                  <img 
                                    src={FileIcon} 
                                    alt="File" 
                                    className="w-5 h-5"
                                    style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                                  />
                                </div>
                                <p className={`text-xs text-center px-2 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>No files from professor</p>
                              </div>
                            )}
                            
                            <button 
                              onClick={() => handleProfessorFileUpload(selectedStudent.id)}
                              disabled={isUploading}
                              className={`w-full mt-2 py-2 text-white text-xs font-medium rounded hover:opacity-90 cursor-pointer transition-all duration-200 shadow ${
                                isUploading 
                                  ? 'bg-gray-600 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-[#767EE0] to-[#5a62c4]'
                              }`}
                            >
                              {isUploading ? 'Uploading...' : '+ Upload File'}
                            </button>
                            <div className={`text-xs text-center mt-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Any file type - Max 50MB
                            </div>
                          </div>

                          <div className={`rounded ${
                            isDarkMode ? 'bg-[#23232C]' : 'bg-white'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Student's Files</h5>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{getStudentFileCount(selectedStudent.id)} file(s)</span>
                            </div>
                            
                            {getStudentFileCount(selectedStudent.id) > 0 ? (
                              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {uploadedFilesList[selectedStudent.id]?.student?.map((file) => 
                                  renderFileItem(file, selectedStudent.id, false)
                                )}
                              </div>
                            ) : (
                              <div className={`w-full h-32 border-2 border-dashed rounded flex flex-col items-center justify-center ${
                                isDarkMode 
                                  ? 'bg-[#15151C] border-gray-700' 
                                  : 'bg-gray-50 border-gray-300'
                              }`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                  isDarkMode 
                                    ? 'bg-gradient-to-br from-gray-700/20 to-gray-700/10' 
                                    : 'bg-gradient-to-br from-gray-300/20 to-gray-300/10'
                                }`}>
                                  <img 
                                    src={FileIcon} 
                                    alt="File" 
                                    className="w-5 h-5"
                                    style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                                  />
                                </div>
                                <p className={`text-xs text-center px-2 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>No submission from student yet</p>
                              </div>
                            )}
                            
                            <div className={`mt-2 text-xs text-center ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Student can upload files in their view
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`h-full flex flex-col items-center justify-center text-xs p-4 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      <img 
                        src={TrackEd} 
                        alt="TrackEd Mascot" 
                        className="w-24 h-24 mb-4 opacity-50"
                        style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                      />
                      <p className="text-center mb-3">
                        {isMobile ? "Select a student from the list to view their analytics" : "Select a student to view analytics"}
                      </p>
                      {isMobile && (
                        <button onClick={scrollToStudents} className="mt-1 px-3 py-1.5 bg-[#767EE0] text-white text-xs rounded hover:bg-[#5a62c4] cursor-pointer">
                          Go to Students List
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={`flex justify-end gap-1.5 p-3 border-t flex-shrink-0 ${
            isDarkMode ? 'bg-[#23232C] border-gray-700' : 'bg-gray-50 border-gray-300'
          }`}>
            <button onClick={onClose} className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${
              isDarkMode 
                ? 'text-gray-300 bg-[#2D2D3A] border border-gray-600 hover:bg-[#374151]' 
                : 'text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200'
            }`}>
              Cancel
            </button>
            <button onClick={handleSave} className="px-3 py-1 text-xs font-medium text-white bg-[#00A15D] border border-transparent rounded hover:bg-[#00874E] cursor-pointer">
              Save Grades
            </button>
          </div>
        </div>
      </div>

      {photoViewerOpen && viewingPhoto && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[70] p-2">
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <button onClick={() => setPhotoViewerOpen(false)}
              className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black/90 rounded-full transition-colors z-10 cursor-pointer">
              <img src={Close} alt="Close" className="w-5 h-5" />
            </button>

            <div className="w-full h-full flex items-center justify-center p-4">
              {isImageFile(viewingPhoto) ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={viewingPhoto.url} 
                    alt={viewingPhoto.name} 
                    className="max-w-full max-h-full object-contain rounded shadow-2xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://via.placeholder.com/400/374151/FFFFFF?text=Image+Not+Available`;
                    }}
                    style={{ maxWidth: '90vw', maxHeight: '80vh' }}
                  />
                </div>
              ) : (
                <div className="bg-gray-800 p-6 rounded shadow-2xl max-w-md w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={getFileIcon(viewingPhoto.name, viewingPhoto.type)} alt="File" className="w-12 h-12" />
                    <div>
                      <p className="text-white text-sm font-medium mb-1">{viewingPhoto.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-400 text-xs">{formatFileSize(viewingPhoto.size)}</p>
                        {getFileTypeBadge(viewingPhoto.name) && (
                          <span className={`text-xs px-2 py-0.5 rounded ${getFileTypeBadge(viewingPhoto.name).color}`}>
                            {getFileTypeBadge(viewingPhoto.name).text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <a href={viewingPhoto.url} target="_blank" rel="noopener noreferrer"
                    className="inline-block w-full px-4 py-2 bg-[#767EE0] hover:bg-[#5a62c4] rounded text-white text-sm text-center">
                    Download File
                  </a>
                </div>
              )}
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-sm backdrop-blur-sm max-w-[90vw] text-center truncate">
              {viewingPhoto.name} • {viewingPhoto.uploadedBy === 'professor' ? 'Professor\'s Upload' : 'Student\'s Submission'}
            </div>
          </div>
        </div>
      )}

      <StudentActivitiesDetails
        activity={activity}
        students={localStudents}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        subjectCode={activity?.subject_code}
        professorName={professorName}
        isDarkMode={isDarkMode}
      />

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[70]">
          <div className={`rounded p-4 m-3 max-w-sm w-full border ${
            isDarkMode ? 'bg-[#15151C] border-gray-700' : 'bg-white border-gray-300'
          }`}>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00A15D]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#00A15D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Success!</h3>
              <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Grades saved successfully.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClassWorkSubmission;