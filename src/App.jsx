import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { userStore } from './logic/state/store';

//page
import LandingPage from './page/LandingPage/LandingPage';
import LogIn from './page/LogInPage/LogIn';
import SignUp from './page/LogInPage/SignUp';

//dashboard
import Overview from './page/Dashboard/Overview/Overview';
import Analisis from './page/Dashboard/Workspace/Analisis';
import HistoriWorkspace from './page/Dashboard/Workspace/HistoriWorkspace';
import TentangAkun from './page/Dashboard/Akun/TentangAkun';
import Billing from './page/Dashboard/Akun/Billing';
import SambungkanAkun from './page/Dashboard/Bot/SambungkanAkun';
import BotKnowledge from './page/Dashboard/Bot/BotKnowledge';

//component
import Shadow from './components/Floating/Shadow';
import Dashboard from './page/Dashboard/Dashboard';

function ProtectedRoute({ children }) {
  const user = userStore((state) => state.user);
  return user ? children : <Navigate to="/login" replace />;
}

function AuthRoute({ children }) {
  const user = userStore((state) => state.user);
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  const user = userStore((state) => state.user);

  return (
    <>
      <Shadow />
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
          <Route path='akun/tentangAkun' element={<TentangAkun />} />
          <Route path='akun/langgananDanBilling' element={<Billing />} />
        </Route>
        <Route path='*' element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}