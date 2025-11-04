import React, { useState, useEffect } from 'react';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Settings from '../../assets/Settings(Light).svg';
import SuccessIcon from '../../assets/Success(Green).svg';
import ErrorIcon from '../../assets/Error(Red).svg';

export default function AccountSetting() {
  const [isOpen, setIsOpen] = useState(false);

  // Simulated student data
  const mockUserData = {
    tracked_fname: "Angela",
    tracked_lname: "Reyes",
    tracked_email: "angela.reyes@cvsu.edu.ph",
    tracked_phone: "09181234567",
  };

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Change password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Popup and message states
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulate loading student data
  useEffect(() => {
    setTimeout(() => {
      setUserData(mockUserData);
      setEmail(mockUserData.tracked_email);
      setPhone(mockUserData.tracked_phone);
      setLoading(false);
    }, 500);
  }, []);

  // Email validation
  const validateEmail = (email) => {
    if (!email.endsWith('@cvsu.edu.ph')) {
      setPopupMessage('Only emails with @cvsu.edu.ph are allowed');
      setShowErrorPopup(true);
      return false;
    }
    return true;
  };

  // Phone validation
  const validatePhone = (phone) => {
    if (phone.length !== 11 || !/^\d+$/.test(phone)) {
      setPopupMessage('Phone number must be 11 digits');
      setShowErrorPopup(true);
      return false;
    }
    return true;
  };

  // Update Account Info (front-end only)
  const handleUpdateAccountInfo = (e) => {
    e.preventDefault();

    if (!validateEmail(email) || !validatePhone(phone)) return;

    if (!password) {
      setPopupMessage('Please enter your password to confirm changes');
      setShowErrorPopup(true);
      return;
    }

    if (email === userData.tracked_email && phone === userData.tracked_phone) {
      setPopupMessage('No changes detected');
      setShowErrorPopup(true);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setUserData({ ...userData, tracked_email: email, tracked_phone: phone });
      setPopupMessage('Account information updated successfully');
      setShowSuccessPopup(true);
      setPassword('');
      setIsSubmitting(false);
    }, 1000);
  };

  // Change Password (front-end only)
  const handleChangePassword = (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPopupMessage('Please fill in all password fields');
      setShowErrorPopup(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPopupMessage('New passwords do not match');
      setShowErrorPopup(true);
      return;
    }

    if (newPassword.length < 6) {
      setPopupMessage('New password must be at least 6 characters');
      setShowErrorPopup(true);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setPopupMessage('Password changed successfully');
      setShowSuccessPopup(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSubmitting(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px]" : "ml-0"}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Loading..." />
          <div className="p-6 text-center text-[#465746]">Loading account settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px]" : "ml-0"}`}>
        <Header 
          setIsOpen={setIsOpen} 
          isOpen={isOpen} 
          userName={`${userData.tracked_fname} ${userData.tracked_lname}`} 
        />

        {/* Main content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img src={Settings} alt="Settings" className="h-6 w-6 mr-2" />
              <h1 className="font-bold text-xl sm:text-2xl text-[#465746]">Account Settings</h1>
            </div>
            <p className="text-sm sm:text-base text-[#465746]">Update your Information</p>
          </div>

          <hr className="border-[#465746]/30 mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Update Account Info */}
            <div className="bg-white rounded-md shadow-md p-5 space-y-4">
              <p className="text-base sm:text-lg font-bold text-[#465746]">Update Account Information</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#465746]">Email Address:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-[#465746]">Phone Number:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-[#465746]">Password (to confirm):</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                  />
                </div>

                <button
                  onClick={handleUpdateAccountInfo}
                  disabled={isSubmitting}
                  className={`w-full bg-[#00A15D] text-white font-bold py-2 rounded-md hover:bg-green-800 transition-all ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isSubmitting ? 'Updating...' : 'Submit'}
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-md shadow-md p-5 space-y-4">
              <p className="text-base sm:text-lg font-bold text-[#465746]">Change Password</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#465746]">Current Password:</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-[#465746]">New Password:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-[#465746]">Re-Enter New Password:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={isSubmitting}
                  className={`w-full bg-[#00A15D] text-white font-bold py-2 rounded-md hover:bg-green-800 transition-all ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isSubmitting ? 'Changing...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <PopupOverlay
          icon={SuccessIcon}
          message={popupMessage}
          color="green"
          onClose={() => setShowSuccessPopup(false)}
        />
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <PopupOverlay
          icon={ErrorIcon}
          message={popupMessage}
          color="red"
          onClose={() => setShowErrorPopup(false)}
        />
      )}
    </div>
  );
}

// Popup Component (reused for success/error)
function PopupOverlay({ icon, message, color, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-${color}-100 mb-4`}>
          <img src={icon} alt={color === 'green' ? 'Success' : 'Error'} className="h-8 w-8" />
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <button
          onClick={onClose}
          className={`w-full bg-${color === 'green' ? '[#00A15D]' : 'red-600'} hover:bg-${color === 'green' ? 'green-800' : 'red-700'} text-white font-bold py-3 rounded-md transition-all`}
        >
          OK
        </button>
      </div>
    </div>
  );
}
