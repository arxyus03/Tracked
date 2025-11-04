import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Subject from '../../assets/Subjects(Light).svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import Add from "../../assets/Add(Light).svg";
import AddIcon from "../../assets/AddIcon.svg";
import Archive from "../../assets/Archive(Light).svg";
import ArchiveRow from "../../assets/ArchiveRow(Light).svg";
import Palette from "../../assets/Palette(Light).svg";
import BackButton from '../../assets/BackButton(Light).svg';

export default function Subjects() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName] = useState("John Doe");

  // archived / enrolled classes (simple list for mapping)
  const initialClasses = [
    { id: 1, code: "GNED09", title: "Rizal Life and Work", instructor: "Prof. Maria Santos" },
    { id: 2, code: "ITEC95", title: "Qualitative Methods", instructor: "Dr. Allan Reyes" },
    { id: 3, code: "ITEC101A", title: "IT Elective 1", instructor: "Prof. Liza Gomez" },
  ];

  const [classes] = useState(initialClasses);

  // per-card background colors (default white)
  const [cardColors, setCardColors] = useState(() =>
    initialClasses.reduce((acc, c) => ({ ...acc, [c.id]: "#ffffff" }), {})
  );

  // which palette menu is open (card id or null)
  const [paletteOpenId, setPaletteOpenId] = useState(null);

  // join class modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState("");

  // color options
  const COLORS = [
    { label: "White", val: "#ffffff" },
    { label: "Green", val: "#E8F5E9" },
    { label: "Orange", val: "#FFF3E0" },
    { label: "Blue", val: "#E3F2FD" },
    { label: "Purple", val: "#F3E5F5" },
  ];

  // toggle palette menu
  const togglePalette = (id) => {
    setPaletteOpenId(prev => (prev === id ? null : id));
  };

  // set color for a card
  const setColorForCard = (id, color) => {
    setCardColors(prev => ({ ...prev, [id]: color }));
    setPaletteOpenId(null);
  };

  // close palette on outside click
  useEffect(() => {
    const handler = (e) => {
      // if click inside a palette button or palette menu, keep open
      const inPalette = e.target.closest?.('.palette-button') || e.target.closest?.('.palette-menu');
      if (!inPalette) setPaletteOpenId(null);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const openJoinModal = () => {
    setClassCode("");
    setShowJoinModal(true);
  };

  const closeJoinModal = () => setShowJoinModal(false);

  const handleJoin = () => {
    if (!classCode.trim()) return;
    alert(`Request sent to join class: ${classCode.trim()}`);
    setShowJoinModal(false);
  };

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-8 text-[#465746]">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img src={Subject} alt="Subjects" className="h-7 w-7 mr-3" />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">Subjects</h1>
            </div>
            <div className='flex justify-between'>
              <div className="text-sm sm:text-base lg:text-lg">
                <span>Enrolled Subjects</span>
              </div>
              <div className="flex text-sm sm:text-base lg:text-lg items-center gap-2">
                <span>2nd Semester 2024 - 2025</span>
                <img src={ArrowDown} alt="ArrowDown" className="h-7 w-7 mr-3" />
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-2 sm:gap-3 sm:ml-auto">
            <Link to="/ArchiveClassStudent">
              <button className="font-bold py-2.5 bg-white rounded-md w-11 h-11 lg:w-12 lg:h-12 shadow-md flex items-center justify-center border-2 border-transparent hover:border-[#00874E] hover:scale-105 transition-all duration-200 cursor-pointer">
                <img src={Archive} alt="Archive" className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </Link>

            <button
              onClick={openJoinModal}
              className="font-bold py-2.5 bg-white rounded-md w-11 h-11 lg:w-12 lg:h-12 shadow-md flex items-center justify-center border-2 border-transparent hover:border-[#00874E] hover:scale-105 transition-all duration-200 cursor-pointer"
              aria-label="Join class"
            >
              <img src={Add} alt="Add" className="h-7 w-7" />
            </button>
          </div>

          {/* Class Cards (mapped - cards look same as your original) */}
          {classes.map((cls) => (
            <Link key={cls.id} to={"/SubjectDetailsStudent"}>
              <div
                className="text-[#465746] text-lg h-30 p-5 mt-5 rounded-md shadow-md cursor-pointer border-2 border-transparent hover:border-[#00874E] transition-all duration-200 relative"
                style={{ backgroundColor: cardColors[cls.id] }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold">{cls.code}:</span>
                    <span className="ml-2">{cls.title}</span>
                  </div>

                  <div className="flex gap-3 items-center">
                    {/* Palette button */}
                    <div
                      onClick={(e) => { e.preventDefault(); togglePalette(cls.id); }}
                      className="palette-button flex bg-[#D4D4D4] h-12 w-12 rounded-md justify-center items-center border-2 border-transparent hover:border-[#00874E] hover:scale-105 transition-all duration-200 cursor-pointer"
                      title="Change card color"
                      aria-haspopup="true"
                      aria-expanded={paletteOpenId === cls.id}
                    >
                      <img src={Palette} className="h-7 w-7" alt="Palette" />
                    </div>

                    {/* Archive button */}
                    <div className="flex bg-[#D4D4D4] h-12 w-12 rounded-md justify-center items-center border-2 border-transparent hover:border-[#00874E] hover:scale-105 transition-all duration-200 cursor-pointer">
                      <img src={ArchiveRow} className="h-8 w-8" alt="ArchiveRow" />
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="font-bold">Instructor:</span>
                  <span className="ml-2">{cls.instructor}</span>
                </div>

                {/* Palette menu (absolute, appears near card) */}
                {paletteOpenId === cls.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="palette-menu absolute right-6 top-16 bg-white border rounded-md shadow-lg p-3 flex gap-2 z-40"
                    style={{ minWidth: 220 }}
                  >
                    {COLORS.map((c) => (
                      <button
                        key={c.val}
                        onClick={(e) => { e.preventDefault(); setColorForCard(cls.id, c.val); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:scale-105 transition-transform"
                        style={{ background: c.val === '#ffffff' ? '#fff' : c.val }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: c.val,
                            border: c.val === '#ffffff' ? '1px solid #E5E7EB' : 'none',
                          }}
                        />
                        <span className="text-sm">{c.label}</span>
                      </button>
                    ))}
                    <div className="flex-1" />
                    <button
                      onClick={(e) => { e.preventDefault(); setPaletteOpenId(null); }}
                      className="text-sm text-gray-600 px-3 py-2"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </Link>
          ))}

        </div>
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-start z-50 p-4 pt-24"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeJoinModal();
          }}
        >
          <div
            className="bg-white w-full max-w-md rounded-lg shadow-2xl p-6 relative"
            style={{ backgroundColor: '#fff' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <img src={AddIcon} alt="Plus" className="h-8 w-8" />
                <h3 className="text-lg font-bold">Join Class</h3>
              </div>

              <button
                onClick={closeJoinModal}
                className="p-2"
                aria-label="Close"
              >
                <img src={BackButton} alt="Close" className="h-7 w-7" />
              </button>
            </div>

            <hr className="mb-4" />

            <label className="block text-sm font-medium text-gray-700 mb-2">Class code:</label>
            <input
              type="text"
              placeholder="Enter class code"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#00A15D]"
            />

            <div className="flex justify-end">
              <button
                onClick={handleJoin}
                disabled={!classCode.trim()}
                className={`px-5 py-2 rounded-md font-bold text-white ${classCode.trim() ? 'bg-[#00A15D] hover:bg-[#00874E]' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
