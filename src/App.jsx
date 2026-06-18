import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { userStore } from './logic/state/store';
import axios from 'axios';

// Static pages
import LandingPage from './page/LandingPage/LandingPage';
import LogIn from './page/LogInPage/LogIn';
import SignUp from './page/LogInPage/SignUp';

// Static components
import Shadow from './components/Floating/Shadow';
import Dashboard from './page/Dashboard/Dashboard';

// Lazy-loaded dashboard pages
const Overview = lazy(() => import('./page/Dashboard/Overview/Overview'));
const Analisis = lazy(() => import('./page/Dashboard/Workspace/Analisis'));
const HistoriWorkspace = lazy(() => import('./page/Dashboard/Workspace/HistoriWorkspace'));
const TentangAkun = lazy(() => import('./page/Dashboard/Akun/TentangAkun'));
const Billing = lazy(() => import('./page/Dashboard/Akun/Billing'));
const SambungkanAkun = lazy(() => import('./page/Dashboard/Bot/SambungkanAkun'));
const BotKnowledge = lazy(() => import('./page/Dashboard/Bot/BotKnowledge'));
const BuatInfografis = lazy(() => import('./page/Dashboard/Infografis/BuatInfografis'));
const HistoriInfografisPage = lazy(() => import('./page/Dashboard/Infografis/HistoriInfografisPage'));

// Global Axios interceptor to handle expired/invalid session tokens (401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or invalid token. Redirecting to login...");
      userStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

function ProtectedRoute({ children }) {
  const user = userStore((state) => state.user);
  return user ? children : <Navigate to="/login" replace />;
}

function AuthRoute({ children }) {
  const user = userStore((state) => state.user);
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function RouteLoading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#030D05',
      color: '#fff',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid rgba(255, 255, 255, 0.1)',
        borderTopColor: '#34B34A',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Memuat Halaman...</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const user = userStore((state) => state.user);

  React.useEffect(() => {
    // Clean up obsolete localStorage keys unused by this project
    const obsoleteKeys = [
      "documents-storage",
      "turnitin_auth_session",
      "react-resizable-panels:layout",
      "persist:root"
    ];
    obsoleteKeys.forEach((key) => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  return (
    <>
      <Shadow />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route 
            path='/' 
            element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path='/login' 
            element={
              <AuthRoute>
                <LogIn />
              </AuthRoute>
            } 
          />
          <Route 
            path='/signup' 
            element={
              <AuthRoute>
                <SignUp />
              </AuthRoute>
            } 
          />
          <Route 
            path='/dashboard' 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path='workspace/analisis' element={<Analisis />} />
            <Route path='workspace/histori' element={<HistoriWorkspace />} />
            <Route path='bot/sambungkanAkun' element={<SambungkanAkun />} />
            <Route path='bot/botKnowledge' element={<BotKnowledge />} />
            <Route path='infografis/histori' element={<HistoriInfografisPage />} />
            <Route path='infografis/buatInfografis' element={<BuatInfografis />} />
            <Route path='akun/tentangAkun' element={<TentangAkun />} />
            <Route path='akun/langgananDanBilling' element={<Billing />} />
          </Route>
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}