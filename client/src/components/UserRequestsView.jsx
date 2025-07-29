import React, { useState, useEffect } from 'react';
import { 
  fetchAllAssetRequests, 
  fetchAllUsers, 
  fetchAllDepartments 
} from '../api.js';
import './UserRequestsView.css';

const UserRequestsView = ({ onClose }) => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all', // 'all', 'pending', 'approved', 'rejected'
    department: '',
    sortBy: 'created_at', // 'created_at', 'asset_name', 'status'
    sortOrder: 'desc' // 'asc', 'desc'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [requestData, userData, departmentData] = await Promise.all([
        fetchAllAssetRequests().catch(() => []),
        fetchAllUsers().catch(() => []),
        fetchAllDepartments().catch(() => [])
      ]);

      setRequests(requestData || []);
      setUsers(userData || []);
      setDepartments(departmentData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load user requests');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(request => 
        request.asset_name?.toLowerCase().includes(searchLower) ||
        request.reason?.toLowerCase().includes(searchLower) ||
        getUserName(request.user_id)?.toLowerCase().includes(searchLower) ||
        getDepartmentName(request.department_id)?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(request => request.status === filters.status);
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(request => 
        request.department_id === parseInt(filters.department)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'asset_name':
          aValue = a.asset_name || '';
          bValue = b.asset_name || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredRequests(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name || user.username || `User #${userId}` : `User #${userId}`;
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : `Department #${departmentId}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
      default:
        return 'status-pending';
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

  const getRequestStats = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getRequestStats();

  if (loading) {
    return (
      <div className="user-requests-overlay">
        <div className="user-requests-container">
          <div className="loading-state">Loading user requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-requests-overlay">
      <div className="user-requests-container">
        <div className="user-requests-header">
          <div className="header-content">
            <h2 className="user-requests-title">User Requests</h2>
            <p className="user-requests-subtitle">
              View and monitor all asset requests from users (read-only)
            </p>
          </div>
          <button className="user-requests-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="user-requests-error">
            ⚠️ {error}
          </div>
        )}

        {/* Stats Summary */}
        <div className="requests-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Requests</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>

        {/* Filters */}
        <div className="requests-filters">
          <div className="filter-row">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search requests..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="filter-input search-input"
              />
            </div>

            <div className="filter-group">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="filter-select"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
                className="filter-select"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="asset_name-asc">Asset Name A-Z</option>
                <option value="asset_name-desc">Asset Name Z-A</option>
                <option value="status-asc">Status A-Z</option>
                <option value="status-desc">Status Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="requests-list">
          <div className="requests-count">
            <span>
              {filteredRequests.length} of {requests.length} requests
            </span>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="no-requests">
              {requests.length === 0 ? 'No user requests found' : 'No requests match your filters'}
            </div>
          ) : (
            <div className="requests-grid">
              {filteredRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="request-asset">
                      <h3 className="asset-name">{request.asset_name || 'Unnamed Asset'}</h3>
                      <span className="request-id">REQ #{request.id}</span>
                    </div>
                    <span className={`status-badge ${getStatusColor(request.status)}`}>
                      {request.status || 'pending'}
                    </span>
                  </div>
                  
                  <div className="request-details">
                    <div className="request-info">
                      <div className="info-row">
                        <span className="info-label">Requested by:</span>
                        <span className="info-value">{getUserName(request.user_id)}</span>
                      </div>
                      
                      <div className="info-row">
                        <span className="info-label">Department:</span>
                        <span className="info-value">{getDepartmentName(request.department_id)}</span>
                      </div>
                      
                      <div className="info-row">
                        <span className="info-label">Date:</span>
                        <span className="info-value">{formatDate(request.created_at)}</span>
                      </div>
                      
                      {request.reason && (
                        <div className="info-row reason-row">
                          <span className="info-label">Reason:</span>
                          <span className="info-value reason-text">{request.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="request-footer">
                    <div className="request-notice">
                      📋 This is a read-only view. Requests cannot be approved or rejected from here.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRequestsView;
