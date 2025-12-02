import React, { useState, useEffect } from 'react';
import Close from "../assets/Close.svg";
import Add from "../assets/Add(Light).svg";
import FileIcon from "../assets/File(Light).svg";

const StudentActivityDetails = ({ activity, isOpen, onClose, studentId }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [instructionExpanded, setInstructionExpanded] = useState(false);
  const [professorFiles, setProfessorFiles] = useState([]);
  const [studentFiles, setStudentFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Localhost configuration - Updated path for student files
  const BACKEND_URL = 'http://localhost/TrackEd/src/Pages/Student/SubjectsDB';

  useEffect(() => {
    if (isOpen && activity && studentId) {
      fetchFiles();
    }
  }, [isOpen, activity, studentId]);

  const fetchFiles = async () => {
    if (!activity?.id || !studentId) return;

    setIsLoading(true);
    try {
      // Fetch professor's uploaded files for this student and activity
      const professorResponse = await fetch(
        `${BACKEND_URL}/get-uploaded-files.php?activity_id=${activity.id}&student_id=${studentId}`
      );
      
      if (professorResponse.ok) {
        const professorResult = await professorResponse.json();
        if (professorResult.success) {
          // Filter to get only professor's uploads
          const profFiles = professorResult.files.filter(file => 
            file.uploaded_by === 'professor'
          );
          setProfessorFiles(profFiles);
        }
      }

      // Fetch student's uploaded files for this activity
      const studentResponse = await fetch(
        `${BACKEND_URL}/get-student-files.php?activity_id=${activity.id}&student_id=${studentId}`
      );
      
      if (studentResponse.ok) {
        const studentResult = await studentResponse.json();
        if (studentResult.success) {
          setStudentFiles(studentResult.files);
        }
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "No deadline") return "No deadline";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const isDeadlineUrgent = (deadline) => {
    if (!deadline || deadline === "No deadline") return false;
    
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const timeDiff = deadlineDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      return hoursDiff <= 24 && hoursDiff > 0;
    } catch {
      return false;
    }
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline || deadline === "No deadline") return false;
    
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      return deadlineDate.getTime() < now.getTime();
    } catch {
      return false;
    }
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      'Assignment': 'bg-blue-100 text-blue-800',
      'Quiz': 'bg-purple-100 text-purple-800',
      'Activity': 'bg-green-100 text-green-800',
      'Project': 'bg-orange-100 text-orange-800',
      'Laboratory': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getDeadlineColorClass = (deadline) => {
    if (isDeadlinePassed(deadline)) {
      return 'text-red-600 font-bold';
    } else if (isDeadlineUrgent(deadline)) {
      return 'text-red-500 font-semibold';
    }
    return 'text-green-600 font-semibold';
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*'; // Accept all file types
    input.multiple = false;
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Check file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        alert('File size must be less than 25MB');
        return;
      }

      setIsUploading(true);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('activity_id', activity.id);
        formData.append('student_id', studentId);
        formData.append('file_type', 'student');

        const response = await fetch(`${BACKEND_URL}/upload-student-file.php`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          alert('File uploaded successfully!');
          // Refresh files list
          fetchFiles();
        } else {
          alert('Upload failed: ' + result.message);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file: ' + error.message);
      } finally {
        setIsUploading(false);
      }
    };
    
    input.click();
  };

  const handleViewFile = (file) => {
    if (file.file_url) {
      window.open(file.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/delete-student-file.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_id: fileId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert('File deleted successfully');
        // Remove from local state
        setStudentFiles(prev => prev.filter(file => file.id !== fileId));
      } else {
        alert('Error deleting file: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file. Please try again.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    if (studentFiles.length === 0) {
      alert('Please upload a file first before submitting.');
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/mark-as-submitted.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_id: activity.id,
          student_id: studentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert('Activity marked as submitted successfully!');
        // Close the modal
        onClose();
      } else {
        alert('Submission failed: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting activity:', error);
      alert('Failed to submit activity: ' + error.message);
    }
  };

  const currentStudentFile = studentFiles.length > 0 ? studentFiles[0] : null;

  if (!isOpen || !activity) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex-1 min-w-0 mr-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {activity.title}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`px-2 py-1 ${getActivityTypeColor(activity.activity_type)} text-xs font-medium rounded flex-shrink-0`}>
                  {activity.activity_type}
                </span>
                <span className="text-sm text-gray-500 font-bold flex-shrink-0">#{activity.task_number}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer flex-shrink-0"
            >
              <img src={Close} alt="Close" className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column - Activity Details */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Activity Details</h3>
                
                <div className="space-y-4">
                  {/* Deadline with color coding */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Deadline</h4>
                    <p className={`text-sm sm:text-base ${getDeadlineColorClass(activity.deadline)}`}>
                      {formatDate(activity.deadline)}
                      {(isDeadlinePassed(activity.deadline) || isDeadlineUrgent(activity.deadline)) && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {isDeadlinePassed(activity.deadline) ? 'Deadline Passed' : 'Deadline Approaching'}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Points */}
                  {activity.points > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Points</h4>
                      <p className="text-green-600 font-semibold text-sm sm:text-base">{activity.points} points</p>
                    </div>
                  )}

                  {/* Instructions with Show More/Less */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className={`text-gray-600 whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed ${
                        !instructionExpanded && activity.instruction && activity.instruction.length > 200 
                          ? 'max-h-24 overflow-hidden' 
                          : ''
                      }`}>
                        {activity.instruction || 'No instructions provided.'}
                      </div>
                      {activity.instruction && activity.instruction.length > 200 && (
                        <button
                          onClick={() => setInstructionExpanded(!instructionExpanded)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 cursor-pointer"
                        >
                          {instructionExpanded ? 'Show Less' : 'Show More'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Link */}
                  {activity.link && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Reference Link</h4>
                      <a 
                        href={activity.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-words text-sm sm:text-base"
                      >
                        {activity.link}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Submission Section */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Submission</h3>
                
                <div className="space-y-4">
                  {/* Professor's Submission Card */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                      <span>Professor's Files for You</span>
                      {professorFiles.length > 0 && (
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                          {professorFiles.length} file{professorFiles.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </h4>
                    
                    {isLoading ? (
                      <div className="text-center py-6">
                        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-green-700 text-sm">Loading files...</p>
                      </div>
                    ) : professorFiles.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {professorFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                              <div className="bg-green-100 p-2 rounded">
                                <span className="text-green-600">📄</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p 
                                  className="text-sm font-medium text-gray-800 truncate cursor-pointer hover:text-green-700"
                                  onClick={() => handleViewFile(file)}
                                  title={file.original_name}
                                >
                                  {file.original_name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                  <span>{formatFileSize(file.file_size)}</span>
                                  <span>•</span>
                                  <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleViewFile(file)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer transition-colors"
                            >
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <img src={FileIcon} alt="No file" className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="text-green-700 text-sm font-medium">No files from professor yet</p>
                        <p className="text-green-600 text-xs mt-1">
                          Your professor hasn't uploaded any files for you yet.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Student's Submission Card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">Your Submission</h4>
                    
                    {isUploading ? (
                      <div className="text-center py-6">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-blue-700 text-sm">Uploading file...</p>
                      </div>
                    ) : studentFiles.length > 0 ? (
                      <div className="space-y-3">
                        {/* Latest file preview */}
                        <div className="bg-white rounded-lg border border-blue-300 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600">📄</span>
                              <p className="text-sm font-medium text-gray-900">
                                Latest Upload ({studentFiles.length} total)
                              </p>
                            </div>
                            <button
                              onClick={handleFileUpload}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Upload New
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {studentFiles.map((file, index) => (
                              <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded ${index === 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    <span className={index === 0 ? 'text-blue-600' : 'text-gray-600'}>📄</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p 
                                      className="text-sm font-medium text-gray-800 truncate cursor-pointer hover:text-blue-700"
                                      onClick={() => handleViewFile(file)}
                                      title={file.original_name}
                                    >
                                      {file.original_name}
                                      {index === 0 && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                          Latest
                                        </span>
                                      )}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <span>{formatFileSize(file.file_size)}</span>
                                      <span>•</span>
                                      <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleViewFile(file)}
                                    className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 hover:bg-blue-50 rounded"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFile(file.id)}
                                    className="text-red-600 hover:text-red-800 text-sm px-2 py-1 hover:bg-red-50 rounded"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          You can upload multiple files. The professor will see all uploaded files.
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-full h-40 bg-white border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors p-4"
                        onClick={handleFileUpload}
                      >
                        <img src={Add} alt="Add" className="w-10 h-10 text-blue-400 mb-3" />
                        <p className="text-blue-700 font-medium text-sm text-center">Click to upload your work</p>
                        <p className="text-blue-600 text-xs mt-1 text-center">All file types supported (Max 25MB)</p>
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    {studentFiles.length === 0 && !isUploading && (
                      <div className="mt-4">
                        <button
                          onClick={handleFileUpload}
                          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <img src={Add} alt="Upload" className="w-4 h-4" />
                          Upload Your File
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Submit and Close buttons */}
          <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 cursor-pointer transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 cursor-pointer transition-colors"
            >
              Mark as Submitted
            </button>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {imageViewerOpen && selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={handleCloseImageViewer}
              className="absolute top-4 right-4 p-2 sm:p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10 cursor-pointer"
            >
              <img src={Close} alt="Close" className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="relative max-w-[95vw] max-h-[85vh] w-auto h-auto mx-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm backdrop-blur-sm max-w-[90vw] text-center">
              {selectedImage.name}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentActivityDetails;