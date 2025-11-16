import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Popup from "../../Components/Popup";

import ClassManagementLight from "../../assets/ClassManagement(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";

export default function UserManagement_StudentAccountDetails() {
  const [isOpen, setIsOpen] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    tracked_firstname: "",
    tracked_middlename: "",
    tracked_lastname: "",
    tracked_phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const location = useLocation();

  // Get ID from query parameters
  const getStudentId = () => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get("id");
  };

  // Try to get student data from location state first
  const studentFromState = location.state?.student;

  useEffect(() => {
    if (studentFromState) {
      setStudent(studentFromState);
      setEditedData({
        tracked_firstname: studentFromState.tracked_firstname || "",
        tracked_middlename: studentFromState.tracked_middlename || "",
        tracked_lastname: studentFromState.tracked_lastname || "",
        tracked_phone: studentFromState.tracked_phone || "",
      });
      setIsFetching(false);
    } else {
      const studentId = getStudentId();
      if (studentId) {
        // Fallback to API call if no state data
        fetchStudentData(studentId);
      } else {
        setIsFetching(false);
      }
    }
  }, [location.search, studentFromState]);

  const fetchStudentData = (studentId) => {
    setIsFetching(true);
    fetch(
      `https://tracked.6minds.site/Admin/StudentAccountsDB/get_students.php?id=${studentId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.student) {
          setStudent(data.student);
          setEditedData({
            tracked_firstname: data.student.tracked_firstname || "",
            tracked_middlename: data.student.tracked_middlename || "",
            tracked_lastname: data.student.tracked_lastname || "",
            tracked_phone: data.student.tracked_phone || "",
          });
        } else {
          console.error("Student not found:", data.message);
          setPopupType("error");
        }
      })
      .catch((err) => {
        console.error("Error fetching student data:", err);
        setPopupType("error");
      })
      .finally(() => {
        setIsFetching(false);
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

  // Extract year level from yearandsec (e.g., "4D" -> "4th Year")
  const getYearLevel = (yearAndSec) => {
    if (!yearAndSec) return "N/A";
    const yearMatch = yearAndSec.match(/^(\d+)/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      const suffixes = ["", "st", "nd", "rd", "th"];
      const suffix = year <= 4 ? suffixes[year] || "th" : "th";
      return `${year}${suffix} Year`;
    }
    return yearAndSec;
  };

  // Extract section from yearandsec (e.g., "4D" -> "D")
  const getSection = (yearAndSec) => {
    if (!yearAndSec) return "N/A";
    const sectionMatch = yearAndSec.match(/[A-Za-z]+$/);
    return sectionMatch ? sectionMatch[0] : yearAndSec;
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset edited data to original values
    if (student) {
      setEditedData({
        tracked_firstname: student.tracked_firstname || "",
        tracked_middlename: student.tracked_middlename || "",
        tracked_lastname: student.tracked_lastname || "",
        tracked_phone: student.tracked_phone || "",
      });
    }
  };

  const handleSaveClick = async () => {
    if (!student) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://tracked.6minds.site/Admin/StudentAccountsDB/update_student.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tracked_ID: student.tracked_ID,
            ...editedData,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state with new data
        setStudent((prev) => ({
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
      console.error("Error updating student:", error);
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

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading student details...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Student not found.
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

        {/* content of ADMIN USER MANAGEMENT STUDENT ACCOUNT DETAILS */}
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
              <span>Student Account Details</span>
              <Link to="/UserManagementStudentAccounts">
                <img
                  src={BackButton}
                  alt="BackButton"
                  className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 hover:opacity-70 transition-opacity sm:hidden"
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* main content of ADMIN STUDENT ACCOUNT DETAILS */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl space-y-5 sm:space-y-6 shadow-md text-[#465746]">
            {/* Student Information Section - Updated Format */}
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                Student Information
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
                    <span>{student.tracked_firstname || "N/A"}</span>
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
                    <span>{student.tracked_middlename || "N/A"}</span>
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
                    <span>{student.tracked_lastname || "N/A"}</span>
                  )}
                </div>

                {/* Sex */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">Sex :</span>
                  <span>{student.tracked_gender || "N/A"}</span>
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Date of Birth :
                  </span>
                  <span>{formatDate(student.tracked_bday)}</span>
                </div>

                {/* Student ID */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Student ID :
                  </span>
                  <span>{student.tracked_ID || "N/A"}</span>
                </div>

                {/* CVSU Email Address */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    CVSU Email Address :
                  </span>
                  <span className="break-all">
                    {student.tracked_email || "N/A"}
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
                    <span>{student.tracked_phone || "N/A"}</span>
                  )}
                </div>

                {/* Program */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">Program :</span>
                  <span>{student.tracked_program || "N/A"}</span>
                </div>

                {/* Year Level */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Year Level :
                  </span>
                  <span>{getYearLevel(student.tracked_yearandsec)}</span>
                </div>

                {/* Section */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">Section :</span>
                  <span>{getSection(student.tracked_yearandsec)}</span>
                </div>

                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Temporary Password :
                  </span>
                  <span className="font-semibold">
                    {student.temporary_password || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <hr className="opacity-10 border-[#465746] rounded border-1 mb-6" />

            {/* Account Information Section - Updated Format */}
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#465746]">
                Account Information
              </h2>
              <div className="space-y-3 sm:space-y-2">
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Date Created :
                  </span>
                  <span>{formatDate(student.created_at)}</span>
                </div>

                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Last Login :
                  </span>
                  <span>{formatDate(student.updated_at)}</span>
                </div>

                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 text-sm sm:text-base md:text-lg">
                  <span className="font-medium text-gray-600">
                    Account Status :
                  </span>
                  <span
                    className={`font-semibold ${
                      student.tracked_Status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {student.tracked_Status || "N/A"}
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
                message="Student information updated successfully!"
                confirmText="OK"
                buttonColor="#00874E"
                hoverColor="#006F3A"
              />
            )}

            {popupType === "error" && (
              <Popup
                setOpen={() => setPopupType(null)}
                message="Failed to update student information. Please try again."
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