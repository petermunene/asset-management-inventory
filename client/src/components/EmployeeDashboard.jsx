import React, { useState, useEffect } from 'react';
import { 
  fetchUser,
  fetchAllUserAssets,
  fetchAllAssetRequests,
  createAssetRequest
} from '../api';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    myAssets: 0,
    activeRequests: 0,
    completedRequests: 0
  });
  const [assets, setAssets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRequestForm, setNewRequestForm] = useState({
    reason: '',
    urgency: 'medium',
    request_type: 'equipment'
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        setError(null);
        const username = localStorage.getItem('username');

        if (!username) {
          setError('No username found. Please log in again.');
          setLoading(false);
          return;
        }

        const currentUser = await fetchUser(username);
        setUser(currentUser);

        if (currentUser && currentUser.username) {
          // Fetch dashboard data in parallel for better performance
          const [userAssets, userRequests] = await Promise.all([
            fetchAllUserAssets().catch(err => {
              console.warn('Failed to fetch user assets:', err);
              return [];
            }),
            fetchAllAssetRequests().catch(err => {
              console.warn('Failed to fetch asset requests:', err);
              return [];
            })
          ]);

          const userAssetsFiltered = userAssets.filter(asset => asset.username === currentUser.username);
          const userRequestsFiltered = userRequests.filter(req => req.username === currentUser.username);

          // Calculate stats
          const myAssets = userAssetsFiltered.length;
          const activeRequests = userRequestsFiltered.filter(req => req.status === 'pending').length;
          const completedRequests = userRequestsFiltered.filter(req => req.status === 'completed').length;

          setStats({
            myAssets,
            activeRequests,
            completedRequests
          });

          // Transform assets data
          const transformedAssets = userAssetsFiltered.map((asset, index) => ({
            id: asset.id || `A${String(index + 1).padStart(3, '0')}`,
            category: asset.category || 'Unknown',
            name: asset.name || 'Unknown Asset',
            assignedDate: asset.assigned_date || new Date().toISOString().split('T')[0],
            condition: asset.condition || 'Good',
            status: asset.status || 'active',
            image_url: asset.image_url,
            serial_number: asset.serial_number
          }));
          setAssets(transformedAssets);
          setRequests(userRequestsFiltered);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleNewRequest = async (e) => {
    e.preventDefault();
    if (!newRequestForm.reason.trim()) {
      alert('Please provide a reason for your request.');
      return;
    }

    try {
      const newRequest = await createAssetRequest({
        ...newRequestForm,
        username: user.username,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      setRequests(prev => [newRequest, ...prev]);
      setNewRequestForm({ reason: '', urgency: 'medium', request_type: 'equipment' });

      // Update stats
      setStats(prev => ({ ...prev, activeRequests: prev.activeRequests + 1 }));

      // Show success message
      alert('Request submitted successfully!');
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  const renderDashboard = () => (
    <div className="main-content">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Employee Dashboard</h1>
          <p className="dashboard-subtitle">
            {user ? `Welcome back, ${user.username}` : 'Manage your assets and requests'}
          </p>
        </div>
      </div>

      {error ? (
        <div className="error-message" style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #fecaca'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>⚠️ Error Loading Data</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f615', color: '#3b82f6' }}>💼</div>
            <div className="stat-info">
              <h3 className="stat-title">My Assets</h3>
              <div className="stat-value">{loading ? '...' : stats.myAssets}</div>
              <p className="stat-subtitle">Currently assigned</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b15', color: '#f59e0b' }}>📝</div>
            <div className="stat-info">
              <h3 className="stat-title">Active Requests</h3>
              <div className="stat-value">{loading ? '...' : stats.activeRequests}</div>
              <p className="stat-subtitle">Pending approval</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#10b98115', color: '#10b981' }}>✅</div>
            <div className="stat-info">
              <h3 className="stat-title">Completed Requests</h3>
              <div className="stat-value">{loading ? '...' : stats.completedRequests}</div>
              <p className="stat-subtitle">This month</p>
            </div>
          </div>
        </div>
      )}

      {!error && (
        <div className="recent-activity">
          <h2>Recent Assets</h2>
          <div className="assets-preview">
            {loading ? (
              <div className="loading-preview">
                <p>Loading assets...</p>
              </div>
            ) : assets.length > 0 ? (
              assets.slice(0, 3).map(asset => (
                <div key={asset.id} className="asset-preview-card">
                  <div className="asset-preview-info">
                    <h4>{asset.name}</h4>
                    <p>{asset.category}</p>
                    <span className={`condition-badge ${asset.status === 'active' ? 'good' : 'fair'}`}>
                      {asset.condition}
                    </span>
                    {asset.serial_number && (
                      <small style={{ display: 'block', color: '#64748b', marginTop: '4px' }}>
                        SN: {asset.serial_number}
                      </small>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-preview">
                <p>No assets assigned yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderAssets = () => (
    <div className="main-content">
      <div className="page-header">
        <h1>My Assets</h1>
        <p>{assets.length} asset{assets.length !== 1 ? 's' : ''} currently assigned to you</p>
      </div>

      {assets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Assets Assigned</h3>
          <p>You don't have any assets assigned to you yet.</p>
        </div>
      ) : (
        <div className="assets-grid">
          {assets.map(asset => (
            <div key={asset.id} className="asset-card">
              <div className="asset-card-header">
                <h3>{asset.name}</h3>
                <span className="asset-id">#{asset.id}</span>
              </div>
              <div className="asset-card-body">
                <div className="asset-detail">
                  <span className="label">Category:</span>
                  <span>{asset.category}</span>
                </div>
                <div className="asset-detail">
                  <span className="label">Assigned:</span>
                  <span>{new Date(asset.assignedDate).toLocaleDateString()}</span>
                </div>
                <div className="asset-detail">
                  <span className="label">Condition:</span>
                  <span className={`condition-badge ${asset.status === 'active' ? 'good' : 'fair'}`}>
                    {asset.condition}
                  </span>
                </div>
                {asset.serial_number && (
                  <div className="asset-detail">
                    <span className="label">Serial:</span>
                    <span>{asset.serial_number}</span>
                  </div>
                )}
              </div>
              <div className="asset-card-footer">
                <button className="action-btn">Report Issue</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRequests = () => (
    <div className="main-content">
      <div className="page-header">
        <h1>My Requests</h1>
        <p>Track your asset requests and their status</p>
      </div>

      <div className="new-request-form">
        <h3>Create New Request</h3>
        <form onSubmit={handleNewRequest}>
          <div className="form-grid">
            <div className="form-group">
              <label>Reason *</label>
              <textarea
                value={newRequestForm.reason}
                onChange={(e) => setNewRequestForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Describe why you need this asset..."
                required
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Urgency</label>
              <select
                value={newRequestForm.urgency}
                onChange={(e) => setNewRequestForm(prev => ({ ...prev, urgency: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Request Type</label>
              <select
                value={newRequestForm.request_type}
                onChange={(e) => setNewRequestForm(prev => ({ ...prev, request_type: e.target.value }))}
              >
                <option value="equipment">Equipment</option>
                <option value="replacement">Replacement</option>
                <option value="upgrade">Upgrade</option>
              </select>
            </div>
          </div>
          <button type="submit" className="submit-btn">Submit Request</button>
        </form>
      </div>

      <div className="requests-list">
        <h3>Request History</h3>
        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Requests Yet</h3>
            <p>You haven't made any requests yet.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <span className={`status-badge ${request.status}`}>{request.status}</span>
                  <span className={`urgency-badge ${request.urgency}`}>{request.urgency}</span>
                </div>
                <div className="request-body">
                  <p>{request.reason}</p>
                  <div className="request-meta">
                    <span>Type: {request.request_type}</span>
                    {request.created_at && (
                      <span style={{ marginLeft: '12px' }}>
                        Created: {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="main-content">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account information</p>
      </div>

      {user && (
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">{user.username?.charAt(0).toUpperCase()}</div>
          </div>
          <div className="profile-info">
            <h2>{user.username}</h2>
            <p>{user.email}</p>
            <div className="profile-details">
              <div className="detail-item">
                <span className="label">Role:</span>
                <span>{user.role}</span>
              </div>
              <div className="detail-item">
                <span className="label">Company ID:</span>
                <span>{user.company_id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Department ID:</span>
                <span>{user.department_id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'assets': return renderAssets();
      case 'requests': return renderRequests();
      case 'profile': return renderProfile();
      default: return renderDashboard();
    }
  };

  return (
    <div className="employee-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">📋</span>
            <span className="logo-text">AssetFlow</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
          >
            <span className="nav-icon">💼</span>
            <span className="nav-text">My Assets</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <span className="nav-icon">📝</span>
            <span className="nav-text">Requests</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-text">Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <div className="user-name">{user?.username}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-container">
        {renderContent()}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
