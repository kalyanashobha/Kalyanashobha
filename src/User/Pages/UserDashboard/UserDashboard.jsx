import React, { useState, useEffect, useRef } from 'react';
import Navbar from "../../Components/Navbar.jsx"; 
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import SignatureCanvas from 'react-signature-canvas';
import Footer from '../../Components/Footer.jsx';
import './UserDashboard.css';

// --- STANDARD SVG ICONS (Professional & Scalable) ---
const Icons = {
  Female: () => <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%"><path d="M12 14C7.33 14 4 17.33 4 22H20C20 17.33 16.67 14 12 14Z" fill="#F59E0B" /><path d="M12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2Z" fill="#DC2626" /></svg>,
  Male: () => <svg viewBox="0 0 24 24" fill="#3B82F6" width="100%" height="100%"><path d="M12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2ZM12 14C7.33 14 4 17.33 4 22H20C20 17.33 16.67 14 12 14Z"/></svg>,
  Verify: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
  Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Filter: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>,
  ChevronDown: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  Diamond: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><path d="M6 3h12l4 6-10 13L2 9Z"></path><path d="M11 3 8 9l4 13 4-13-3-6"></path><path d="M2 9h20"></path></svg>,
  Info: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
  CheckCircle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  ArrowRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
};

// --- HELPER FUNCTION: Convert Canvas Data URL to File Object ---
const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

// --- CUSTOM TIME PICKER COMPONENT ---
const CustomTimePicker = ({ isOpen, onClose, onSet, initialTime }) => {
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [period, setPeriod] = useState('AM');

  useEffect(() => {
    if (isOpen && initialTime) {
      const match = initialTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        setHour(match[1]);
        setMinute(match[2]);
        setPeriod(match[3].toUpperCase());
      }
    }
  }, [isOpen, initialTime]);

  const handleSet = () => {
    if (hour && minute) {
      const formattedHour = hour.padStart(2, '0');
      const formattedMinute = minute.padStart(2, '0');
      onSet(`${formattedHour}:${formattedMinute} ${period}`);
    } else {
      onSet(''); 
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      width: '320px', backgroundColor: '#fff', padding: '0', borderRadius: '12px', overflow: 'hidden',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ backgroundColor: '#6366f1', color: 'white', padding: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>Set time</h3>
      </div>
      
      <div style={{ padding: '24px 20px' }}>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>Type in time</p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input 
              type="number" placeholder="12" min="1" max="12" value={hour}
              onChange={(e) => {
                let val = e.target.value;
                if (val.length > 2) val = val.slice(-2);
                if (parseInt(val) > 12) val = '12';
                setHour(val);
              }}
              style={{ width: '100%', fontSize: '1.5rem', textAlign: 'center', border: 'none', borderBottom: '2px solid #6366f1', padding: '8px 0', outline: 'none' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>hour</span>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', paddingBottom: '20px' }}>:</span>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input 
              type="number" placeholder="00" min="0" max="59" value={minute}
              onChange={(e) => {
                let val = e.target.value;
                if (val.length > 2) val = val.slice(-2);
                if (parseInt(val) > 59) val = '59';
                setMinute(val);
              }}
              style={{ width: '100%', fontSize: '1.5rem', textAlign: 'center', border: 'none', borderBottom: '2px solid #6366f1', padding: '8px 0', outline: 'none' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>minute</span>
          </div>
          <div style={{ flex: 1 }}>
            <select 
              value={period} onChange={(e) => setPeriod(e.target.value)}
              style={{ width: '100%', padding: '12px 8px', fontSize: '1rem', border: 'none', outline: 'none', background: 'transparent', appearance: 'none', cursor: 'pointer', textAlign: 'center' }}
            >
              <option value="AM">AM</option><option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px', gap: '16px' }}>
        <button type="button" onClick={() => { setHour(''); setMinute(''); setPeriod('AM'); }} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', cursor: 'pointer' }}>CLEAR</button>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', cursor: 'pointer' }}>CANCEL</button>
        <button type="button" onClick={handleSet} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', cursor: 'pointer' }}>SET</button>
      </div>
    </div>
  );
};

// --- SEARCHABLE COMBO INPUT ---
const DashboardComboInput = ({ label, name, value, onChange, options, required, onKeyDown }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filtered, setFiltered] = useState(options || []);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
  
    useEffect(() => { setFiltered(options || []); }, [options]);
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    const handleInputChange = (e) => {
      onChange(e); 
      setIsOpen(true);
      const val = e.target.value.toLowerCase();
      setFiltered((options || []).filter(opt => {
         const text = typeof opt === 'string' ? opt : opt.name;
         return text.toLowerCase().includes(val);
      }));
    };
  
    const handleSelect = (val) => {
      onChange({ target: { name, value: val } });
      setIsOpen(false);
      
      if (inputRef.current) {
        const form = inputRef.current.closest('form');
        if (form) {
          const focusableElements = Array.from(form.querySelectorAll('input, select, button[type="submit"]'));
          const index = focusableElements.indexOf(inputRef.current);
          if (index > -1 && index < focusableElements.length - 1) {
            focusableElements[index + 1].focus();
          }
        }
      }
    };
  
    return (
      <div className="ud-form-group" ref={wrapperRef} style={{ position: 'relative', zIndex: isOpen ? 100 : 1 }}>
        <label className="ud-label">{label} {required && <span className="ud-required">*</span>}</label>
        <div style={{ position: 'relative' }}>
          <input 
            ref={inputRef} type="text" name={name} value={value} onChange={handleInputChange} 
            onFocus={() => { setIsOpen(true); setFiltered(options || []); }} onKeyDown={onKeyDown}
            placeholder="Type or select..." className="ud-input" autoComplete="off" required={required}
          />
          <div style={{ position: 'absolute', right: '12px', top: '12px', cursor: 'pointer', color: '#64748b' }} onClick={() => setIsOpen(!isOpen)}>
            <Icons.ChevronDown />
          </div>
          {isOpen && filtered && filtered.length > 0 && (
            <ul className="ud-combo-dropdown">
              {filtered.map((opt, idx) => {
                const text = typeof opt === 'string' ? opt : opt.name;
                return <li key={idx} onClick={() => handleSelect(text)}>{text}</li>
              })}
            </ul>
          )}
        </div>
      </div>
    );
};

const DashboardSkeleton = () => (
  <div className="ud-grid">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="ud-skeleton-card">
        <div className="ud-sk-circle ud-sk-animate"></div>
        <div className="ud-sk-line ud-w-80 ud-sk-animate"></div>
        <div className="ud-sk-line ud-w-40 ud-sk-animate"></div>
        <div className="ud-sk-block ud-sk-animate"></div>
      </div>
    ))}
  </div>
);

