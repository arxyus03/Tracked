import React, { useState, useEffect } from 'react';
import BackButton from '../assets/BackButton(Light).svg';
import ArrowDown from '../assets/ArrowDown(Light).svg';

const NewAnnouncement = ({ 
  showModal, 
  handleModalClose, 
  editingAnnouncement, 
  handlePost, 
  selectedSubject, 
  setSelectedSubject, 
  title, 
  setTitle, 
  description, 
  setDescription, 
  link, 
  setLink, 
  deadline, 
  setDeadline, 
  getUniqueSubjects, 
  loadingClasses, 
  getCurrentDateTime 
}) => {
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      handlePost();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (subjectDropdownOpen && !event.target.closest('.subject-dropdown')) {
        setSubjectDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [subjectDropdownOpen]);

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-md p-6 sm:p-8 relative modal-pop max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleModalClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors cursor-pointer touch-manipulation"
        >
          <img
            src={BackButton}
            alt="BackButton"
            className="w-5 h-5"
          />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-1 pr-10">
          {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {editingAnnouncement ? "Update the announcement details" : "Fill in the details to create a new announcement"}
        </p>
        <hr className="border-gray-200 mb-5" />

        {/* Modal Body */}
        <div className="space-y-5">
          {/* Subject Dropdown */}
          <div className="relative subject-dropdown">
            <label className="text-sm font-semibold mb-2 block text-gray-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSubjectDropdownOpen(!subjectDropdownOpen);
              }}
              className="w-full bg-white border-2 border-gray-300 text-black rounded-md px-4 py-3 flex items-center justify-between hover:border-[#00874E] active:border-[#00874E] focus:border-[#00874E] focus:outline-none transition-colors cursor-pointer touch-manipulation"
            >
              <span className={`text-sm ${!selectedSubject ? 'text-gray-500' : ''}`}>
                {selectedSubject 
                  ? (() => {
                      const selectedSubj = getUniqueSubjects().find(subj => subj.subject_code === selectedSubject);
                      return selectedSubj ? `${selectedSubj.subject_name} (${selectedSubj.subject_code}) - ${selectedSubj.section}` : "Unknown Subject";
                    })()
                  : "Select Subject"
                }
              </span>
              <img 
                src={ArrowDown} 
                alt="" 
                className={`h-4 w-4 transition-transform ${subjectDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            {subjectDropdownOpen && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-xl border border-gray-200 z-10 overflow-hidden max-h-40 overflow-y-auto">
                {loadingClasses ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Loading subjects...</div>
                ) : getUniqueSubjects().length > 0 ? (
                  getUniqueSubjects().map((subject) => (
                    <button
                      key={subject.subject_code}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubject(subject.subject_code);
                        setSubjectDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer touch-manipulation"
                    >
                      {subject.subject_name} ({subject.subject_code}) - {subject.section}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">No subjects found. Create a class first.</div>
                )}
              </div>
            )}
          </div>

          {/* Deadline Input */}
          <div>
            <label className="text-sm font-semibold mb-2 block text-gray-700">Deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={getCurrentDateTime()} // Prevent past dates
              className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none text-sm focus:border-[#00874E] transition-colors"
            />
          </div>

          {/* Title Input */}
          <div>
            <label className="text-sm font-semibold mb-2 block text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none text-sm focus:border-[#00874E] transition-colors"
            />
          </div>

          {/* Description Textarea */}
          <div>
            <label className="text-sm font-semibold mb-2 block text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none min-h-[120px] resize-none text-sm focus:border-[#00874E] transition-colors"
            />
          </div>

          {/* Link Input */}
          <div>
            <label className="text-sm font-semibold mb-2 block text-gray-700">Insert Link</label>
            <input
              type="text"
              placeholder="Enter link (optional)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none text-sm focus:border-[#00874E] transition-colors"
            />
          </div>

          {/* Post Button */}
          <button
            onClick={handlePost}
            className="w-full bg-[#00A15D] hover:bg-[#00874E] active:bg-[#006B3D] text-white font-bold py-3 rounded-md transition-all duration-200 text-base cursor-pointer touch-manipulation active:scale-98"
          >
            {editingAnnouncement ? "Update Announcement" : "Post Announcement"}
          </button>
        </div>
      </div>

      <style>{`
        .overlay-fade { animation: overlayFade .18s ease-out both; }
        @keyframes overlayFade { from { opacity: 0 } to { opacity: 1 } }

        .modal-pop {
          transform-origin: top center;
          animation: popIn .22s cubic-bezier(.2,.8,.2,1) both;
        }
        @keyframes popIn {
          from { opacity: 0; transform: translateY(-8px) scale(.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
};

export default NewAnnouncement;