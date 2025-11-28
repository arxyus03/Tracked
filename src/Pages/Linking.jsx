import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Admin Links
import UserManagement from './Admin/UserManagement.jsx';
import Report from './Admin/Report.jsx';
import UserManagementProfessorAccounts from './Admin/UserManagement_ProfessorAccounts.jsx';
import UserManagementProfessorAccountsDetails from './Admin/UserManagement_ProfessorAccountDetails.jsx';
import UserManagementStudentAccounts from './Admin/UserManagement_StudentAccounts.jsx';
import UserManagementStudentAccountDetails from './Admin/UserManagement_StudentAccountDetails.jsx';
import AdminAccountArchive from './Admin/AdminAccountArchive.jsx';
import Import from './Admin/AdminImport.jsx';

// Landing Links
import Login from './Landing/Login.jsx';
import Signup from './Landing/Signup.jsx';
import VerifyAcc from './Landing/VerifyAcc.jsx';
import ForgotPass from './Landing/ForgotPass.jsx';

// Professor Links
import DashboardProf from './Professor/DashboardProf.jsx';
import ClassManagement from './Professor/ClassManagement.jsx';
import Class from './Professor/AnnouncementTab.jsx';
import AnalyticsProf from './Professor/AnalyticsProf.jsx';
import ClassworkTab from './Professor/ClassworkTab.jsx';
import NotificationProf from './Professor/NotificationProf.jsx';
import ProfileProf from './Professor/ProfileProf.jsx';
import AccountSettingProf from './Professor/AccountSettingProf.jsx';
import SubjectDetails from './Professor/ClassworkTab.jsx';
import Attendance from './Professor/AttendanceTab.jsx';
import GradeTab from './Professor/GradeTab.jsx';
import AnalyticsTab from './Professor/AnalyticsTab.jsx';
import AttendanceHistory from './Professor/AttendanceHistory.jsx';
import AnalyticsIndividualInfo from './Professor/AnalyticsIndividualInfo.jsx';
import AnalyticsAttendanceInfo from './Professor/AnalyticsAttendanceInfo.jsx';
import ArchiveClass from './Professor/ArchiveClass.jsx'; 
import ArchiveActivities from './Professor/ArchiveActivities.jsx';
import StudentList from './Professor/StudentList.jsx';

// Student Links
import DashboardStudent from './Student/DashboardStudent.jsx';
import Subjects from './Student/Subjects.jsx';
import ArchiveClassStudent from './Student/ArchiveClassStudent.jsx';
import AnalyticsStudent from './Student/AnalyticsStudent.jsx';
import NotificationStudent from './Student/NotificationStudent.jsx';
import ProfileStudent from './Student/ProfileStudent.jsx';
import AccountSetting from './Student/AccountSetting.jsx';
import AttendanceHistoryStudent from './Student/AttendanceHistoryStudent.jsx';
import SubjectAnnouncementStudent from './Student/SubjectAnnouncementStudent.jsx';
import SubjectSchoolWorksStudent from './Student/SubjectSchoolWorksStudent.jsx';
import SubjectAttendanceStudent from './Student/SubjectAttendanceStudent.jsx';
import SubjectListStudent from './Student/SubjectListStudent.jsx';
import SubjectAnalyticsStudent from './Student/SubjectAnalyticsStudent.jsx';


// Super Admin Links
import SuperAdminAccountList from './SuperAdmin/SuperAdminAccountList.jsx';
import SuperAdminLanding from './SuperAdmin/SuperAdminLanding.jsx';
import SuperAdminAdminAccountDetails from './SuperAdmin/SuperAdminAdminAccountDetails.jsx';
import SuperAdminProfAccountDetails from './SuperAdmin/SuperAdminProfAccountDetails.jsx';
import SuperAdminStudentAccountDetails from './SuperAdmin/SuperAdminStudentAccountDetails.jsx';
import SuperAdminAdminAccount from './SuperAdmin/SuperAdminAdminAccount.jsx';
import SuperAdminProfAccount from './SuperAdmin/SuperAdminProfAccount.jsx';
import SuperAdminStudentAccount from './SuperAdmin/SuperAdminStudentAccount.jsx';

