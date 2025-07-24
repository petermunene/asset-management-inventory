import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmployeeDashboard from './components/EmployeeDashboard';
import HomePage from './components/HomePage'  ;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<EmployeeDashboard />} />
        <Route path="/homepage" element={<HomePage />} />
      </Routes>
    </Router>
);
}
export default App;

