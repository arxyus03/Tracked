import React from "react";
import ArchiveWarningIcon from "../assets/Warning(Yellow).svg";

const AdminProfAccountStatus = ({ show, professor, onClose, onConfirm }) => {
  if (!show || !professor) return null;

  const isDeactivating = professor.tracked_Status === "Active";
  const action = isDeactivating ? "Deactivate" : "Activate";
  const confirmColor = isDeactivating ? "bg-[#FF6666] hover:bg-[#FF5555]" : "bg-[#00A15D] hover:bg-[#00874E]";

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
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <img 
              src={ArchiveWarningIcon} 
              alt="Warning" 
              className="h-8 w-8" 
            />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {action} Account?
          </h3>
          
          <div className="mt-4 mb-6">
            <p className="text-sm text-gray-600 mb-3">
              Are you sure you want to {action.toLowerCase()} this professor account?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                {professor.tracked_firstname} {professor.tracked_lastname}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                ID: {professor.tracked_ID}
              </p>
              <p className="text-sm text-gray-600">
                Email: {professor.tracked_email}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 ${confirmColor} text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer`}
            >
              {action}
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

export default AdminProfAccountStatus;