import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import UserManagement from './Admin/UserManagement.jsx';
import Report from './Admin/Report.jsx';
import AccountRequest from './Admin/AccountRequest.jsx';
import UserManagementProfessorAccounts from './Admin/UserManagement_ProfessorAccounts.jsx';
import UserManagementProfessorAccountsDetails from './Admin/UserManagement_ProfessorAccountDetails.jsx';
import UserManagementStudentAccounts from './Admin/UserManagement_StudentAccounts.jsx';
import UserManagementStudentAccountDetails from './Admin/UserManagement_StudentAccountDetails.jsx';
import AdminAccountArchive from './Admin/AdminAccountArchive.jsx';
import Login from './Landing/Login.jsx';
import Signup from './Landing/Signup.jsx';


function Linking() {
  return (
    <Router>
      <Routes>
        {/* Navigations for ADMIN */}
        <Route path ="/Login" element={<Login />} />
        <Route path ="/Signup" element={<Signup />} />

        {/* Navigations for ADMIN */}
        <Route path="/" element={<UserManagement />} />  
        <Route path ="/UserManagement" element={<UserManagement />} />
        <Route path ="/UserManagementProfessorAccounts" element={<UserManagementProfessorAccounts />} />
        <Route path ="/UserManagementProfessorAccountsDetails" element={<UserManagementProfessorAccountsDetails />} />
        <Route path ="/UserManagementStudentAccounts" element={<UserManagementStudentAccounts />} />
        <Route path ="/UserManagementStudentAccountDetails" element={<UserManagementStudentAccountDetails />} />
        <Route path ="/Report" element={<Report />} />
        <Route path ="/AccountRequest" element={<AccountRequest />} />
        <Route path ="/AdminAccountArchive" element={<AdminAccountArchive />} />

      </Routes>
    </Router>
  );
}

export default Linking;