import React, { useState } from 'react';
import Close from "../assets/Close.svg";
import Add from "../assets/Add(Light).svg";

const StudentActivityDetails = ({ activity, isOpen, onClose, onImageUpload, studentImages }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [instructionExpanded, setInstructionExpanded] = useState(false);

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

  // Check if deadline is near (within 24 hours) or passed
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

  // Get activity type color
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

  // Get deadline text color class - UPDATED with green for ongoing deadlines
  const getDeadlineColorClass = (deadline) => {
    if (isDeadlinePassed(deadline)) {
      return 'text-red-600 font-bold';
    } else if (isDeadlineUrgent(deadline)) {
      return 'text-red-500 font-semibold';
    }
    return 'text-green-600 font-semibold'; // Green for ongoing deadlines
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        onImageUpload(activity.id, file);
      }
    };
    input.click();
  };

  const handleViewImage = (image) => {
    setSelectedImage(image);
    setImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedImage(null);
  };

  const handleSubmit = () => {
    // TODO: Implement submission logic
    console.log('Submitting activity:', activity.id);
    alert('Submission functionality to be implemented');
  };

  const currentStudentImage = studentImages[activity?.id];
  const hasTeacherImage = activity?.teacher_image; // This will need to come from backend

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
                {/* Made task number bold */}
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
                      <span>Professor's Submission of your work</span>
                      {hasTeacherImage && (
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                          Available
                        </span>
                      )}
                    </h4>
                    
                    {hasTeacherImage ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-300">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <img src={Add} alt="File" className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">professor_reference.pdf</p>
                            <p className="text-xs text-gray-500">Uploaded by Professor • 2.5 MB</p>
                          </div>
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium cursor-pointer bg-green-100 hover:bg-green-200 px-3 py-1 rounded transition-colors">
                            View
                          </button>
                        </div>
                        <p className="text-xs text-green-700">
                          Your professor has provided this reference of your work to help with your submission.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <img src={Add} alt="No file" className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="text-green-700 text-sm font-medium">No professor submission of your work yet</p>
                        <p className="text-green-600 text-xs mt-1">
                          Check back later for your work submitted by your professor.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Student's Submission Card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">Your Submission</h4>
                    
                    {currentStudentImage ? (
                      <div className="space-y-3">
                        <div 
                          className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-blue-500"
                          onClick={() => handleViewImage(currentStudentImage)}
                        >
                          <img 
                            src={currentStudentImage.url} 
                            alt="Your submission" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{currentStudentImage.name}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded on {new Date(currentStudentImage.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={handleFileUpload}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 cursor-pointer transition-colors w-fit"
                          >
                            Change File
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-full h-40 bg-white border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors p-4"
                        onClick={handleFileUpload}
                      >
                        <img src={Add} alt="Add" className="w-10 h-10 text-blue-400 mb-3" />
                        <p className="text-blue-700 font-medium text-sm text-center">Click to upload your work</p>
                        <p className="text-blue-600 text-xs mt-1 text-center">JPG, PNG, PDF files supported</p>
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
              Submit
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