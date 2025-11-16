import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import Popup from "../../Components/Popup";

import Guide from "../../assets/Guide(Light).svg";
import FullLogo from "../../assets/New-FullBlack-TrackEdLogo.svg";
import Close from "../../assets/BackButton(Light).svg";
import ArrowDown from "../../assets/ArrowDown(Light).svg";

export default function Signup() {
  const [formData, setFormData] = useState({
    tracked_ID: "",
    tracked_email: "",
    tracked_password: "",
    tracked_fname: "",
    tracked_lname: "",
    tracked_mi: "",
    tracked_program: "BSIT",
    tracked_bday: "",
    tracked_phone: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // password checker
    if (formData.tracked_password !== confirmPassword) {
      setError("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    // ID number checker
    // if (formData.tracked_ID.length !== 9) {
    //   setError("ID Number must be 9 digits!");
    //   setIsLoading(false);
    //   return;
    // }

    // Phone number checker
    const digitsOnly = formData.tracked_phone.replace(/\D/g, "");
    if (digitsOnly.length !== 11) {
      setError("Phone number must be 11 digits");
      setIsLoading(false);
      return;
    }

    if (!captchaToken) {
      setError("Please complete the CAPTCHA");
      setIsLoading(false);
      return;
    }

    // email checker must be @cvsu.edu.ph to sign up
    if (!formData.tracked_email.endsWith("@cvsu.edu.ph")) {
      setError("Email must be a valid CVSU email");
      setIsLoading(false);
      return;
    }

    //connection sa php file
    try {
      const res = await fetch(
        "https://tracked.6minds.site/Landing/Signup.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            ...formData,
            captcha: captchaToken,
          }).toString(),
        }
      );

      // First, try to parse as JSON
      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (err) {
        // If it's not JSON, show the raw text (for debugging)
        console.error("JSON Parse Error:", err);
        setError("Invalid response from server: " + text);
        setIsLoading(false);
        return;
      }

      if (data.success) {
        setShowSuccessPopup(true);
        setSuccessMessage(data.message);
        // Optional: Redirect to login page after successful registration
        // window.location.href = "/Login";

        // Clear form
        setFormData({
          tracked_ID: "",
          tracked_email: "",
          tracked_password: "",
          tracked_fname: "",
          tracked_lname: "",
          tracked_mi: "",
          tracked_program: "BSIT",
          tracked_bday: "",
          tracked_phone: "",
        });
        setConfirmPassword("");
        setCaptchaToken(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // for faqs
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How can I create an Account?",
      answer:
        "- You can sign up using your school ID number and a valid email address. Fill out the registration form and follow the instructions sent to your email.",
    },
    {
      question: "I forgot my password. What shoud I do?",
      answer:
        "- Click on 'Forgot Password?' on the login page, then enter your registered email. You'll receive a link to reset your password.",
    },
    {
      question: "Can I use a personal email to sign up?",
      answer:
        "- Yes, you can use either your school or personal email. Just make sure it's an active email you can access.",
    },
    {
      question: "Who do I contact for account issues or bugs?",
      answer:
        "- You can reach our support team at support@tracked.com or through the help section in the app.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-[#465746] px-5 sm:px-5 lg:px-5 py-5 sm:py-5">
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-md w-full max-w-200">
        <div className="flex justify-end mb-2">
          <img
            src={Guide}
            alt="Guide"
            className="cursor-pointer w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6"
            onClick={() => setIsGuideOpen(true)}
          />
        </div>

        <h1 className="text-center">
          <img
            src={FullLogo}
            alt="TrackED Logo"
            className="h-12 sm:h-10 md:h-10 lg:h-12 xl:h-12 w-auto mx-auto mb-2 sm:mb-2 md:mb-4 cursor-pointer"
          />
        </h1>
        <p className="text-center mb-2 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-base">
          Cavite State University - Imus Campus
        </p>

        <hr className="my-3 sm:my-4 md:my-6 border-dotted border-gray-300" />

        {/* Section Title */}
        <div className="flex items-center gap-2 mb-2 sm:mb-2">
          <img
            src={Guide}
            alt="Guide"
            className="h-4 w-4 sm:w-5 md:h-6 md:w-6"
          />
          <p className="font-semibold text-base sm:text-base md:text-base">
            Account Creation
          </p>
        </div>
        <p className="mb-3 sm:mb-5 md:mb-6 ml-6 sm:ml-7 md:ml-8 text-xs sm:text-sm md:text-sm text-gray-600">
          Make sure your Student Number is recorded in CVSU - Imus Campus.
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ID & Program */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-2 sm:mb-2 md:mb-4">
            <div>
              <p className="text-sm sm:text-basmse md:text-sm mb-1 sm:mb-2">
                ID Number
              </p>
              <input
                type="text"
                name="tracked_ID"
                value={formData.tracked_ID}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                  setFormData({ ...formData, tracked_ID: digits });
                }}
                placeholder="202284596"
                required
                inputMode="numeric"
                maxLength="9"
                className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D] text-xs sm:text-sm"
                disabled={isLoading}
              />
            </div>
            <div>
              <p className="text-sm sm:text-sm md:text-sm mb-1 sm:mb-2">
                Program
              </p>
              <input
                type="text"
                name="tracked_program"
                value={formData.tracked_program}
                readOnly
                className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 text-xs sm:text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-2 sm:mb-2 md:mb-4">
            <div>
              <p className="text-sm sm:text-sm md:text-sm mb-1 sm:mb-2">
                Firstname
              </p>
              <input
                type="text"
                name="tracked_fname"
                value={formData.tracked_fname}
                onChange={handleChange}
                placeholder="Firstname"
                required
                className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D] text-xs sm:text-sm"
                disabled={isLoading}
              />
            </div>

            <div>
              <p className="text-sm sm:text-sm md:text-sm mb-1 sm:mb-2">
                Lastname
              </p>
              <input
                type="text"
                name="tracked_lname"
                value={formData.tracked_lname}
                onChange={handleChange}
                placeholder="Lastname"
                required
                className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D] text-xs sm:text-sm"
                disabled={isLoading}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <p className="text-sm sm:text-sm md:text-sm mb-1 sm:mb-2">
                Middle Initial
              </p>
              <input
                type="text"
                name="tracked_mi"
                value={formData.tracked_mi}
                onChange={handleChange}
                placeholder="M.I"
                maxLength="1"
                className="w-full px-2 sm:px-3 py-2 sm:py-2 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D] text-xs sm:text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* DOB & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-2 sm:mb-2 md:mb-4">
            <div>
              <p className="text-sm sm:text-sm md:text-sm mb-1 sm:mb-2">
                Date of Birth
              </p>
              <input
                type="date"
                required
                name="tracked_bday"
                value={formData.tracked_bday}
                onChange={handleChange}
                className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D] text-xs sm:text-sm"
                disabled={isLoading}
              />
            </div>

            <div>
              <p className="text-sm sm:text-sm md:text-sm mb-1 sm:mb-2">
                Phone Number
              </p>
              <div className="relative">
                <span className="absolute left-2 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-700 text-xs sm:text-sm pointer-events-none">
                  (+63)
                </span>
                <input
                  type="tel"
                  name="tracked_phone"
                  value={formData.tracked_phone}
                  onChange={handleChange}
                  onInput={(e) => {
                    // Remove any non-digit characters
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                  onKeyPress={(e) => {
                    // Prevent non-numeric characters from being typed
                    if (
                      !/[0-9]/.test(e.key) &&
                      ![
                        "Backspace",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                        "Tab",
                      ].includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="0912 345 6789"
                  required
                  maxLength="11"
                  className="w-full pl-12 sm:pl-14 md:pl-16 pr-2 sm:pr-3 md:pr-4 py-2 sm:py-2 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D] text-xs sm:text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="mb-2 sm:mb-2 md:mb-4">
            <p className="text-sm sm:text-sm md:text-sm mb-1 sm:mb-2">
              CVSU Email Address
            </p>
            <input
              type="email"
              name="tracked_email"
              value={formData.tracked_email}
              onChange={handleChange}
              placeholder="JaneDoe@cvsu.edu.ph"
              required
              // pattern=".+@cvsu\.edu\.ph"
              // title="Email must end with @cvsu.edu.ph"
              className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D] text-xs sm:text-sm"
              disabled={isLoading}
            />
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-2 sm:mb-2 md:mb-4">
            <div>
              <p className="text-sm sm:text-sm md:text-sm mb-1 sm:mb-2">
                Password
              </p>
              <input
                type="password"
                name="tracked_password"
                value={formData.tracked_password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D] text-xs sm:text-sm"
                disabled={isLoading}
              />
            </div>

            <div>
              <p className="text-sm sm:text-sm md:text-sm mb-1 sm:mb-2">
                Confirm Password
              </p>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A15D] text-xs sm:text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* RESPONSIVE RECAPTCHA */}
          <div className="my-3 sm:my-4 flex justify-center">
            <div className="w-full max-w-[320px] flex justify-center overflow-hidden">
              <div className="transform scale-[0.70] sm:scale-[0.85] md:scale-95 lg:scale-95 origin-center">
                <ReCAPTCHA
                  sitekey="6LclQMwrAAAAAPXrqY3nFvcNIkcioAbqng-GzxxA"
                  onChange={(token) => setCaptchaToken(token)}
                  theme="light"
                />
              </div>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-9 sm:h-9 bg-[#00A15D] text-white py-1 rounded-md font-medium mt-2 sm:mt-2 text-sm sm:text-sm cursor-pointer transition-colors duration-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
            }`}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login */}
        <div className="text-center text-xs sm:text-sm md:text-sm mt-5">
          <span>Already have an account? </span>
          <Link
            to="/Login"
            className="text-[#00A15D] font-semibold cursor-pointer hover:underline"
          >
            Log In
          </Link>
        </div>
      </div>

      {/* GUIDE */}
      {isGuideOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50 overlay-fade p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            // close only when clicking the backdrop (not when clicking inside the modal)
            if (e.target === e.currentTarget) setIsGuideOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg lg:mx-w-xl p-4 sm:p-6 md:p-8 relative modal-pop max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsGuideOpen(false)}
              aria-label="Close guide"
              className="absolute top-4 right-4 sm:top-4 sm:right-6 md:top-6 md:right-8 cursor-pointer"
            >
              <img
                src={Close}
                alt="Back"
                className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6"
              />
            </button>

            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 pr-8">
              TrackED Guide
            </h2>
            <hr className="border-gray-300 mb-3 sm:mb-4" />

            <h3 className="font-semibold mb-3 sm:mb-4 md:mb-5 text-sm sm:text-base">
              Common Asked Questions
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-gray-300 pb-2 sm:pb-3"
                >
                  <button
                    className="flex justify-between items-center w-full text-left text-green-700 sm:text-green-800 font-medium cursor-pointer text-xs sm:text-sm md:text-base hover:text-green-600 transition-colors"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="pr-2">{faq.question}</span>
                    <img 
                      src={ArrowDown}
                      alt="Toggle"
                      className={`w-5 h-5 sm:w-7 sm:h-7 flex-shrink-0 transition-transform duration-200 ${
                        openIndex === index ? "rotate-180" : ""
                      }`}             
                    />
                  </button>
                  {openIndex === index && (
                    <p className="text-black-600 mt-2 text-xs sm:text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
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

                /* Responsive scroll behavior */
                @media (max-height: 600px) {
                  .modal-pop {
                    max-height: 85vh;
                  }
                }
                
                /* Enhanced mobile styles */
                @media (max-width: 640px) {
                  .modal-pop {
                    margin: 1rem;
                    max-height: calc(100vh - 2rem);
                  }
                }
              `}</style>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <Popup
          setOpen={(isOpen) => {
            setShowSuccessPopup(isOpen);
            if (!isOpen) {
              navigate("/Login");
            }
          }}
          message={successMessage}
          confirmText="Continue"
          buttonColor="#00A15D"
          hoverColor="#00874E"
        />
      )}
    </div>
  );
}
