import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import ClassManagementLight from '../../assets/ClassManagement(Light).svg';
import BackButton from '../../assets/BackButton(Light).svg';

export default function SuperAdminProfAccountDetails() {
  const [isOpen, setIsOpen] = useState(false);  
  const [popupType, setPopupType] = useState(null);
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const professorId = searchParams.get('id');

  const baseUrl = "https://tracked.6minds.site/SuperAdmin/SuperAdminDB";

  useEffect(() => {
    if (professorId) {
      fetchProfessorDetails();
    }
  }, [professorId]);

  const fetchProfessorDetails = async () => {
    try {
      const response = await fetch(`${baseUrl}/get_superadmin_professor_details.php?id=${professorId}`);
      const data = await response.json();
      if (data.success) {
        setProfessor(data.professor);
      } else {
        console.error("Error fetching professor details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching professor details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch(`${baseUrl}/reset_user_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: professorId, userType: 'professor' })
      });
      const data = await response.json();
      if (data.success) {
        alert('Password reset successfully!');
        setPopupType(null);
      } else {
        alert('Failed to reset password: ' + data.message);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert('Error resetting password');
    }
  };

  const handleToggleAccount = async () => {
    try {
      const response = await fetch(`${baseUrl}/update_user_status.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: professorId, 
          status: professor?.tracked_Status === 'Active' ? 'Deactivated' : 'Active',
          userType: 'professor'
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Account ${professor?.tracked_Status === 'Active' ? 'deactivated' : 'activated'} successfully!`);
        setPopupType(null);
        fetchProfessorDetails();
      } else {
        alert('Failed to update account status: ' + data.message);
      }
    } catch (error) {
      console.error("Error updating account status:", error);
      alert('Error updating account status');
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'text-[#00A15D]' : 'text-[#FF6666]';
  };

  const getDisplayName = (user) => {
    return `${user.tracked_firstname} ${user.tracked_middlename ? user.tracked_middlename + ' ' : ''}${user.tracked_lastname}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return 'N/A';
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div>
        <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 flex justify-center items-center">
            <div className="text-[#465746]">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!professor) {
    return (
      <div>
        <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 flex justify-center items-center">
            <div className="text-[#465746]">Professor not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`
        transition-all duration-300
        ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}
      `}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={ClassManagementLight}
                alt="ClassManagement"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                User Management
              </h1>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>Professor Account Details - {professor.tracked_ID}</span>
              <Link to="/SuperAdminLanding">
                <img
                  src={BackButton}
                  alt="BackButton"
                  className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 hover:opacity-70 transition-opacity sm:hidden"
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl space-y-5 sm:space-y-6 shadow-md text-[#465746]">
            {/* Professor Information Section */}
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                Professor Information
              </h2>
              <div className="space-y-3 sm:space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Professor Name:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">
                    {getDisplayName(professor)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Faculty ID:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">{professor.tracked_ID}</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    CVSU Email Address:
                  </span>
                  <span className="sm:col-span-2 text-[#465746] break-all sm:break-normal">
                    {professor.tracked_email}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Phone Number:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">
                    {professor.tracked_phone || 'N/A'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Age:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">
                    {calculateAge(professor.tracked_bday)}
                  </span>
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                Professional Information
              </h2>
              <div className="space-y-3 sm:space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Department:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">
                    {professor.tracked_program || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                Account Information
              </h2>
              <div className="space-y-3 sm:space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Date Created:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">
                    {formatDate(professor.created_at)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Last Updated:
                  </span>
                  <span className="sm:col-span-2 text-[#465746]">
                    {formatDate(professor.updated_at)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm sm:text-base">
                  <span className="font-semibold text-gray-600 sm:text-[#465746] sm:font-normal">
                    Account Status:
                  </span>
                  <span className={`sm:col-span-2 font-bold ${getStatusColor(professor.tracked_Status)}`}>
                    {professor.tracked_Status}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 sm:pt-5 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Reset Password */}
                <button 
                  onClick={() => setPopupType("reset")} 
                  className="font-bold text-white py-2.5 px-4 sm:px-6 bg-[#00874E] rounded-md shadow-md text-center hover:bg-[#006F3A] text-sm sm:text-base w-full sm:w-auto transition-colors duration-200 cursor-pointer"
                >
                  Reset Password
                </button>

                {/* Toggle Account Status */}
                <button 
                  onClick={() => setPopupType("toggle")}  
                  className={`font-bold text-white py-2.5 px-4 sm:px-6 rounded-md shadow-md text-center text-sm sm:text-base w-full sm:w-auto transition-colors duration-200 cursor-pointer ${
                    professor.tracked_Status === 'Active' 
                      ? 'bg-[#FF6666] hover:bg-[#E55555]' 
                      : 'bg-[#00874E] hover:bg-[#006F3A]'
                  }`}
                >
                  {professor.tracked_Status === 'Active' ? 'Disable Account' : 'Enable Account'}
                </button>
              </div>
            </div>

            {/* Popup */}
            {popupType === "reset" && (
              <Popup 
                setOpen={() => setPopupType(null)} 
                message="Do you really want to reset this password? The default password will be 'password123'." 
                confirmText="Reset" 
                buttonColor="#00874E" 
                hoverColor="#006F3A"
                onConfirm={handleResetPassword}
              />
            )}

            {popupType === "toggle" && (
              <Popup 
                setOpen={() => setPopupType(null)} 
                message={`Are you sure you want to ${professor.tracked_Status === 'Active' ? 'disable' : 'enable'} this account?`} 
                confirmText={professor.tracked_Status === 'Active' ? 'Disable' : 'Enable'} 
                buttonColor={professor.tracked_Status === 'Active' ? '#FF6666' : '#00874E'} 
                hoverColor={professor.tracked_Status === 'Active' ? '#C23535' : '#006F3A'}
                onConfirm={handleToggleAccount}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}