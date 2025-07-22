
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ClassroomPage from './pages/ClassroomPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ManageClassContentPage from './pages/ManageClassContentPage';
import ManageQuizzesPage from './pages/ManageQuizzesPage';
import ManageStudentsPage from './pages/ManageStudentsPage';
import PerformanceAnalyticsPage from './pages/PerformanceAnalyticsPage';

function App(): React.ReactNode {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route 
            path="/complete-profile" 
            element={
              <ProtectedRoute>
                <CompleteProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/teacher-dashboard" 
            element={
              <ProtectedRoute role="TEACHER">
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute role="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/classroom/:classId" 
            element={
              <ProtectedRoute>
                <ClassroomPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/class/:classId/manage" 
            element={
              <ProtectedRoute role="TEACHER">
                <ManageClassContentPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/class/:classId/quizzes" 
            element={
              <ProtectedRoute role="TEACHER">
                <ManageQuizzesPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/class/:classId/students" 
            element={
              <ProtectedRoute role="TEACHER">
                <ManageStudentsPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/class/:classId/analytics" 
            element={
              <ProtectedRoute role="TEACHER">
                <PerformanceAnalyticsPage />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
