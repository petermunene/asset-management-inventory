import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  deleteAssetRequest,
  fetchAllDepartmentAssets, 
  fetchAllAssetRequests, 
  fetchAllUsers,
  updateAssetRequest,
  updateDepartment,
  createUserAsset,
  deleteUserAsset,
  fetchAllUserAssets,
  fetchAllDepartments
} from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Manager.css';

const menuItems = [
  { label: "Dashboard", tab: "dashboard" },
  { label: "Assets", tab: "assets" },
  { label: "Requests", tab: "requests" },
  { label: "Team", tab: "team" },
  { label: "Settings", tab: "settings" },
];

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h3>Something went wrong</h3>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assets, setAssets] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assignedAssets, setAssignedAssets] = useState([]);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const deptId = location.state?.deptId || localStorage.getItem('currentDeptId');

    if (!deptId) {
      console.error("No department ID provided");
      setError("No department selected");
      setLoading(false);
      return;
    }

    localStorage.setItem('currentDeptId', deptId);

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [assetsData, requestsData, usersData, departmentsData, assignedAssetsData] = await Promise.all([
          fetchAllDepartmentAssets(),
          fetchAllAssetRequests(),
          fetchAllUsers(),
          fetchAllDepartments(),
          fetchAllUserAssets()
        ]);

        if (!isMounted) return;

        // Create user map for efficient lookups
        const userMap = new Map(usersData.map(user => [user.id, user]));

        // Enrich requests with department info
        const enrichedRequests = requestsData.map(request => ({
          ...request,
          department_id: userMap.get(request.user_id)?.department_id,
          userName: userMap.get(request.user_id)?.username || 'Unknown'
        }));

        // Filter by department
        const departmentRequests = enrichedRequests.filter(
          req => req.department_id === deptId
        );

        setSelectedDepartmentId(deptId);
        setAssets(assetsData.filter(asset => asset.department_id === deptId));
        setAllRequests(departmentRequests);
        setApproved(departmentRequests.filter(req => req.status === 'approved'));
        setTeamMembers(usersData.filter(user => user.department_id === deptId));
        setDepartments(departmentsData);
        setAssignedAssets(assignedAssetsData);
        
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching data:', error);
          setError('Failed to load data. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.state?.deptId]);

  const handleRequestAction = async (requestId, action) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      setLoading(true);
      
      const response = await updateAssetRequest(requestId, { status: action });
      
      if (!response) {
        throw new Error(response.message || 'Request update failed');
      }

      // Refetch and reprocess data using the same logic as initial load
      const [ requestsData,assetsData, usersData] = await Promise.all([
        fetchAllAssetRequests(),
        fetchAllDepartmentAssets(),
        fetchAllUsers()
      ]);

      const userMap = new Map(usersData.map(user => [user.id, user]));
      const enrichedRequests = requestsData.map(request => ({
        ...request,
        department_id: userMap.get(request.user_id)?.department_id,
        userName: userMap.get(request.user_id)?.username || 'Unknown'
      }));

      const departmentRequests = enrichedRequests.filter(
        req => req.department_id === selectedDepartmentId
      );

      setAllRequests(departmentRequests);
      setAssets(assetsData.filter(asset => asset.department_id === selectedDepartmentId));
      
      if (action === 'approved') {
        setApproved(prev => [...prev, departmentRequests.find(req => req.id === requestId)]);
      }
    } catch (error) {
      console.error('Error updating request:', error);
      setError('Failed to update request');
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };


  const handleAssignAsset = async (assetId, userId) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      const assetToAssign = assets.find(a => a.id === assetId);
      const user = teamMembers.find(u => u.id === userId);
      
      if (!user) throw new Error("Selected user not found");
      
      const response = await createUserAsset({
        name: assetToAssign.name,
        category: assetToAssign.category,
        image_url: assetToAssign.image_url,
        user_id: userId,
        company_id: assetToAssign.company_id
      });

      if (!response) {
        throw new Error(response.message || 'Assignment failed');
      }

      // Update the assigned assets list
      const freshAssignedAssets = await fetchAllUserAssets();
      setAssignedAssets(freshAssignedAssets);
      
      // Update the assets list to reflect the assignment
      const freshAssets = await fetchAllDepartmentAssets();
      const updatedAssets = freshAssets.filter(a => a.department_id === selectedDepartmentId);
      setAssets(updatedAssets);
      
    } catch (err) {
      console.error("Error assigning asset:", err);
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnassignAsset = async (assetId) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      const assetToUnassign = assets.find(a => a.id === assetId);
      if (!assetToUnassign) throw new Error("Asset not found");
      
      // Find the assigned asset record
      const assignedAsset = assignedAssets.find(
        asset => asset.name === assetToUnassign.name 
      );

      if (!assignedAsset) {
        throw new Error("Assigned asset record not found");
      }

      const response = await deleteUserAsset(assignedAsset.id);

      // Update the assigned assets list
      const freshAssignedAssets = await fetchAllUserAssets();
      setAssignedAssets(freshAssignedAssets);
      
      // Update the assets list to reflect the unassignment
      const freshAssets = await fetchAllDepartmentAssets();
      const updatedAssets = freshAssets.filter(a => a.department_id === selectedDepartmentId);
      setAssets(updatedAssets);
      
    } catch (err) {
      console.error("Error unassigning asset:", err);
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentDeptId');
    localStorage.removeItem('appState');
    window.location.reload();
  };

  const handleMenuClick = (tab) => {
    setActiveTab(tab);
  };

  if (loading && !assets.length) {
    return (
      <div className="loading-screen">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading Manager Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="alert alert-danger">
          <h4>Error Loading Data</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`assetflow-app ${sidebarOpen ? "sidebar-open" : ""}`}>
        <button
          className="hamburger-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <rect y="6" width="30" height="3" rx="1.5" fill="#ffffff"/>
            <rect y="13.5" width="30" height="3" rx="1.5" fill="#ffffff"/>
            <rect y="21" width="30" height="3" rx="1.5" fill="#ffffff"/>
          </svg>
        </button>

        <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
          <nav className="sidebar-menu">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className={`sidebar-item ${activeTab === item.tab ? "active" : ""}`}
                onClick={() => handleMenuClick(item.tab)}
              >
                {item.label}
              </button>
            ))}
            <button className="sidebar-item" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </aside>

        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="main-content">
          <header className="manager-header">
            <h1>Manager Dashboard</h1>
            {selectedDepartmentId && (
              <div className="department-info">
                {departments.find(d => d.id === selectedDepartmentId)?.name || 'Department'}
              </div>
            )}
          </header>
          
          {activeTab === "dashboard" && (
            <DashboardView
              assets={assets}
              requests={allRequests.filter(req => req.status === 'pending')}
              teamMembers={teamMembers}
              approved={approved}
              assignedAssets={assignedAssets}
            />
          )}
          {activeTab === "assets" && (
            <AssetsView 
              assets={assets}
              teamMembers={teamMembers} 
              currentUser={currentUser}
              onAssign={handleAssignAsset}
              onUnassign={handleUnassignAsset}
              assignedAssets={assignedAssets}
            />
          )}
          {activeTab === "team" && <TeamView teamMembers={teamMembers} assets={assets} assignedAssets={assignedAssets} />}
          {activeTab === "requests" && (
            <RequestsView
              requests={allRequests}
              onRequestAction={handleRequestAction}
              isProcessing={isProcessing}
            />
          )}
          {activeTab === "settings" && <SettingsView 
            targetDepartmentId={selectedDepartmentId} 
            updateDepartment={updateDepartment}
          />}
        </main>
      </div>
    </ErrorBoundary>
  );
}

