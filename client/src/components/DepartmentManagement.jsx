import React, { useState, useEffect } from 'react';
import { 
  fetchAllDepartments,
  fetchAllDepartmentAssets,
  createDepartmentAsset,
  updateDepartmentAsset,
  deleteDepartmentAsset,
  fetchAllCompanyAssets
} from '../api.js';
import './DepartmentManagement.css';

const DepartmentManagement = ({ companyId,onClose }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentAssets, setDepartmentAssets] = useState([]);
  const [companyAssets, setCompanyAssets] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showAssignmentView, setShowAssignmentView] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  
  const [assetFormData, setAssetFormData] = useState({
    name: '',
    category: '',
    image_url: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
      loadCompanyAssets();
    }
  }, [isOpen, companyId]);

  const handleClose = () => {
    onClose();
    resetState();
  };

  const resetState = () => {
    setSelectedDepartment(null);
    setDepartmentAssets([]);
    setShowEditForm(false);
    setEditingAsset(null);
    setShowAssignmentView(false);
    setAssetFormData({
      name: '',
      category: '',
      image_url: ''
    });
  };

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const departmentData = await fetchAllDepartments();
      const filteredDepartments = departmentData.filter(
        dept => dept.company_id === companyId
      );
      setDepartments(filteredDepartments || []);
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyAssets = async () => {
    try {
      setLoading(true);
      const assetData = await fetchAllCompanyAssets();
      const filteredAssets = assetData.filter(
        asset => asset.company_id === companyId
      );
      setCompanyAssets(filteredAssets || []);
    } catch (err) {
      console.error('Error loading company assets:', err);
      setError('Failed to load company assets');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentAssets = async (departmentId) => {
    try {
      setLoading(true);
      setError(null);
      const assetData = await fetchAllDepartmentAssets();
      const filteredAssets = assetData.filter(
        asset => asset.department_id === departmentId && asset.company_id === companyId
      );
      setDepartmentAssets(filteredAssets || []);
    } catch (err) {
      console.error('Error loading department assets:', err);
      setError('Failed to load department assets');
    } finally {
      setLoading(false);
    }
  };

  const handleAssetInputChange = (e) => {
    const { name, value } = e.target;
    setAssetFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateDepartmentAsset(editingAsset.id, assetFormData);
      setShowEditForm(false);
      await loadDepartmentAssets(selectedDepartment.id);
    } catch (err) {
      console.error('Error updating asset:', err);
      setError(`Failed to update asset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetFormData({
      name: asset.name || '',
      category: asset.category || '',
      image_url: asset.image_url || ''
    });
    setShowEditForm(true);
  };

  const handleDeleteAsset = async (asset) => {
    if (!window.confirm(`Delete "${asset.name}" asset? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteDepartmentAsset(asset.id);
      await loadDepartmentAssets(selectedDepartment.id);
    } catch (err) {
      console.error('Error deleting asset:', err);
      setError(`Failed to delete asset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAssets = async (department) => {
    setSelectedDepartment(department);
    await loadDepartmentAssets(department.id);
  };

  const handleBackToDepartments = () => {
    resetState();
    loadDepartments();
  };

  const handleAssignAsset = () => {
    setShowAssignmentView(true);
  };

  const handleAssignCompanyAsset = async (companyAsset) => {
    if (!window.confirm(`Assign "${companyAsset.name}" to ${selectedDepartment.name}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await createDepartmentAsset({
        name: companyAsset.name,
        category: companyAsset.category,
        image_url: companyAsset.image_url,
        company_id: companyId,
        department_id: selectedDepartment.id
      });
      
      await loadDepartmentAssets(selectedDepartment.id);
      setShowAssignmentView(false);
    } catch (err) {
      console.error('Error assigning asset:', err);
      setError(`Failed to assign asset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Render asset management view
  if (selectedDepartment) {
    return (
      <div className="department-management-overlay">
        <div className="department-management-container compact-view">
          <div className="department-management-header">
            <button 
              className="back-button"
              onClick={handleBackToDepartments}
            >
              &larr; Departments
            </button>
            <h2 className="department-management-title">
              {selectedDepartment.name} Assets
            </h2>
            <button className="department-management-close" onClick={handleClose}>×</button>
          </div>

          {error && (
            <div className="department-management-error">
              ⚠️ {error}
            </div>
          )}

          {!showAssignmentView && (
            <div className="asset-actions">
              <button 
                className="assign-asset-btn"
                onClick={handleAssignAsset}
                disabled={loading}
              >
                + Assign Asset
              </button>
            </div>
          )}

          {showAssignmentView ? (
            <div className="assignment-view">
              <div className="assignment-header">
                <button 
                  className="back-button"
                  onClick={() => setShowAssignmentView(false)}
                >
                  &larr; Back
                </button>
                <h3>Assign to {selectedDepartment.name}</h3>
              </div>
              
              <div className="company-assets-grid compact-grid">
                {companyAssets.map(asset => (
                  <div 
                    key={asset.id} 
                    className="company-asset-card compact-card"
                    onClick={() => handleAssignCompanyAsset(asset)}
                  >
                    {asset.image_url && (
                      <img 
                        src={asset.image_url} 
                        alt={asset.name} 
                        className="company-asset-image compact-image"
                      />
                    )}
                    <div className="company-asset-name">{asset.name}</div>
                    <div className="company-asset-category">{asset.category}</div>
                    <button
                      className="assign-button compact-button"
                      onClick={() => handleAssignCompanyAsset(asset)}
                      disabled={loading}
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : showEditForm ? (
            <div className="asset-edit-form compact-form">
              <div className="asset-form-header">
                <h3 className="asset-form-title">Edit Asset</h3>
                <button 
                  className="asset-form-close" 
                  onClick={() => setShowEditForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAssetSubmit} className="asset-form">
                <div className="form-group">
                  <label htmlFor="asset-name" className="form-label">Name</label>
                  <input
                    type="text"
                    id="asset-name"
                    name="name"
                    value={assetFormData.name}
                    onChange={handleAssetInputChange}
                    className="form-input compact-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="asset-category" className="form-label">Category</label>
                  <input
                    type="text"
                    id="asset-category"
                    name="category"
                    value={assetFormData.category}
                    onChange={handleAssetInputChange}
                    className="form-input compact-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="asset-image-url" className="form-label">Image URL</label>
                  <input
                    type="text"
                    id="asset-image-url"
                    name="image_url"
                    value={assetFormData.image_url}
                    onChange={handleAssetInputChange}
                    className="form-input compact-input"
                  />
                </div>

                <div className="form-actions compact-actions">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="form-button-cancel"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="form-button-submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="assets-list">
              {loading ? (
                <div className="loading-state">Loading assets...</div>
              ) : departmentAssets.length === 0 ? (
                <div className="no-assets">
                  No assets assigned to this department.
                </div>
              ) : (
                <div className="assets-grid compact-grid">
                  {departmentAssets.map(asset => (
                    <div key={asset.id} className="asset-card compact-card">
                      <div className="asset-header">
                        <h3 className="asset-name compact-name">{asset.name}</h3>
                        <div className="asset-actions-menu">
                          <button 
                            className="asset-edit-btn"
                            onClick={() => handleEditAsset(asset)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="asset-delete-btn"
                            onClick={() => handleDeleteAsset(asset)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      {asset.image_url && (
                        <img 
                          src={asset.image_url} 
                          alt={asset.name} 
                          className="asset-image compact-image"
                        />
                      )}
                      
                      <div className="asset-info compact-info">
                        <div className="info-item">
                          <span className="info-value">{asset.category || 'No category'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render department management view
  return (
    <div className="department-management-overlay">
      <div className="department-management-container compact-view">
        <div className="department-management-header">
          <h2 className="department-management-title">Departments</h2>
          <button className="department-management-close" onClick={handleClose}>×</button>
        </div>

        {error && (
          <div className="department-management-error">
            ⚠️ {error}
          </div>
        )}

        <div className="departments-list">
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : departments.length === 0 ? (
            <div className="no-departments">
              No departments found.
            </div>
          ) : (
            <div className="departments-grid compact-grid">
              {departments.map(department => (
                <div 
                  key={department.id} 
                  className="department-card compact-card"
                  onClick={() => handleViewAssets(department)}
                >
                  <div className="department-header">
                    <h3 className="department-name compact-name">{department.name}</h3>
                  </div>
                  
                  <div className="department-info compact-info">
                    <div className="info-item">
                      <span className="info-label">Manager:</span>
                      <span className="info-value">{department.manager_name || 'N/A'}</span>
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

export default DepartmentManagement;