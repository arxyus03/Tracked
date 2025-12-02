import React, { useState } from 'react';
import Cross from "../assets/Cross(Light).svg";
import Add from "../assets/Add(Light).svg";
import FileIcon from "../assets/File(Light).svg";
import GoogleDriveIcon from "../assets/GoogleDrive.svg";

const PhotoManagement = ({
  isOpen,
  onClose,
  selectedStudent,
  professorPhoto,
  studentPhoto,
  professorFiles = [], // NEW: Array of professor's uploaded files
  onProfessorPhotoUpload,
  onViewProfessorPhoto,
  onViewProfessorFile, // NEW: Function to view a specific file
  onDeleteProfessorPhoto,
  onDeleteProfessorFile, // NEW: Function to delete a specific file
  onViewStudentPhoto,
  activity,
  formatFileSize, // NEW: Function to format file size
  isUploadingToDrive = false,
  isAuthenticated = false,
  onConnectDrive = () => {}
}) => {
  const [uploading, setUploading] = useState(false);

  if (!isOpen || !selectedStudent) return null;

  const handleUploadClick = async () => {
    // For local upload, we don't need Google Drive authentication
    if (onProfessorPhotoUpload) {
      onProfessorPhotoUpload();
    }
  };

  // Get the latest file for the main display
  const latestFile = professorFiles.length > 0 ? professorFiles[0] : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-2 sm:p-3 md:p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              File Management - {selectedStudent.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {activity?.title} • {activity?.activity_type} #{activity?.task_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer flex-shrink-0"
          >
            <img src={Cross} alt="Close" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Professor's Files Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Professor's Files</h3>
                <button
                  onClick={handleUploadClick}
                  disabled={uploading || isUploadingToDrive}
                  className={`flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors cursor-pointer ${(uploading || isUploadingToDrive) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading || isUploadingToDrive ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <img src={Add} alt="Add" className="w-4 h-4" />
                      Upload File
                    </>
                  )}
                </button>
              </div>
              
              {/* Latest File Preview */}
              {latestFile ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                    <span>Latest Upload</span>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                      Most Recent
                    </span>
                  </h4>
                  
                  <div className="space-y-3">
                    <div 
                      className={`w-full h-40 bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 ${latestFile.type?.startsWith('image/') ? 'border-green-500' : 'border-blue-500'}`}
                      onClick={() => onViewProfessorFile(latestFile)}
                    >
                      {latestFile.type?.startsWith('image/') ? (
                        <img 
                          src={latestFile.url} 
                          alt={latestFile.name} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          <div className="text-4xl mb-2">📄</div>
                          <p className="text-center font-medium text-gray-700">{latestFile.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{latestFile.type || 'File'}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{latestFile.name}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <p className="text-xs text-gray-500">
                              {formatFileSize ? formatFileSize(latestFile.size) : 'Unknown size'}
                            </p>
                            <span className="text-gray-300">•</span>
                            <p className="text-xs text-gray-500">
                              {new Date(latestFile.uploaded_at || latestFile.uploadDate).toLocaleDateString()}
                            </p>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Local Server
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onViewProfessorFile(latestFile)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer transition-colors"
                        >
                          <span className="text-lg">👁️</span>
                          View File
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this file?')) {
                              onDeleteProfessorFile(latestFile.id);
                            }
                          }}
                          className="px-3 py-2 bg-white text-red-600 text-sm rounded border border-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                          title="Delete file"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full h-40 bg-white border-2 border-dashed border-green-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors p-4"
                  onClick={handleUploadClick}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <img src={Add} alt="Add" className="w-6 h-6" />
                  </div>
                  <p className="text-green-700 font-medium text-sm text-center">
                    Click to upload a file
                  </p>
                  <p className="text-green-600 text-xs mt-1 text-center">
                    Files are saved to your local server
                  </p>
                </div>
              )}

              {/* All Uploaded Files List */}
              {professorFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-3 text-sm">
                    All Uploaded Files ({professorFiles.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {professorFiles.map((file) => (
                      <div 
                        key={file.id} 
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${file === latestFile ? 'bg-green-100' : 'bg-blue-100'}`}>
                            <span className={`${file === latestFile ? 'text-green-600' : 'text-blue-600'}`}>
                              📄
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p 
                              className="text-sm font-medium text-gray-800 truncate cursor-pointer hover:text-blue-600"
                              onClick={() => onViewProfessorFile(file)}
                              title={file.name}
                            >
                              {file.name}
                              {file === latestFile && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  Latest
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{formatFileSize ? formatFileSize(file.size) : 'Unknown size'}</span>
                              <span>•</span>
                              <span>{new Date(file.uploaded_at || file.uploadDate).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                                {file.uploadedBy === 'professor' ? 'Professor' : file.uploadedBy}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onViewProfessorFile(file)}
                            className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer px-2 py-1 hover:bg-blue-50 rounded"
                            title="View file"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
                                onDeleteProfessorFile(file.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm cursor-pointer px-2 py-1 hover:bg-red-50 rounded"
                            title="Delete file"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Instructions */}
              <div className="mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="font-medium text-blue-900 mb-2 text-sm">📋 Upload Instructions:</h5>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Click "Upload File" to add new files</li>
                    <li>• Files are stored on your local server</li>
                    <li>• Maximum file size: 25MB</li>
                    <li>• Supported formats: All file types</li>
                    <li>• Students can download files from their portal</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Student's Submission Section */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Student's Submission</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <span>Student's Uploaded Work</span>
                  {studentPhoto && (
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                      Submitted
                    </span>
                  )}
                </h4>
                
                {studentPhoto ? (
                  <div className="space-y-3">
                    <div 
                      className={`w-full h-40 bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 ${typeof studentPhoto === 'object' && studentPhoto.type?.startsWith('image/') ? 'border-blue-500' : 'border-blue-400'}`}
                      onClick={onViewStudentPhoto}
                    >
                      {typeof studentPhoto === 'object' && studentPhoto.type?.startsWith('image/') ? (
                        <img 
                          src={studentPhoto.url} 
                          alt="Student's submission" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          <div className="text-4xl mb-2">📄</div>
                          <p className="text-center font-medium text-gray-700">
                            {typeof studentPhoto === 'object' ? studentPhoto.name : 'Student Submission'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {typeof studentPhoto === 'object' ? studentPhoto.type || 'File' : 'Submitted file'}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {typeof studentPhoto === 'object' ? studentPhoto.name : 'Student Submission'}
                        </p>
                        {typeof studentPhoto === 'object' && studentPhoto.uploadDate && (
                          <p className="text-xs text-gray-500">
                            Submitted on {new Date(studentPhoto.uploadDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={onViewStudentPhoto}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 cursor-pointer transition-colors whitespace-nowrap"
                      >
                        {typeof studentPhoto === 'string' && studentPhoto.startsWith('http') ? 'Open Link' : 'View'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <img src={FileIcon} alt="No file" className="w-6 h-6" />
                    </div>
                    <p className="text-blue-700 text-sm font-medium">No submission from student yet</p>
                    <p className="text-blue-600 text-xs mt-1">
                      The student has not uploaded any files for this activity.
                    </p>
                  </div>
                )}
              </div>

              {/* Information Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  About File Management
                </h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Files are stored on your local server</li>
                  <li>• Students can download files you upload for them</li>
                  <li>• Keep all related files organized per student</li>
                  <li>• Maximum file size: 25MB per file</li>
                  <li>• All file types are supported</li>
                  <li>• Files are accessible anytime from the student portal</li>
                </ul>
              </div>

              {/* Statistics Box */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Upload Statistics
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-green-800">Total Files:</span>
                    <span className="text-sm font-medium text-green-900">{professorFiles.length}</span>
                  </div>
                  {professorFiles.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-green-800">Latest Upload:</span>
                      <span className="text-xs text-green-700">
                        {new Date(latestFile.uploaded_at || latestFile.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-green-800">Student Submission:</span>
                    <span className="text-xs font-medium text-green-900">
                      {studentPhoto ? '✅ Submitted' : '❌ Not submitted'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Close
          </button>
          {professorFiles.length > 0 && (
            <button
              onClick={() => onViewProfessorFile(latestFile)}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 cursor-pointer transition-colors flex items-center gap-2"
            >
              <span className="text-lg">👁️</span>
              View Latest File
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoManagement;