import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useThemeStore } from './store/themeStore';

// Auth Pages
import { Home } from './pages/auth/Home';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { ForcePasswordChange } from './pages/auth/ForcePasswordChange';

// Teacher Pages
import { TeacherDashboard } from './pages/Teacher/TeacherDashboard';
import { CreateQuestion } from './pages/Teacher/CreateQuestion';
import { QuestionsList } from './pages/Teacher/QuestionsList';
import { CreateTest } from './pages/Teacher/CreateTest';
import { TestDetail } from './pages/Teacher/TestDetail';

import { TeacherResults } from './pages/Teacher/TeacherResults';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { LiveTest } from './pages/student/LiveTest';

// Campus Admin Module Pages
import { CampusAdminDashboard } from './pages/Admin/CampusAdminDashboard';
import { UserManagement } from './pages/Admin/UserManagement';
import { DepartmentManagement } from './pages/Admin/DepartmentManagement';
import { BatchManagement } from './pages/Admin/BatchManagement';
import { BulkUpload } from './pages/Admin/BulkUpload';
import { AuditLogs } from './pages/Admin/AuditLogs';

// Super Admin Module Pages
import { SuperAdminDashboard } from './pages/Admin/SuperAdminDashboard';
import { CampusManagement } from './pages/Admin/CampusManagement';
import { GlobalUserManagement } from './pages/Admin/GlobalUserManagement';
import { StaffManagement } from './pages/Admin/StaffManagement';
import { SubscriptionManagement } from './pages/Admin/SubscriptionManagement';
import { DeanDashboard } from './pages/Admin/DeanDashboard';
import { HodDashboard } from './pages/Admin/HodDashboard';
import { MentorDashboard } from './pages/Admin/MentorDashboard';



function App() {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ style: { background: '#111111', color: '#ffffff', border: '1px solid rgba(45,240,123,0.1)' } }} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/force-password-change" element={<ProtectedRoute><ForcePasswordChange /></ProtectedRoute>} />

        {/* Teacher */}
        <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<TeacherDashboard />} />
          <Route path="questions" element={<QuestionsList />} />
          <Route path="questions/create" element={<CreateQuestion />} />
          <Route path="questions/edit/:id" element={<CreateQuestion />} />
          <Route path="tests/create" element={<CreateTest />} />
          <Route path="tests/:id" element={<TestDetail />} />

          <Route path="results" element={<TeacherResults />} />
        </Route>

        {/* Student */}
        <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/test/:id" element={<ProtectedRoute allowedRoles={['student']}><LiveTest /></ProtectedRoute>} />
        <Route path="/student/join/:id" element={<ProtectedRoute allowedRoles={['student']}><Navigate to={window.location.pathname.replace('/join/', '/test/')} replace /></ProtectedRoute>} />

        {/* Super Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin', 'platform_staff']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="campuses" element={<CampusManagement />} />
          <Route path="users" element={<GlobalUserManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="subscriptions" element={<SubscriptionManagement />} />
        </Route>

        {/* Campus Admin */}
        <Route path="/campus-admin" element={<ProtectedRoute allowedRoles={['campus_admin']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<CampusAdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="batches" element={<BatchManagement />} />
          <Route path="bulk-upload" element={<BulkUpload />} />
        </Route>

        {/* Staff (can manage users + bulk upload) */}
        <Route path="/staff" element={<ProtectedRoute allowedRoles={['campus_staff']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<CampusAdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="bulk-upload" element={<BulkUpload />} />
        </Route>

        {/* Dean */}
        <Route path="/dean" element={<ProtectedRoute allowedRoles={['dean']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DeanDashboard />} />
          <Route path="students" element={<DeanDashboard />} />
          <Route path="teachers" element={<DeanDashboard />} />
          <Route path="academic-staff" element={<DeanDashboard />} />
        </Route>

        {/* HOD */}
        <Route path="/hod" element={<ProtectedRoute allowedRoles={['hod']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<HodDashboard />} />
          <Route path="teachers" element={<HodDashboard />} />
          <Route path="students" element={<HodDashboard />} />
          <Route path="mentors" element={<HodDashboard />} />
        </Route>

        {/* Mentor */}
        <Route path="/mentor" element={<ProtectedRoute allowedRoles={['mentor']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<MentorDashboard />} />
          <Route path="students" element={<MentorDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;