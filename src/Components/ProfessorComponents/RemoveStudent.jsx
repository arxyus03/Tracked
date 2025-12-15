import React from 'react';
import Cross from "../../assets/Cross(Light).svg";

const RemoveStudent = ({ isOpen, onClose, onConfirm, student }) => {
  if (!isOpen || !student) return null;

  const handleConfirm = () => {
    onConfirm(student);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Remove Student from Class
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
          >
            <img src={Cross} alt="Close" className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to remove <span className="font-semibold text-gray-900">{student.name}</span> from this class?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-sm text-red-700 font-medium">This action will:</p>
            <ul className="text-sm text-red-600 mt-2 list-disc list-inside space-y-1">
              <li>Permanently remove the student from this class</li>
              <li>Delete all their attendance records for this class</li>
              <li>Delete all their activity grades for this class</li>
            </ul>
          </div>
          <p className="text-sm text-gray-500">
            This action cannot be undone. The student will need to re-join the class if they want to participate again.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 cursor-pointer"
          >
            Remove Student
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveStudent;