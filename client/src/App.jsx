import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmployeeDashboard from './components/EmployeeDashboard';
import HomePage from './components/HomePage'  ;
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Login  />} />
        <Route path="/homepage" element={<Login />} />
      </Routes>
    </Router>
);
}
export default App;

