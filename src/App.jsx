import React from 'react';
import { Router, Routes, Route } from 'react-router-dom';
import TreeFlow from './components/TreeFlow';
import dummyData from './data/dummy.json';

//page
import LandingPage from './page/LandingPage/LandingPage';

//dashboard
import Overview from './page/Dashboard/Overview/Overview';

//component
import Shadow from './components/Floating/Shadow';
import Dashboard from './page/Dashboard/Dashboard';

export default function App() {

  return (
    <>
    <Shadow/>
    <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/dashboard' element={<Dashboard/>}>
        <Route index element={<Overview/>} />
      </Route>
    </Routes>
    </>
  );
}