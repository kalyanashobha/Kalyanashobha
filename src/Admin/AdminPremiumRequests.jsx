import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// --- ICONS ---
const Icons = {
  Crown: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="2 15 7 10 12 16 17 10 22 15 22 20 2 20 2 15"></polygon><line x1="2" y1="20" x2="22" y2="20"></line></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Phone: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  ChevronLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
};

const AdminPremiumRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const API_URL = "https://kalyanashobha-back.vercel.app/api/admin";
    const token = localStorage.getItem('adminToken'); 

    useEffect(() => {
        fetchRequests();
    }, []);

    // Reset pagination when search or tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/premium-requests`, {
                headers: { 'Authorization': token }
            });
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
            } else {
                toast.error(data.message || "Failed to fetch requests.");
            }
        } catch (error) {
            toast.error("Network error fetching requests.");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        setProcessingId(id);
        try {
            const res = await fetch(`${API_URL}/premium-requests/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            const data = await res.json();
            
            if (data.success) {
                toast.success(`Request marked as ${newStatus}`);
                setRequests(prev => prev.map(req => 
                    req._id === id ? { ...req, status: newStatus } : req
                ));
                window.dispatchEvent(new Event('premiumUpdated'));
            } else {
                toast.error(data.message || "Failed to update status.");
            }
        } catch (error) {
            toast.error("Network error while updating.");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (activeTab !== 'All' && req.status !== activeTab) return false;
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const fullName = `${req.userId?.firstName || ''} ${req.userId?.lastName || ''}`.toLowerCase();
            const email = (req.userId?.email || '').toLowerCase();
            const phone = (req.userId?.mobileNumber || '').toLowerCase();
            const uniqueId = (req.userId?.uniqueId || '').toLowerCase();

            if (!fullName.includes(term) && !email.includes(term) && !phone.includes(term) && !uniqueId.includes(term)) {
                return false;
            }
        }
        return true;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    const StatusBadge = ({ status }) => {
        let style = {};
        let Icon = null;

        switch(status) {
            case 'Pending':
                style = { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
                Icon = Icons.Clock;
                break;
            case 'Contacted':
                style = { bg: '#e0f2fe', text: '#1e40af', border: '#bfdbfe' };
                Icon = Icons.Phone;
                break;
            case 'Resolved':
                style = { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' };
                Icon = Icons.Check;
                break;
            default:
                style = { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
        }

        return (
            <span className="admin-status-badge" style={{
                backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}`
            }}>
                {Icon && <span className="admin-badge-icon"><Icon /></span>}
                {status}
            </span>
        );
    };

    return (
        <div className="admin-layout-container" id="premium-requests-root">
            <Toaster position="top-right" />
            
            {/* INTERNAL CSS */}
            <style>{`
                .admin-layout-container {
                    padding: 24px !important;
                    max-width: 1400px !important;
                    margin: 0 auto !important;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
                    color: #334155 !important;
                    box-sizing: border-box !important;
                    background-color: #ffffff !important; /* Added pure white background */
                }

                /* Header Styles */
                .admin-header {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 20px !important;
                    margin-bottom: 24px !important;
                }
                .admin-header-title-group {
                    display: flex !important;
                    align-items: center !important;
                    gap: 16px !important;
                }
                .admin-header-text h2 {
                    margin: 0 0 4px 0 !important;
                    font-size: 1.5rem !important;
                    color: #0f172a !important;
                }
                .admin-header-text p {
                    margin: 0 !important;
                    color: #64748b !important;
                    font-size: 0.95rem !important;
                }

                /* Controls (Search & Tabs) */
                .admin-controls-group {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 16px !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                }
                .admin-search-group {
                    position: relative !important;
                    display: flex !important;
                    align-items: center !important;
                    flex: 1 !important;
                    min-width: 250px !important;
                    max-width: 400px !important;
                }
                .admin-search-group svg {
                    position: absolute !important;
                    left: 12px !important;
                    color: #94a3b8 !important;
                }
                .admin-search-input {
                    width: 100% !important;
                    padding: 10px 12px 10px 36px !important;
                    border: 1px solid #cbd5e1 !important;
                    border-radius: 8px !important;
                    outline: none !important;
                    font-size: 0.95rem !important;
                    transition: border-color 0.2s !important;
                    box-sizing: border-box !important;
                }
                .admin-search-input:focus {
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                }

                /* TABS SCROLLING */
                .admin-tabs-wrapper {
                    display: flex !important;
                    background: #f1f5f9 !important;
                    padding: 4px !important;
                    border-radius: 8px !important;
                    gap: 4px !important;
                    overflow-x: auto !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                    -webkit-overflow-scrolling: touch !important;
                }
                
                /* Hide scrollbar for cleaner UI */
                .admin-tabs-wrapper::-webkit-scrollbar {
                    display: none !important;
                }
                
                .admin-tab-button {
                    flex-shrink: 0 !important;
                    background: transparent !important;
                    border: none !important;
                    padding: 8px 16px !important;
                    border-radius: 6px !important;
                    font-size: 0.9rem !important;
                    font-weight: 500 !important;
                    color: #64748b !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    white-space: nowrap !important;
                    transition: all 0.2s !important;
                }
                .admin-tab-button.active {
                    background: #ffffff !important;
                    color: #0f172a !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
                }
                .admin-tab-count {
                    background: #e2e8f0 !important;
                    padding: 2px 6px !important;
                    border-radius: 12px !important;
                    font-size: 0.75rem !important;
                }
                .admin-tab-button.active .admin-tab-count {
                    background: #dbeafe !important;
                    color: #1e40af !important;
                }

                /* Table Styles */
                .admin-data-card {
                    background: #ffffff !important;
                    border: 1px solid #e2e8f0 !important;
                    border-radius: 12px !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
                    overflow: hidden !important;
                }
                .admin-table-wrapper {
                    width: 100% !important;
                    overflow-x: auto !important;
                }
                .admin-data-table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    text-align: left !important;
                }
                .admin-data-table th {
                    background: #f8fafc !important;
                    padding: 16px !important;
                    font-size: 0.85rem !important;
                    text-transform: uppercase !important;
                    color: #64748b !important;
                    font-weight: 600 !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                }
                .admin-data-table td {
                    padding: 16px !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    vertical-align: middle !important;
                }
                .admin-data-table tr:last-child td {
                    border-bottom: none !important;
                }
                .admin-data-table tr:hover td {
                    background: #f8fafc !important;
                }
                .admin-info-stack {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 4px !important;
                }
                .admin-text-muted {
                    font-size: 0.85rem !important;
                    color: #64748b !important;
                }
                .admin-text-small {
                    font-size: 0.9rem !important;
                }
                .admin-text-right {
                    text-align: right !important;
                }

                /* Badges & Buttons */
                .admin-status-badge {
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    padding: 4px 10px !important;
                    border-radius: 20px !important;
                    font-size: 0.8rem !important;
                    font-weight: 600 !important;
                }
                .admin-badge-icon {
                    display: flex !important;
                }
                .admin-action-group {
                    display: flex !important;
                    justify-content: flex-end !important;
                    gap: 8px !important;
                }
                .admin-btn {
                    padding: 8px 16px !important;
                    border-radius: 6px !important;
                    font-size: 0.85rem !important;
                    font-weight: 500 !important;
                    cursor: pointer !important;
                    border: none !important;
                    transition: background 0.2s !important;
                }
                .admin-btn:disabled {
                    opacity: 0.6 !important;
                    cursor: not-allowed !important;
                }
                .admin-btn-primary {
                    background: #eff6ff !important;
                    color: #2563eb !important;
                }
                .admin-btn-primary:hover:not(:disabled) { background: #dbeafe !important; }
                .admin-btn-success {
                    background: #f0fdf4 !important;
                    color: #16a34a !important;
                }
                .admin-btn-success:hover:not(:disabled) { background: #dcfce7 !important; }
                .admin-status-done {
                    color: #94a3b8 !important;
                    font-size: 0.9rem !important;
                    font-weight: 500 !important;
                    padding-right: 8px !important;
                }

                /* Pagination */
                .admin-pagination-bar {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    padding: 16px !important;
                    border-top: 1px solid #e2e8f0 !important;
                    background: #f8fafc !important;
                    flex-wrap: wrap !important;
                    gap: 16px !important;
                }
                .admin-pagination-text {
                    font-size: 0.9rem !important;
                    color: #64748b !important;
                }
                .admin-pagination-controls {
                    display: flex !important;
                    gap: 6px !important;
                }
                .admin-page-btn {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    min-width: 32px !important;
                    height: 32px !important;
                    border: 1px solid #e2e8f0 !important;
                    background: #ffffff !important;
                    border-radius: 6px !important;
                    color: #475569 !important;
                    font-size: 0.9rem !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                }
                .admin-page-btn:hover:not(:disabled) {
                    background: #f1f5f9 !important;
                    border-color: #cbd5e1 !important;
                }
                .admin-page-btn.active {
                    background: #3b82f6 !important;
                    color: #ffffff !important;
                    border-color: #3b82f6 !important;
                }
                .admin-page-btn:disabled {
                    opacity: 0.5 !important;
                    cursor: not-allowed !important;
                    background: #f8fafc !important;
                }

                /* Loading & Empty States */
                .admin-state-view {
                    padding: 48px 24px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    color: #64748b !important;
                    gap: 12px !important;
                }
                .admin-state-view.empty svg {
                    width: 48px !important;
                    height: 48px !important;
                    color: #cbd5e1 !important;
                }
                .admin-state-view h3 {
                    margin: 0 !important;
                    color: #1e293b !important;
                    font-size: 1.2rem !important;
                }
                .admin-spinner {
                    width: 24px !important;
                    height: 24px !important;
                    border: 3px solid #e2e8f0 !important;
                    border-top-color: #3b82f6 !important;
                    border-radius: 50% !important;
                    animation: spin 1s linear infinite !important;
                }
                @keyframes spin {
                    to { transform: rotate(360deg) !important; }
                }

                /* =========================================
                   RESPONSIVE DESIGN (Mobile Table to Cards)
                   ========================================= */
                @media (max-width: 850px) {
                    .admin-header, .admin-controls-group {
                        flex-direction: column !important;
                        align-items: stretch !important;
                    }
                    .admin-search-group {
                        max-width: 100% !important;
                    }
                    .admin-data-table thead {
                        display: none !important;
                    }
                    .admin-data-table, 
                    .admin-data-table tbody, 
                    .admin-data-table tr, 
                    .admin-data-table td {
                        display: block !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .admin-data-table tr {
                        margin-bottom: 16px !important;
                        border: 1px solid #e2e8f0 !important;
                        border-radius: 8px !important;
                        background: #fff !important;
                        padding: 8px 0 !important;
                    }
                    .admin-data-table td {
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        text-align: right !important;
                        padding: 12px 16px !important;
                        border-bottom: 1px solid #f1f5f9 !important;
                    }
                    .admin-data-table td::before {
                        content: attr(data-label) !important;
                        font-weight: 600 !important;
                        font-size: 0.85rem !important;
                        color: #64748b !important;
                        text-transform: uppercase !important;
                        text-align: left !important;
                        margin-right: 16px !important;
                    }
                    .admin-info-stack {
                        align-items: flex-end !important; 
                    }
                    .admin-action-group {
                        justify-content: flex-end !important;
                        width: 100% !important;
                    }
                    .admin-pagination-bar {
                        flex-direction: column !important;
                        gap: 12px !important;
                    }
                }
            `}</style>

            <div className="admin-header">
                <div className="admin-header-title-group">
                    <div className="admin-header-text">
                        <h2>Premium Upgrades</h2>
                        <p>Manage users requesting personalized premium assistance.</p>
                    </div>
                </div>

                <div className="admin-controls-group">
                    <div className="admin-search-group">
                        <Icons.Search />
                        <input 
                            id="premium-search-input"
                            className="admin-search-input"
                            type="text" 
                            placeholder="Search name, ID, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="admin-tabs-wrapper">
                        {['All', 'Pending', 'Contacted', 'Resolved'].map(tab => (
                            <button 
                                key={tab}
                                id={`filter-tab-${tab.toLowerCase()}`}
                                className={`admin-tab-button ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                                {tab !== 'All' && (
                                    <span className="admin-tab-count">
                                        {requests.filter(r => r.status === tab).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="admin-data-card" id="premium-data-view">
                {loading ? (
                    <div className="admin-state-view">
                        <span className="admin-spinner"></span>
                        Loading requests...
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="admin-state-view empty">
                        <Icons.Crown />
                        <h3>No requests found</h3>
                        <p>
                            {searchTerm 
                                ? `No results match "${searchTerm}" in the ${activeTab} tab.` 
                                : `There are currently no ${activeTab !== 'All' ? activeTab.toLowerCase() : ''} premium requests.`
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="admin-table-wrapper">
                            <table className="admin-data-table">
                                <thead>
                                    <tr>
                                        <th>User Details</th>
                                        <th>Contact Info</th>
                                        <th>Location</th>
                                        <th>Request Date</th>
                                        <th>Status</th>
                                        <th className="admin-text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((req) => (
                                        <tr key={req._id}>
                                            <td data-label="User Details">
                                                <div className="admin-info-stack">
                                                    <strong>{req.userId?.firstName} {req.userId?.lastName}</strong>
                                                    <span className="admin-text-muted">{req.userId?.uniqueId}</span>
                                                </div>
                                            </td>
                                            <td data-label="Contact Info">
                                                <div className="admin-info-stack">
                                                    <span>{req.userId?.mobileNumber}</span>
                                                    <span className="admin-text-muted">{req.userId?.email}</span>
                                                </div>
                                            </td>
                                            <td data-label="Location" className="admin-text-small">
                                                {req.userId?.city}, {req.userId?.state}
                                            </td>
                                            <td data-label="Request Date" className="admin-text-small">
                                                {formatDate(req.requestDate)}
                                            </td>
                                            <td data-label="Status">
                                                <StatusBadge status={req.status} />
                                            </td>
                                            <td data-label="Actions" className="admin-text-right">
                                                <div className="admin-action-group">
                                                    {req.status === 'Pending' && (
                                                        <button 
                                                            className="admin-btn admin-btn-primary"
                                                            onClick={() => updateStatus(req._id, 'Contacted')}
                                                            disabled={processingId === req._id}
                                                        >
                                                            {processingId === req._id ? 'Processing...' : 'Mark Contacted'}
                                                        </button>
                                                    )}
                                                    {req.status === 'Contacted' && (
                                                        <button 
                                                            className="admin-btn admin-btn-success"
                                                            onClick={() => updateStatus(req._id, 'Resolved')}
                                                            disabled={processingId === req._id}
                                                        >
                                                            {processingId === req._id ? 'Processing...' : 'Mark Resolved'}
                                                        </button>
                                                    )}
                                                    {req.status === 'Resolved' && (
                                                        <span className="admin-status-done">Done</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="admin-pagination-bar">
                                <span className="admin-pagination-text">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRequests.length)} of {filteredRequests.length}
                                </span>
                                <div className="admin-pagination-controls">
                                    <button 
                                        className="admin-page-btn" 
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <Icons.ChevronLeft />
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button 
                                            key={index + 1}
                                            className={`admin-page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                            onClick={() => handlePageChange(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}

                                    <button 
                                        className="admin-page-btn" 
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <Icons.ChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPremiumRequests;