function DashboardView({ assets, requests, teamMembers, approved, assignedAssets }) {
  return (
    <div className="dashboard-view">
      <div className="page-header">
        <h2>Manager Dashboard</h2>
        <div className="subtitle">Welcome to the asset management system.</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{assets.length}</div>
          <div className="stat-label">Assets Managed</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{teamMembers.length}</div>
          <div className="stat-label">Team Members</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{requests.length}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{approved.length}</div>
          <div className="stat-label">Approved Requests</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="assets-section">
          <h3>Department Assets</h3>
          <div className="assets-list">
            {assets.length > 0 ? (
              <table className="assets-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(asset => {
                    const isAssigned = assignedAssets.some(a => a.name === asset.name);
                    const assignedTo = isAssigned 
                      ? teamMembers.find(m => m.id === asset.assigned_to)?.name || 'Unknown'
                      : 'Unassigned';
                    
                    return (
                      <tr key={asset.id}>
                        <td>{asset.name}</td>
                        <td>{assignedTo}</td>
                        <td>
                          {isAssigned ? (
                            <span className="badge bg-success">Assigned</span>
                          ) : (
                            <span className="badge bg-secondary">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="no-assets">
                <p>No assets found in your department</p>
              </div>
            )}
          </div>
        </div>

        <div className="team-section">
          <h3>Team Members</h3>
          <div className="team-members-list">
            {teamMembers.map(member => (
              <div key={member.id} className="team-member-card">
                <div className="member-info">
                  <h4>{member.username}</h4>
                  <p className="role">{member.role}</p>
                </div>
                <div className="member-assets">
                  <span>
                    {assignedAssets.filter(a => a.user_id === member.id).length} assets assigned
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="requests-section">
        <h3>Pending Requests</h3>
        <p>Review and approve asset requests from your team members</p>

        {requests.length > 0 ? (
          requests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <strong>{request.userName}</strong>
                <span className="request-date">
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="request-details">
                <div><strong>Type:</strong> {request.type}</div>
                <div><strong>Reason:</strong> {request.reason}</div>
                <div><strong>Item:</strong> {request.assetName}</div>
              </div>
              {request.priority === 'high' && (
                <div className="priority-badge">High Priority</div>
              )}
            </div>
          ))
        ) : (
          <div className="no-requests">
            <i className="bi bi-check-circle"></i>
            <p>No pending requests</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AssetsView({ assets, teamMembers, currentUser, onAssign, onUnassign, assignedAssets }) {
  const [assigningAsset, setAssigningAsset] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const getUserName = (userId) => {
    const user = teamMembers.find(u => u.id === userId);
    return user ? user.username : 'Unknown';
  };

  const isAssetAssigned = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return false;
    
    return assignedAssets.some(a => a.name === asset.name);
  };

  const getAssignedUserId = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return null;
    
    const assignedAsset = assignedAssets.find(a => a.name === asset.name);
    return assignedAsset ? assignedAsset.user_id : null;
  };

  return (
    <div className="assets-view">
      <div className="page-header">
        <h2>Department Assets</h2>
        <p>Assets allocated to your department</p>
      </div>

      <div className="table-container">
        <table className="assets-table">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => {
              const assigned = isAssetAssigned(asset.id);
              const assignedUserId = getAssignedUserId(asset.id);
              
              return (
                <tr key={asset.id}>
                  <td>{asset.id}</td>
                  <td>{asset.name}</td>
                  <td>{asset.category}</td>
                  <td>
                    {assigned ? getUserName(assignedUserId) : 'Unassigned'}
                  </td>
                  <td>
                    {assigned ? (
                      <span className="badge bg-success">Assigned</span>
                    ) : (
                      <span className="badge bg-secondary">Unassigned</span>
                    )}
                  </td>
                  <td>
                    {!assigned ? (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setAssigningAsset(asset.id)}
                      >
                        Assign
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => onUnassign(asset.id)}
                      >
                        Unassign
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {assigningAsset && (
        <div className="modal-backdrop">
          <div className="assignment-modal">
            <h3>Assign Asset</h3>
            <p>Assigning: {assets.find(a => a.id === assigningAsset)?.name}</p>
            
            <select
              className="form-control mb-3"
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
            >
              <option value="">Select a user</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.username} ({member.role})
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  onAssign(assigningAsset, selectedUserId);
                  setAssigningAsset(null);
                  setSelectedUserId(null);
                }}
                disabled={!selectedUserId}
              >
                Confirm Assignment
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setAssigningAsset(null);
                  setSelectedUserId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamView({ teamMembers, assets, assignedAssets }) {
  const getUserAssetCount = (userId) => {
    return assignedAssets.filter(asset => asset.user_id === userId).length;
  };

  const getUserAssets = (userId) => {
    return assignedAssets.filter(asset => asset.user_id === userId);
  };

  return (
    <div className="team-view">
      <div className="page-header">
        <h2>Team Members</h2>
        <p>Your department team</p>
      </div>

      <div className="team-section">
        {teamMembers.map(member => (
          <div key={member.id} className="team-card">
            <div className="member-info">
              <h4>{member.username}</h4>
              <p className="role">{member.role}</p>
              <p className="email">{member.email}</p>
            </div>
            <div className="member-assets">
              <h5>Assigned Assets ({getUserAssetCount(member.id)})</h5>
              {getUserAssets(member.id).length > 0 ? (
                <ul className="asset-list">
                  {getUserAssets(member.id).map(asset => (
                    <li key={asset.id}>
                      {asset.name} ({asset.category})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-assets">No assets assigned</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RequestsView({ requests, onRequestAction, isProcessing }) {
    const [otherRequests, setOtherRequests] = useState(requests.filter(req => req.status !== 'pending'));
    const [pendingRequests, setPendingRequests] = useState(requests.filter(req => req.status === 'pending'));
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
  
    // Update local state when props change
    useEffect(() => {
      setPendingRequests(requests.filter(req => req.status === 'pending'));
      setOtherRequests(requests.filter(req => req.status !== 'pending'));
    }, [requests]);
  
    const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this request?')) {
        return;
      }
  
      setDeletingId(id);
      setIsDeleting(true);
  
      try {
        await deleteAssetRequest(id);
        setOtherRequests(prev => prev.filter(request => request.id !== id));
      } catch (error) {
        console.error("Delete failed:", error);
        alert('Failed to delete request. Please try again.');
      } finally {
        setIsDeleting(false);
        setDeletingId(null);
      }
    };
  
    return (
      <div className="requests-view">
        <div className="page-header">
          <h2>Asset Requests</h2>
          <p>Manage asset requests from your team</p>
        </div>
  
        <div className="requests-section">
          <h3>Pending Requests</h3>
          {pendingRequests.length > 0 ? (
            <div className="request-list">
              {pendingRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h4>{request.userName}</h4>
                    <span className="request-date">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="request-details">
                    <p><strong>Asset:</strong> {request.assetName}</p>
                    <p><strong>Type:</strong> {request.type}</p>
                    <p><strong>Reason:</strong> {request.reason}</p>
                    {request.priority === 'high' && (
                      <span className="badge bg-danger">High Priority</span>
                    )}
                  </div>
                  <div className="request-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => onRequestAction(request.id, 'approved')}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => onRequestAction(request.id, 'rejected')}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-requests">
              <i className="bi bi-check-circle"></i>
              <p>No pending requests</p>
            </div>
          )}
        </div>
  
        <div className="requests-section">
          <h3>Processed Requests</h3>
          {otherRequests.length > 0 ? (
            <table className="request-history-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Asset</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {otherRequests.map(request => (
                  <tr key={request.id}>
                    <td>{request.userName}</td>
                    <td>{request.assetName}</td>
                    <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${request.status}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(request.id)}
                        disabled={isDeleting && deletingId === request.id}
                      >
                        {isDeleting && deletingId === request.id ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-requests">
              <p>No processed requests yet</p>
            </div>
          )}
        </div>
      </div>
    );
  }

function SettingsView({ targetDepartmentId, updateDepartment }) {
  const [departmentName, setDepartmentName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (targetDepartmentId) {
      setDepartmentName('Department ' + targetDepartmentId);
    }
  }, [targetDepartmentId]);

  const handleSave = async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      const response = await updateDepartment(targetDepartmentId, { name: departmentName });
      
      if (!response.success) {
        throw new Error(response.message || 'Update failed');
      }

      setSuccessMessage('Department updated successfully!');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating department:', error);
      setErrorMessage(error.message || 'Failed to update department');
      setSuccessMessage('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-view">
      <div className="page-header">
        <h2>Department Settings</h2>
        <p>Manage your department settings</p>
      </div>

      <div className="settings-form">
        <div className="form-group">
          <label>Department Name</label>
          <input
            type="text"
            className="form-control"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
          />
        </div>

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="alert alert-danger">{errorMessage}</div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!departmentName.trim() || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default App;