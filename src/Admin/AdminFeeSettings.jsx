import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Assuming you have a general admin CSS file, or you can reuse your existing classes
import './Login/AdminLogin.css'; 

const AdminFeeSettings = () => {
    // State management
    const [maleFee, setMaleFee] = useState(0);
    const [femaleFee, setFemaleFee] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Live Vercel backend URL for settings
    const API_BASE = "https://kalyanashobha-back.vercel.app/api/admin/settings/fees";

    // Fetch the current fees when the component loads
    useEffect(() => {
        fetchCurrentFees();
    }, []);

    const fetchCurrentFees = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(API_BASE, {
                headers: { Authorization: token }
            });
            
            if (res.data.success) {
                setMaleFee(res.data.data.maleRegistrationFee || 0);
                setFemaleFee(res.data.data.femaleRegistrationFee || 0);
            }
        } catch (err) {
            console.error("Error fetching fees:", err);
            setMessage({ type: 'error', text: 'Failed to load current fee settings.' });
        }
    };

    const handleUpdateFees = async (e) => {
        e.preventDefault();
        setIsLoading(true); 
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('adminToken');
            
            // Send the updated fees to the backend
            const res = await axios.post(API_BASE, { 
                maleFee: Number(maleFee), 
                femaleFee: Number(femaleFee) 
            }, {
                headers: { Authorization: token }
            });

            if (res.data.success) {
                setMessage({ type: 'success', text: 'Registration fees updated successfully!' });
                
                // Clear the success message after 3 seconds
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || "Failed to update fees." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>


            <div className="admin-login-container">
                <div className="login-card">
                    
                    <div className="login-header">
                        <h2>Fee Management</h2>
                        <p>Set global registration fees for users</p>
                    </div>

                    {message.text && (
                        <div className={`alert alert-${message.type}`} style={{ marginBottom: '15px', padding: '10px', borderRadius: '5px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleUpdateFees}>
                        <div className="form-group">
                            <label>Male Registration Fee (₹)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                placeholder="Enter amount" 
                                value={maleFee}
                                onChange={(e) => setMaleFee(e.target.value)} 
                                required 
                                min="0"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Female Registration Fee (₹)</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                placeholder="Enter amount" 
                                value={femaleFee}
                                onChange={(e) => setFemaleFee(e.target.value)} 
                                required 
                                min="0"
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </form>

                </div>
            </div>
        </>
    );
};

export default AdminFeeSettings;
