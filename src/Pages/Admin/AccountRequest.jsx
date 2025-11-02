import React from 'react'
import { useState } from "react";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import AccountRequestLight from '../../assets/AccountRequest(Light).svg';

export default function AccountRequest() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* main content of ADMIN ACCOUNT REQUEST */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
        
          {/* "Header" */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img 
                src={AccountRequestLight} 
                alt="AccountRequest" 
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Account Request
              </h1>
            </div>
            <div className="text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>Account creation request</span>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Account Request Main Content */}
          {/* Account Request Table */}
          <div className="mt-4 sm:mt-5">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3 text-xs sm:text-sm lg:text-base">
                {/* Table Header */}
                <thead>
                  <tr className="text-[#465746] font-bold">
                    <th className="py-2 px-2 sm:px-3">No.</th>
                    <th className="py-2 px-2 sm:px-3">Student No.</th>
                    <th className="py-2 px-2 sm:px-3">Full Name</th>
                    <th className="py-2 px-2 sm:px-3">Email</th>
                    <th className="py-2 px-2 sm:px-3">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="text-[#465746]">
                  <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-2 sm:px-3 rounded-l-lg">1</td>
                    <td className="py-3 px-2 sm:px-3">2025001</td>
                    <td className="py-3 px-2 sm:px-3">Alice Mendoza</td>
                    <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">alice@example.com</td>
                    <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                      <div className="flex gap-2">
                        <button className="font-bold text-xs sm:text-sm lg:text-base px-3 py-1.5 bg-[#00A15D] text-white rounded hover:bg-[#007A47] transition-colors duration-200 cursor-pointer">
                          Accept
                        </button>
                        <button className="font-bold text-xs sm:text-sm lg:text-base px-3 py-1.5 bg-[#FF6666] text-white rounded hover:bg-[#E55555] transition-colors duration-200 cursor-pointer">
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-2 sm:px-3 rounded-l-lg">2</td>
                    <td className="py-3 px-2 sm:px-3">2025002</td>
                    <td className="py-3 px-2 sm:px-3">Brian Santos</td>
                    <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">brian@example.com</td>
                    <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                      <div className="flex gap-2">
                        <button className="font-bold text-xs sm:text-sm lg:text-base px-3 py-1.5 bg-[#00A15D] text-white rounded hover:bg-[#007A47] transition-colors duration-200 cursor-pointer">
                          Accept
                        </button>
                        <button className="font-bold text-xs sm:text-sm lg:text-base px-3 py-1.5 bg-[#FF6666] text-white rounded hover:bg-[#E55555] transition-colors duration-200 cursor-pointer">
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {/* Card 1 */}
              <div className="bg-white rounded-lg shadow p-4 text-[#465746]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">No. 1 | Student No.</p>
                    <p className="font-semibold text-sm">2025001</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="font-bold text-xs px-3 py-1.5 bg-[#00A15D] text-white rounded hover:bg-[#007A47] transition-colors duration-200 cursor-pointer whitespace-nowrap">
                      Accept
                    </button>
                    <button className="font-bold text-xs px-3 py-1.5 bg-[#FF6666] text-white rounded hover:bg-[#E55555] transition-colors duration-200 cursor-pointer whitespace-nowrap">
                      Decline
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-sm">Alice Mendoza</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm break-all">alice@example.com</p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-lg shadow p-4 text-[#465746]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">No. 2 | Student No.</p>
                    <p className="font-semibold text-sm">2025002</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="font-bold text-xs px-3 py-1.5 bg-[#00A15D] text-white rounded hover:bg-[#007A47] transition-colors duration-200 cursor-pointer whitespace-nowrap">
                      Accept
                    </button>
                    <button className="font-bold text-xs px-3 py-1.5 bg-[#FF6666] text-white rounded hover:bg-[#E55555] transition-colors duration-200 cursor-pointer whitespace-nowrap">
                      Decline
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-sm">Brian Santos</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm break-all">brian@example.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}