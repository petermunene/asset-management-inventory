import React, { useState, useEffect } from 'react';
import { 
  fetchAllDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment 
} from '../api.js';
import './DepartmentManagement.css';

const DepartmentManagement = ({ onClose }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager_name: '',
    budget: ''
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const departmentData = await fetchAllDepartments();
      setDepartments(departmentData || []);
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      manager_name: '',
      budget: ''
    });
    setShowCreateForm(false);
    setEditingDepartment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const departmentData = {
        name: formData.name,
        description: formData.description,
        manager_name: formData.manager_name || null,
        budget: formData.budget ? parseFloat(formData.budget) : null
      };

      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, departmentData);
      } else {
        await createDepartment(departmentData);
      }

      resetForm();
      await loadDepartments();
    } catch (err) {
      console.error('Error saving department:', err);
      setError(`Failed to ${editingDepartment ? 'update' : 'create'} department: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name || '',
      description: department.description || '',
      manager_name: department.manager_name || '',
      budget: department.budget || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (department) => {
    if (!window.confirm(`Are you sure you want to delete the "${department.name}" department? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteDepartment(department.id);
      await loadDepartments();
    } catch (err) {
      console.error('Error deleting department:', err);
      setError(`Failed to delete department: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="department-management-overlay">
      <div className="department-management-container">
        <div className="department-management-header">
          <h2 className="department-management-title">Department Management</h2>
          <button className="department-management-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="department-management-error">
            ⚠️ {error}
          </div>
        )}

        <div className="department-actions">
          <button 
            className="create-department-btn"
            onClick={() => setShowCreateForm(true)}
            disabled={loading}
          >
            + Create New Department
          </button>
        </div>

        {showCreateForm && (
          <div className="department-form-container">
            <div className="department-form-header">
              <h3 className="department-form-title">
                {editingDepartment ? 'Edit Department' : 'Create New Department'}
              </h3>
              <button className="department-form-close" onClick={resetForm}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="department-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Department Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="Enter department name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="manager_name" className="form-label">Manager Name</label>
                  <input
                    type="text"
                    id="manager_name"
                    name="manager_name"
                    value={formData.manager_name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter manager name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="3"
                  placeholder="Enter department description"
                />
              </div>

              <div className="form-group">
                <label htmlFor="budget" className="form-label">Budget ($)</label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={resetForm}
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
                  {loading ? 'Saving...' : (editingDepartment ? 'Update Department' : 'Create Department')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="departments-list">
          {loading && !showCreateForm ? (
            <div className="loading-state">Loading departments...</div>
          ) : departments.length === 0 ? (
            <div className="no-departments">
              No departments found. Create your first department to get started.
            </div>
          ) : (
            <div className="departments-grid">
              {departments.map(department => (
                <div key={department.id} className="department-card">
                  <div className="department-header">
                    <h3 className="department-name">{department.name}</h3>
                    <div className="department-actions-menu">
                      <button 
                        className="department-edit-btn"
                        onClick={() => handleEdit(department)}
                        title="Edit Department"
                      >
                        ✏️
                      </button>
                      <button 
                        className="department-delete-btn"
                        onClick={() => handleDelete(department)}
                        title="Delete Department"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="department-details">
                    {department.description && (
                      <p className="department-description">{department.description}</p>
                    )}
                    
                    <div className="department-info">
                      <div className="info-item">
                        <span className="info-label">ID:</span>
                        <span className="info-value">#{department.id}</span>
                      </div>
                      
                      {department.manager_name && (
                        <div className="info-item">
                          <span className="info-label">Manager:</span>
                          <span className="info-value">{department.manager_name}</span>
                        </div>
                      )}
                      
                      <div className="info-item">
                        <span className="info-label">Budget:</span>
                        <span className="info-value">{formatCurrency(department.budget)}</span>
                      </div>
                      
                      {department.created_at && (
                        <div className="info-item">
                          <span className="info-label">Created:</span>
                          <span className="info-value">
                            {new Date(department.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
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
