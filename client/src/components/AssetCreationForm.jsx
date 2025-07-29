import React, { useState, useEffect } from 'react';
import { createCompanyAsset, createDepartmentAsset, fetchAllDepartments } from '../api.js';
import './AssetCreationForm.css';

const AssetCreationForm = ({ onClose, onAssetCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    value: '',
    department_id: '',
    asset_type: 'company' // 'company' or 'department'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const departmentData = await fetchAllDepartments();
      setDepartments(departmentData || []);
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Failed to load departments');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const assetData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        value: parseFloat(formData.value) || 0,
        photo: selectedFile ? selectedFile.name : null
      };

      // In a real application, you would upload the file to a server here
      // For now, we'll just include the filename
      if (selectedFile) {
        console.log('Asset photo selected:', selectedFile.name, selectedFile.size);
      }

      let result;
      if (formData.asset_type === 'department' && formData.department_id) {
        assetData.department_id = parseInt(formData.department_id);
        result = await createDepartmentAsset(assetData);
      } else {
        result = await createCompanyAsset(assetData);
      }

      console.log('Asset created successfully:', result);
      onAssetCreated && onAssetCreated(result);
      onClose && onClose();
    } catch (err) {
      console.error('Error creating asset:', err);
      setError(`Failed to create asset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="asset-form-overlay">
      <div className="asset-form-container">
        <div className="asset-form-header">
          <h2 className="asset-form-title">Create New Asset</h2>
          <button className="asset-form-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="asset-form-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="asset-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="asset_type" className="form-label">Asset Type</label>
              <select
                id="asset_type"
                name="asset_type"
                value={formData.asset_type}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="company">Company Asset</option>
                <option value="department">Department Asset</option>
              </select>
            </div>

            {formData.asset_type === 'department' && (
              <div className="form-group">
                <label htmlFor="department_id" className="form-label">Department</label>
                <select
                  id="department_id"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Asset Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="Enter asset name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Vehicles">Vehicles</option>
                <option value="Office Equipment">Office Equipment</option>
                <option value="IT Hardware">IT Hardware</option>
                <option value="Software">Software</option>
                <option value="Other">Other</option>
              </select>
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
              placeholder="Enter asset description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="value" className="form-label">Value ($)</label>
              <input
                type="number"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="asset_photo" className="form-label">Asset Photo</label>
              <div className="photo-upload-container">
                {!selectedFile ? (
                  <label htmlFor="asset_photo" className="photo-upload-area">
                    <div className="upload-content">
                      <div className="upload-icon">📷</div>
                      <div className="upload-text">Click to upload photo</div>
                      <div className="upload-hint">JPG, PNG, GIF up to 5MB</div>
                    </div>
                    <input
                      type="file"
                      id="asset_photo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="photo-input"
                      hidden
                    />
                  </label>
                ) : (
                  <div className="photo-preview">
                    <img src={previewUrl} alt="Asset preview" className="preview-image" />
                    <div className="preview-info">
                      <span className="file-name">{selectedFile.name}</span>
                      <span className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="remove-photo-btn"
                      title="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Creating...' : 'Create Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetCreationForm;
