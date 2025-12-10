import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Lottie from "lottie-react";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Search from "../../assets/Search.svg";
import ReportLight from '../../assets/Report(Light).svg';
import TotalAccountImported from '../../assets/TotalAccountImported.svg';
import StudentAccounts from '../../assets/StudentAccounts.svg';
import ProfessorAccounts from '../../assets/ProfessorAccounts.svg';
import ActiveAccounts from '../../assets/ActiveAccounts.svg';
import DisabledAccounts from '../../assets/DisabledAccounts.svg';
import Details from '../../assets/Details(Light).svg';
import SuccessIcon from '../../assets/Success(Green).svg';
import ErrorIcon from '../../assets/Error(Red).svg';

import loadingAnimation from "../../assets/system-regular-716-spinner-three-dots-loop-expand.json";

export default function Report() {
  const [isOpen, setIsOpen] = useState(true);
  const [studentFilterOpen, setStudentFilterOpen] = useState(false);
  const [professorFilterOpen, setProfessorFilterOpen] = useState(false);
  
  const [widgetData, setWidgetData] = useState({
    totalAccounts: 0,
    studentAccounts: 0,
    professorAccounts: 0,
    activeAccounts: 0,
    deactivatedAccounts: 0
  });
  
  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [studentSearch, setStudentSearch] = useState('');
  const [professorSearch, setProfessorSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState('all');
  const [professorFilter, setProfessorFilter] = useState('all');

  const [semesterSettings, setSemesterSettings] = useState({
    first_sem: 'INACTIVE',
    second_sem: 'INACTIVE',
    summer_sem: 'INACTIVE'
  });
  const [isLoadingSemester, setIsLoadingSemester] = useState(false);
  const [semesterModal, setSemesterModal] = useState({
    show: false,
    type: '',
    title: '',
    message: ''
  });

  const defaultLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  const fetchWidgetData = async () => {
    try {
      const [userCountsRes, studentsRes, professorsRes] = await Promise.all([
        fetch('https://tracked.6minds.site/Admin/UserManagementDB_ReportsDB/get_user_counts.php'),
        fetch('https://tracked.6minds.site/Admin/StudentAccountsDB/get_students.php'),
        fetch('https://tracked.6minds.site/Admin/ProfessorAccountsDB/get_professors.php')
      ]);

      if (!userCountsRes.ok || !studentsRes.ok || !professorsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const userCounts = await userCountsRes.json();
      const studentsData = await studentsRes.json();
      const professorsData = await professorsRes.json();

      setWidgetData({
        totalAccounts: (userCounts.Students || 0) + (userCounts.Professors || 0),
        studentAccounts: userCounts.Students || 0,
        professorAccounts: userCounts.Professors || 0,
        activeAccounts: userCounts.TotalActive || 0,
        deactivatedAccounts: userCounts.TotalDeactivated || 0
      });

      setStudents(studentsData);
      setProfessors(professorsData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchSemesterStatus = async () => {
    setIsLoadingSemester(true);
    try {
      const response = await fetch("https://tracked.6minds.site/Admin/UserManagementDB_ReportsDB/semester_settings.php", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setSemesterSettings(data.data);
      } else {
        showSemesterModal('error', 'Fetch Failed', 'Failed to load semester settings');
      }
    } catch (error) {
      showSemesterModal('error', 'Network Error', 'Failed to connect to server');
    } finally {
      setIsLoadingSemester(false);
    }
  };

  const updateSemesterStatus = async (semester, status) => {
    setIsLoadingSemester(true);
    try {
      const response = await fetch("https://tracked.6minds.site/Admin/UserManagementDB_ReportsDB/semester_settings.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semester: semester,
          status: status
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchSemesterStatus();
        showSemesterModal('success', 'Success', data.message || 'Semester status updated successfully');
      } else {
        showSemesterModal('error', 'Update Failed', data.message || 'Failed to update semester status');
      }
    } catch (error) {
      showSemesterModal('error', 'Network Error', 'Failed to connect to server');
    } finally {
      setIsLoadingSemester(false);
    }
  };

  const showSemesterModal = (type, title, message) => {
    setSemesterModal({
      show: true,
      type,
      title,
      message
    });
  };

  const closeSemesterModal = () => {
    setSemesterModal({ show: false, type: '', title: '', message: '' });
  };

  const handleSemesterToggle = (semester) => {
    const newStatus = semesterSettings[semester] === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateSemesterStatus(semester, newStatus);
  };

  const getSemesterDisplayName = (semester) => {
    const names = {
      first_sem: 'First Semester',
      second_sem: 'Second Semester',
      summer_sem: 'Summer Semester'
    };
    return names[semester] || semester;
  };

  useEffect(() => {
    fetchWidgetData();
    fetchSemesterStatus();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.tracked_ID?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.tracked_firstname?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.tracked_lastname?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.tracked_email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.tracked_yearandsec?.toLowerCase().includes(studentSearch.toLowerCase());

    const matchesFilter = 
      studentFilter === 'all' || 
      (studentFilter === 'active' && student.tracked_Status === 'Active') ||
      (studentFilter === 'deactivated' && student.tracked_Status === 'Deactivated');

    return matchesSearch && matchesFilter;
  });

  const filteredProfessors = professors.filter(professor => {
    const matchesSearch = 
      professor.tracked_ID?.toLowerCase().includes(professorSearch.toLowerCase()) ||
      professor.tracked_firstname?.toLowerCase().includes(professorSearch.toLowerCase()) ||
      professor.tracked_lastname?.toLowerCase().includes(professorSearch.toLowerCase()) ||
      professor.tracked_email?.toLowerCase().includes(professorSearch.toLowerCase());

    const matchesFilter = 
      professorFilter === 'all' || 
      (professorFilter === 'active' && professor.tracked_Status === 'Active') ||
      (professorFilter === 'deactivated' && professor.tracked_Status === 'Deactivated');

    return matchesSearch && matchesFilter;
  });

  const handleStudentFilterSelect = (filterType) => {
    setStudentFilter(filterType);
    setStudentFilterOpen(false);
  };

  const handleProfessorFilterSelect = (filterType) => {
    setProfessorFilter(filterType);
    setProfessorFilterOpen(false);
  };

  const SemesterToggleSwitch = ({ semester, status, onToggle, disabled }) => {
    const isActive = status === 'ACTIVE';
    const displayName = getSemesterDisplayName(semester);
    
    return (
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-[#465746] font-medium">{displayName}</span>
        <button
          onClick={onToggle}
          disabled={disabled}
          className={`cursor-pointer relative inline-flex h-4 w-8 sm:h-5 sm:w-10 items-center rounded-full transition-colors focus:outline-none ${
            isActive ? 'bg-[#00874E]' : 'bg-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
              isActive ? 'translate-x-4 sm:translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 flex flex-col justify-center items-center h-64">
            <div className="w-24 h-24 mb-4">
              <Lottie 
                {...defaultLottieOptions}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div className="text-[#465746] text-lg font-medium">Loading reports...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 flex justify-center items-center h-64">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={ReportLight}
                alt="Report"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Reports
              </h1>
            </div>
            <div className="text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>TrackED reports</span>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Stats Widgets */}
          <div className='flex justify-center items-center'>
            <div className='grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 w-full max-w-7xl'>
              {/* Total Accounts */}
              <div className='bg-[#fff] h-24 sm:h-32 md:h-36 lg:h-40 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-[#465746] shadow-md'> 
                <div className='font-bold text-[10px] sm:text-sm md:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <p className='mb-1 sm:mb-2'> Accounts Imported </p>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#8DDEBC] h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#00874E]'>
                      <img 
                        src={TotalAccountImported}
                        alt="TotalAccountsCreated"
                        className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='text-sm sm:text-lg md:text-xl lg:text-2xl'>
                      {widgetData.totalAccounts}
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Accounts */}
              <div className='bg-[#fff] h-24 sm:h-32 md:h-36 lg:h-40 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-[#465746] shadow-md'> 
                <div className='font-bold text-[10px] sm:text-sm md:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <p className='mb-1 sm:mb-2'> Student Accounts </p>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#ffd0b3] h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#FFA600]'>
                      <img
                        src={StudentAccounts} 
                        alt="Student Accounts"
                        className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='text-sm sm:text-lg md:text-xl lg:text-2xl'>
                      {widgetData.studentAccounts}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professor Accounts */}
              <div className='bg-[#fff] h-24 sm:h-32 md:h-36 lg:h-40 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-[#465746] shadow-md'> 
                <div className='font-bold text-[10px] sm:text-sm md:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <p className='mb-1 sm:mb-2'> Professor Accounts </p>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#a7aef9] h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#4951AA]'>
                      <img 
                        src={ProfessorAccounts}
                        alt="ProfessorAccounts"
                        className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='text-sm sm:text-lg md:text-xl lg:text-2xl'>
                      {widgetData.professorAccounts}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Widgets */}
          <div className='flex justify-center items-center mt-4 sm:mt-5'>
            <div className='grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 w-full max-w-7xl'>
              {/* Active Accounts */}
              <div className='bg-[#fff] h-24 sm:h-32 md:h-36 lg:h-40 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-[#465746] shadow-md'> 
                <div className='font-bold text-[10px] sm:text-sm md:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <p className='mb-1 sm:mb-2'> Active Accounts </p>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#8DDEBC] h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#00874E]'>
                      <img 
                        src={ActiveAccounts}
                        alt="Active Accounts"
                        className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='text-sm sm:text-lg md:text-xl lg:text-2xl'>
                      {widgetData.activeAccounts}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deactivated Accounts */}
              <div className='bg-[#fff] h-24 sm:h-32 md:h-36 lg:h-40 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-[#465746] shadow-md'> 
                <div className='font-bold text-[10px] sm:text-sm md:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <p className='mb-1 sm:mb-2'> Deactivated Accounts </p>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#ffb1b1] h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#FF6666]'>
                      <img 
                        src={DisabledAccounts}
                        alt="Disabled Accounts"
                        className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='text-sm sm:text-lg md:text-xl lg:text-2xl'> 
                      {widgetData.deactivatedAccounts}
                    </p>
                  </div>
                </div>
              </div>

              {/* Semester Settings Widget */}
              <div className='bg-[#fff] h-24 sm:h-32 md:h-36 lg:h-40 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-[#465746] shadow-md'> 
                <div className='font-bold text-[10px] sm:text-sm md:text-base lg:text-[1.125rem] h-full flex flex-col'>
                  <p className='mb-1 sm:mb-2'> Semester Settings </p>
                  <div className='flex flex-col space-y-1 sm:space-y-2 mt-auto'>
                    {isLoadingSemester ? (
                      <div className="flex items-center justify-center py-2">
                        <div className="w-4 h-4 mr-2">
                          <Lottie 
                            {...defaultLottieOptions}
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                        <span className="text-xs text-[#465746]">Loading...</span>
                      </div>
                    ) : (
                      <>
                        {Object.entries(semesterSettings).map(([semester, status]) => (
                          <SemesterToggleSwitch
                            key={semester}
                            semester={semester}
                            status={status}
                            onToggle={() => handleSemesterToggle(semester)}
                            disabled={isLoadingSemester}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 my-5 sm:my-6" />

          {/* Student Accounts Section */}
          <p className="text-sm sm:text-base lg:text-lg text-[#465746] mb-4 font-bold">
            Student Accounts ({filteredStudents.length})
          </p>

          {/* Student Controls */}
          <div className="flex flex-col sm:flex-row text-[#465746] gap-3 sm:gap-4 sm:justify-between sm:items-center">           
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setStudentFilterOpen(!studentFilterOpen)}
                className="flex items-center justify-between font-bold px-3 sm:px-4 py-2 bg-[#fff] rounded-md w-full sm:w-40 lg:w-44 shadow-md border-2 border-transparent hover:border-[#00874E] text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer"
              >
                <span>Filter</span>
                <img src={ArrowDown} alt="ArrowDown" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ml-2" />
              </button>

              {studentFilterOpen && (
                <div className="absolute top-full mt-1 bg-white rounded-md w-full sm:w-40 lg:w-44 shadow-lg border border-gray-200 z-10">
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => handleStudentFilterSelect('all')}
                  >
                    All
                  </button>
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => handleStudentFilterSelect('active')}
                  >
                    Active
                  </button>
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => handleStudentFilterSelect('deactivated')}
                  >
                    Deactivated
                  </button>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs lg:max-w-md">
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none text-[#465746] bg-white text-xs sm:text-sm border-2 border-transparent focus:border-[#00874E] transition-all duration-200"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#465746]">
                <img src={Search} alt="Search" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </button>
            </div>
          </div>

          {/* Student Accounts Table */}
          <div className="mt-4 sm:mt-5">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3 text-xs sm:text-sm lg:text-base">
                <thead>
                  <tr className="text-[#465746] font-bold">
                    <th className="py-2 px-2 sm:px-3">No.</th>
                    <th className="py-2 px-2 sm:px-3">Student No.</th>
                    <th className="py-2 px-2 sm:px-3">Full Name</th>
                    <th className="py-2 px-2 sm:px-3">Email</th>
                    <th className="py-2 px-2 sm:px-3">Year & Section</th>
                    <th className="py-2 px-2 sm:px-3">Status</th>
                    <th className="py-2 px-2 sm:px-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="text-[#465746]">
                  {filteredStudents.map((student, index) => (
                    <tr key={student.tracked_ID} className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-3 px-2 sm:px-3 rounded-l-lg">{index + 1}</td>
                      <td className="py-3 px-2 sm:px-3">{student.tracked_ID}</td>
                      <td className="py-3 px-2 sm:px-3">{student.tracked_firstname} {student.tracked_lastname}</td>
                      <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">{student.tracked_email}</td>
                      <td className="py-3 px-2 sm:px-3">{student.tracked_yearandsec}</td>
                      <td className={`py-3 px-2 sm:px-3 font-bold ${
                        student.tracked_Status === 'Active' ? 'text-[#00A15D]' : 'text-[#FF6666]'
                      }`}>
                        {student.tracked_Status}
                      </td>
                      <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                        <Link to={`/UserManagementStudentAccountDetails?id=${student.tracked_ID}`}>
                          <img 
                            src={Details} 
                            alt="View student details" 
                            className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 transition-opacity"
                          />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredStudents.map((student, index) => (
                <div key={student.tracked_ID} className="bg-white rounded-lg shadow p-4 text-[#465746]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">No. {index + 1} | Student No.</p>
                      <p className="font-semibold text-sm">{student.tracked_ID}</p>
                    </div>
                    <div>
                      <Link to={`/UserManagementStudentAccountDetails?id=${student.tracked_ID}`}>
                        <img 
                          src={Details} 
                          alt="View student details" 
                          className="h-5 w-5"
                        />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium text-sm">{student.tracked_firstname} {student.tracked_lastname}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm break-all">{student.tracked_email}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Year & Section</p>
                      <p className="text-sm">{student.tracked_yearandsec}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className={`font-bold text-sm ${
                        student.tracked_Status === 'Active' ? 'text-[#00A15D]' : 'text-[#FF6666]'
                      }`}>
                        {student.tracked_Status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-[#465746]">
                No students found matching your criteria.
              </div>
            )}
          </div>

          <hr className="border-[#465746]/30 my-5 sm:my-6" />

          {/* Professor Accounts Section */}
          <p className="text-sm sm:text-base lg:text-lg text-[#465746] mb-4 font-bold">
            Professor Accounts ({filteredProfessors.length})
          </p>
          
          {/* Professor Controls */}
          <div className="flex flex-col sm:flex-row text-[#465746] gap-3 sm:gap-4 sm:justify-between sm:items-center">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfessorFilterOpen(!professorFilterOpen)}
                className="flex items-center justify-between font-bold px-3 sm:px-4 py-2 bg-[#fff] rounded-md w-full sm:w-40 lg:w-44 shadow-md border-2 border-transparent hover:border-[#00874E] text-xs sm:text-sm lg:text-base transition-all duration-200 cursor-pointer"
              >
                <span>Filter</span>
                <img src={ArrowDown} alt="ArrowDown" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ml-2" />
              </button>

              {professorFilterOpen && (
                <div className="absolute top-full mt-1 bg-white rounded-md w-full sm:w-40 lg:w-44 shadow-lg border border-gray-200 z-10">
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => handleProfessorFilterSelect('all')}
                  >
                    All
                  </button>
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => handleProfessorFilterSelect('active')}
                  >
                    Active
                  </button>
                  <button 
                    className="block px-3 sm:px-4 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm lg:text-base transition-colors duration-200 cursor-pointer"
                    onClick={() => handleProfessorFilterSelect('deactivated')}
                  >
                    Deactivated
                  </button>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs lg:max-w-md">
              <input
                type="text"
                placeholder="Search professors..."
                value={professorSearch}
                onChange={(e) => setProfessorSearch(e.target.value)}
                className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none text-[#465746] bg-white text-xs sm:text-sm border-2 border-transparent focus:border-[#00874E] transition-all duration-200"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#465746]">
                <img src={Search} alt="Search" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </button>
            </div>
          </div>

          {/* Professor Accounts Table */}
          <div className="mt-4 sm:mt-5">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-3 text-xs sm:text-sm lg:text-base">
                <thead>
                  <tr className="text-[#465746] font-bold">
                    <th className="py-2 px-2 sm:px-3">No.</th>
                    <th className="py-2 px-2 sm:px-3">Professor No.</th>
                    <th className="py-2 px-2 sm:px-3">Full Name</th>
                    <th className="py-2 px-2 sm:px-3">Email</th>
                    <th className="py-2 px-2 sm:px-3">Status</th>
                    <th className="py-2 px-2 sm:px-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="text-[#465746]">
                  {filteredProfessors.map((professor, index) => (
                    <tr key={professor.tracked_ID} className="bg-[#fff] rounded-lg shadow hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-3 px-2 sm:px-3 rounded-l-lg">{index + 1}</td>
                      <td className="py-3 px-2 sm:px-3">{professor.tracked_ID}</td>
                      <td className="py-3 px-2 sm:px-3">{professor.tracked_firstname} {professor.tracked_lastname}</td>
                      <td className="py-3 px-2 sm:px-3 break-all sm:break-normal">{professor.tracked_email}</td>
                      <td className={`py-3 px-2 sm:px-3 font-bold ${
                        professor.tracked_Status === 'Active' ? 'text-[#00A15D]' : 'text-[#FF6666]'
                      }`}>
                        {professor.tracked_Status}
                      </td>
                      <td className="py-3 px-2 sm:px-3 rounded-r-lg">
                        <Link to={`/UserManagementProfessorAccountsDetails?id=${professor.tracked_ID}`}>
                          <img 
                            src={Details} 
                            alt="View professor details" 
                            className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 transition-opacity"
                          />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredProfessors.map((professor, index) => (
                <div key={professor.tracked_ID} className="bg-white rounded-lg shadow p-4 text-[#465746]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">No. {index + 1} | Professor No.</p>
                      <p className="font-semibold text-sm">{professor.tracked_ID}</p>
                    </div>
                    <div>
                      <Link to={`/UserManagementProfessorAccountsDetails?id=${professor.tracked_ID}`}>
                        <img 
                          src={Details} 
                          alt="View professor details" 
                          className="h-5 w-5"
                        />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium text-sm">{professor.tracked_firstname} {professor.tracked_lastname}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm break-all">{professor.tracked_email}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className={`font-bold text-sm ${
                        professor.tracked_Status === 'Active' ? 'text-[#00A15D]' : 'text-[#FF6666]'
                      }`}>
                        {professor.tracked_Status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProfessors.length === 0 && (
              <div className="text-center py-8 text-[#465746]">
                No professors found matching your criteria.
              </div>
            )}
          </div>
        </div>

        {/* Semester Settings Modal */}
        {semesterModal.show && (
          <div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
            onClick={closeSemesterModal}
            role="dialog"
            aria-modal="true"
          >
            <div 
              className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
                  semesterModal.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <img 
                    src={semesterModal.type === 'success' ? SuccessIcon : ErrorIcon} 
                    alt={semesterModal.type === 'success' ? 'Success' : 'Error'} 
                    className="h-8 w-8" 
                  />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {semesterModal.title}
                </h3>
                
                <div className="mt-4 mb-6">
                  <p className="text-base text-gray-600">
                    {semesterModal.message}
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={closeSemesterModal}
                    className="px-6 py-3 bg-[#00874E] hover:bg-[#00743E] text-white font-bold rounded-md transition-all duration-200 cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}