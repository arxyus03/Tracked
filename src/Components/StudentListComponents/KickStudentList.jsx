import React from 'react';
import PersonIcon from '../../assets/Person.svg';

const KickStudentList = ({ isOpen, student, onClose, onConfirm }) => {
  if (!isOpen || !student) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
        <div className="text-center">

          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Remove Student?
          </h3>
          
          <div className="mt-4 mb-6">
            <p className="text-sm text-gray-600 mb-3">
              Are you sure you want to remove this student from the class?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <img src={PersonIcon} alt="Person" className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {student.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Student
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              This action cannot be undone. The student will lose access to all class materials.
            </p>
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
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
            >
              Remove Student
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

export default KickStudentList;