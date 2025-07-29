import React, { useState, useEffect } from 'react';
import { 
  fetchAllCompanyAssets, 
  fetchAllDepartmentAssets, 
  fetchAllDepartments,
  deleteCompanyAsset,
  deleteDepartmentAsset 
} from '../api.js';
import './AssetManagement.css';

const AssetManagement = ({ onClose }) => {
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    department: '',
    assetType: 'all' // 'all', 'company', 'department'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assets, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [companyAssets, departmentAssets, departmentData] = await Promise.all([
        fetchAllCompanyAssets().catch(() => []),
        fetchAllDepartmentAssets().catch(() => []),
        fetchAllDepartments().catch(() => [])
      ]);

      // Combine and mark asset types
      const allAssets = [
        ...(companyAssets || []).map(asset => ({ ...asset, asset_type: 'company' })),
        ...(departmentAssets || []).map(asset => ({ ...asset, asset_type: 'department' }))
      ];

      setAssets(allAssets);
      setDepartments(departmentData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load assets and departments');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assets];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name?.toLowerCase().includes(searchLower) ||
        asset.description?.toLowerCase().includes(searchLower) ||
        asset.category?.toLowerCase().includes(searchLower) ||
        asset.serial_number?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(asset => asset.category === filters.category);
    }

    // Asset type filter
    if (filters.assetType !== 'all') {
      filtered = filtered.filter(asset => asset.asset_type === filters.assetType);
    }

    // Department filter (only applies to department assets)
    if (filters.department) {
      filtered = filtered.filter(asset => 
        asset.asset_type === 'department' && 
        asset.department_id === parseInt(filters.department)
      );
    }

    setFilteredAssets(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleDeleteAsset = async (asset) => {
    if (!window.confirm(`Are you sure you want to delete "${asset.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      if (asset.asset_type === 'company') {
        await deleteCompanyAsset(asset.id);
      } else {
        await deleteDepartmentAsset(asset.id);
      }
      
      // Reload data after deletion
      await loadData();
    } catch (err) {
      console.error('Error deleting asset:', err);
      alert(`Failed to delete asset: ${err.message}`);
    }
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Unknown Department';
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(assets.map(asset => asset.category).filter(Boolean))];
    return categories.sort();
  };

  if (loading) {
    return (
      <div className="asset-management-overlay">
        <div className="asset-management-container">
          <div className="loading-state">Loading assets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-management-overlay">
      <div className="asset-management-container">
        <div className="asset-management-header">
          <h2 className="asset-management-title">Asset Management</h2>
          <button className="asset-management-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="asset-management-error">
            ⚠️ {error}
          </div>
        )}

        {/* Filters */}
        <div className="asset-filters">
          <div className="filter-row">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search assets..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="filter-input search-input"
              />
            </div>

            <div className="filter-group">
              <select
                value={filters.assetType}
                onChange={(e) => handleFilterChange('assetType', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Assets</option>
                <option value="company">Company Assets</option>
                <option value="department">Department Assets</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="filter-select"
                disabled={filters.assetType !== 'department' && filters.assetType !== 'all'}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Assets List */}
        <div className="assets-list">
          <div className="assets-stats">
            <span className="assets-count">
              {filteredAssets.length} of {assets.length} assets
            </span>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="no-assets">
              {assets.length === 0 ? 'No assets found' : 'No assets match your filters'}
            </div>
          ) : (
            <div className="assets-grid">
              {filteredAssets.map(asset => (
                <div key={`${asset.asset_type}-${asset.id}`} className="asset-card">
                  <div className="asset-header">
                    <h3 className="asset-name">{asset.name}</h3>
                    <span className={`asset-type-badge ${asset.asset_type}`}>
                      {asset.asset_type === 'company' ? 'Company' : 'Department'}
                    </span>
                  </div>
                  
                  <div className="asset-details">
                    {asset.description && (
                      <p className="asset-description">{asset.description}</p>
                    )}
                    
                    <div className="asset-info">
                      <div className="info-item">
                        <span className="info-label">Category:</span>
                        <span className="info-value">{asset.category || 'N/A'}</span>
                      </div>
                      
                      {asset.value && (
                        <div className="info-item">
                          <span className="info-label">Value:</span>
                          <span className="info-value">${asset.value}</span>
                        </div>
                      )}
                      
                      {asset.serial_number && (
                        <div className="info-item">
                          <span className="info-label">Serial:</span>
                          <span className="info-value">{asset.serial_number}</span>
                        </div>
                      )}
                      
                      {asset.asset_type === 'department' && asset.department_id && (
                        <div className="info-item">
                          <span className="info-label">Department:</span>
                          <span className="info-value">{getDepartmentName(asset.department_id)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="asset-actions">
                    <button 
                      className="asset-delete-btn"
                      onClick={() => handleDeleteAsset(asset)}
                      title="Delete Asset"
                    >
                      🗑️ Delete
                    </button>
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

export default AssetManagement;
