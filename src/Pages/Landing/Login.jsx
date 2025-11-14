import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Guide from "../../assets/Guide(Light).svg";
import FullLogo from "../../assets/New-FullBlack-TrackEdLogo.svg";
import Close from "../../assets/BackButton(Light).svg";
import ArrowDown from "../../assets/ArrowDown(Light).svg";

export default function Login() {
  const navigate = useNavigate();

  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // for faqs
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { question: "How can I create an Account?", answer: "- You can sign up using your school ID number and a valid email address. Fill out the registration form and follow the instructions sent to your email." },
    { question: "I forgot my password. What shoud I do?", answer: "- Click on 'Forgot Password?' on the login page, then enter your registered email. You'll receive a link to reset your password." },
    { question: "Can I use a personal email to sign up?", answer: "- Yes, you can use either your school or personal email. Just make sure it's an active email you can access." },
    { question: "Who do I contact for account issues or bugs?", answer: "- You can reach our support team at support@tracked.com or through the help section in the app." },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Sending login request...", { idNumber, password });
      
      const response = await fetch("http://localhost/TrackEd/src/Pages/Landing/Login.php", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ id_number: idNumber, password }),
      });

      // Read raw text first
      const text = await response.text();
      console.log("RAW RESPONSE FROM PHP:", text);

      // Check if response contains HTML error tags
      if (text.includes('<br />') || text.includes('<b>') || text.trim().startsWith('<!DOCTYPE') || text.includes('<?php')) {
        console.error("PHP Error detected in response");
        setError("Server error occurred. Please check if PHP is configured properly.");
        setIsLoading(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
        console.log("PARSED DATA:", data);
      } catch (err) {
        console.error("JSON Parse Error:", err);
        console.error("Raw response that failed to parse:", text);
        setError("Invalid response from server. Please check the PHP file for errors.");
        setIsLoading(false);
        return;
      }

      if (data.success) {
        console.log("Login successful! User data:", data.user);
        
        // Save user info in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("User saved to localStorage");

        // Redirect based on role
        const userRole = data.user?.role;
        console.log("User role:", userRole);

        if (userRole === "Admin") {
          navigate("/UserManagement");
        } else if (userRole === "Professor") {
          navigate("/DashboardProf");
        } else {
          navigate("/DashboardStudent");
        }
      } else {
        const errorMessage = data.message || "Invalid login credentials.";
        console.log("Login failed:", errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Cannot connect to server. Please check your connection and make sure the PHP server is running.");
    } finally {
      setIsLoading(false);
    }
  };

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
        <p className="text-center mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base md:text-base">
          Cavite State University - Imus Campus
        </p>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* ID Number */}
          <label className="block mb-1 sm:mb-2 text-sm sm:text-sm mt-4 sm:mt-6 md:mt-8">
            ID Number
          </label>
          <input
            type="text"
            placeholder="202284596"
            required
            inputMode="numeric"
            maxLength="9"
            value={idNumber}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, '');
              setIdNumber(numericValue);
            }}
            className="w-full px-4 sm:px-4 py-2 sm:py-2 border border-gray-300 rounded-md mb-2 sm:mb-2 md:mb-4 focus:outline-none focus:ring-2 focus:ring-[#00A15D] text-xs sm:text-sm"
            disabled={isLoading}
          />

          {/* Password */}
          <label className="block mb-1 sm:mb-2 text-sm sm:text-sm">
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 sm:px-4 py-2 sm:py-2 border border-gray-300 rounded-md mb-2 sm:mb-3 focus:outline-none focus:ring-2 focus:ring-[#00A15D] text-xs sm:text-sm"
            disabled={isLoading}
          />

          <Link to={"/VerifyAcc"}>
            <p className="text-xs sm:text-sm text-[#00A15D] cursor-pointer mb-3 sm:mb-2 md:mb-4 hover:underline">
              Forgot Password?
            </p>
          </Link>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-9 sm:h-9 bg-[#00A15D] text-white py-1 rounded-md font-medium mt-2 sm:mt-3 text-sm sm:text-sm cursor-pointer transition-colors duration-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
            }`}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-4 sm:mt-4 md:mt-6 text-gray-600 text-sm sm:text-sm cursor-pointer hover:text-gray-800 transition-colors duration-200">
        About Us
      </p>

      {/* GUIDE Modal */}
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
          `}</style>
        </div>
      )}
    </div>
  );
}