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
  const [displayedText, setDisplayedText] = React.useState("");
  const fullText = "Looading";

  React.useEffect(() => {
    let index = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + fullText.charAt(index));
      index++;
      if (index >= fullText.length) {
        clearInterval(timer);
      }
    }, 60); // 60ms per character
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'radial-gradient(circle at center, #06190a 0%, #030d05 100%)',
      color: '#fff',
      gap: '24px',
      fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        zIndex: 2
      }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          fontWeight: '600',
          color: '#ffffffff',
          fontFamily: "Fira Code, Source Code Pro, Consolas, Monaco, 'Courier New', Courier, monospace",
        }}>
          {displayedText}
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '15px',
            marginLeft: '4px',
            backgroundColor: '#34B34A',
            verticalAlign: 'middle',
            animation: 'blinkCursor 0.8s step-end infinite',
            boxShadow: '0 0 6px #34B34A'
          }} />
        </p>
      </div>

      <style>{`
        @keyframes rotateCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rotateCCW {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pulseCore {
          0%, 100% { transform: scale(0.9); opacity: 0.8; box-shadow: 0 0 15px #34B34A, 0 0 30px rgba(52, 179, 74, 0.4); }
          50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 30px #34B34A, 0 0 60px rgba(52, 179, 74, 0.8); }
        }
        @keyframes scanLine {
          0%, 100% { transform: translateY(-25px); opacity: 0; }
          50% { opacity: 1; }
          60% { opacity: 1; }
          99% { transform: translateY(25px); opacity: 0; }
        }
        @keyframes shimmerText {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; text-shadow: 0 0 15px rgba(52, 179, 74, 0.8); }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(0.6); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes blinkCursor {
          from, to { opacity: 0; }
          50% { opacity: 1; }
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
      {/* <Shadow /> */}
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