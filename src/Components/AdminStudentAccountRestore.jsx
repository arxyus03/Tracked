import React from "react";
import ArchiveWarningIcon from "../assets/Warning(Yellow).svg";
import SuccessIcon from "../assets/Success(Green).svg";
import ErrorIcon from "../assets/Error(Red).svg";

const AdminStudentAccountRestore = ({ show, content, onClose, onConfirm }) => {
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
          {content.type === 'confirmation' ? (
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <img 
                src={ArchiveWarningIcon} 
                alt="Warning" 
                className="h-8 w-8" 
              />
            </div>
          ) : (
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
              content.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <img 
                src={content.type === 'success' ? SuccessIcon : ErrorIcon} 
                alt={content.type === 'success' ? 'Success' : 'Error'} 
                className="h-8 w-8" 
              />
            </div>
          )}

          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {content.title}
          </h3>
          
          <div className="mt-4 mb-6">
            <p className="text-sm text-gray-600 mb-3">
              {content.message}
            </p>
            {content.filename && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-600">
                  <strong>Restored from:</strong> {content.filename}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {content.type === 'confirmation' ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  {content.cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 bg-[#00874E] hover:bg-[#00743E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  {content.confirmText}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 bg-[#00874E] hover:bg-[#00743E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
              >
                OK
              </button>
            )}
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

export default AdminStudentAccountRestore;