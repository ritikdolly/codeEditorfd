import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

// Auth Pages
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";

// Admin Pages
import { AdminDashboard } from "./pages/Admin/AdminDashboard";
import { AdminUsers } from "./pages/Admin/AdminUsers";

// Teacher Pages
import { TeacherDashboard } from "./pages/Teacher/TeacherDashboard";
import { CreateQuestion } from "./pages/Teacher/CreateQuestion";
import { CreateTest } from "./pages/Teacher/CreateTest";
import { TestDetail } from "./pages/Teacher/TestDetail";
import { TeacherResults } from "./pages/Teacher/TeacherResults";
import { QuestionLibrary } from "./pages/Teacher/QuestionLibrary";
import { TeacherMonitor } from "./pages/Teacher/TeacherMonitor";

// Student Pages
import { StudentDashboard } from "./pages/Student/StudentDashboard";
import { LiveTest } from "./pages/Student/LiveTest";
import { Home } from "./pages/auth/Home";

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#09090b",
            color: "#f1f5f9",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Teacher */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="questions" element={<QuestionLibrary />} />
          <Route path="questions/create" element={<CreateQuestion />} />
          <Route path="questions/edit/:id" element={<CreateQuestion />} />
          <Route path="tests/create" element={<CreateTest />} />
          <Route path="tests/:id" element={<TestDetail />} />
          <Route path="monitor/:id" element={<TeacherMonitor />} />
          <Route path="results" element={<TeacherResults />} />
        </Route>

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/test/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <LiveTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/join/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Navigate
                to={window.location.pathname.replace("/join/", "/test/")}
                replace
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
