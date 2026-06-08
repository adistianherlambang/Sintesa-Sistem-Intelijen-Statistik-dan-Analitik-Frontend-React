import React from 'react';
import { Router, Routes, Route } from 'react-router-dom';
import TreeFlow from './components/TreeFlow';
import dummyData from './data/dummy.json';

//page
import LandingPage from './page/LandingPage/LandingPage';

//dashboard
import Overview from './page/Dashboard/Overview/Overview';
import Analisis from './page/Dashboard/Workspace/Analisis';
import HistoriWorkspace from './page/Dashboard/Workspace/HistoriWorkspace';
import TentangAkun from './page/Dashboard/Akun/TentangAkun';
import Billing from './page/Dashboard/Akun/Billing';

//component
import Shadow from './components/Floating/Shadow';
import Dashboard from './page/Dashboard/Dashboard';

export default function App() {

  return (
    <>
      <Shadow />
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/dashboard' element={<Dashboard />}>
          <Route index element={<Overview />} />
          <Route path='workspace/analisis' element={<Analisis />} />
          <Route path='workspace/histori' element={<HistoriWorkspace />} />
          <Route path='akun/tentangakun' element={<TentangAkun />} />
          <Route path='akun/langgananDanBilling' element={<Billing />} />
        </Route>
      </Routes>
    </>
  );
}