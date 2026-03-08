import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { CreateQuestion } from './pages/teacher/CreateQuestion';
import { CreateTest } from './pages/teacher/CreateTest';
import { TeacherMonitor } from './pages/teacher/TeacherMonitor';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { LiveTest } from './pages/student/LiveTest';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/users" element={<AdminUsers />} />
                  <Route path="/questions" element={<div>Question Bank</div>} />
                  <Route path="/monitor" element={<TeacherMonitor />} />
                  <Route path="/analytics" element={<div>Analytics</div>} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<TeacherDashboard />} />
                  <Route path="/questions" element={<CreateQuestion />} />
                  <Route path="/tests/create" element={<CreateTest />} />
                  <Route path="/results" element={<TeacherMonitor />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/test/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <LiveTest />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
