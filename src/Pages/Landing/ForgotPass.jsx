import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Guide from "../../assets/Guide(Light).svg";
import FullLogo from "../../assets/New-FullBlack-TrackEdLogo.svg";
import Close from "../../assets/BackButton(Light).svg";
import ArrowDown from "../../assets/ArrowDown(Light).svg";

export default function ForgotPass() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null = checking, true = valid, false = invalid

  // Get token from URL
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  // for faqs
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How can I create an Account?",
      answer: "- You can sign up using your school ID number and a valid email address. Fill out the registration form and follow the instructions sent to your email."
    },
    {
      question: "I forgot my password. What should I do?",
      answer: "- Click on 'Forgot Password?' on the login page, then enter your registered email. You'll receive a link to reset your password."
    },
    {
      question: "Can I use a personal email to sign up?",
      answer: "- Yes, you can use either your school or personal email. Just make sure it's an active email you can access."
    },
    {
      question: "Who do I contact for account issues or bugs?",
      answer: "- You can reach our support team at support@tracked.com or through the help section in the app."
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Verify token when component loads
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("Invalid password reset link. Please request a new one.");
      return;
    }

    // Verify token with backend
    const verifyToken = async () => {
      try {
        const response = await fetch("https://tracked.6minds.site/Landing/ForgotPass.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "verify_token",
            token: token,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError(data.message || "Invalid or expired reset link.");
        }
      } catch (error) {
        setTokenValid(false);
        setError("Connection error. Please try again later.");
        console.error("Error:", error);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://tracked.6minds.site/Landing/ForgotPass.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reset_password",
          token: token,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Password changed successfully! Redirecting to login...");
        setNewPassword("");
        setConfirmPassword("");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/Login");
        }, 2000);
      } else {
        setError(data.message || "Failed to change password. Please try again.");
      }
    } catch (error) {
      setError("Connection error. Please try again later.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#465746]">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-center">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#465746] px-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-center text-xl font-semibold mb-4 text-red-600">Invalid Link</h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <Link to="/VerifyAcc">
            <button className="w-full bg-[#00A15D] hover:bg-green-700 text-white py-2 rounded-md font-medium">
              Request New Reset Link
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-[#465746] px-6 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="bg-[#fff] p-6 sm:p-8 md:p-8 rounded-lg shadow-md w-full max-w-sm text-base sm:text-base">
        <div className="flex justify-end">
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
        <p className="text-center mb-4 sm:mb-6 md:mb-4 text-sm sm:text-base md:text-base">
          Cavite State University - Imus Campus
        </p>

        <hr className="opacity-20 border-[#465746] rounded border-1 mb-4" />

        {/* Change Password Title */}
        <h2 className="text-center text-sm sm:text-base md:text-base font-medium mb-4 sm:mb-8">
          Change Password
        </h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <label className="block mb-1 sm:mb-2 text-sm sm:text-sm">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            required
            disabled={loading}
            className="w-full px-4 sm:px-4 py-2 sm:py-2 border border-gray-300 rounded-md mb-2 sm:mb-2 md:mb-4 focus:outline-none focus:ring-2 focus:ring-[#00A15D] text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          {/* Confirm Password */}
          <label className="block mb-1 sm:mb-2 text-sm sm:text-sm">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            required
            disabled={loading}
            className="w-full px-4 sm:px-4 py-2 sm:py-2 border border-gray-300 rounded-md mb-2 sm:mb-3 focus:outline-none focus:ring-2 focus:ring-[#00A15D] text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          {/* Change Password Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 sm:h-9 bg-[#00A15D] hover:bg-green-700 text-white py-1 rounded-md font-medium mt-2 sm:mt-3 text-sm sm:text-sm cursor-pointer transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>

        {/* Sign in link */}
        <div className="text-center mt-3 sm:mt-4 md:mt-6 text-xs sm:text-sm">
          <span>Sign in to your account? </span>
          <Link to="/Login">
            <span className="text-[#00A15D] font-semibold cursor-pointer hover:underline">
              Click here
            </span>
          </Link>
        </div>
      </div>

      {/* GUIDE */}
      {isGuideOpen && (
        <div 
          className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50 overlay-fade p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
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

            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 pr-8">TrackED Guide</h2>
            <hr className="border-gray-300 mb-3 sm:mb-4" />

            <h3 className="font-semibold mb-3 sm:mb-4 md:mb-5 text-sm sm:text-base">Common Asked Questions</h3>
            <div className="space-y-2 sm:space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-300 pb-2 sm:pb-3">
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
                    <p className="text-gray-600 mt-2 text-xs sm:text-sm leading-relaxed">{faq.answer}</p>
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

            @media (max-height: 600px) {
              .modal-pop {
                max-height: 85vh;
              }
            }
            
            @media (max-width: 640px) {
              .modal-pop {
                margin: 1rem;
                max-height: calc(100vh - 2rem);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}