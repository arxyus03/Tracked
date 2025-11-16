import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import ClassManagementLight from "../../assets/ClassManagement(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";

export default function UserManagement_ProfessorAccountDetails() {
  const [isOpen, setIsOpen] = useState(false);
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

  // Get ID from query parameters
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
          console.error("Professor not found:", data.message);
          setPopupType("error");
        }
      })
      .catch((err) => {
        console.error("Error fetching professor data:", err);
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
          console.error("Error fetching professor classes:", data.message);
          setProfessorClasses([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching professor classes:", err);
        setProfessorClasses([]);
      })
      .finally(() => {
        setClassesLoading(false);
      });
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format classes for display
  const formatClassesDisplay = () => {
    if (classesLoading) {
      return "Loading classes...";
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
    // Reset edited data to original values
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
        // Update local state with new data
        setProfessor((prev) => ({
          ...prev,
          ...editedData,
        }));
        setIsEditing(false);
        setPopupType("success");
      } else {
        setPopupType("error");
        console.error("Update failed:", result.message);
      }
    } catch (error) {
      setPopupType("error");
      console.error("Error updating professor:", error);
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

  if (!professor) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading professor details...
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

        {/* content of ADMIN USER MANAGEMENT PROFESSOR ACCOUNT DETAILS */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* "Header" */}
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
                  className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 hover:opacity-70 transition-opacity sm:hidden"
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Content */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl space-y-5 sm:space-y-6 shadow-md text-[#465746]">
            {/* Professor Information Section - Updated Format */}
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                Professor Information
              </h2>
              <div className="space-y-3 sm:space-y-2">
                {/* First Name */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    First Name :
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.tracked_firstname}
                      onChange={(e) =>
                        handleInputChange("tracked_firstname", e.target.value)
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00874E] focus:border-transparent"
                    />
                  ) : (
                    <span>{professor.tracked_firstname || "N/A"}</span>
                  )}
                </div>

                {/* Middle Name */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Middle Name :
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.tracked_middlename}
                      onChange={(e) =>
                        handleInputChange("tracked_middlename", e.target.value)
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00874E] focus:border-transparent"
                    />
                  ) : (
                    <span>{professor.tracked_middlename || "N/A"}</span>
                  )}
                </div>

                {/* Last Name */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">Last Name :</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.tracked_lastname}
                      onChange={(e) =>
                        handleInputChange("tracked_lastname", e.target.value)
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00874E] focus:border-transparent"
                    />
                  ) : (
                    <span>{professor.tracked_lastname || "N/A"}</span>
                  )}
                </div>

                {/* Sex */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">Sex :</span>
                  <span>{professor.tracked_gender || "N/A"}</span>
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Date of Birth :
                  </span>
                  <span>{formatDate(professor.tracked_bday)}</span>
                </div>

                {/* Professor ID */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Professor ID :
                  </span>
                  <span>{professor.tracked_ID || "N/A"}</span>
                </div>

                {/* CVSU Email Address */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    CVSU Email Address :
                  </span>
                  <span className="break-all">
                    {professor.tracked_email || "N/A"}
                  </span>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Phone Number :
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.tracked_phone}
                      onChange={(e) =>
                        handleInputChange("tracked_phone", e.target.value)
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00874E] focus:border-transparent"
                    />
                  ) : (
                    <span>{professor.tracked_phone || "N/A"}</span>
                  )}
                </div>

                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Temporary Password :
                  </span>
                  <span className="font-semibold">{professor.temporary_password || "N/A"}</span>
                </div>
              </div>
            </div>

            <hr className="opacity-10 border-[#465746] rounded border-1 mb-6" />

            {/* Professional Information Section */}
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                Professional Information
              </h2>
              <div className="space-y-3 sm:space-y-2">
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Department :
                  </span>
                  <span>{professor.tracked_program || "N/A"}</span>
                </div>

                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Subject Handled :
                  </span>
                  <span className={classesLoading ? "text-gray-400 italic" : ""}>
                    {formatClassesDisplay()}
                  </span>
                </div>
              </div>
            </div>

            <hr className="opacity-10 border-[#465746] rounded border-1 mb-6" />

            {/* Account Information Section */}
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                Account Information
              </h2>
              <div className="space-y-3 sm:space-y-2">
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Date Created :
                  </span>
                  <span>{formatDate(professor.created_at)}</span>
                </div>

                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Last Login :
                  </span>
                  <span>{formatDate(professor.updated_at)}</span>
                </div>

                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Account Status :
                  </span>
                  <span
                    className={`font-semibold ${
                      professor.tracked_Status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {professor.tracked_Status || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 sm:pt-5 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {isEditing ? (
                  <>
                    {/* Save Button */}
                    <button
                      onClick={handleSaveClick}
                      disabled={isLoading}
                      className="font-bold text-white py-2.5 px-4 sm:px-6 bg-[#00874E] rounded-md shadow-md text-center hover:bg-[#006F3A] disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto transition-colors duration-200 cursor-pointer"
                    >
                      {isLoading ? "Saving..." : "Save"}
                    </button>

                    {/* Cancel Button */}
                    <button
                      onClick={handleCancelClick}
                      disabled={isLoading}
                      className="font-bold text-white py-2.5 px-4 sm:px-6 bg-[#FF6666] rounded-md shadow-md text-center hover:bg-[#E55555] disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto transition-colors duration-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {/* Edit Button */}
                    <button
                      onClick={handleEditClick}
                      className="font-bold text-white py-2.5 px-4 sm:px-6 bg-[#00874E] rounded-md shadow-md text-center hover:bg-[#006F3A] text-sm sm:text-base w-full sm:w-auto transition-colors duration-200 cursor-pointer"
                    >
                      Edit
                    </button>

                    {/* Reset Password */}
                    <button
                      onClick={() => setPopupType("reset")}
                      className="font-bold text-white py-2.5 px-4 sm:px-6 bg-[#00874E] rounded-md shadow-md text-center hover:bg-[#006F3A] text-sm sm:text-base w-full sm:w-auto transition-colors duration-200 cursor-pointer"
                    >
                      Reset Password
                    </button>

                    {/* Disable Account */}
                    <button
                      onClick={() => setPopupType("disable")}
                      className="font-bold text-white py-2.5 px-4 sm:px-6 bg-[#FF6666] rounded-md shadow-md text-center hover:bg-[#E55555] text-sm sm:text-base w-full sm:w-auto transition-colors duration-200 cursor-pointer"
                    >
                      Disable Account
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Popup */}
            {popupType === "reset" && (
              <Popup
                setOpen={() => setPopupType(null)}
                message="Do you really want to reset this password?"
                confirmText="Reset"
                buttonColor="#00874E"
                hoverColor="#006F3A"
              />
            )}

            {popupType === "disable" && (
              <Popup
                setOpen={() => setPopupType(null)}
                message="Are you sure you want to disable this account?"
                confirmText="Disable"
                buttonColor="#FF6666"
                hoverColor="#C23535"
              />
            )}

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
        </div>
      </div>
    </div>
  );
}