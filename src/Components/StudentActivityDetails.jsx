import React, { useState, useEffect } from 'react';
import Close from "../assets/Cross(Light).svg";
import Add from "../assets/Add(Light).svg";
import FileIcon from "../assets/File(Light).svg";
import ImageIcon from "../assets/Image.svg";
import DownloadIcon from "../assets/Download(Light).svg";

const StudentActivityDetails = ({ activity, isOpen, onClose, studentId }) => {
  const [professorFiles, setProfessorFiles] = useState([]);
  const [studentFiles, setStudentFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activityDetails, setActivityDetails] = useState(null);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const BACKEND_URL = 'https://tracked.6minds.site/Student/SubjectDetailsStudentDB';

  useEffect(() => {
    if (isOpen && activity && studentId) {
      fetchActivityDetails();
    }
  }, [isOpen, activity, studentId]);

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

  const formatDate = (dateString) => {
    if (!dateString || dateString === "No deadline") return "No deadline";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
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

  const handleFileUpload = () => {
    if (!studentId) {
      alert('Student ID not found');
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        alert('Image must be < 25MB');
        return;
      }

      setIsUploading(true);
      
      try {
        // If student already has a file, delete it first
        if (studentFiles.length > 0) {
          for (const file of studentFiles) {
            await deleteFile(file.id, false); // Don't confirm
          }
        }

        const formData = new FormData();
        formData.append('file', file);
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
          alert('Image uploaded!');
          fetchActivityDetails();
        } else {
          alert('Upload failed');
        }
      } catch (error) {
        alert('Upload error');
      } finally {
        setIsUploading(false);
      }
    };
    
    input.click();
  };

  const handleViewFile = (file) => {
    const fileUrl = file.file_url || file.url;
    if (fileUrl) {
      if (fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        setSelectedImage({ url: fileUrl, name: file.original_name });
      } else {
        window.open(fileUrl, '_blank');
      }
    }
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  const deleteFile = async (fileId, showConfirm = true) => {
    if (showConfirm && !confirm('Delete this image?')) return;
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
    } catch (error) {
      alert('Delete failed');
    }
  };

  const handleSubmit = async () => {
    if (studentFiles.length === 0) {
      alert('Upload an image first');
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
      } else {
        alert('Submission failed');
      }
    } catch (error) {
      alert('Submit error');
    }
  };

  const formatGrade = (grade) => {
    if (!grade || grade === '0') return null;
    const num = parseFloat(grade);
    return Math.floor(num) === num ? num : num.toFixed(1);
  };

  if (!isOpen || !activity) return null;
  const currentActivity = activityDetails || activity;
  const hasGrade = currentActivity.grade && currentActivity.grade !== '0';
  const totalPoints = Math.floor(currentActivity.points || 0);
  const deadlineLabel = getDeadlineLabel(currentActivity.deadline);

  return (
    <>
      <div className="fixed inset-0 bg-[#23232C]/90 flex justify-center items-center z-50 p-2">
        <div className="bg-[#15151C] rounded-lg w-full max-w-2xl max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between p-3 border-b border-gray-800">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[#767EE0] font-bold text-sm">
                  {currentActivity.activity_type} #{currentActivity.task_number}
                </span>
                {activityDetails?.submitted === 1 && (
                  <span className="text-xs bg-[#00A15D] text-white px-2 py-0.5 rounded-full">
                    Submitted
                  </span>
                )}
              </div>
              <h2 className="text-white font-bold truncate text-sm mt-1">
                {currentActivity.title}
              </h2>
              
              {/* Deadline in header */}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-medium ${getDeadlineColor(currentActivity.deadline)}`}>
                  {formatDate(currentActivity.deadline)}
                </span>
                {deadlineLabel && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[#A15353]/20 text-[#A15353]">
                    {deadlineLabel}
                  </span>
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
                        {((currentActivity.grade / currentActivity.points) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <p className="text-white font-bold text-lg">
                        {formatGrade(currentActivity.grade)}/{totalPoints}
                      </p>
                    </div>
                  </div>
                )}

                {/* Instructions with Link */}
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
                  <div className={`text-gray-200 text-sm whitespace-pre-wrap ${
                    !instructionsExpanded && currentActivity.instruction && currentActivity.instruction.length > 150 
                      ? 'max-h-20 overflow-hidden' 
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
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {professorFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-[#15151C] rounded">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <img src={FileIcon} alt="File" className="w-3 h-3 invert" />
                              <div className="flex-1 min-w-0">
                                <p 
                                  className="text-white text-xs font-medium truncate cursor-pointer hover:text-[#767EE0]"
                                  onClick={() => handleViewFile(file)}
                                  title={file.original_name}
                                >
                                  {file.original_name}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {file.file_size ? `${Math.floor(file.file_size / 1024)}KB` : ''}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleViewFile(file)}
                              className="text-xs bg-[#767EE0] text-white px-3 py-1 rounded cursor-pointer"
                            >
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-xs">No files from professor</p>
                    )}
                  </div>

                  {/* Student Files - Only 1 image upload */}
                  <div className="bg-[#23232C] rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm">Your Image</h3>
                      <span className="text-gray-400 text-xs">
                        {studentFiles.length > 0 ? 'Uploaded' : 'Not uploaded'}
                      </span>
                    </div>
                    
                    {studentFiles.length > 0 ? (
                      <div className="space-y-3">
                        {studentFiles.slice(0, 1).map((file) => (
                          <div key={file.id} className="space-y-2">
                            {/* Image preview */}
                            <div 
                              className="w-full h-40 bg-[#15151C] rounded overflow-hidden cursor-pointer group relative"
                              onClick={() => handleViewFile(file)}
                            >
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#23232C] to-[#15151C]">
                                <img src={ImageIcon} alt="Image" className="w-8 h-8" />
                              </div>
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white font-medium text-sm">View Image</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium truncate">
                                  {file.original_name}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {file.file_size ? `${Math.floor(file.file_size / 1024)}KB` : ''}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteFile(file.id)}
                                className="text-xs bg-[#A15353] text-white px-3 py-1 rounded cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                            
                            <button
                              onClick={handleFileUpload}
                              className="w-full mt-2 py-2 bg-[#767EE0] text-white text-sm font-medium rounded cursor-pointer"
                            >
                              Replace Image
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div 
                        className="w-full h-40 border-2 border-dashed border-[#767EE0] rounded flex flex-col items-center justify-center cursor-pointer hover:border-[#00A15D] transition-colors group"
                        onClick={handleFileUpload}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#767EE0]/20 to-[#767EE0]/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <img src={Add} alt="Add" className="w-5 h-5 invert" />
                        </div>
                        <p className="text-[#767EE0] text-sm font-medium">Upload your image</p>
                        <p className="text-gray-400 text-xs mt-1">JPG, PNG, GIF - Max 25MB</p>
                        {isUploading && (
                          <div className="mt-2">
                            <div className="w-4 h-4 border-2 border-[#00A15D] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Removed activity type, "Close" changed to green "Done" */}
          <div className="flex justify-end gap-2 p-3 border-t border-gray-800">
            {activityDetails?.submitted !== 1 && studentFiles.length > 0 && (
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

      {/* Image Viewer Modal */}
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