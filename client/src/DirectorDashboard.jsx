import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './DirectorDashboard.css';
import {
  fetchAllCompanies,
  fetchAllCompanyAssets,
  fetchAllDepartmentAssets,
  fetchAllUserAssets,
  fetchAllUsers,
  fetchAllAssetRequests,
  createCompanyAsset,
  createAssetRequest
} from './api.js';

import AssetCreationForm from './components/AssetCreationForm';
import AssetManagement from './components/AssetManagement';
import DepartmentManagement from './components/DepartmentManagement';
import UserRequestsView from './components/UserRequestsView';

const DirectorDashboard = () => {
  const [stats, setStats] = useState({
    totalAssets: 0,
    assetsOut: 0,
    assetsIn: 0,
    managers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states for new components
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showAssetManagement, setShowAssetManagement] = useState(false);
  const [showDepartmentManagement, setShowDepartmentManagement] = useState(false);
  const [showUserRequests, setShowUserRequests] = useState(false);
  const location = useLocation();
  const companyId = location.state?.company_id 
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data needed for the dashboard
      const [
        companyAssets,
        departmentAssets,
        userAssets,
        users,
        assetRequests
      ] = await Promise.all([
        fetchAllCompanyAssets()
          .then(data => data.filter(asset => asset.company_id === companyId))
          .catch(() => []),
      
        fetchAllDepartmentAssets()
          .then(data => data.filter(asset => asset.company_id === companyId))
          .catch(() => []),
      
        fetchAllUserAssets()
          .then(data => data.filter(asset => asset.company_id === companyId))
          .catch(() => []),
      
        fetchAllUsers()
          .then(data => data.filter(user => user.company_id === companyId))
          .catch(() => []),
      
        fetchAllAssetRequests()
          .then(data => data.filter(request => request.company_id === companyId))
          .catch(() => [])
      ]);

      // Calculate statistics
      const totalAssets = (companyAssets?.length || 0) + (departmentAssets?.length || 0) + (userAssets?.length || 0);
      const assetsOut = (departmentAssets?.length || 0) + (userAssets?.length || 0);
      const assetsIn = companyAssets?.length || 0;
      const managers = users?.filter(user => user.role === 'manager')?.length || 0;

      setStats({
        totalAssets,
        assetsOut,
        assetsIn,
        managers
      });

      // Process recent activity from asset requests and user assets
      const recentActivities = [];

      if (assetRequests && assetRequests.length > 0) {
        assetRequests.slice(0, 3).forEach(request => {
          recentActivities.push({
            name: request.asset_name || 'Asset Request',
            id: `REQ#${request.id}`,
            action: request.status === 'approved' ? 'Approved' : 'Requested',
            date: formatDate(request.created_at),
            type: 'request'
          });
        });
      }

      if (userAssets && userAssets.length > 0) {
        userAssets.slice(0, 3 - recentActivities.length).forEach(asset => {
          recentActivities.push({
            name: asset.name || 'User Asset',
            id: `ASSET#${asset.id}`,
            action: `Assigned to user`,
            date: formatDate(asset.created_at),
            type: 'assignment'
          });
        });
      }

      // Fill remaining slots with sample data if needed
      while (recentActivities.length < 3) {
        recentActivities.push({
          name: 'Sample Asset',
          id: `SAMPLE#${recentActivities.length + 1}`,
          action: 'Sample action',
          date: 'Today',
          type: 'sample'
        });
      }

      setRecentActivity(recentActivities);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Backend server not available. Please start the Flask server on port 5000.');
      } else {
        setError(`Failed to load dashboard data: ${err.message || 'Unknown error'}`);
      }

      // Set default values if API fails
      setStats({
        totalAssets: 0,
        assetsOut: 0,
        assetsIn: 0,
        managers: 0
      });
      setRecentActivity([
        {
          name: 'Dell Laptop',
          id: 'ASSET#123654',
          action: 'Assigned to John',
          date: 'Today 01:41',
          type: 'assignment'
        },
        {
          name: 'HP Printer',
          id: 'ASSET#789012',
          action: 'Returned by Sarah',
          date: 'Today 12:30',
          type: 'return'
        },
        {
          name: 'Office Desk',
          id: 'ASSET#345678',
          action: 'Assigned to Emily',
          date: '2024-01-15',
          type: 'assignment'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      console.log('Testing connection to backend...');

      const response = await fetchAllCompanies();
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        alert('✅ Backend server is running and accessible!');
        loadDashboardData();
      } else {
        alert(`❌ Backend returned error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      alert(`❌ Cannot connect to backend server: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAsset = () => {
    setShowAssetForm(true);
  };

  const handleAssetCreated = (newAsset) => {
    console.log('Asset created successfully:', newAsset);
    loadDashboardData(); // Refresh data
  };

  const handleNewMovement = async () => {
    try {
      // Sample asset request creation
      const newRequest = {
        asset_name: 'Sample Movement Request',
        user_id: 1,
        department_id: 1,
        reason: 'Asset movement requested from dashboard'
      };

      await createAssetRequest(newRequest);
      alert('Movement request created successfully!');
      loadDashboardData(); // Refresh data
    } catch (err) {
      console.error('Error creating movement request:', err);
      if (err.message.includes('Failed to fetch')) {
        alert('Unable to connect to server. Please ensure the backend server is running on port 5000.');
      } else {
        alert(`Failed to create movement request: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className='page-wrapper'>
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Asset Manager</h1>
        <h2 className="dashboard-subtitle">Director Dashboard</h2>
        <p className="dashboard-description">Manage assets, oversee department allocations, and track asset movement</p>
        {error && (
          <div className="error-message">
            ⚠️ {error}
            {error.includes('Backend server not available') && (
              <div className="error-instructions">
                <p><strong>To start the backend server:</strong></p>
                <ol>
                  <li>Install Python dependencies: <code>pip install flask flask-sqlalchemy flask-restful flask-cors</code></li>
                  <li>Navigate to server directory: <code>cd server</code></li>
                  <li>Start the Flask server: <code>python app.py</code> or <code>flask run --port=5000</code></li>
                </ol>
                <button className="test-connection-btn" onClick={testConnection} disabled={loading}>
                  {loading ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{stats.totalAssets}</div>
          <div className="stat-label">Total Assets</div>
          <div className="stat-sublabel">In asset management</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.assetsOut}</div>
          <div className="stat-label">Assets Out</div>
          <div className="stat-sublabel">Currently allocated</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.assetsIn}</div>
          <div className="stat-label">Assets In</div>
          <div className="stat-sublabel">Available for allocation</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.managers}</div>
          <div className="stat-label">Managers</div>
          <div className="stat-sublabel">Department managers</div>
        </div>
      </div>

      <div className="main-sections">
        <div className="section-card">
          <div className="section-header">
            <div className="section-icon">📦</div>
            <div>
              <h3 className="section-title">Asset Management</h3>
              <p className="section-description">Add new assets and manage existing inventory</p>
            </div>
          </div>
          <div className="section-buttons">
            <button className="primary-button" onClick={handleAddNewAsset}>Create Asset</button>
            <button className="secondary-button" onClick={() => setShowAssetManagement(true)}>
              <span className="button-icon">📋</span>
              Manage & Filter Assets
            </button>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <div className="section-icon">🔄</div>
            <div>
              <h3 className="section-title">Asset Movement</h3>
              <p className="section-description">Track and control asset check in/check out</p>
            </div>
          </div>
          <div className="section-buttons">
            <button className="primary-button" onClick={handleNewMovement}>New Movement</button>
            <button className="secondary-button" onClick={() => loadDashboardData()}>
              <span className="button-icon">📊</span>
              Refresh Data
            </button>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <div className="section-icon">🏢</div>
            <div>
              <h3 className="section-title">Department Allocation</h3>
              <p className="section-description">Assign assets to department managers</p>
            </div>
          </div>
          <div className="section-buttons">
            <button className="primary-button" onClick={() => setShowDepartmentManagement(!showDepartmentManagement)}>Manage Departments</button>
            <button className="secondary-button" onClick={() => setShowUserRequests(true)}>
              <span className="button-icon">📋</span>
              View User Requests
            </button>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <div className="activity-header">
          <div className="activity-icon">⏱️</div>
          <div>
            <h3 className="activity-title">Recent Asset Activity</h3>
            <p className="activity-description">Latest asset movements and allocations</p>
          </div>
        </div>
        
        <div className="activity-list">
          {recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-details">
                <div className="activity-name">{activity.name}</div>
                <div className="activity-info">
                  <span className="activity-id">{activity.id}</span>
                  <span className="activity-date">{activity.action} • {activity.date}</span>
                </div>
              </div>
              <div className="activity-actions">
                <button className="activity-button edit" onClick={() => alert(`Edit ${activity.name}`)}>Edit</button>
                <button className="activity-button view" onClick={() => alert(`View ${activity.name}`)}>View</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Components */}
      {showAssetForm && (
        <AssetCreationForm
          onClose={() => setShowAssetForm(false)}
          onAssetCreated={handleAssetCreated}
        />
      )}

      {showAssetManagement && (
        <AssetManagement
          onClose={() => setShowAssetManagement(false)}
        />
      )}

      {showDepartmentManagement && (
        <DepartmentManagement
          companyId={companyId}
          onClose={() => setShowDepartmentManagement(!showDepartmentManagement)}
        />
      )}

      {showUserRequests && (
        <UserRequestsView
          onClose={() => setShowUserRequests(false)}
        />
      )}
    </div>
    </div>
  );
};

export default DirectorDashboard;
