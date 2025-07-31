import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ManagerDashboard from './components/Manager';
import DirectorDashboard from './DirectorDashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SuperAdminDashboard from './components/SuperAdminDashBoard';
import EmployeeDashboard from './components/EmployeeDashboard';
import CompanySignup from './components/SignUp';
import HomePage from './components/HomePage'  ;
import Login from './components/Login';
import AdminDashboardPage from './components/AdminDashBoard';
import  './App.css';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<HomePage/>} />
        <Route path='/manager-dashboard' element={<ManagerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/company-signup" element={<CompanySignup />} />
        <Route path="/director-dashboard" element={<DirectorDashboard />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
      </Routes>
    </Router>
);

}
export default App;

