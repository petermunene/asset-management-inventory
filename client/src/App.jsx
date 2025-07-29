import React from 'react';
import DirectorDashboard from './DirectorDashboard';
import './App.css'; // Make sure this imports the CSS I gave you

function App() {
  return (
    <div className="page-wrapper">
      <div className="dashboard-container">
        <DirectorDashboard />
      </div>
    </div>
  );
}

export default App;
