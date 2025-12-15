import React from 'react';
import SuccessIcon from '../../assets/Success(Green).svg';

const ClassWorkSuccess = ({ 
  isOpen, 
  onClose,
  message = "Operation completed successfully!",
  type = "success" // "success", "duplicate", "edit", "grade", "archive"
}) => {
  if (!isOpen) return null;

  const getModalConfig = () => {
    switch (type) {
      case "duplicate":
        return {
          title: "Duplicate Task Number",
          icon: (
            <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-[#A15353]/20 mb-2">
              <svg className="h-4 w-4 text-[#A15353]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          ),
          buttonText: "OK",
          buttonClass: "bg-[#A15353] hover:bg-[#8a3d3d] text-white"
        };
      
      case "edit":
        return {
          title: "Changes Saved!",
          icon: (
            <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-[#767EE0]/20 mb-2">
              <svg className="h-4 w-4 text-[#767EE0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          ),
          buttonText: "Continue",
          buttonClass: "bg-[#767EE0] hover:bg-[#5a62c4] text-white"
        };
      
      case "grade":
        return {
          title: "Graded Successfully!",
          icon: (
            <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-[#00A15D]/20 mb-2">
              <img 
                src={SuccessIcon} 
                alt="Success" 
                className="h-4 w-4"
              />
            </div>
          ),
          buttonText: "Continue",
          buttonClass: "bg-[#00A15D] hover:bg-[#00874E] text-white"
        };
      
      case "archive":
        return {
          title: "Archived Successfully!",
          icon: (
            <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-[#FFA600]/20 mb-2">
              <svg className="h-4 w-4 text-[#FFA600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          ),
          buttonText: "Continue",
          buttonClass: "bg-[#FFA600] hover:bg-[#e69500] text-white"
        };
      
      default: // success
        return {
          title: "Success!",
          icon: (
            <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-[#00A15D]/20 mb-2">
              <img 
                src={SuccessIcon} 
                alt="Success" 
                className="h-4 w-4"
              />
            </div>
          ),
          buttonText: "Continue",
          buttonClass: "bg-[#00A15D] hover:bg-[#00874E] text-white"
        };
    }
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 overlay-fade p-3">
      <div className="bg-[#15151C] text-white rounded-lg shadow-xl w-full max-w-xs mx-2 p-4 border border-[#2D2D3A] modal-pop">
        <div className="text-center">
          {/* Icon */}
          {config.icon}

          {/* Title */}
          <h3 className="text-base font-bold text-white mb-1">
            {config.title}
          </h3>
          
          {/* Message */}
          <div className={`mb-3 text-xs text-gray-300 ${
            type === 'duplicate' ? 'whitespace-pre-line' : ''
          }`}>
            {message}
          </div>

          {/* Button */}
          <button
            onClick={onClose}
            className={`w-full px-4 py-1.5 font-medium rounded transition-colors duration-200 cursor-pointer text-xs ${config.buttonClass}`}
          >
            {config.buttonText}
          </button>
        </div>
      </div>

      <style>{`
        .overlay-fade { 
          animation: overlayFade .15s ease-out both; 
        }
        @keyframes overlayFade { 
          from { opacity: 0 } 
          to { opacity: 1 } 
        }

        .modal-pop {
          transform-origin: center;
          animation: popIn .2s cubic-bezier(.2,.8,.2,1) both;
        }
        @keyframes popIn {
          from { 
            opacity: 0; 
            transform: translateY(-6px) scale(.96); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);    
          }
        }
      `}</style>
    </div>
  );
};

export default ClassWorkSuccess;