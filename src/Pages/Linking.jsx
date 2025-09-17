import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

{/* Admin Links */}
import UserManagement from './Admin/UserManagement.jsx';
import Report from './Admin/Report.jsx';
import AccountRequest from './Admin/AccountRequest.jsx';
import UserManagementProfessorAccounts from './Admin/UserManagement_ProfessorAccounts.jsx';
import UserManagementProfessorAccountsDetails from './Admin/UserManagement_ProfessorAccountDetails.jsx';
import UserManagementStudentAccounts from './Admin/UserManagement_StudentAccounts.jsx';
import UserManagementStudentAccountDetails from './Admin/UserManagement_StudentAccountDetails.jsx';
import AdminAccountArchive from './Admin/AdminAccountArchive.jsx';
import Import from './Admin/AdminImport.jsx';

{/* Landing Links */}
import Login from './Landing/Login.jsx';
import Signup from './Landing/Signup.jsx';
import ForgotPass from './Landing/ForgotPass.jsx';

{/* Professor Links */}
import DashboardProf from './Professor/DashboardProf.jsx';
import ClassManagement from './Professor/ClassManagement.jsx';
import AnalyticsProf from './Professor/AnalyticsProf.jsx';
import Announcement from './Professor/Announcement.jsx';
import NotificationProf from './Professor/NotificationProf.jsx';
import ProfileProf from './Professor/ProfileProf.jsx';
import AccountSettingProf from './Professor/AccountSettingProf.jsx';


function Linking() {
  return (
    <Router>
      <Routes>

        {/* Starting Flow */} 
        <Route path="/" element={<DashboardProf />} />  
        
        {/* Navigations for Landing */}
        <Route path ="/Login" element={<Login />} />
        <Route path ="/Signup" element={<Signup />} />
        <Route path="/ForgotPass" element={<ForgotPass />} />

        {/* Navigations for ADMIN */} 
        <Route path ="/UserManagement" element={<UserManagement />} />
        <Route path ="/UserManagementProfessorAccounts" element={<UserManagementProfessorAccounts />} />
        <Route path ="/UserManagementProfessorAccountsDetails" element={<UserManagementProfessorAccountsDetails />} />
        <Route path ="/UserManagementStudentAccounts" element={<UserManagementStudentAccounts />} />
        <Route path ="/UserManagementStudentAccountDetails" element={<UserManagementStudentAccountDetails />} />
        <Route path ="/Report" element={<Report />} />
        <Route path ="/AccountRequest" element={<AccountRequest />} />
        <Route path ="/AdminAccountArchive" element={<AdminAccountArchive />} />
        <Route path ="/Import" element={<Import/>} />
        
        {/* Navigations for Professor  */} 
        <Route path="DashboardProf" element={<DashboardProf />} />  
        <Route path="ClassManagement" element={<ClassManagement />} />  
        <Route path="AnalyticsProf" element={<AnalyticsProf />} />  
        <Route path="Announcement" element={<Announcement />} />  
        <Route path="NotificationProf" element={<NotificationProf />} />  
        <Route path="ProfileProf" element={<ProfileProf/>} />  
        <Route path="AccountSettingProf" element={<AccountSettingProf/>} />  
      </Routes>
    </Router>
  );
}

export default Linking;