import React, { useState } from 'react';
import axios from 'axios';

export default function CreateModerator() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Available permissions matching link.id from AdminSidebar
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

  // Internal CSS for the component
  const styles = `
    .sys-mod-setup-wrapper {
      display: flex;
      justify-content: center;
      padding: 2rem 1rem;
      background-color: #f8fafc;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-sizing: border-box;
    }

    .sys-mod-setup-card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      width: 100%;
      max-width: 800px;
      padding: 2.5rem;
      border: 1px solid #e2e8f0;
    }

    .sys-mod-setup-header {
      margin-bottom: 2rem;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 1.5rem;
    }

    .sys-mod-setup-header h2 {
      margin: 0 0 0.5rem 0;
      color: #0f172a;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .sys-mod-setup-header p {
      margin: 0;
      color: #64748b;
      font-size: 0.95rem;
    }

    .sys-mod-setup-alert {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .sys-mod-setup-alert-success {
      background-color: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .sys-mod-setup-alert-error {
      background-color: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .sys-mod-setup-input-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .sys-mod-setup-form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1.5rem;
    }

    .sys-mod-setup-form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #334155;
      font-size: 0.9rem;
    }

    .sys-mod-setup-form-group input {
      padding: 0.75rem 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 1rem;
      color: #1e293b;
      transition: all 0.2s ease;
      outline: none;
    }

    .sys-mod-setup-form-group input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .sys-mod-setup-permissions-panel {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 2rem;
      margin-bottom: 2rem;
    }

    .sys-mod-setup-permissions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .sys-mod-setup-perm-titles h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      color: #0f172a;
    }

    .sys-mod-setup-perm-titles p {
      margin: 0;
      font-size: 0.85rem;
      color: #64748b;
    }

    .sys-mod-setup-permissions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .sys-mod-setup-checkbox-wrapper {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }

    .sys-mod-setup-checkbox-wrapper:hover {
      border-color: #94a3b8;
      background: #f1f5f9;
    }

    .sys-mod-setup-checkbox-wrapper.active {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .sys-mod-setup-checkbox-wrapper input {
      margin-right: 0.75rem;
      cursor: pointer;
      width: 16px;
      height: 16px;
      accent-color: #3b82f6;
    }

    .sys-mod-setup-checkbox-text {
      font-size: 0.9rem;
      color: #334155;
      font-weight: 500;
    }

    .sys-mod-setup-btn-outline {
      background: transparent;
      border: 1px solid #cbd5e1;
      color: #475569;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .sys-mod-setup-btn-outline:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .sys-mod-setup-form-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 1rem;
    }

    .sys-mod-setup-btn-primary {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .sys-mod-setup-btn-primary:hover {
      background: #1d4ed8;
    }

    .sys-mod-setup-btn-primary:disabled {
      background: #93c5fd;
      cursor: not-allowed;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .sys-mod-setup-input-grid {
        grid-template-columns: 1fr;
        gap: 0;
      }
      .sys-mod-setup-permissions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .sys-mod-setup-permissions-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      .sys-mod-setup-card {
        padding: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .sys-mod-setup-permissions-grid {
        grid-template-columns: 1fr;
      }
      .sys-mod-setup-form-actions {
        justify-content: center;
      }
      .sys-mod-setup-btn-primary {
        width: 100%;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="sys-mod-setup-wrapper">
        <div className="sys-mod-setup-card">
          <div className="sys-mod-setup-header">
            <h2>Create Moderator Access</h2>
            <p>Assign administrative roles and configure dashboard permissions.</p>
          </div>
          
          {message.text && (
            <div className={`sys-mod-setup-alert sys-mod-setup-alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="sys-mod-setup-form">
            <div className="sys-mod-setup-input-grid">
              <div className="sys-mod-setup-form-group">
                <label htmlFor="sys-username">Moderator Username</label>
                <input 
                  id="sys-username"
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. JohnAdmin"
                />
              </div>

              <div className="sys-mod-setup-form-group">
                <label htmlFor="sys-email">Official Email</label>
                <input 
                  id="sys-email"
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="moderator@kalyanashobha.in"
                />
              </div>
            </div>

            <div className="sys-mod-setup-form-group">
              <label htmlFor="sys-password">Temporary Password</label>
              <input 
                id="sys-password"
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleInputChange} 
                required 
                placeholder="Set a strong secure password"
              />
            </div>

            <div className="sys-mod-setup-permissions-panel">
              <div className="sys-mod-setup-permissions-header">
                <div className="sys-mod-setup-perm-titles">
                  <h3>Module Permissions</h3>
                  <p>Select the areas this moderator can access.</p>
                </div>
                <button type="button" onClick={handleSelectAll} className="sys-mod-setup-btn-outline">
                  {selectedPermissions.length === availablePermissions.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="sys-mod-setup-permissions-grid">
                {availablePermissions.map((perm) => (
                  <label key={perm.id} className={`sys-mod-setup-checkbox-wrapper ${selectedPermissions.includes(perm.id) ? 'active' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => handleCheckboxChange(perm.id)}
                    />
                    <span className="sys-mod-setup-checkbox-text">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sys-mod-setup-form-actions">
              <button type="submit" disabled={isLoading} className="sys-mod-setup-btn-primary">
                {isLoading ? 'Provisioning Account...' : 'Create Moderator Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
