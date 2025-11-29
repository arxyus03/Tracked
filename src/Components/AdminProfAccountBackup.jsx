import React from "react";
import SuccessIcon from "../assets/Success(Green).svg";
import ErrorIcon from "../assets/Error(Red).svg";

const AdminProfAccountBackup = ({ show, content, onClose }) => {
  if (!show || !content) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          {/* Icon */}
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
            content.type === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <img 
              src={content.type === 'success' ? SuccessIcon : ErrorIcon} 
              alt={content.type === 'success' ? 'Success' : 'Error'} 
              className="h-8 w-8" 
            />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {content.title}
          </h3>
          
          <div className="mt-4 mb-6">
            <p className="text-sm text-gray-600 mb-3">
              {content.message}
            </p>
            {content.filename && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 break-words">
                    <span className="font-semibold">File:</span> {content.filename}
                  </p>
                  {content.filepath && (
                    <p className="text-xs text-gray-500 break-words">
                      <span className="font-semibold">Location:</span> {content.filepath}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#00A15D] hover:bg-[#00874E] text-white font-bold rounded-md transition-all duration-200 cursor-pointer"
            >
              OK
            </button>
          </div>
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

export default AdminProfAccountBackup;