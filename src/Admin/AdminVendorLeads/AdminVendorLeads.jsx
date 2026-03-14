import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import "./AdminVendorLeads.css";

export default function AdminVendorLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- UPDATED: Search, Status Filter, and Pagination States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // "All", "New", "Contacted", etc.
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  useEffect(() => {
    fetchLeads();
  }, []);

  // Reset to page 1 whenever the search term or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("adminToken"); 
      const config = { headers: { Authorization: token } };

      const timestamp = new Date().getTime();
      const res = await axios.get(`https://kalyanashobha-back.vercel.app/api/admin/vendor-leads?t=${timestamp}`, config);

      if (res.data.success) {
        setLeads(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching vendor leads", err);
      const backendError = err.response?.data?.message || "Failed to load leads. Please try again.";
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const config = { headers: { Authorization: token } };
      
      setLeads(prevLeads => prevLeads.map(lead => 
        lead._id === leadId ? { ...lead, status: newStatus } : lead
      ));

      const res = await axios.put(
        `https://kalyanashobha-back.vercel.app/api/admin/vendor-leads/${leadId}/status`, 
        { status: newStatus }, 
        config
      );

      if (res.data.success) {
        window.dispatchEvent(new Event("vendorLeadUpdated"));
      }
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update lead status.");
      fetchLeads(); 
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // --- UPDATED: Filter Logic (Search + Status) ---
  let processedLeads = leads.filter((lead) => {
    // 1. Text Search Filter
    const searchLower = searchTerm.toLowerCase();
    const clientName = lead.name?.toLowerCase() || "";
    const clientPhone = lead.phone?.toLowerCase() || "";
    const vendorName = lead.vendorId?.businessName?.toLowerCase() || "";
    const vendorID = lead.vendorId?.vendorId?.toLowerCase() || "";
    
    const matchesSearch = clientName.includes(searchLower) ||
                          clientPhone.includes(searchLower) ||
                          vendorName.includes(searchLower) ||
                          vendorID.includes(searchLower);

    // 2. Status Dropdown Filter
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Always sort by newest first by default
  processedLeads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // --- Pagination Logic ---
  const totalPages = Math.ceil(processedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLeads = processedLeads.slice(startIndex, startIndex + itemsPerPage);

  const SkeletonRow = () => (
    <tr className="v-skeleton-row">
      <td><div className="v-skel-box v-skel-date"></div></td>
      <td>
        <div className="v-skel-box v-skel-title"></div>
        <div className="v-skel-box v-skel-text"></div>
      </td>
      <td>
        <div className="v-skel-box v-skel-badge"></div>
        <div className="v-skel-box v-skel-title"></div>
        <div className="v-skel-box v-skel-text short"></div>
      </td>
      <td>
        <div className="v-skel-box v-skel-desc"></div>
        <div className="v-skel-box v-skel-desc half"></div>
      </td>
      <td><div className="v-skel-box v-skel-status"></div></td>
    </tr>
  );

  return (
    <div className="admin-leads-container">
      {/* Header */}
      <div className="admin-leads-header">
        <div>
          <h2>Vendor Inquiries</h2>
          <p>Manage and route user requests to premium vendors.</p>
        </div>
        <div className="admin-leads-actions">
          <span className="lead-count-badge">
            {loading ? "..." : leads.length} Total Leads
          </span>
        </div>
      </div>

      {/* --- UPDATED: Search & Status Filter Toolbar --- */}
      <div className="admin-leads-toolbar" style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div className="search-box" style={{ flex: 1, minWidth: "250px", position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
          <input 
            type="text" 
            placeholder="Search by client, phone, or vendor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: "6px", border: "1px solid #ddd" }}
          />
        </div>
        
        <div className="filter-box" style={{ position: "relative", minWidth: "160px" }}>
          <Filter size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#666", pointerEvents: "none" }} />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "100%", padding: "10px 30px", borderRadius: "6px", border: "1px solid #ddd", backgroundColor: "white", cursor: "pointer", appearance: "none" }}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Forwarded">Forwarded</option>
            <option value="Closed">Closed</option>
          </select>
          {/* Custom dropdown arrow to match styling */}
          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "12px", color: "#888" }}>▼</div>
        </div>
      </div>

      {error && <div className="admin-error-banner">Error: {error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-leads-table">
          <thead>
            <tr>
              <th width="12%">Date</th>
              <th width="22%">Client Details</th>
              <th width="25%">Requested Vendor</th>
              <th width="31%">Requirements</th>
              <th width="10%">Status Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, index) => <SkeletonRow key={index} />)
            ) : currentLeads.length === 0 ? (
              <tr>
                <td colSpan="5" className="admin-empty-state" style={{ textAlign: "center", padding: "40px" }}>
                  {searchTerm || statusFilter !== "All" ? "No leads match your current filters." : "No vendor inquiries found yet."}
                </td>
              </tr>
            ) : (
              currentLeads.map((lead) => (
                <tr key={lead._id}>
                  <td className="lead-date">{formatDate(lead.createdAt)}</td>
                  
                  <td className="lead-client">
                    <strong>{lead.name}</strong>
                    <span>{lead.phone}</span>
                    {lead.email && <span>{lead.email}</span>}
                  </td>
                  
                  <td className="lead-vendor">
                    <span className="vendor-custom-id">
                      {lead.vendorId?.vendorId || "N/A"}
                    </span>
                    <strong>{lead.vendorId?.businessName || "Unknown Vendor"}</strong>
                    <span className="vendor-category">{lead.vendorId?.category || "Service"}</span>
                    {lead.vendorId?.contactNumber && (
                       <span className="vendor-contact">Ph: {lead.vendorId.contactNumber}</span>
                    )}
                  </td>
                  
                  <td className="lead-message">
                    <p>{lead.message}</p>
                    <div className="lead-meta">
                      {lead.weddingDate && <span>Event Date: {lead.weddingDate}</span>}
                      {lead.guestCount && <span>Guests: {lead.guestCount}</span>}
                    </div>
                  </td>
                  
                  <td className="lead-status-cell">
                    <select 
                      value={lead.status} 
                      onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                      className={`status-badge status-${lead.status.toLowerCase()}`}
                      style={{ cursor: "pointer", border: "none", outline: "none", appearance: "none", paddingRight: "15px", fontWeight: "bold" }}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Forwarded">Forwarded</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="admin-pagination" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", padding: "10px 0" }}>
          <span style={{ fontSize: "14px", color: "#666" }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, processedLeads.length)} of {processedLeads.length} entries
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ display: "flex", alignItems: "center", padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: currentPage === 1 ? "#f5f5f5" : "white", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ display: "flex", alignItems: "center", padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: currentPage === totalPages ? "#f5f5f5" : "white", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
