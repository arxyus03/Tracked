import React, { useState, useEffect } from 'react';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Settings from '../../assets/Settings.svg';
import SuccessIcon from '../../assets/Success(Green).svg';
import ErrorIcon from '../../assets/Error(Red).svg';

export default function AccountSetting() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // Added theme state
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Check initial theme
    handleThemeChange();
    
    // Listen for theme changes
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsOpen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
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

  // Theme-based style functions
  const getBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getCardBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getPopupBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getInputBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-100";
  };

  const getInputBorderColor = () => {
    return isDarkMode ? "border-[#23232C]" : "border-gray-300";
  };

  const getInputFocusBorderColor = () => {
    return isDarkMode ? "focus:border-[#00A15D]" : "focus:border-[#00A15D]";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/80" : "text-gray-600";
  };

  const getMutedTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/50" : "text-gray-500";
  };

  const getLabelTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/70" : "text-gray-600";
  };

  const getDividerColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/30" : "border-gray-300";
  };

  const getPopupTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]" : "text-gray-900";
  };

  const getPopupSecondaryTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/70" : "text-gray-600";
  };

  const validateEmail = (email) => {
    if (!email) return true;
    
    if (!email.endsWith('@cvsu.edu.ph')) {
      setPopupMessage('Only emails with @cvsu.edu.ph are allowed');
      setShowErrorPopup(true);
      return false;
    }
    
    return true;
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    
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
    if (/^\d*$/.test(value) && value.length <= 11) {
      setPhone(value);
    }
  };

  const handleUpdateAccountInfo = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) return;
    if (!validatePhone(phone)) return;

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
      <div className={`min-h-screen ${getBackgroundColor()}`}>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Loading..." />
          <div className="p-4 sm:p-5 md:p-6 lg:p-8">
            <div className={`${getCardBackgroundColor()} p-6 rounded-lg shadow-md text-center`}>
              <p className={getSecondaryTextColor()}>Loading account settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getBackgroundColor()}`}>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header 
          setIsOpen={setIsOpen} 
          isOpen={isOpen} 
          userName={userData ? `${userData.tracked_fname} ${userData.tracked_lname}` : "Loading..."} 
        />

        <div className={`p-4 sm:p-5 md:p-6 lg:p-8 ${getTextColor()}`}>
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img 
                src={Settings} 
                alt="Settings" 
                className="h-7 w-7 sm:h-8 sm:w-8 mr-2 sm:mr-3"
                style={!isDarkMode ? { filter: 'invert(0.5)' } : {}}
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">Account Settings</h1>
            </div>
            <p className={`text-sm sm:text-base lg:text-lg ${getSecondaryTextColor()}`}>Update your Information</p>
          </div>

          <hr className={`${getDividerColor()} mb-5 sm:mb-6`} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {/* Update Account Info */}
            <div className={`${getCardBackgroundColor()} rounded-lg shadow-md p-4 space-y-4`}>
              <p className={`text-lg font-bold ${getTextColor()}`}>Update Account Information</p>

              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${getLabelTextColor()}`}>Email Address:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="your.email@cvsu.edu.ph"
                    className={`w-full p-2.5 text-sm border-2 ${getInputBorderColor()} ${getInputBackgroundColor()} rounded-md focus:outline-none ${getInputFocusBorderColor()} ${getTextColor()} placeholder:${getMutedTextColor()}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${getLabelTextColor()}`}>Phone Number:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="09XXXXXXXXX"
                    className={`w-full p-2.5 text-sm border-2 ${getInputBorderColor()} ${getInputBackgroundColor()} rounded-md focus:outline-none ${getInputFocusBorderColor()} ${getTextColor()} placeholder:${getMutedTextColor()}`}
                    maxLength="11"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${getLabelTextColor()}`}>Password (to confirm):</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full p-2.5 text-sm border-2 ${getInputBorderColor()} ${getInputBackgroundColor()} rounded-md focus:outline-none ${getInputFocusBorderColor()} ${getTextColor()} placeholder:${getMutedTextColor()}`}
                    required
                  />
                </div>

                <button
                  onClick={handleUpdateAccountInfo}
                  disabled={isSubmitting}
                  className={`w-full bg-[#00A15D] text-white font-bold py-2.5 rounded-md hover:bg-[#00874E] transition-all duration-200 text-sm cursor-pointer ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Updating...' : 'Submit'}
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className={`${getCardBackgroundColor()} rounded-lg shadow-md p-4 space-y-4`}>
              <p className={`text-lg font-bold ${getTextColor()}`}>Change Password</p>

              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${getLabelTextColor()}`}>Current Password:</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className={`w-full p-2.5 text-sm border-2 ${getInputBorderColor()} ${getInputBackgroundColor()} rounded-md focus:outline-none ${getInputFocusBorderColor()} ${getTextColor()} placeholder:${getMutedTextColor()}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${getLabelTextColor()}`}>New Password:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={`w-full p-2.5 text-sm border-2 ${getInputBorderColor()} ${getInputBackgroundColor()} rounded-md focus:outline-none ${getInputFocusBorderColor()} ${getTextColor()} placeholder:${getMutedTextColor()}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${getLabelTextColor()}`}>Re-Enter New Password:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={`w-full p-2.5 text-sm border-2 ${getInputBorderColor()} ${getInputBackgroundColor()} rounded-md focus:outline-none ${getInputFocusBorderColor()} ${getTextColor()} placeholder:${getMutedTextColor()}`}
                    required
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={isSubmitting}
                  className={`w-full bg-[#00A15D] text-white font-bold py-2.5 rounded-md hover:bg-[#00874E] transition-all duration-200 text-sm cursor-pointer ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
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
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSuccessPopup(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className={`${getPopupBackgroundColor()} ${getPopupTextColor()} rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 relative`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-[#00A15D]/20 mb-3">
                <img src={SuccessIcon} alt="Success" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Success!</h3>
              <p className={`text-sm ${getPopupSecondaryTextColor()} mb-4`}>{popupMessage}</p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-2.5 rounded transition-all duration-200 cursor-pointer text-sm"
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
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowErrorPopup(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className={`${getPopupBackgroundColor()} ${getPopupTextColor()} rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 relative`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-[#A15353]/20 mb-3">
                <img src={ErrorIcon} alt="Error" className="h-6 w-6" />
              </div>
              <p className={`text-sm ${getPopupSecondaryTextColor()} mb-4`}>{popupMessage}</p>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="w-full bg-[#A15353] hover:bg-[#8A4545] text-white font-bold py-2.5 rounded transition-all duration-200 cursor-pointer text-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}