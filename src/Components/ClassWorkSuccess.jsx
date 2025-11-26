import React from 'react';
import SuccessIcon from '../assets/Success(Green).svg';

const ClassWorkSuccess = ({ 
  isOpen, 
  onClose,
  message = "Operation completed successfully!"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-3 sm:p-4 md:p-6">
      <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4 p-4 sm:p-6 md:p-8 relative modal-pop">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-green-100 mb-3 sm:mb-4">
            <img 
              src={SuccessIcon} 
              alt="Success" 
              className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8"
            />
          </div>

          {/* Success Title */}
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
            Success!
          </h3>
          
          {/* Success Message */}
          <p className="text-xs sm:text-sm md:text-base text-gray-600 px-2 sm:px-0">
            {message}
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-4 sm:mt-5 md:mt-6 w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200 cursor-pointer text-sm sm:text-base"
          >
            Continue
          </button>
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

        /* Mobile-specific optimizations */
        @media (max-width: 640px) {
          .modal-pop {
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ClassWorkSuccess;