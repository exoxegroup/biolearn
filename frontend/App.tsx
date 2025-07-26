
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import LandingPage from './src/pages/LandingPage';
import LoginPage from './src/pages/LoginPage';
import RegisterPage from './src/pages/RegisterPage';
import TeacherDashboard from './src/pages/TeacherDashboard';
import StudentDashboard from './src/pages/StudentDashboard';
import ClassroomPage from './src/pages/ClassroomPage';
import CompleteProfilePage from './src/pages/CompleteProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ManageClassContentPage from './src/pages/ManageClassContentPage';
import ManageQuizzesPage from './src/pages/ManageQuizzesPage';
import ManageStudentsPage from './src/pages/ManageStudentsPage';
import PerformanceAnalyticsPage from './src/pages/PerformanceAnalyticsPage';

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
