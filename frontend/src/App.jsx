import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WebGisHeader from './components/WebGisHeader';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WebGisDashboardPage from './pages/WebGisDashboardPage';
import MobileTransitScreen from './pages/MobileTransitScreen';
import SearchPage from './pages/SearchPage';
import RoutePlannerPage from './pages/RoutePlannerPage';
import StationProfilePage from './pages/StationProfilePage';
import BoardingRecommendationPage from './pages/BoardingRecommendationPage';
import ArrivalReminderPage from './pages/ArrivalReminderPage';
import CommunityReportsPage from './pages/CommunityReportsPage';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('mapid_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mapid_token');
    localStorage.removeItem('mapid_user');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
        {/* PanduYuk WebGIS Header (shown when logged in) */}
        {user && <WebGisHeader user={user} onLogout={handleLogout} />}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/webgis-dashboard" replace />
                ) : (
                  <LoginPage onLoginSuccess={(u) => setUser(u)} />
                )
              }
            />

            {/* NEW: WebGIS Dashboard (Full-screen 3-column layout) */}
            <Route
              path="/webgis-dashboard"
              element={user ? <WebGisDashboardPage /> : <Navigate to="/login" replace />}
            />

            {/* NEW: Mobile Transit Screen */}
            <Route
              path="/mobile"
              element={user ? <MobileTransitScreen /> : <Navigate to="/login" replace />}
            />

            {/* Existing routes - wrap in padded container */}
            <Route
              path="/dashboard"
              element={
                user ? (
                  <div className="max-w-7xl w-full mx-auto p-4 md:p-6">
                    <DashboardPage />
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/search"
              element={
                user ? (
                  <div className="max-w-7xl w-full mx-auto p-4 md:p-6">
                    <SearchPage />
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/route-planner"
              element={
                user ? (
                  <div className="max-w-7xl w-full mx-auto p-4 md:p-6">
                    <RoutePlannerPage />
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/station-profile"
              element={
                user ? (
                  <div className="max-w-7xl w-full mx-auto p-4 md:p-6">
                    <StationProfilePage />
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/boarding-recommendation"
              element={
                user ? (
                  <div className="max-w-7xl w-full mx-auto p-4 md:p-6">
                    <BoardingRecommendationPage />
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/arrival-reminder"
              element={
                user ? (
                  <div className="max-w-7xl w-full mx-auto p-4 md:p-6">
                    <ArrivalReminderPage />
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/community-reports"
              element={
                user ? (
                  <div className="max-w-7xl w-full mx-auto p-4 md:p-6">
                    <CommunityReportsPage />
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Default Fallback */}
            <Route
              path="*"
              element={<Navigate to={user ? '/webgis-dashboard' : '/login'} replace />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
