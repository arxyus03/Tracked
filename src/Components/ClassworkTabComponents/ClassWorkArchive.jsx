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
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-3 sm:p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4 p-4 sm:p-6 md:p-8 relative modal-pop">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-yellow-100 mb-3 sm:mb-4">
            <img 
              src={ArchiveWarningIcon} 
              alt="Warning" 
              className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" 
            />
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
            Archive Activity?
          </h3>
          
          {/* Content */}
          <div className="mt-3 sm:mt-4 md:mt-5 mb-4 sm:mb-5 md:mb-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
              Are you sure you want to archive this activity?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-left">
              <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 break-words">
                {activity.title}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                Type: {activity.activity_type}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                Task: {activity.task_number}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 sm:py-3 rounded-md transition-all duration-200 cursor-pointer text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(activity);
                onClose();
              }}
              className="flex-1 bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-2.5 sm:py-3 rounded-md transition-all duration-200 cursor-pointer text-sm sm:text-base"
            >
              Archive
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .overlay-fade { 
          animation: overlayFade .18s ease-out both; 
        }
        @keyframes overlayFade { 
          from { opacity: 0 } 
          to { opacity: 1 } 
        }

        .modal-pop {
          transform-origin: top center;
          animation: popIn .22s cubic-bezier(.2,.8,.2,1) both;
        }
        @keyframes popIn {
          from { 
            opacity: 0; 
            transform: translateY(-8px) scale(.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);    
          }
        }

        /* Custom breakpoint for extra small screens */
        @media (min-width: 475px) {
          .xs\\:flex-row {
            flex-direction: row;
          }
        }

        /* Mobile-specific optimizations */
        @media (max-width: 640px) {
          .modal-pop {
            margin: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ClassWorkArchive;