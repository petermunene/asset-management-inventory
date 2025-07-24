import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmployeeDashboard from './components/EmployeeDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<EmployeeDashboard />} />
      </Routes>
    </Router>
  );
}

export default App
