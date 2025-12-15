import React from 'react';
import ArchiveWarningIcon from '../../assets/Warning(Yellow).svg';

const ClassWorkArchive = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  activity 
}) => {
  if (!isOpen || !activity) return null;

  return (
    <div
      className="fixed inset-0 bg-[#23232C]/80 flex justify-center items-center z-50 p-3"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-[#15151C] text-white rounded-lg w-full max-w-xs mx-2 p-4 relative">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#23232C] mb-3">
            <img 
              src={ArchiveWarningIcon} 
              alt="Warning" 
              className="h-5 w-5" 
            />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2">
            Archive Activity?
          </h3>
          
          {/* Content */}
          <div className="mt-3 mb-4">
            <p className="text-xs text-gray-400 mb-2">
              This will move the activity to the archive section.
            </p>
            <div className="bg-[#23232C] rounded p-3 text-left">
              <p className="text-sm font-medium text-white break-words">
                {activity.title}
              </p>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-gray-400">
                  {activity.activity_type}
                </span>
                <span className="text-xs text-gray-400">
                  • Task {activity.task_number}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-[#23232C] hover:bg-[#2a2a34] text-white font-medium py-2 rounded text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(activity);
                onClose();
              }}
              className="flex-1 bg-[#00A15D] hover:bg-[#00874E] text-white font-medium py-2 rounded text-sm transition-colors"
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassWorkArchive;