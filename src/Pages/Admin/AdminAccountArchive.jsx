import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';

// Components
import Sidebar from '../../Components/Sidebar';
import Header from '../../Components/Header';

// Assets
import BackButton from '../../assets/BackButton(Light).svg';
import Archive from '../../assets/Archive(Light).svg';
import Unarchive from '../../assets/Unarchive.svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import Search from '../../assets/Search.svg';
import SuccessIcon from '../../assets/Success(Green).svg';
import loadingAnimation from '../../assets/system-regular-716-spinner-three-dots-loop-expand.json';

export default function AdminAccountArchive() {
  // State variables
  const [isOpen, setIsOpen] = useState(true);
  const [open, setOpen] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [setSelectedFilter] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isLoading] = useState(false);
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  // Lottie animation config
  const defaultLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  // Unarchive click handler
  const handleUnarchiveClick = (account) => {
    setSelectedAccount(account);
    setShowUnarchiveModal(true);
  };

  // Confirm unarchive handler
  const confirmUnarchive = () => {
    setIsUnarchiving(true);
    console.log('Unarchiving account:', selectedAccount);
    
    // Simulate API call
    setTimeout(() => {
      setIsUnarchiving(false);
      setShowUnarchiveModal(false);
      setShowSuccessModal(true);
      setSelectedAccount(null);
    }, 1500);
  };

  // Sample archived accounts data
  const archivedAccounts = [
    { id: 1, number: '2025001', name: 'Alice Mendoza', email: 'alice@example.com', type: 'Student', status: 'Deactivated' },
    { id: 2, number: '2025002', name: 'Brian Santos', email: 'brian@example.com', type: 'Professor', status: 'Deactivated' }
  ];

  return (
    <div>
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img 
                src={Archive} 
                alt="Archive" 
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Archives
              </h1>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>Accounts Archived</span>
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col justify-center items-center py-12">
              <div className="w-24 h-24 mb-4">
                <Lottie 
                  {...defaultLottieOptions}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <p className="text-[#465746] text-lg font-medium">Loading archived accounts...</p>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Control Buttons Section */}
              <div className="flex flex-col sm:flex-row text-[#465746] gap-3 sm:gap-4 sm:justify-between sm:items-center">
                {/* Filter and Backup Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {/* Filter Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setOpen(!open)}
                      className="flex items-center justify-between font-bold px-3 sm:px-4 py-2 bg-[#fff] rounded-md w-28 sm:w-36 lg:w-40 shadow-md border-2 border-transparent hover:border-[#00874E] text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer"
                    >
                      <span>Filter</span>
                      <img 
                        src={ArrowDown} 
                        alt="ArrowDown" 
                        className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ml-2"
                      />
                    </button>

                    {open && (
                      <div className="absolute top-full mt-1 bg-white rounded-md w-28 sm:w-36 lg:w-40 shadow-lg border border-gray-200 z-10">
                        <button 
                          className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                          onClick={() => {
                            setSelectedFilter('Students');
                            setOpen(false);
                          }}
                        >
                          Students
                        </button>
                        <button 
                          className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                          onClick={() => {
                            setSelectedFilter('Professor');
                            setOpen(false);
                          }}
                        >
                          Professor
                        </button>
                      </div>
                    )}
                  </div>

                  <button className="font-bold px-3 sm:px-4 py-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer">
                    Backup
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 sm:max-w-xs lg:max-w-md">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none text-[#465746] bg-white text-xs sm:text-sm border-2 border-transparent focus:border-[#00874E] transition-all duration-200"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#465746]">
                    <img 
                      src={Search} 
                      alt="Search"
                      className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                    />
                  </button>
                </div>
              </div>

              {/* Accounts Table/Cards */}
              <div className="mt-4 sm:mt-5">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3 text-xs sm:text-sm lg:text-base">
                    <thead>
                      <tr className="text-[#465746] font-bold">
                        <th className="py-2 px-2 sm:px-3">No.</th>
                        <th className="py-2 px-2 sm:px-3">Student/Professor No.</th>
                        <th className="py-2 px-2 sm:px-3">Full Name</th>
                        <th className="py-2 px-2 sm:px-3">Email</th>
                        <th className="py-2 px-2 sm:px-3">Status</th>
                        <th className="py-2 px-2 sm:px-3">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="text-[#465746]">
                      {archivedAccounts.map((account) => (
                        <tr key={account.id} className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-3 px-2 sm:px-3 rounded-l-lg">{account.id}</td>
                          <td className="py-3 px-2 sm:px-3">{account.number}</td>
                          <td className="py-3 px-2 sm:px-3">{account.name}</td>
                          <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">{account.email}</td>
                          <td className="py-3 px-2 sm:px-3 font-bold text-[#FF6666]">{account.status}</td>
                          <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                            <img 
                              onClick={() => handleUnarchiveClick(account)} 
                              src={Unarchive} 
                              alt="Unarchive" 
                              className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {archivedAccounts.map((account) => (
                    <div key={account.id} className="bg-white rounded-lg shadow p-4 text-[#465746]">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">No. {account.id} | Student/Professor No.</p>
                          <p className="font-semibold text-sm">{account.number}</p>
                        </div>
                        <div className="flex gap-2">
                          <img 
                            onClick={() => handleUnarchiveClick(account)} 
                            src={Unarchive} 
                            alt="Unarchive" 
                            className="h-5 w-5 cursor-pointer" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Full Name</p>
                          <p className="font-medium text-sm">{account.name}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm break-all">{account.email}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <p className="font-bold text-sm text-[#FF6666]">{account.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* No archived accounts message */}
                {archivedAccounts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 opacity-50">
                      <Lottie 
                        {...defaultLottieOptions}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                    <p className="text-[#465746] text-lg font-medium">No archived accounts found</p>
                    <p className="text-gray-500 mt-2">All accounts are currently active</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Unarchive Confirmation Modal */}
          {showUnarchiveModal && selectedAccount && (
            <div
              className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget && !isUnarchiving) {
                  setShowUnarchiveModal(false);
                  setSelectedAccount(null);
                }
              }}
              role="dialog"
              aria-modal="true"
            >
              <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
                <div className="text-center">
                  {/* Info Icon */}
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    {isUnarchiving ? (
                      <div className="w-8 h-8">
                        <Lottie 
                          {...defaultLottieOptions}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    ) : (
                      <img 
                        src={Unarchive} 
                        alt="Restore" 
                        className="h-8 w-8"
                      />
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {isUnarchiving ? 'Restoring Account...' : 'Restore Account?'}
                  </h3>
                  
                  <div className="mt-4 mb-6">
                    {isUnarchiving ? (
                      <p className="text-sm text-gray-600 mb-3">
                        Please wait while we restore the account...
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 mb-3">
                        Are you sure you want to restore this account?
                      </p>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                      <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                        {selectedAccount.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        ID: {selectedAccount.number}
                      </p>
                      <p className="text-sm text-gray-600">
                        Email: {selectedAccount.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        Type: {selectedAccount.type}
                      </p>
                    </div>
                  </div>

                  {!isUnarchiving && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          setShowUnarchiveModal(false);
                          setSelectedAccount(null);
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmUnarchive}
                        className="flex-1 bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                      >
                        Restore
                      </button>
                    </div>
                  )}
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

          {/* Success Modal */}
          {showSuccessModal && (
            <div
              className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowSuccessModal(false);
              }}
              role="dialog"
              aria-modal="true"
            >
              <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
                <div className="text-center">
                  {/* Success Icon */}
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <img 
                      src={SuccessIcon} 
                      alt="Success" 
                      className="h-8 w-8"
                    />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Account Restored Successfully!
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    The account has been restored and is now active again.
                  </p>

                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}