import React, { useState } from 'react';
import axios from 'axios';
import './CreateModerator.css'; 

export default function CreateModerator() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  // These IDs MUST exactly match the link.id from your AdminSidebar allLinks array
  const availablePermissions = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users", label: "User Registry" },
    { id: "reg-approvals", label: "Registration Approvals" },
    { id: "interest-approvals", label: "Interest Approvals" },
    { id: "agents", label: "Agents Management" },
    { id: "vendors", label: "Vendors Management" },
    { id: "user-certificates", label: "User Acceptance" },
    { id: "add-data", label: "Add Data Fields" },
    { id: "vendor-leads", label: "Vendor Leads" },
    { id: "help-center", label: "Help Center" },
    { id: "data-approval", label: "Data Approval" },
    { id: "manage-pages", label: "Manage Pages" },
    { id: "testimonials", label: "Testimonials" }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (id) => {
    setSelectedPermissions((prev) => 
      prev.includes(id) 
        ? prev.filter(perm => perm !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === availablePermissions.length) {
      setSelectedPermissions([]); 
    } else {
      setSelectedPermissions(availablePermissions.map(p => p.id)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsLoading(true);

    if (selectedPermissions.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one permission.' });
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        'https://kalyanashobha-back.vercel.app/api/admin/create-moderator',
        {
          ...formData,
          permissions: selectedPermissions
        },
        {
          headers: { Authorization: token }
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Moderator profile successfully created.' });
        setFormData({ username: '', email: '', password: '' });
        setSelectedPermissions([]);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to create moderator.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kalyana-mod-wrapper">
      <div className="kalyana-mod-card">
        <div className="kalyana-mod-header">
          <h2>Create Moderator Access</h2>
          <p>Assign administrative roles and configure dashboard permissions.</p>
        </div>
        
        {message.text && (
          <div className={`kalyana-mod-alert kalyana-mod-alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="kalyana-mod-form">
          <div className="kalyana-mod-input-grid">
            <div className="kalyana-mod-form-group">
              <label htmlFor="username">Moderator Username</label>
              <input 
                id="username"
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g. JohnAdmin"
              />
            </div>

            <div className="kalyana-mod-form-group">
              <label htmlFor="email">Official Email</label>
              <input 
                id="email"
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
                placeholder="moderator@kalyanashobha.in"
              />
            </div>
          </div>

          <div className="kalyana-mod-form-group">
            <label htmlFor="password">Temporary Password</label>
            <input 
              id="password"
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              required 
              placeholder="Set a strong secure password"
            />
          </div>

          <div className="kalyana-mod-permissions-panel">
            <div className="kalyana-mod-permissions-header">
              <div className="kalyana-mod-perm-titles">
                <h3>Module Permissions</h3>
                <p>Select the areas this moderator can access.</p>
              </div>
              <button type="button" onClick={handleSelectAll} className="kalyana-mod-btn-outline">
                {selectedPermissions.length === availablePermissions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="kalyana-mod-permissions-grid">
              {availablePermissions.map((perm) => (
                <label key={perm.id} className={`kalyana-mod-checkbox-wrapper ${selectedPermissions.includes(perm.id) ? 'active' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => handleCheckboxChange(perm.id)}
                  />
                  <span className="kalyana-mod-checkbox-text">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="kalyana-mod-form-actions">
            <button type="submit" disabled={isLoading} className="kalyana-mod-btn-primary">
              {isLoading ? 'Provisioning Account...' : 'Create Moderator Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
