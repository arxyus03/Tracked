import React, { useState, useEffect } from 'react';
import BackButton from '../../assets/BackButton(Light).svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';

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
  getCurrentDateTime,
  currentSubjectCode,
  restrictToCurrentSubject = false,
  postingAnnouncement = false
}) => {
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

  // Get filtered subjects based on restriction
  const getFilteredSubjects = () => {
    const allSubjects = getUniqueSubjects();
    
    if (restrictToCurrentSubject && currentSubjectCode) {
      // Only show the current subject
      return allSubjects.filter(subject => subject.subject_code === currentSubjectCode);
    }
    
    // Show all subjects (original behavior)
    return allSubjects;
  };

  // Auto-select current subject when modal opens and no subject is selected
  useEffect(() => {
    if (showModal && !selectedSubject && currentSubjectCode) {
      setSelectedSubject(currentSubjectCode);
    }
  }, [showModal, selectedSubject, currentSubjectCode, setSelectedSubject]);

  // Add CSS for styling the calendar icon
  useEffect(() => {
    if (showModal) {
      const style = document.createElement('style');
      style.innerHTML = `
        .announcement-deadline-input::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        .announcement-deadline-input::-moz-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        .announcement-deadline-input::-webkit-datetime-edit {
          color: white;
        }
        .announcement-deadline-input::-webkit-datetime-edit-fields-wrapper {
          color: white;
        }
        .announcement-deadline-input::-webkit-datetime-edit-text {
          color: white;
          padding: 0 0.3em;
        }
        .announcement-deadline-input::-webkit-datetime-edit-month-field,
        .announcement-deadline-input::-webkit-datetime-edit-day-field,
        .announcement-deadline-input::-webkit-datetime-edit-year-field,
        .announcement-deadline-input::-webkit-datetime-edit-hour-field,
        .announcement-deadline-input::-webkit-datetime-edit-minute-field,
        .announcement-deadline-input::-webkit-datetime-edit-ampm-field {
          color: white;
        }
        .announcement-deadline-input::-webkit-inner-spin-button {
          display: none;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [showModal]);

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
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-3"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#15151C] text-[#FFFFFF] rounded-lg shadow-2xl w-full max-w-md p-4 sm:p-5 relative modal-pop max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleModalClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 p-1.5 hover:bg-[#23232C] active:bg-[#2A2A35] rounded-full transition-colors cursor-pointer touch-manipulation"
        >
          <img
            src={BackButton}
            alt="BackButton"
            className="w-4 h-4 brightness-0 invert"
          />
        </button>

        <h2 className="text-lg sm:text-xl font-bold mb-1 pr-8">
          {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
        </h2>
        <p className="text-xs text-[#FFFFFF]/70 mb-3">
          {editingAnnouncement ? "Update the announcement details" : "Fill in the details to create a new announcement"}
        </p>
        <hr className="border-[#FFFFFF]/20 mb-4" />

        {/* Modal Body */}
        <div className="space-y-3">
          {/* Subject Display (Non-editable) */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#FFFFFF]/80">
              Subject <span className="text-[#A15353]">*</span>
            </label>
            <div className="w-full bg-[#23232C] border-2 border-[#23232C] text-[#FFFFFF] rounded-md px-3 py-2.5 flex items-center justify-between">
              <span className="text-xs">
                {(() => {
                  const currentSubj = getFilteredSubjects().find(subj => subj.subject_code === (selectedSubject || currentSubjectCode));
                  return currentSubj ? `${currentSubj.subject_name} (${currentSubj.subject_code}) - ${currentSubj.section}` : "Loading subject...";
                })()}
              </span>
            </div>
            <input
              type="hidden"
              value={selectedSubject || currentSubjectCode}
              onChange={(e) => setSelectedSubject(e.target.value)}
            />
          </div>

          {/* Deadline Input - FIXED: Remove min attribute when editing */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#FFFFFF]/80">Deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              // Only apply min attribute for NEW announcements, not when editing
              min={editingAnnouncement ? undefined : getCurrentDateTime()}
              className="announcement-deadline-input w-full border-2 border-[#23232C] bg-[#23232C] rounded-md px-3 py-2.5 outline-none text-xs focus:border-[#00A15D] transition-colors text-[#FFFFFF]"
              title={deadline ? `Current deadline: ${deadline}` : "Set a deadline"}
            />
          </div>

          {/* Title Input */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#FFFFFF]/80">
              Title <span className="text-[#A15353]">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full border-2 border-[#23232C] bg-[#23232C] rounded-md px-3 py-2.5 outline-none text-xs focus:border-[#00A15D] transition-colors text-[#FFFFFF] placeholder:text-[#FFFFFF]/50"
            />
          </div>

          {/* Instruction Textarea */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#FFFFFF]/80">
              Instruction <span className="text-[#A15353]">*</span>
            </label>
            <textarea
              placeholder="Enter instruction..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-2 border-[#23232C] bg-[#23232C] rounded-md px-3 py-2.5 outline-none min-h-[100px] resize-none text-xs focus:border-[#00A15D] transition-colors text-[#FFFFFF] placeholder:text-[#FFFFFF]/50"
            />
          </div>

          {/* Link Input */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#FFFFFF]/80">Insert Link</label>
            <input
              type="text"
              placeholder="Enter link (optional)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full border-2 border-[#23232C] bg-[#23232C] rounded-md px-3 py-2.5 outline-none text-xs focus:border-[#00A15D] transition-colors text-[#FFFFFF] placeholder:text-[#FFFFFF]/50"
            />
          </div>

          {/* Post Button */}
          <button
            onClick={handlePost}
            disabled={postingAnnouncement}
            className={`w-full text-[#FFFFFF] font-bold py-2.5 rounded-md transition-all duration-200 text-sm cursor-pointer touch-manipulation active:scale-98 ${
              postingAnnouncement 
                ? 'bg-[#23232C] cursor-not-allowed text-[#FFFFFF]/50' 
                : 'bg-[#00A15D] hover:bg-[#00874E] active:bg-[#006B3D]'
            }`}
          >
            {postingAnnouncement ? (
              <div className="flex items-center justify-center">
                <div className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-[#FFFFFF] border-r-transparent mr-1.5"></div>
                Posting...
              </div>
            ) : (
              editingAnnouncement ? "Update Announcement" : "Post Announcement"
            )}
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