import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Lottie from "lottie-react";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import ClassManagementLight from "../../assets/ClassManagement(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";
import loadingAnimation from "../../assets/system-regular-716-spinner-three-dots-loop-expand.json";

export default function UserManagement_ProfessorAccountDetails() {
  const [isOpen, setIsOpen] = useState(true);
  const [popupType, setPopupType] = useState(null);
  const [professor, setProfessor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    tracked_firstname: "",
    tracked_middlename: "",
    tracked_lastname: "",
    tracked_phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [professorClasses, setProfessorClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);

  const location = useLocation();

  // Animation configuration
  const defaultLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  // Extract professor ID from URL
  const getProfessorId = () => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get("id");
  };

  useEffect(() => {
    const professorId = getProfessorId();
    if (professorId) {
      fetchProfessorData(professorId);
      fetchProfessorClasses(professorId);
    }
  }, [location.search]);

  const fetchProfessorData = (professorId) => {
    setIsLoading(true);
    fetch(
      `https://tracked.6minds.site/Admin/ProfessorAccountsDB/get_professors.php?id=${professorId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.professor) {
          setProfessor(data.professor);
          setEditedData({
            tracked_firstname: data.professor.tracked_firstname || "",
            tracked_middlename: data.professor.tracked_middlename || "",
            tracked_lastname: data.professor.tracked_lastname || "",
            tracked_phone: data.professor.tracked_phone || "",
          });
        } else {
          setPopupType("error");
        }
      })
      .catch((err) => {
        setPopupType("error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchProfessorClasses = (professorId) => {
    setClassesLoading(true);
    fetch(
      `https://tracked.6minds.site/Admin/ProfessorAccountsDB/get_professor_classes.php?professor_id=${professorId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfessorClasses(data.classes || []);
        } else {
          setProfessorClasses([]);
        }
      })
      .catch((err) => {
        setProfessorClasses([]);
      })
      .finally(() => {
        setClassesLoading(false);
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatClassesDisplay = () => {
    if (classesLoading) {
      return (
        <div className="flex items-center text-gray-500">
          <div className="w-4 h-4 mr-2">
            <Lottie 
              {...defaultLottieOptions}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          Loading classes...
        </div>
      );
    }
    
    if (professorClasses.length === 0) {
      return "No classes assigned";
    }

    return professorClasses.map(cls => 
      `${cls.subject} (${cls.subject_code}) - ${cls.section}`
    ).join(", ");
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset to original values
    if (professor) {
      setEditedData({
        tracked_firstname: professor.tracked_firstname || "",
        tracked_middlename: professor.tracked_middlename || "",
        tracked_lastname: professor.tracked_lastname || "",
        tracked_phone: professor.tracked_phone || "",
      });
    }
  };

  const handleSaveClick = async () => {
    if (!professor) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://tracked.6minds.site/Admin/ProfessorAccountsDB/update_professor.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tracked_ID: professor.tracked_ID,
            ...editedData,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setProfessor((prev) => ({
          ...prev,
          ...editedData,
        }));
        setIsEditing(false);
        setPopupType("success");
      } else {
        setPopupType("error");
      }
    } catch (error) {
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Loading state for initial professor data
  if (!professor) {
    return (
      <div>
        <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-4 sm:p-5 md:p-6 lg:p-8">
            <div className="flex flex-col justify-center items-center h-64">
              <div className="w-24 h-24 mb-4">
                <Lottie 
                  {...defaultLottieOptions}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <p className="text-[#465746] text-lg font-medium">Loading professor details...</p>
            </div>
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
          {/* Page Header */}
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
              <span>Professor Account Details</span>
              <Link to="/UserManagementProfessorAccounts">
                <img
                  src={BackButton}
                  alt="BackButton"
                  className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 hover:opacity-70 transition-opacity"
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Loading overlay for professor data */}
          {isLoading && (
            <div className="flex flex-col justify-center items-center py-12 bg-white rounded-lg shadow-md">
              <div className="w-20 h-20 mb-4">
                <Lottie 
                  {...defaultLottieOptions}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <p className="text-[#465746] text-lg font-medium">Loading professor information...</p>
            </div>
          )}

          {/* Main Content */}
          {!isLoading && (
            <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl space-y-5 sm:space-y-6 shadow-md text-[#465746]">
              
              {/* Professor Information */}
              <div>
                <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                  Professor Information
                </h2>
                <div className="space-y-3 sm:space-y-2">
                  {/* Editable fields when in edit mode */}
                  {['First Name', 'Middle Name', 'Last Name', 'Phone Number'].map((field, index) => {
                    const fieldKey = field.toLowerCase().replace(' ', '_').replace(' phone', '_phone');
                    const apiKey = `tracked_${fieldKey}`;
                    
                    return (
                      <div key={index} className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                        <span className="font-medium text-gray-600">{field} :</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedData[apiKey]}
                            onChange={(e) => handleInputChange(apiKey, e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00874E] focus:border-transparent"
                          />
                        ) : (
                          <span>{professor[apiKey] || "N/A"}</span>
                        )}
                      </div>
                    );
                  })}

                  {/* Non-editable fields */}
                  {[
                    { label: 'Sex', key: 'tracked_gender' },
                    { label: 'Date of Birth', key: 'tracked_bday', format: formatDate },
                    { label: 'Professor ID', key: 'tracked_ID' },
                    { label: 'CVSU Email Address', key: 'tracked_email' },
                    { label: 'Temporary Password', key: 'temporary_password' }
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                      <span className="font-medium text-gray-600">{item.label} :</span>
                      <span className={item.label === 'CVSU Email Address' ? "break-all" : ""}>
                        {item.format ? item.format(professor[item.key]) : professor[item.key] || "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="opacity-10 border-[#465746] rounded border-1 mb-6" />

              {/* Professional Information */}
              <div>
                <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                  Professional Information
                </h2>
                <div className="space-y-3 sm:space-y-2">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Department :</span>
                    <span>{professor.tracked_program || "N/A"}</span>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                    <span className="font-medium text-gray-600">Subject Handled :</span>
                    <span className={classesLoading ? "text-gray-400 italic" : ""}>
                      {formatClassesDisplay()}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="opacity-10 border-[#465746] rounded border-1 mb-6" />

              {/* Account Information */}
              <div>
                <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                  Account Information
                </h2>
                <div className="space-y-3 sm:space-y-2">
                  {[
                    { label: 'Date Created', key: 'created_at', format: formatDate },
                    { label: 'Last Login', key: 'updated_at', format: formatDate },
                    { label: 'Account Status', key: 'tracked_Status' }
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                      <span className="font-medium text-gray-600">{item.label} :</span>
                      <span className={
                        item.label === 'Account Status' 
                          ? `font-semibold ${professor.tracked_Status === 'Active' ? 'text-green-600' : 'text-red-600'}`
                          : ''
                      }>
                        {item.format ? item.format(professor[item.key]) : professor[item.key] || "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 sm:pt-5 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveClick}
                        disabled={isLoading}
                        className="font-bold text-white py-2.5 px-4 sm:px-6 bg-[#00874E] rounded-md shadow-md text-center hover:bg-[#006F3A] disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto transition-colors duration-200 cursor-pointer flex items-center justify-center"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-2">
                              <Lottie 
                                {...defaultLottieOptions}
                                style={{ width: '100%', height: '100%' }}
                              />
                            </div>
                            Saving...
                          </div>
                        ) : (
                          "Save"
                        )}
                      </button>
                      <button
                        onClick={handleCancelClick}
                        disabled={isLoading}
                        className="font-bold text-white py-2.5 px-4 sm:px-6 bg-[#FF6666] rounded-md shadow-md text-center hover:bg-[#E55555] disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto transition-colors duration-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEditClick}
                      className="font-bold text-white py-2.5 px-4 sm:px-6 bg-[#00874E] rounded-md shadow-md text-center hover:bg-[#006F3A] text-sm sm:text-base w-full sm:w-auto transition-colors duration-200 cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Popup Messages */}
              {popupType === "success" && (
                <Popup
                  setOpen={() => setPopupType(null)}
                  message="Professor information updated successfully!"
                  confirmText="OK"
                  buttonColor="#00874E"
                  hoverColor="#006F3A"
                />
              )}

              {popupType === "error" && (
                <Popup
                  setOpen={() => setPopupType(null)}
                  message="Failed to update professor information. Please try again."
                  confirmText="OK"
                  buttonColor="#FF6666"
                  hoverColor="#C23535"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}