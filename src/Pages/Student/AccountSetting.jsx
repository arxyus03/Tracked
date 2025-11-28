import React, { useState, useEffect } from 'react';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Settings from '../../assets/Settings(Light).svg';
import SuccessIcon from '../../assets/Success(Green).svg';
import ErrorIcon from '../../assets/Error(Red).svg';

export default function AccountSetting() {
  const [isOpen, setIsOpen] = useState(false); // Default to closed
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

  // Sidebar behavior based on screen size
  useEffect(() => {
    // Check screen size and set sidebar state accordingly
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint (1024px)
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // Check on initial load
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const userIdFromStorage = user.id;
        
        if (userIdFromStorage) {
          const response = await fetch(`https://tracked.6minds.site/Student/DashboardStudentDB/get_student_info.php?id=${userIdFromStorage}`);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
              setUserData(data.user);
              setEmail(data.user.tracked_email || '');
              setPhone(data.user.tracked_phone || '');
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Email validation function
  const validateEmail = (email) => {
    if (!email) {
      return true;
    }
    
    if (!email.endsWith('@cvsu.edu.ph')) {
      setPopupMessage('Only emails with @cvsu.edu.ph are allowed');
      setShowErrorPopup(true);
      return false;
    }
    
    return true;
  };

  // Phone number validation function
  const validatePhone = (phone) => {
    if (!phone) {
      return true;
    }
    
    if (phone.length !== 11) {
      setPopupMessage('Phone number must be exactly 11 digits');
      setShowErrorPopup(true);
      return false;
    }

    if (!/^\d+$/.test(phone)) {
      setPopupMessage('Phone number must contain only digits');
      setShowErrorPopup(true);
      return false;
    }
    
    return true;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow digits and limit to 11 characters
    if (/^\d*$/.test(value) && value.length <= 11) {
      setPhone(value);
    }
  };

  const handleUpdateAccountInfo = async (e) => {
    e.preventDefault();
    
    // Validate email before submission
    if (!validateEmail(email)) {
      return;
    }

    // Validate phone number before submission
    if (!validatePhone(phone)) {
      return;
    }

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

    try {
      const response = await fetch('https://tracked.6minds.site/Student/AccountSettingStudentDB/updateAccountInfo.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.tracked_ID,
          email: email,
          phone: phone,
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        setPopupMessage('Account information updated successfully');
        setShowSuccessPopup(true);
        setPassword('');
        // Refresh user data
        await fetchUserData();
      } else {
        setPopupMessage(data.message || 'Failed to update account information');
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Error updating account:', error);
      setPopupMessage('An error occurred while updating account information');
      setShowErrorPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
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
      setPopupMessage('New password must be at least 6 characters long');
      setShowErrorPopup(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://tracked.6minds.site/Student/AccountSettingStudentDB/changePassword.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.tracked_ID,
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setPopupMessage('Password changed successfully');
        setShowSuccessPopup(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPopupMessage(data.message || 'Failed to change password');
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPopupMessage('An error occurred while changing password');
      setShowErrorPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px]" : "ml-0"}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Loading..." />
          <div className="p-4 sm:p-5 md:p-6 lg:p-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center text-[#465746]">
              <p>Loading account settings...</p>
            </div>
          </div>
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
          userName={userData ? `${userData.tracked_fname} ${userData.tracked_lname}` : "Loading..."} 
        />

        {/* Main content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img src={Settings} alt="Settings" className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">Account Settings</h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">Update your Information</p>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mt-5">
            {/* Update Account Info */}
            <div className="bg-white rounded-md shadow-md p-4 sm:p-5 md:p-6 space-y-4">
              <p className="text-base sm:text-lg font-bold text-[#465746]">Update Account Information</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-[#465746]">Email Address:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="your.email@cvsu.edu.ph"
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-[#465746]">Phone Number:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="09XXXXXXXXX"
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                    maxLength="11"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-[#465746]">Password (to confirm):</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                    required
                  />
                </div>

                <button
                  onClick={handleUpdateAccountInfo}
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto bg-[#00A15D] text-white font-bold py-2 px-6 sm:px-8 rounded-md hover:bg-green-800 transition-colors duration-200 text-sm sm:text-base ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isSubmitting ? 'Updating...' : 'Submit'}
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-md shadow-md p-4 sm:p-5 md:p-6 space-y-4">
              <p className="text-base sm:text-lg font-bold text-[#465746]">Change Password</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-[#465746]">Current Password:</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-[#465746]">New Password:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-[#465746]">Re-Enter New Password:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
                    required
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto bg-[#00A15D] text-white font-bold py-2 px-6 sm:px-8 rounded-md hover:bg-green-800 transition-colors duration-200 text-sm sm:text-base ${
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
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSuccessPopup(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <img 
                  src={SuccessIcon} 
                  alt="Success" 
                  className="h-8 w-8"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Success!
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">{popupMessage}</p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowErrorPopup(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <img 
                  src={ErrorIcon} 
                  alt="Error" 
                  className="h-8 w-8"
                />
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-6">{popupMessage}</p>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

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
}