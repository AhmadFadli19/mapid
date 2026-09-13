import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import api, { normalizeStations } from './services/api';
import WebGisHeader, { PRD_PERSONAS } from './components/WebGisHeader';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import StationProfilePage from './pages/StationProfilePage';
import BoardingRecommendationPage from './pages/BoardingRecommendationPage';
import ArrivalReminderPage from './pages/ArrivalReminderPage';
import CommunityReportsPage from './pages/CommunityReportsPage';
import PanduYukExperience from './pages/PanduYukExperience';

const FRESH_EXPERIENCE_PATHS = [
  '/webgis-dashboard',
  '/mobile',
  '/route-planner',
  '/trip-detail',
  '/community-report',
  '/community-report-status',
  '/station-info',
  '/arrival-exit',
  '/facility-finder',
  '/data-availability',
];

const DEFAULT_USER = { id: 1, name: 'Andi Komuter', email: 'andi@panduyuk.id', role: 'Komuter Harian' };

function getInitialUser() {
  try {
    const savedUser = localStorage.getItem('mapid_user');
    return savedUser ? JSON.parse(savedUser) : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export default function App() {
  const [user, setUser] = useState(getInitialUser);
  const [activePersona, setActivePersona] = useState(PRD_PERSONAS[0]);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem('mapid_user')) localStorage.setItem('mapid_user', JSON.stringify(DEFAULT_USER));

    api.get('/stations?limit=800').then((response) => {
      const nextStations = normalizeStations(response.data);
      if (nextStations.length > 0) setStations(nextStations);
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mapid_token');
    localStorage.removeItem('mapid_user');
    setUser(null);
  };

  return (
    <Router>
      <AppRoutes
        user={user}
        onLogout={handleLogout}
        activePersona={activePersona}
        onSelectPersona={setActivePersona}
        stations={stations}
        onLoginSuccess={setUser}
      />
    </Router>
  );
}

function LegacyPage({ children }) {
  return <div className="max-w-7xl w-full mx-auto p-4 md:p-6">{children}</div>;
}

function AppRoutes({ user, onLogout, activePersona, onSelectPersona, stations, onLoginSuccess }) {
  const location = useLocation();
  const isFreshExperience = FRESH_EXPERIENCE_PATHS.includes(location.pathname);
  const shellClass = isFreshExperience
    ? 'min-h-screen bg-[#f5f5f7] flex flex-col font-sans'
    : 'min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans';

  return (
    <div className={shellClass}>
      {user && !isFreshExperience ? (
        <WebGisHeader
          user={user}
          onLogout={onLogout}
          activePersona={activePersona}
          onSelectPersona={onSelectPersona}
          stations={stations}
        />
      ) : null}

      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/webgis-dashboard" replace /> : <LoginPage onLoginSuccess={onLoginSuccess} />}
          />

          <Route
            path="/webgis-dashboard"
            element={user ? <PanduYukExperience onLogout={onLogout} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/mobile"
            element={user ? <PanduYukExperience onLogout={onLogout} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/route-planner"
            element={user ? <PanduYukExperience onLogout={onLogout} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/trip-detail"
            element={user ? <PanduYukExperience onLogout={onLogout} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/community-report"
            element={user ? <PanduYukExperience onLogout={onLogout} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/community-report-status"
            element={user ? <PanduYukExperience onLogout={onLogout} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/station-info"
            element={user ? <PanduYukExperience onLogout={onLogout} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/arrival-exit"
            element={user ? <PanduYukExperience onLogout={onLogout} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/facility-finder"
            element={user ? <PanduYukExperience onLogout={onLogout} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/data-availability"
            element={user ? <PanduYukExperience onLogout={onLogout} /> : <Navigate to="/login" replace />}
          />

          <Route path="/dashboard" element={user ? <LegacyPage><DashboardPage /></LegacyPage> : <Navigate to="/login" replace />} />
          <Route path="/search" element={user ? <LegacyPage><SearchPage /></LegacyPage> : <Navigate to="/login" replace />} />
          <Route path="/station-profile" element={user ? <LegacyPage><StationProfilePage /></LegacyPage> : <Navigate to="/login" replace />} />
          <Route path="/boarding-recommendation" element={user ? <LegacyPage><BoardingRecommendationPage /></LegacyPage> : <Navigate to="/login" replace />} />
          <Route path="/arrival-reminder" element={user ? <LegacyPage><ArrivalReminderPage /></LegacyPage> : <Navigate to="/login" replace />} />
          <Route path="/community-reports" element={user ? <LegacyPage><CommunityReportsPage /></LegacyPage> : <Navigate to="/login" replace />} />

          <Route path="*" element={<Navigate to={user ? '/webgis-dashboard' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
}
