import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
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
        {/* Render Navbar when user is logged in */}
        {user && <Navbar user={user} onLogout={handleLogout} />}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
          <Routes>
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LoginPage onLoginSuccess={(u) => setUser(u)} />
                )
              }
            />

            <Route
              path="/dashboard"
              element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/search"
              element={user ? <SearchPage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/route-planner"
              element={user ? <RoutePlannerPage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/station-profile"
              element={user ? <StationProfilePage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/boarding-recommendation"
              element={user ? <BoardingRecommendationPage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/arrival-reminder"
              element={user ? <ArrivalReminderPage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/community-reports"
              element={user ? <CommunityReportsPage /> : <Navigate to="/login" replace />}
            />

            {/* Default Fallback */}
            <Route
              path="*"
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