const getUserFriendlyStatus = (status) => {
    switch (status) {
        case 'PendingAdminPhase1': return 'Request Under Admin Review';
        case 'PendingUser': return 'Awaiting Member Response';
        case 'PendingAdminPhase2': return 'Final Verification in Progress';
        case 'Accepted':
        case 'Finalized': return 'Connection Established';
        case 'Declined': return 'Interest Declined';
        case 'Rejected': return 'Request Not Approved';
        case 'PendingPaymentVerification': return 'Payment Verification in Progress';
        case 'PendingAdmin': return 'Awaiting Admin Approval';
        default: return 'Processing';
    }
};

const formatDisplayName = (fullName) => {
  if (!fullName) return "Unknown";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();

  const knownSurnames = ["adepu", "reddy", "sharma", "goud", "rao", "yadav", "patel", "singh", "kumar"];
  let surname = "";
  let givenName = "";
  const firstWord = parts[0].toLowerCase();
  const lastWord = parts[parts.length - 1].toLowerCase();

  if (knownSurnames.includes(firstWord)) {
      surname = parts[0]; givenName = parts.slice(1).join(" ");
  } else if (knownSurnames.includes(lastWord)) {
      surname = parts[parts.length - 1]; givenName = parts.slice(0, -1).join(" ");
  } else {
      surname = parts[parts.length - 1]; givenName = parts.slice(0, -1).join(" ");
  }

  const surnameInitial = surname.charAt(0).toUpperCase();
  const formattedGivenName = givenName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return `${surnameInitial}. ${formattedGivenName}`;
};