function Linking() {
  return (
    <Router basename="/">
      <Routes>
        {/* Redirect to Login */}
        <Route path="/" element={<Navigate to="/Login" replace />} />
        
        {/* Navigations for Landing */}
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/VerifyAcc" element={<VerifyAcc />} />
        <Route path="/ForgotPass" element={<ForgotPass />} />

        {/* Navigations for ADMIN */} 
        <Route path="/UserManagement" element={<UserManagement />} />
        <Route path="/UserManagementProfessorAccounts" element={<UserManagementProfessorAccounts />} />
        <Route path="/UserManagementProfessorAccountsDetails" element={<UserManagementProfessorAccountsDetails />} />
        <Route path="/UserManagementStudentAccounts" element={<UserManagementStudentAccounts />} />
        <Route path="/UserManagementStudentAccountDetails" element={<UserManagementStudentAccountDetails />} />
        <Route path="/Report" element={<Report />} />
        <Route path="/AdminAccountArchive" element={<AdminAccountArchive />} />
        <Route path="/Import" element={<Import/>} />
        
        {/* Navigations for Professor */} 
        <Route path="/DashboardProf" element={<DashboardProf />} />  
        <Route path="/ClassManagement" element={<ClassManagement />} /> 
        <Route path="/Class" element={<Class />} /> 
        <Route path="/AnalyticsProf" element={<AnalyticsProf />} />  
        <Route path="/ClassworkTab" element={<ClassworkTab />} />  
        <Route path="/NotificationProf" element={<NotificationProf />} />  
        <Route path="/ProfileProf" element={<ProfileProf/>} />  
        <Route path="/AccountSettingProf" element={<AccountSettingProf/>} />  
        <Route path="/SubjectDetails" element={<SubjectDetails/>} />  
        <Route path="/Attendance" element={<Attendance/>} /> 
        <Route path="/AttendanceHistory" element={<AttendanceHistory/>} /> 
        <Route path="/ArchiveClass" element={<ArchiveClass/>} /> 
        <Route path="/ArchiveActivities" element={<ArchiveActivities/>} /> 
        <Route path="/AnalyticsIndividualInfo" element={<AnalyticsIndividualInfo/>} /> 
        <Route path="/AnalyticsAttendanceInfo" element={<AnalyticsAttendanceInfo/>} /> 
        <Route path="/StudentList" element={<StudentList/>} /> 
        <Route path="/GradeTab" element={<GradeTab/>} /> 
        <Route path="/AnalyticsTab" element={<AnalyticsTab/>} /> 

        {/* Navigations for Student */}
        <Route path="/DashboardStudent" element={<DashboardStudent />} />
        <Route path="/Subjects" element={<Subjects />} />
        <Route path="/ArchiveClassStudent" element={<ArchiveClassStudent />} />
        <Route path="/AnalyticsStudent" element={<AnalyticsStudent />} />
        <Route path="/NotificationStudent" element={<NotificationStudent />} />
        <Route path="/ProfileStudent" element={<ProfileStudent />} />
        <Route path="/AccountSetting" element={<AccountSetting />} />
        <Route path="/AttendanceHistoryStudent" element={<AttendanceHistoryStudent />} />
        <Route path="/SubjectAnnouncementStudent" element={<SubjectAnnouncementStudent />} />
        <Route path="/SubjectSchoolWorksStudent" element={<SubjectSchoolWorksStudent />} />
        <Route path="/SubjectAttendanceStudent" element={<SubjectAttendanceStudent />} />
        <Route path="/SubjectListStudent" element={<SubjectListStudent />} />
        <Route path="/SubjectAnalyticsStudent" element={<SubjectAnalyticsStudent />} />

        {/* Navigations for Super Admin */}
        <Route path="/SuperAdminAccountList" element={<SuperAdminAccountList />} />
        <Route path="/SuperAdminLanding" element={<SuperAdminLanding />} />
        <Route path="/SuperAdminAdminAccountDetails" element={<SuperAdminAdminAccountDetails />} />
        <Route path="/SuperAdminProfAccountDetails" element={<SuperAdminProfAccountDetails />} />
        <Route path="/SuperAdminStudentAccountDetails" element={<SuperAdminStudentAccountDetails />} />
        <Route path="/SuperAdminAdminAccount" element={<SuperAdminAdminAccount />} />
        <Route path="/SuperAdminProfAccount" element={<SuperAdminProfAccount />} />
        <Route path="/SuperAdminStudentAccount" element={<SuperAdminStudentAccount />} />
      </Routes>
    </Router>
  );
}

export default Linking;