import React from 'react';
import ArchiveWarningIcon from '../../assets/Warning(Yellow).svg';

const ClassWorkArchive = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  activity,
  isDarkMode = true 
}) => {
  if (!isOpen || !activity) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-3"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`rounded-lg w-full max-w-xs mx-2 p-4 relative ${
        isDarkMode ? 'bg-[#15151C] text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-3 ${
            isDarkMode ? 'bg-[#23232C]' : 'bg-gray-100'
          }`}>
            <img 
              src={ArchiveWarningIcon} 
              alt="Warning" 
              className="h-5 w-5"
            />
          </div>

          <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Archive Activity?
          </h3>
          
          <div className="mt-3 mb-4">
            <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This will move the activity to the archive section.
            </p>
            <div className={`rounded p-3 text-left ${
              isDarkMode ? 'bg-[#23232C]' : 'bg-gray-50'
            }`}>
              <p className={`text-sm font-medium break-words ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {activity.title}
              </p>
              <div className="flex gap-3 mt-1">
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {activity.activity_type}
                </span>
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  • Task {activity.task_number}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`flex-1 font-medium py-2 rounded text-sm transition-colors ${
                isDarkMode 
                  ? 'bg-[#23232C] hover:bg-[#2a2a34] text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
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