const UserDashboard = () => {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [regPaymentStatus, setRegPaymentStatus] = useState(null);
  
  // --- Premium Request States ---
  const [premiumRequestLoading, setPremiumRequestLoading] = useState(false);
  const [premiumRequested, setPremiumRequested] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState(null); 

  const [masterCommunities, setMasterCommunities] = useState([]); 
  const [availableSubCommunities, setAvailableSubCommunities] = useState([]);

  const [dynamicOptions, setDynamicOptions] = useState({
    Moonsign: [], Star: [], Pada: [], MotherTongue: [], Complexion: [],
    Education: [], Designation: [], MaritalStatus: [], State: [], City: [], Diet: [], Income: [], Country: []
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    searchId: '', minAge: '', maxAge: '', minHeight: '', maxHeight: '', 
    education: '', community: '', subCommunity: '', occupation: '', maritalStatus: '',
    country: '', state: '', city: '', diet: '', motherTongue: '', star: '', pada: '', complexion: ''
  });

  // --- MODAL TRACKING STATES ---
  const [needsTermsAcceptance, setNeedsTermsAcceptance] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [submittingSignature, setSubmittingSignature] = useState(false);
  
  // Signature ref
  const sigRef = useRef(null);

  const [needsExtraDetails, setNeedsExtraDetails] = useState(false);
  const [showExtraDetailsModal, setShowExtraDetailsModal] = useState(false);
  const [submittingExtraDetails, setSubmittingExtraDetails] = useState(false);
  
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [extraDetailsForm, setExtraDetailsForm] = useState({
      moonsign: '', star: '', pada: '', motherTongue: '', timeOfBirth: '', placeOfBirth: '', nativeLocation: '', complexion: '',
      familyType: '', fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '', noOfBrothers: 0, noOfBrothersMarried: 0, noOfSisters: 0, noOfSistersMarried: 0
  });

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [needsPhotos, setNeedsPhotos] = useState(false);
  const [photoFiles, setPhotoFiles] = useState({ primary: null, secondary: null }); 
  const [uploading, setUploading] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const API_BASE_URL = "https://kalyanashobha-back.vercel.app/api/user";
  const PUBLIC_API_BASE = "https://kalyanashobha-back.vercel.app/api/public";

  useEffect(() => {
    const initDashboard = async () => {
      let commData = [];
      try {
        const response = await fetch(`${PUBLIC_API_BASE}/get-all-communities`);
        const data = await response.json();
        if (data.success) {
            setMasterCommunities(data.data);
            commData = data.data;
        }
      } catch (err) { console.error("Failed to load communities", err); }

      fetchDynamicOptions(); 
      fetchUserStatuses(); 

      const token = localStorage.getItem('token');
      if (token) {
        try {
          // --- Fetch Premium Status ---
          const statusRes = await fetch(`${API_BASE_URL}/premium-status`, { headers: { 'Authorization': token }});
          const statusData = await statusRes.json();
          if (statusData.success) {
              setPremiumStatus(statusData.status); 
              setPremiumRequested(statusData.status === 'Pending' || statusData.status === 'Contacted');
          }

          // --- Fetch Preferences ---
          const prefRes = await fetch(`${API_BASE_URL}/preference`, { headers: { 'Authorization': token }});
          const prefJson = await prefRes.json();
          
          if (prefJson.success && prefJson.data) {
             const p = prefJson.data;
             const savedFilters = {
                searchId: '', minAge: p.minAge || '', maxAge: p.maxAge || '', minHeight: p.minHeight || '', maxHeight: p.maxHeight || '',
                education: p.education || '', community: p.community || '', subCommunity: p.subCommunity || '',
                occupation: p.occupation || '', maritalStatus: p.maritalStatus || '', country: p.country || '',
                state: p.state || '', city: p.city || '', diet: p.diet || '', motherTongue: p.motherTongue || '',
                star: p.star || '', pada: p.pada || '', complexion: p.complexion || ''
             };
             
             setFilters(savedFilters);
             if (p.community) {
                 const found = commData.find(c => c.name === p.community);
                 if (found) setAvailableSubCommunities(found.subCommunities || []);
             }

             fetchFeedAndData(savedFilters);
             return; 
          }
        } catch (e) { console.error("Failed to load user info", e); }
      }
      
      fetchFeedAndData({});
    };

    initDashboard();
  }, []);

  // Background poller for Real-time Status Updates
  useEffect(() => {
    const checkStatuses = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const statusRes = await fetch(`${API_BASE_URL}/premium-status`, { headers: { 'Authorization': token }});
        const statusData = await statusRes.json();
        if (statusData.success) {
            setPremiumStatus(statusData.status);
            setPremiumRequested(statusData.status === 'Pending' || statusData.status === 'Contacted');
            if (statusData.status === 'Resolved') {
               setIsPremium(true); 
            }
        }

        const regRes = await fetch("https://kalyanashobha-back.vercel.app/api/payment/registration/status", { headers: { 'Authorization': token } });
        const regData = await regRes.json();
        if (regData.success && regData.paymentFound) {
            setRegPaymentStatus(regData.data);
        } else {
            setRegPaymentStatus(null);
        }
      } catch (e) {
        console.error("Background status check failed", e);
      }
    };

    const intervalId = setInterval(checkStatuses, 15000); 
    window.addEventListener("focus", checkStatuses);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", checkStatuses);
    };
  }, []);

  const fetchDynamicOptions = async () => {
    const categories = ['Moonsign', 'Star', 'Pada', 'MotherTongue', 'Complexion', 'Education', 'Designation', 'MaritalStatus', 'State', 'City', 'Diet', 'Income', 'Country'];
    const newOptions = { ...dynamicOptions };
    await Promise.all(categories.map(async (category) => {
      try {
        const res = await fetch(`${PUBLIC_API_BASE}/master-data/${category}`);
        const json = await res.json();
        if (json.success && json.data.length > 0) newOptions[category] = json.data.map(item => item.name);
      } catch (err) {}
    }));
    setDynamicOptions(newOptions);
  };

  const fetchUserStatuses = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      let activeUserId = userId;
      if (!activeUserId) {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          activeUserId = storedUser._id || storedUser.id;
      }
      if (!token || !activeUserId) return;

      try {
          // 1. Check Profile for Terms & Conditions (Highest Priority)
          const profileRes = await fetch(`${API_BASE_URL}/my-profile`, { headers: { 'Authorization': token } });
          const profileData = await profileRes.json();
          let missingTerms = false;
          
          if (profileData.success && !profileData.user.termsAcceptedAt) {
              setNeedsTermsAcceptance(true);
              setShowTermsModal(true);
              missingTerms = true;
          }

          // 2. Check Extra Details
          const extraRes = await fetch(`${API_BASE_URL}/extra-details/${activeUserId}`, { headers: { 'Authorization': token } });
          const extraData = await extraRes.json();
          if (extraData.success && !extraData.hasAstrologyAndFamilyDetails) {
              setNeedsExtraDetails(true);
              // Only show if terms modal is NOT open
              if (!missingTerms) setShowExtraDetailsModal(true); 
          }

          // 3. Check Photos
          const photoRes = await fetch(`${API_BASE_URL}/photos-status`, { headers: { 'Authorization': token } });
          const photoData = await photoRes.json();
          if (photoData.success && !photoData.hasPhotos) {
              setNeedsPhotos(true);
          }
      } catch (err) {}
  };

  const fetchFeedAndData = async (filterData) => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      setSearchLoading(true);
      const feedRes = await fetch(`${API_BASE_URL}/dashboard/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(filterData)
      });
      const feedData = await feedRes.json();

      if (feedData.success) {
        setMatches(feedData.data);
        setIsPremium(feedData.isPremium || false);

        if (Object.keys(filterData).length > 0 && feedData.count > 0) toast.success(`Found ${feedData.count} matches`);
        else if (Object.keys(filterData).length > 0 && feedData.count === 0) toast("No matches found based on current filters");

        if (!feedData.isPremium) {
          const regRes = await fetch("https://kalyanashobha-back.vercel.app/api/payment/registration/status", { headers: { 'Authorization': token } });
          const regData = await regRes.json();
          if (regData.success && regData.paymentFound) setRegPaymentStatus(regData.data);
        }
      } else {
        if (feedRes.status === 401) { localStorage.removeItem('token'); navigate('/login'); }
        toast.error(feedData.message || "Failed to load data");
      }

    } catch (err) {
      toast.error("Network error");
    } finally {
      setDashboardLoading(false);
      setSearchLoading(false);
    }
  };

  const clearSignature = () => {
      if (sigRef.current) sigRef.current.clear();
  };

  // --- SUBMIT TERMS HANDLER ---
  const submitTerms = async (e) => {
    e.preventDefault();
    if (!termsAgreed) return toast.error("Please agree to the Terms & Conditions.");
    if (!sigRef.current || sigRef.current.isEmpty()) return toast.error("Please provide your digital signature.");

    setSubmittingSignature(true);

    try {
        // Convert canvas drawing to File object
        const signatureDataURL = sigRef.current.toDataURL("image/png");
        const signatureFile = dataURLtoFile(signatureDataURL, "signature.png");

        const formData = new FormData();
        formData.append('digitalSignature', signatureFile);

        const res = await fetch(`${API_BASE_URL}/accept-terms`, {
            method: 'POST',
            headers: { 'Authorization': localStorage.getItem('token') },
            body: formData
        });
        const data = await res.json();
        
        if (data.success) {
            setNeedsTermsAcceptance(false);
            setShowTermsModal(false);
            toast.success("Terms accepted successfully!");
            
            // Waterfall to the next required modal
            if (needsExtraDetails) {
                setShowExtraDetailsModal(true);
            } else if (needsPhotos) {
                setShowPhotoModal(true);
            }
        } else {
            toast.error(data.message || "Failed to submit terms.");
        }
    } catch (err) {
        console.error("Terms Submit Error:", err);
        toast.error("Network error. Please try again.");
    } finally {
        setSubmittingSignature(false);
    }
  };

  const handlePremiumRequest = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    setPremiumRequestLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/premium-click-alert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': token }
        });
        const data = await response.json();
        
        if (data.success) {
            toast.success("Request sent! Our team will contact you shortly.");
            setPremiumRequested(true);
            setPremiumStatus('Pending'); 
        } else {
            toast.error(data.message || "Something went wrong.");
        }
    } catch (error) {
        console.error("Premium Click Error:", error);
        toast.error("Network error while sending request.");
    } finally {
        setPremiumRequestLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'community') {
      const found = masterCommunities.find(c => c.name === value);
      if (found) setAvailableSubCommunities(found.subCommunities || []);
      else setAvailableSubCommunities([]);
      setFilters(prev => ({ ...prev, community: value === "Any" ? "" : value, subCommunity: '' }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value === "Any" ? "" : value }));
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (needsTermsAcceptance) { setShowTermsModal(true); return; } // Guard
    if (needsExtraDetails) { setShowExtraDetailsModal(true); return; }
    if (!isPremium) return toast.error("Upgrade to Premium to search matches!");
    fetchFeedAndData(filters);
  };

  const clearFilters = () => {
    if (needsTermsAcceptance) { setShowTermsModal(true); return; } // Guard
    if (needsExtraDetails) { setShowExtraDetailsModal(true); return; }
    const emptyFilters = { 
        searchId: '', minAge: '', maxAge: '', minHeight: '', maxHeight: '', 
        education: '', community: '', subCommunity: '', occupation: '', maritalStatus: '',
        country: '', state: '', city: '', diet: '', motherTongue: '', star: '', pada: '', complexion: '' 
    };
    setFilters(emptyFilters);
    setAvailableSubCommunities([]);
    fetchFeedAndData(emptyFilters); 
  };

  const handleVerifyClick = () => {
    if (regPaymentStatus?.status === 'PendingVerification') {
        toast("Verification is currently in progress. Please wait for admin approval.", { icon: <Icons.Info /> });
        return;
    }
    
    if (needsTermsAcceptance) { setShowTermsModal(true); return; } // Guard
    if (needsExtraDetails) { setShowExtraDetailsModal(true); return; }
    if (needsPhotos) { setShowPhotoModal(true); return; }
    
    navigate('/payment-registration');
  };

  const handleExtraDetailsChange = (e) => {
      const { name, value } = e.target;
      setExtraDetailsForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEnterToNext = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
      e.preventDefault(); 
      const form = e.target.closest('form');
      const focusableElements = Array.from(form.querySelectorAll('input, select, button[type="submit"]'));
      const index = focusableElements.indexOf(e.target);
      if (index > -1 && index < focusableElements.length - 1) {
        focusableElements[index + 1].focus();
      }
    }
  };

  const submitExtraDetails = async (e) => {
      e.preventDefault();
      setSubmittingExtraDetails(true);
      
      let userId = localStorage.getItem('userId');
      if (!userId) {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          userId = storedUser._id || storedUser.id;
      }

      if (!userId) {
          toast.error("Session expired. Please login again.");
          setSubmittingExtraDetails(false);
          return;
      }

      const payload = {
          userId: userId,
          astrologyDetails: {
              moonsign: extraDetailsForm.moonsign,
              star: extraDetailsForm.star,
              pada: extraDetailsForm.pada,
              motherTongue: extraDetailsForm.motherTongue,
              timeOfBirth: extraDetailsForm.timeOfBirth,
              placeOfBirth: extraDetailsForm.placeOfBirth,
              nativeLocation: extraDetailsForm.nativeLocation,
              complexion: extraDetailsForm.complexion
          },
          familyDetails: {
              familyType: extraDetailsForm.familyType,
              fatherName: extraDetailsForm.fatherName,
              fatherOccupation: extraDetailsForm.fatherOccupation,
              motherName: extraDetailsForm.motherName,
              motherOccupation: extraDetailsForm.motherOccupation,
              noOfBrothers: Number(extraDetailsForm.noOfBrothers),
              noOfBrothersMarried: Number(extraDetailsForm.noOfBrothersMarried),
              noOfSisters: Number(extraDetailsForm.noOfSisters),
              noOfSistersMarried: Number(extraDetailsForm.noOfSistersMarried)
          }
      };

      try {
          const res = await fetch(`${API_BASE_URL}/extra-details`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': localStorage.getItem('token') 
              },
              body: JSON.stringify(payload)
          });
          
          const data = await res.json();
          if (data.success) {
              setNeedsExtraDetails(false);
              setShowExtraDetailsModal(false);
              toast.success("Additional details saved successfully!");
              
              if (needsPhotos) { setShowPhotoModal(true); } 
          } else {
              toast.error(data.message);
          }
      } catch (err) {
          toast.error("Network error while saving details");
      } finally {
          setSubmittingExtraDetails(false);
      }
  };

    const handlePhotoSelect = async (type, file) => { 
    if (file) { 
      let loadingToast; // Define outside try/catch so we can access it in finally
      try {
        loadingToast = toast.loading(`uploading ${type} photo...`);
        
        const options = { 
          maxSizeMB: 1, 
          maxWidthOrHeight: 1920, 
          useWebWorker: false, // Changed to false: Web Workers often crash on mobile browsers during heavy image processing
          alwaysKeepResolution: true // Helps prevent errors if the image is already small
        };
        
        const compressedFile = await imageCompression(file, options);
        setPhotoFiles(prev => ({ ...prev, [type]: compressedFile }));
        
      } catch (error) {
        console.error("Compression Error:", error);
        
        // Optional Fallback: If compression fails, you could just accept the original file anyway
        // setPhotoFiles(prev => ({ ...prev, [type]: file }));
        
        toast.error("Failed to compress image. Please try another photo.");
      } finally {
        // This ensures the loading spinner always disappears, even if an error occurs!
        if (loadingToast) {
          toast.dismiss(loadingToast);
        }
      }
    } 
  };


  const submitPhotos = async (e) => {
    e.preventDefault();
    if (!photoFiles.primary || !photoFiles.secondary) return toast.error("Essential photos required");

    const primarySizeMB = photoFiles.primary.size / (1024 * 1024);
    const secondarySizeMB = photoFiles.secondary.size / (1024 * 1024);
    if (primarySizeMB + secondarySizeMB > 2.5) return toast.error("Photos are too large even after compression! Please choose different images.");
    
    setUploading(true);
    const formData = new FormData();
    formData.append('photos', photoFiles.primary);
    formData.append('photos', photoFiles.secondary);
  
    try {
      const res = await fetch(`${API_BASE_URL}/upload-photos`, {
        method: 'POST', 
        headers: { 'Authorization': localStorage.getItem('token') }, 
        body: formData
      });
  
      if (!res.ok) throw new Error(`Server returned status: ${res.status}`);
      const data = await res.json();
      if (data.success || res.ok) { 
          setNeedsPhotos(false); 
          setShowPhotoModal(false); 
          toast.success("Photos updated");
          navigate('/payment-registration');
      } else { 
          toast.error(data.message); 
      }
    } catch (error) { 
        console.error("Upload Error:", error);
        toast.error(`Upload failed: ${error.message}`); 
    } finally { 
        setUploading(false); 
    }
  };

  const handleConnect = async (profile) => {
    if (needsTermsAcceptance) { setShowTermsModal(true); return; } // Guard
    if (needsExtraDetails) { setShowExtraDetailsModal(true); return; }
    if (needsPhotos) { setShowPhotoModal(true); return; } 
    if (!isPremium) {
       if (regPaymentStatus?.status === 'PendingVerification') toast("Verification in progress", { icon: <Icons.Info /> });
       else handleVerifyClick();
       return;
    }
    
    setActionLoadingId(profile.id);
    try {
      const res = await fetch("https://kalyanashobha-back.vercel.app/api/interest/send", {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') 
        }, 
        body: JSON.stringify({ receiverId: profile.id })
      });
      const data = await res.json();
      
      if (data.success) {
        setMatches(prev => prev.map(m => m.id === profile.id ? { ...m, interestStatus: 'PendingAdminPhase1' } : m));
        toast.success("Interest sent to Admin for approval");
      } else { 
        if (data.currentStatus) {
            setMatches(prev => prev.map(m => m.id === profile.id ? { ...m, interestStatus: data.currentStatus } : m));
        }
        toast.error(data.message); 
      }
    } catch { 
        toast.error("Network error"); 
    } finally { 
        setActionLoadingId(null); 
    }
  };

  const renderStatusBtn = (profile) => {
    const status = profile.interestStatus;
    if (status && status !== 'Rejected') {
        return (
            <button className="ud-btn ud-btn-disabled" disabled>
                {getUserFriendlyStatus(status)}
            </button>
        );
    }

    const isThisLoading = actionLoadingId === profile.id;

    return (
      <button 
        className={`ud-btn ${!isPremium ? 'ud-btn-locked' : 'ud-btn-accent'}`} 
        onClick={() => handleConnect(profile)}
        disabled={isThisLoading || (actionLoadingId !== null)} 
      >
        {!isPremium ? <><Icons.Lock /> Verify to Connect</> : (isThisLoading ? "Sending..." : "Send Interest")}
      </button>
    );
  };

  const siblingOptions = Array.from({ length: 11 }, (_, i) => i);

  return (
    <>
      <Navbar />
      <Toaster toastOptions={{ style: { background: '#1e293b', color: '#fff', fontFamily: 'Inter' } }} />

      <div className="ud-dashboard">
        <div className="ud-container ud-header-section">
          <p className="ud-subtitle">Find your perfect match</p>
        </div>

        {dashboardLoading ? <DashboardSkeleton /> : (
          <div className="ud-container">

            {/* --- PREMIUM UPGRADE BANNER (ONLY SHOWS IF isPremium is true) --- */}
            {isPremium && premiumStatus !== 'Resolved' && (
              <div style={{
                background: (premiumRequested || premiumStatus === 'Pending' || premiumStatus === 'Contacted')
                  ? 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' 
                  : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                borderRadius: '16px',
                padding: 'clamp(20px, 4vw, 28px) clamp(24px, 5vw, 36px)', 
                marginBottom: '28px',
                border: (premiumRequested || premiumStatus === 'Pending' || premiumStatus === 'Contacted')
                  ? '1px solid #d1fae5' 
                  : '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '24px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s ease-in-out'
              }}>
                
                <div style={{
                  position: 'absolute', right: '-10%', top: '-50%', width: '300px', height: '300px', 
                  background: (premiumRequested || premiumStatus === 'Pending' || premiumStatus === 'Contacted')
                    ? 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 70%)' 
                    : 'radial-gradient(circle, rgba(217,119,6,0.15) 0%, rgba(0,0,0,0) 70%)', 
                  pointerEvents: 'none'
                }}></div>

                {(premiumRequested || premiumStatus === 'Pending' || premiumStatus === 'Contacted') ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px, 4vw, 24px)', width: '100%', zIndex: 1 }}>
                    <div style={{ 
                      background: '#d1fae5', minWidth: 'clamp(44px, 10vw, 56px)', height: 'clamp(44px, 10vw, 56px)', 
                      borderRadius: '50%', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                    }}>
                      <div style={{ width: 'clamp(24px, 6vw, 30px)', height: 'clamp(24px, 6vw, 30px)' }}><Icons.CheckCircle /></div>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.35rem)', color: '#064e3b', fontWeight: '700', letterSpacing: '-0.02em' }}>Request Received</h3>
                      <p style={{ margin: '6px 0 0 0', color: '#047857', fontSize: 'clamp(0.85rem, 3vw, 1rem)', lineHeight: '1.5' }}>Our support team will contact you shortly to process your premium upgrade.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px, 4vw, 24px)', flex: '1 1 300px', zIndex: 1 }}>
                      <div style={{ 
                        background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)', minWidth: 'clamp(44px, 10vw, 56px)', 
                        height: 'clamp(44px, 10vw, 56px)', borderRadius: '14px', color: '#f59e0b', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <div style={{ width: 'clamp(22px, 5vw, 28px)', height: 'clamp(22px, 5vw, 28px)' }}><Icons.Diamond /></div>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 'clamp(1.15rem, 4vw, 1.4rem)', color: '#f8fafc', fontWeight: '700', letterSpacing: '-0.01em' }}>Upgrade to Premium</h3>
                        <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: 'clamp(0.85rem, 3vw, 0.95rem)', lineHeight: '1.5', maxWidth: '500px', fontWeight: '400' }}>Get personalized assistance from our expert matchmaking team. Request your exclusive upgrade today.</p>
                      </div>
                    </div>
                    <div style={{ zIndex: 1, display: 'flex', width: 'fit-content' }}>
                      <button 
                        onClick={handlePremiumRequest} disabled={premiumRequestLoading}
                        style={{
                          background: '#f8fafc', color: '#0f172a', fontWeight: '600', border: 'none',
                          padding: 'clamp(10px, 3vw, 14px) clamp(20px, 5vw, 32px)', borderRadius: '8px', cursor: premiumRequestLoading ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: 'clamp(0.9rem, 3vw, 1rem)', 
                          transition: 'all 0.2s ease', opacity: premiumRequestLoading ? 0.8 : 1, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', whiteSpace: 'nowrap'
                        }}
                      >
                        {premiumRequestLoading ? "Processing..." : <>Request Upgrade <Icons.ArrowRight /></>}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* --- PENDING VERIFICATION BANNER --- */}
            {!isPremium && regPaymentStatus?.status === 'PendingVerification' && (
              <div style={{
                backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '16px 24px',
                marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#92400e'
              }}>
                 <div><Icons.Info /></div>
                 <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Verification in Progress</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>We have received your payment request. Our admin team is currently verifying the details.</p>
                 </div>
              </div>
            )}

            {/* --- SEARCH SECTION --- */}
            <div className="ud-search-section">
              <div className="ud-search-card">
                {!isPremium && (
                  <div className="ud-search-locked-overlay" onClick={handleVerifyClick} style={{ cursor: regPaymentStatus?.status === 'PendingVerification' ? 'default' : 'pointer' }}>
                    {regPaymentStatus?.status === 'PendingVerification' ? (
                      <><div className="ud-pending-status"><Icons.Verify /> Verification Pending</div><p className="ud-subtitle" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Waiting for admin approval.</p></>
                    ) : (
                      <><div className="ud-lock-msg"><Icons.Lock /> Premium Search</div><p className="ud-subtitle" style={{ fontSize: '0.8rem' }}>Verify profile to use Advanced Filters</p></>
                    )}
                  </div>
                )}

                <div className="ud-search-bar">
                  <div className="ud-search-input-group">
                    <div className="ud-search-icon-box"><Icons.Search /></div>
                    <input type="text" name="searchId" className="ud-main-search-input" placeholder="Search by ID (e.g. KS1023)..." value={filters.searchId} onChange={handleFilterChange} disabled={!isPremium}/>
                  </div>
                  <button className={`ud-filter-toggle ${showFilters ? 'active' : ''}`} onClick={() => isPremium && setShowFilters(!showFilters)} disabled={!isPremium}><Icons.Filter /> Advanced <Icons.ChevronDown /></button>
                  <button className="ud-btn ud-btn-primary" style={{width:'auto', padding:'0.75rem 1.5rem'}} onClick={handleSearch} disabled={!isPremium || searchLoading}>{searchLoading ? 'Searching...' : 'Search'}</button>
                </div>

                {/* --- FILTERS PANEL --- */}
                {showFilters && isPremium && (
                  <div className="ud-filters-panel">
                    <div className="ud-filters-grid">
                      <div className="ud-form-group">
                        <label className="ud-label">Age (Years)</label>
                        <div style={{display:'flex', gap:'0.5rem'}}>
                          <input type="number" name="minAge" placeholder="Min" className="ud-input" value={filters.minAge} onChange={handleFilterChange}/>
                          <input type="number" name="maxAge" placeholder="Max" className="ud-input" value={filters.maxAge} onChange={handleFilterChange}/>
                        </div>
                      </div>
                      
                      <div className="ud-form-group">
                        <label className="ud-label">Marital Status</label>
                        <select name="maritalStatus" className="ud-input" value={filters.maritalStatus} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.MaritalStatus.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Education</label>
                        <select name="education" className="ud-input" value={filters.education} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.Education.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Community</label>
                        <select name="community" className="ud-input" value={filters.community} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {masterCommunities.map((c, idx) => (<option key={idx} value={c.name}>{c.name}</option>))}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Sub-Community / Caste</label>
                        <select name="subCommunity" className="ud-input" value={filters.subCommunity} onChange={handleFilterChange} disabled={!filters.community}>
                          <option value="">Any</option>
                          {availableSubCommunities.map((sub, idx) => { 
                            const val = typeof sub === 'string' ? sub : sub.name; 
                            return <option key={idx} value={val}>{val}</option>; 
                          })}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Occupation</label>
                        <select name="occupation" className="ud-input" value={filters.occupation} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.Designation.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Country</label>
                        <select name="country" className="ud-input" value={filters.country} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.Country.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">State</label>
                        <select name="state" className="ud-input" value={filters.state} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.State.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">City</label>
                        <select name="city" className="ud-input" value={filters.city} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.City.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Mother Tongue</label>
                        <select name="motherTongue" className="ud-input" value={filters.motherTongue} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.MotherTongue.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Star (Nakshatram)</label>
                        <select name="star" className="ud-input" value={filters.star} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.Star.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Pada</label>
                        <select name="pada" className="ud-input" value={filters.pada} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.Pada.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Diet</label>
                        <select name="diet" className="ud-input" value={filters.diet} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.Diet.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Complexion</label>
                        <select name="complexion" className="ud-input" value={filters.complexion} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.Complexion.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Height (Cm)</label>
                        <div style={{display:'flex', gap:'0.5rem'}}>
                          <input type="number" name="minHeight" placeholder="Min" className="ud-input" value={filters.minHeight} onChange={handleFilterChange}/>
                          <input type="number" name="maxHeight" placeholder="Max" className="ud-input" value={filters.maxHeight} onChange={handleFilterChange}/>
                        </div>
                      </div>
                    </div>
                    <div className="ud-filter-actions">
                      <button className="ud-btn ud-btn-outline" style={{width:'auto'}} onClick={clearFilters}>Reset All</button>
                      <button className="ud-btn ud-btn-accent" style={{width:'auto'}} onClick={handleSearch}>Apply Filters</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* --- EMPTY STATE --- */}
            {matches.length === 0 && (
              <div className="ud-empty-state">
                <div style={{width:'60px', height:'60px', margin:'0 auto', color:'#cbd5e1'}}><Icons.Search /></div>
                <h3>No Matches Found</h3>
                <p>Try adjusting your filters.</p>
                {filters.searchId || filters.minAge || filters.community ? (
                    <button className="ud-btn ud-btn-outline" style={{marginTop:'1rem', width:'auto', display:'inline-flex'}} onClick={clearFilters}>Clear Filters</button>
                ) : null}
              </div>
            )}

            {/* --- GRID --- */}
            <div className="ud-grid">
              {matches.map((profile) => (
                <div key={profile.id} className="ud-card">
                  <div className="ud-card-header"><div className="ud-avatar-box">{profile.gender === 'Male' ? <Icons.Male /> : <Icons.Female />}</div></div>
                  <div className="ud-card-body">
                    <div className="ud-profile-header">
                      <div className="ud-name">{formatDisplayName(profile.name)} <Icons.Verify /></div>
                      <span className="ud-age-badge">{profile.age} Yrs</span>
                    </div>
                    
                    <p className="ud-job">{profile.occupation || profile.job || "Not Specified"}</p>
                    <div className="ud-info-grid">
                      <div className="ud-info-item"><span className="ud-lbl">Education</span><span className="ud-val">{profile.education || "--"}</span></div>
                      <div className="ud-info-item"><span className="ud-lbl">Community</span><span className="ud-val">{profile.community || "--"}</span></div>
                      <div className="ud-info-item"><span className="ud-lbl">Sub-Community</span><span className="ud-val">{profile.subCommunity || "--"}</span></div>
                      <div className="ud-info-item"><span className="ud-lbl">Location</span><span className="ud-val">{profile.location || "--"}</span></div>
                      <div className="ud-info-item"><span className="ud-lbl">ID</span><span className="ud-val">{profile.uniqueId || "--"}</span></div>
                      <div className="ud-info-item"><span className="ud-lbl">Height</span><span className="ud-val">{profile.height ? `${profile.height} cm` : "--"}</span></div>
                      <div className="ud-info-item"><span className="ud-lbl">Status</span><span className="ud-val">{profile.status || "--"}</span></div>
                    </div>
                    <div style={{marginTop:'auto'}}>
                       {renderStatusBtn(profile)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- TERMS & CONDITIONS MODAL (HIGHEST PRIORITY) --- */}
      {showTermsModal && (
        <div className="ud-overlay" style={{ zIndex: 9999 }}>
          <div className="ud-modal">
            {/* Intentionally removed the close button so users must accept terms before proceeding */}
            <h2 className="ud-title">Terms & Conditions</h2>
            <p className="ud-subtitle" style={{marginBottom:'1.5rem'}}>
               Welcome! As your profile was created by an agent, you must accept our terms and provide a digital signature to proceed with your account.
            </p>
            
            <form onSubmit={submitTerms}>
              <div className="ud-form-group">
                <label className="ud-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', lineHeight: '1.4' }}>
                  <input 
                    type="checkbox" 
                    checked={termsAgreed} 
                    onChange={(e) => setTermsAgreed(e.target.checked)} 
                    style={{ width: '18px', height: '18px', marginTop: '2px', flexShrink: 0 }}
                  />
                  <span>
                    I hereby declare that the information provided in my profile is true and correct. I accept the <a href="/terms" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 'bold' }}>Terms & Conditions</a> of KalyanaShobha.
                  </span>
                </label>
              </div>

              <div className="ud-form-group">
                <label className="ud-label">Digital Signature <span className="ud-required">*</span></label>
                <div style={{ 
                    border: '2px dashed #E2E8F0', 
                    borderRadius: '8px', 
                    padding: '10px', 
                    backgroundColor: '#F8FAFC', 
                    marginBottom: '10px' 
                }}>
                    <SignatureCanvas 
                        ref={sigRef}
                        penColor="#1A1A1A"
                        canvasProps={{ 
                            className: 'sigCanvas', 
                            style: { width: '100%', height: '160px', touchAction: 'none' } 
                        }}
                        backgroundColor="#FFFFFF"
                    />
                </div>
                <button 
                    type="button" 
                    onClick={clearSignature} 
                    style={{ 
                        background: 'none', border: 'none', color: '#EF4444', 
                        fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem' 
                    }}
                >
                    Clear Signature
                </button>
              </div>

              <button 
                type="submit" 
                className="ud-btn ud-btn-primary" 
                disabled={submittingSignature || !termsAgreed}
              >
                {submittingSignature ? "Submitting..." : "Accept & Continue"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EXTRA DETAILS MODAL --- */}
      {showExtraDetailsModal && (
        <div className="ud-overlay">
          <div className="ud-modal-large" style={{ position: 'relative' }}>
            
            {showTimePicker && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}>
                <CustomTimePicker isOpen={showTimePicker} onClose={() => setShowTimePicker(false)} initialTime={extraDetailsForm.timeOfBirth} onSet={(formattedTime) => { setExtraDetailsForm(prev => ({ ...prev, timeOfBirth: formattedTime })); }} />
              </div>
            )}

            <div className="ud-modal-header">
               <div>
                  <h2 className="ud-title">Complete Your Profile</h2>
                  <p className="ud-subtitle">Please provide these details to proceed with verification.</p>
               </div>
               <button className="ud-close-btn" onClick={() => setShowExtraDetailsModal(false)}>✕</button>
            </div>
            
            <div className="ud-modal-body">
               <form onSubmit={submitExtraDetails} onKeyDown={handleEnterToNext}>
                 <div className="ud-form-section">
                   <h4 className="ud-section-title">Additional Details</h4>
                   <div className="ud-grid-2">
                     <DashboardComboInput label="Moonsign" name="moonsign" value={extraDetailsForm.moonsign} onChange={handleExtraDetailsChange} options={dynamicOptions.Moonsign} required={true} onKeyDown={handleEnterToNext} />
                     <DashboardComboInput label="Star (Nakshatram)" name="star" value={extraDetailsForm.star} onChange={handleExtraDetailsChange} options={dynamicOptions.Star} required={true} onKeyDown={handleEnterToNext}/>
                     <DashboardComboInput label="Pada/Quarter" name="pada" value={extraDetailsForm.pada} onChange={handleExtraDetailsChange} options={dynamicOptions.Pada} required={false} onKeyDown={handleEnterToNext}/>
                     <DashboardComboInput label="Mother Tongue" name="motherTongue" value={extraDetailsForm.motherTongue} onChange={handleExtraDetailsChange} options={dynamicOptions.MotherTongue} required={true} onKeyDown={handleEnterToNext}/>
                     
                     <div className="ud-form-group">
                       <label className="ud-label">Time of Birth</label>
                       <div style={{ position: 'relative' }}>
                         <input type="text" name="timeOfBirth" className="ud-input" placeholder="02:30 PM" value={extraDetailsForm.timeOfBirth} readOnly onClick={() => setShowTimePicker(true)} style={{ cursor: 'pointer' }} />
                         <div style={{ position: 'absolute', right: '12px', top: '12px', color: '#64748b', pointerEvents: 'none' }}><Icons.ChevronDown /></div>
                       </div>
                     </div>
                     
                     <div className="ud-form-group"><label className="ud-label">Place of Birth</label><input type="text" name="placeOfBirth" className="ud-input" placeholder="City or Village name" value={extraDetailsForm.placeOfBirth} onChange={handleExtraDetailsChange}/></div>
                     <div className="ud-form-group"><label className="ud-label">Native Location</label><input type="text" name="nativeLocation" className="ud-input" placeholder="Native Place" value={extraDetailsForm.nativeLocation} onChange={handleExtraDetailsChange}/></div>
                     <DashboardComboInput label="Complexion" name="complexion" value={extraDetailsForm.complexion} onChange={handleExtraDetailsChange} options={dynamicOptions.Complexion} required={false} onKeyDown={handleEnterToNext}/>
                   </div>
                 </div>

                 <div className="ud-form-section">
                   <h4 className="ud-section-title">Family Information</h4>
                   <div className="ud-grid-2">
                     <div className="ud-form-group">
                       <label className="ud-label">Family Type</label>
                       <select name="familyType" className="ud-input" value={extraDetailsForm.familyType} onChange={handleExtraDetailsChange}>
                         <option value="">Select Family Type</option>
                         <option value="Nuclear">Nuclear</option>
                         <option value="Joint">Joint</option>
                         <option value="Extended">Extended</option>
                       </select>
                     </div>
                     <div className="ud-form-group"><label className="ud-label">Father's Name <span className="ud-required">*</span></label><input type="text" name="fatherName" className="ud-input" value={extraDetailsForm.fatherName} onChange={handleExtraDetailsChange} required/></div>
                     <div className="ud-form-group">
                       <label className="ud-label">Father's Occupation</label>
                       <select name="fatherOccupation" className="ud-input" value={extraDetailsForm.fatherOccupation} onChange={handleExtraDetailsChange}>
                         <option value="">Select Occupation</option><option value="Employed">Employed</option><option value="Business">Business</option><option value="Professional">Professional</option><option value="Retired">Retired</option><option value="Not Employed">Not Employed</option><option value="Passed Away">Passed Away</option>
                       </select>
                     </div>
                     <div className="ud-form-group"><label className="ud-label">Mother's Name <span className="ud-required">*</span></label><input type="text" name="motherName" className="ud-input" value={extraDetailsForm.motherName} onChange={handleExtraDetailsChange} required/></div>
                     <div className="ud-form-group">
                       <label className="ud-label">Mother's Occupation</label>
                       <select name="motherOccupation" className="ud-input" value={extraDetailsForm.motherOccupation} onChange={handleExtraDetailsChange}>
                         <option value="">Select Occupation</option><option value="Homemaker">Homemaker</option><option value="Employed">Employed</option><option value="Business">Business</option><option value="Professional">Professional</option><option value="Retired">Retired</option><option value="Passed Away">Passed Away</option>
                       </select>
                     </div>
                     <div className="ud-form-group"><label className="ud-label">No. of Brothers</label><select name="noOfBrothers" className="ud-input" value={extraDetailsForm.noOfBrothers} onChange={handleExtraDetailsChange}>{siblingOptions.map(num => <option key={num} value={num}>{num}</option>)}</select></div>
                     <div className="ud-form-group"><label className="ud-label">Brothers Married</label><select name="noOfBrothersMarried" className="ud-input" value={extraDetailsForm.noOfBrothersMarried} onChange={handleExtraDetailsChange}>{siblingOptions.map(num => <option key={num} value={num}>{num}</option>)}</select></div>
                     <div className="ud-form-group"><label className="ud-label">No. of Sisters</label><select name="noOfSisters" className="ud-input" value={extraDetailsForm.noOfSisters} onChange={handleExtraDetailsChange}>{siblingOptions.map(num => <option key={num} value={num}>{num}</option>)}</select></div>
                     <div className="ud-form-group"><label className="ud-label">Sisters Married</label><select name="noOfSistersMarried" className="ud-input" value={extraDetailsForm.noOfSistersMarried} onChange={handleExtraDetailsChange}>{siblingOptions.map(num => <option key={num} value={num}>{num}</option>)}</select></div>
                   </div>
                 </div>

                 <div className="ud-modal-footer">
                    <button type="submit" className="ud-btn ud-btn-primary ud-btn-large" disabled={submittingExtraDetails}>
                      {submittingExtraDetails ? "Saving..." : "Save Details & Continue"}
                    </button>
                 </div>
               </form>
            </div>
          </div>
        </div>
      )}

      {/* --- PHOTO MODAL --- */}
      {showPhotoModal && (
        <div className="ud-overlay">
          <div className="ud-modal">
            <button className="ud-close-btn" onClick={() => setShowPhotoModal(false)}>✕</button>
            <h2 className="ud-title">Profile Photos Required</h2>
            <p className="ud-subtitle" style={{marginBottom:'1.5rem'}}>Upload your photos to proceed with verification.</p>
            <form onSubmit={submitPhotos}>
              {['primary', 'secondary'].map((type) => {
                // Logic: Lock 'secondary' if 'primary' is missing
                const isLocked = type === 'secondary' && !photoFiles.primary;
                
                return (
                  <div key={type} className="ud-form-group">
                    <label className="ud-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {type === 'primary' ? 'Primary Profile Photo' : 'Secondary Portrait'}
                      {isLocked && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      </span>}
                    </label>
                    
                    <div 
                      className={`ud-upload-zone ${photoFiles[type] ? 'active' : ''}`}
                      style={{ 
                        opacity: isLocked ? 0.6 : 1, 
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        backgroundColor: isLocked ? '#f1f5f9' : '' 
                      }}
                    >
                      <input 
                        className="ud-file-input" 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handlePhotoSelect(type, e.target.files[0])} 
                        disabled={isLocked}
                      />
                      <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem', color: isLocked ? '#94a3b8' : 'inherit'}}>
                        {isLocked ? <Icons.Lock /> : <Icons.Upload />}
                        <span className="ud-lbl">
                          {isLocked 
                            ? "Upload primary photo first" 
                            : (photoFiles[type] ? photoFiles[type].name : "Click to Upload")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button 
                type="submit" 
                className="ud-btn ud-btn-primary" 
                disabled={uploading || !photoFiles.primary || !photoFiles.secondary}
              >
                {uploading ? "Uploading..." : "Save & Continue to Payment"}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer/>
    </>
  );
};

export default UserDashboard;
