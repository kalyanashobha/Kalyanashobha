import React, { useState, useEffect } from 'react';
import Navbar from "../../Components/Navbar.jsx";
import toast, { Toaster } from 'react-hot-toast'; 
import imageCompression from 'browser-image-compression'; 
import './MyProfile.css';

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

// --- SKELETON LOADER ---
const ProfileSkeleton = () => (
  <div className="mp-container fade-in">
    <div className="mp-profile-sheet skeleton-sheet">
      <div className="mp-sheet-header">
        <div className="skeleton-avatar shimmer"></div>
        <div className="mp-header-text">
          <div className="skeleton-line title shimmer"></div>
          <div className="skeleton-line subtitle shimmer"></div>
        </div>
      </div>
      <div className="mp-divider"></div>
      <div className="mp-sheet-body">
        {[1, 2, 3].map((section) => (
          <div key={section} className="mp-section-wrapper">
            <div className="skeleton-line section-title shimmer"></div>
            <div className="mp-details-grid">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="mp-data-field">
                  <div className="skeleton-line label shimmer"></div>
                  <div className="skeleton-line value shimmer"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [referredBy, setReferredBy] = useState(null); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  // Time Picker State
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Photo States
  const [existingPhotos, setExistingPhotos] = useState([]); 
  const [newPhotos, setNewPhotos] = useState([]); 

  const API_BASE = "https://kalyanashobha-back.vercel.app/api/user";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/my-profile`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': token }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        
        setReferredBy(data.referredBy || null); 
        
        setFormData({
            ...data.user,
            astrologyDetails: data.user.astrologyDetails || {},
            familyDetails: data.user.familyDetails || {}
        });
        
        setExistingPhotos(data.user.photos || []);
      }
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const toastId = toast.loading("Updating profile and photos...");

    try {
      const submitData = new FormData();

      Object.keys(formData).forEach(key => {
        if (key === 'photos' || key === 'astrologyDetails' || key === 'familyDetails') return;
        submitData.append(key, formData[key] || '');
      });

      Object.keys(formData.astrologyDetails || {}).forEach(key => {
        submitData.append(`astrologyDetails[${key}]`, formData.astrologyDetails[key]);
      });
      Object.keys(formData.familyDetails || {}).forEach(key => {
        submitData.append(`familyDetails[${key}]`, formData.familyDetails[key]);
      });

      existingPhotos.forEach(url => {
        submitData.append('existingPhotos', url);
      });

      newPhotos.forEach(file => {
        submitData.append('photos', file);
      });

      const res = await fetch(`${API_BASE}/update-profile`, {
        method: 'PUT',
        headers: { 'Authorization': token }, 
        body: submitData
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        setExistingPhotos(data.user.photos || []);
        setNewPhotos([]); 
        setIsEditing(false);
        toast.success("Profile updated successfully!", { id: toastId });
      } else {
        toast.error(data.message || "Update failed", { id: toastId });
      }
    } catch (err) {
      toast.error("Network error occurred", { id: toastId });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value
        }
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    const totalPhotos = existingPhotos.length + newPhotos.length + files.length;
    if (totalPhotos > 2) {
      toast.error("You can only have a maximum of 2 photos.");
      e.target.value = null; 
      return;
    }

    const loadingToast = toast.loading("uploading photos...");
    const compressedFiles = [];

    try {
      const options = {
        maxSizeMB: 1,           
        maxWidthOrHeight: 1920, 
        useWebWorker: true      
      };

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const compressedFile = await imageCompression(file, options);
        
        if (compressedFile.size > 2.5 * 1024 * 1024) {
           toast.error(`Image ${file.name} is still too large after compression.`);
           continue; 
        }

        compressedFiles.push(compressedFile);
      }

      setNewPhotos([...newPhotos, ...compressedFiles]);
      toast.success("Photos processed successfully", { id: loadingToast });
      
    } catch (error) {
      console.error("Compression Error:", error);
      toast.error("Failed to compress some images.", { id: loadingToast });
    } finally {
      e.target.value = null; 
    }
  };

  const removeExistingPhoto = (urlToRemove) => {
    setExistingPhotos(existingPhotos.filter(url => url !== urlToRemove));
  };

  const removeNewPhoto = (indexToRemove) => {
    setNewPhotos(newPhotos.filter((_, index) => index !== indexToRemove));
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    return Math.abs(new Date(Date.now() - birthDate.getTime()).getUTCFullYear() - 1970);
  };

  return (
    <>
      <Navbar/>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: { fontFamily: "'Poppins', sans-serif", fontSize: '14px', color: '#1F2937' },
          success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          error: { iconTheme: { primary: '#D32F2F', secondary: '#fff' }, duration: 5000 }
        }}
      />

      {/* Render Custom Time Picker Modal Overlay */}
      {showTimePicker && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CustomTimePicker 
            isOpen={showTimePicker} 
            onClose={() => setShowTimePicker(false)} 
            initialTime={formData.astrologyDetails?.timeOfBirth} 
            onSet={(formattedTime) => { 
              setFormData(prev => ({ 
                ...prev, 
                astrologyDetails: { ...prev.astrologyDetails, timeOfBirth: formattedTime } 
              })); 
            }} 
          />
        </div>
      )}

      {loading ? (
        <ProfileSkeleton />
      ) : (
        <div className="mp-container fade-in">
          <div className="mp-profile-sheet">
            
            {/* 1. Header Section */}
            <div className="mp-sheet-header">
              <div className="mp-avatar-group">
                <img 
                  src={user?.photos?.[0] || "https://via.placeholder.com/150"} 
                  alt="Profile" 
                  className="mp-sheet-avatar" 
                />
                {user?.isPaidMember && (
                  <div className="mp-verified-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="mp-header-text">
                <div className="mp-title-row">
                  <h1 className="mp-sheet-name">{user?.firstName} {user?.lastName}</h1>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="mp-icon-btn" title="Edit Profile">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  )}
                </div>
                <div className="mp-meta-info" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span className="mp-meta-item">ID: {user?.uniqueId || 'N/A'}</span>
                  
                  {referredBy && (
                    <span className="mp-meta-item" style={{ 
                      background: '#ecfdf5', 
                      color: '#059669', 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '13px', 
                      fontWeight: '600',
                      border: '1px solid #a7f3d0'
                    }}>
                      ✨ Referred by: {referredBy.name} ({referredBy.agentCode})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mp-divider"></div>

            {/* 2. Body Section */}
            <div className="mp-sheet-body">
              {!isEditing ? (
                /* --- VIEW MODE --- */
                <>
                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Photos</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {user?.photos && user.photos.length > 0 ? (
                        user.photos.map((photo, i) => (
                          <img key={i} src={photo} alt={`Profile ${i+1}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                        ))
                      ) : (
                        <p style={{ color: '#666', fontSize: '14px' }}>No photos uploaded yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Basic Information</h3>
                    <div className="mp-details-grid">
                      <div className="mp-data-field">
                        <label>Age / DOB</label>
                        <p>{calculateAge(user?.dob)} Years <span className="text-muted">({new Date(user?.dob).toLocaleDateString()})</span></p>
                      </div>
                      <div className="mp-data-field">
                        <label>Gender</label>
                        <p>{user?.gender || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Height</label>
                        <p>{user?.height ? `${user.height} cm` : "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Marital Status</label>
                        <p>{user?.maritalStatus || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Religion</label>
                        <p>{user?.religion || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Community</label>
                        <p>{user?.community || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Gothra</label>
                        <p>{user?.gothra || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Diet</label>
                        <p>{user?.diet || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Astrology Details</h3>
                    <div className="mp-details-grid">
                      <div className="mp-data-field">
                        <label>Moonsign / Rasi</label>
                        <p>{user?.astrologyDetails?.moonsign || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Star / Nakshatra</label>
                        <p>{user?.astrologyDetails?.star || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Pada</label>
                        <p>{user?.astrologyDetails?.pada || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Time of Birth</label>
                        <p>{user?.astrologyDetails?.timeOfBirth || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Place of Birth</label>
                        <p>{user?.astrologyDetails?.placeOfBirth || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Family Details</h3>
                    <div className="mp-details-grid">
                      <div className="mp-data-field">
                        <label>Father's Name</label>
                        <p>{user?.familyDetails?.fatherName || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Father's Occupation</label>
                        <p>{user?.familyDetails?.fatherOccupation || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Mother's Name</label>
                        <p>{user?.familyDetails?.motherName || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Mother's Occupation</label>
                        <p>{user?.familyDetails?.motherOccupation || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Brothers</label>
                        <p>{user?.familyDetails?.noOfBrothers || "0"} ({user?.familyDetails?.noOfBrothersMarried || "0"} Married)</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Sisters</label>
                        <p>{user?.familyDetails?.noOfSisters || "0"} ({user?.familyDetails?.noOfSistersMarried || "0"} Married)</p>
                      </div>
                    </div>
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Professional & Education</h3>
                    <div className="mp-details-grid">
                      <div className="mp-data-field">
                        <label>Qualification</label>
                        <p>{user?.highestQualification || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>College</label>
                        <p>{user?.collegeName || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Job Role</label>
                        <p>{user?.jobRole || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Company</label>
                        <p>{user?.companyName || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Annual Income</label>
                        <p>{user?.annualIncome || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Work Type</label>
                        <p>{user?.workType || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Contact & Location</h3>
                    <div className="mp-details-grid">
                      <div className="mp-data-field">
                        <label>Email</label>
                        <p>{user?.email}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Phone</label>
                        <p>{user?.mobileNumber}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Residence</label>
                        <p>{user?.residentsIn || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Location</label>
                        <p>{user?.city}, {user?.state}, {user?.country}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* --- EDIT FORM --- */
                <form onSubmit={handleUpdate} className="mp-edit-container">
                  
                  {/* --- PHOTO UPLOAD SECTION --- */}
                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Manage Photos (Max 2)</h3>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                      
                      {/* Existing Photos */}
                      {existingPhotos.map((url, i) => (
                        <div key={`existing-${i}`} style={{ position: 'relative' }}>
                          <img src={url} alt="Existing" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                          <button type="button" onClick={() => removeExistingPhoto(url)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}

                      {/* New Photos Preview */}
                      {newPhotos.map((file, i) => (
                        <div key={`new-${i}`} style={{ position: 'relative' }}>
                          <img src={URL.createObjectURL(file)} alt="New Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #059669' }} />
                          <button type="button" onClick={() => removeNewPhoto(i)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}

                    </div>
                    
                    {existingPhotos.length + newPhotos.length < 2 && (
                      <div className="mp-input-wrap">
                        <input type="file" multiple accept="image/*" onChange={handlePhotoSelect} />
                        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>Upload up to {2 - (existingPhotos.length + newPhotos.length)} more photos </small>
                      </div>
                    )}
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Edit Personal Details</h3>
                    <div className="mp-edit-grid">
                      <div className="mp-input-wrap">
                        <label>Marital Status</label>
                        <select name="maritalStatus" value={formData.maritalStatus || ''} onChange={handleChange}>
                          <option value="Never Married">Never Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                      <div className="mp-input-wrap">
                        <label>Height (cm)</label>
                        <input name="height" type="number" value={formData.height || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Diet</label>
                        <select name="diet" value={formData.diet || ''} onChange={handleChange}>
                          <option value="Veg">Veg</option>
                          <option value="Non-Veg">Non-Veg</option>
                          <option value="Eggetarian">Eggetarian</option>
                        </select>
                      </div>
                      <div className="mp-input-wrap">
                        <label>Gothra</label>
                        <input name="gothra" value={formData.gothra || ''} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Edit Astrology</h3>
                    <div className="mp-edit-grid">
                      <div className="mp-input-wrap">
                        <label>Moonsign / Rasi</label>
                        <input name="astrologyDetails.moonsign" value={formData.astrologyDetails?.moonsign || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Star / Nakshatra</label>
                        <input name="astrologyDetails.star" value={formData.astrologyDetails?.star || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Pada</label>
                        <input name="astrologyDetails.pada" value={formData.astrologyDetails?.pada || ''} onChange={handleChange} />
                      </div>
                      
                      {/* INTEGRATED CUSTOM TIME PICKER INPUT */}
                      <div className="mp-input-wrap">
                        <label>Time of Birth</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="text" 
                            name="astrologyDetails.timeOfBirth" 
                            value={formData.astrologyDetails?.timeOfBirth || ''} 
                            onClick={() => setShowTimePicker(true)} 
                            readOnly 
                            placeholder="e.g. 02:30 PM"
                            style={{ cursor: 'pointer', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb' }} 
                          />
                        </div>
                      </div>

                      <div className="mp-input-wrap">
                        <label>Place of Birth</label>
                        <input name="astrologyDetails.placeOfBirth" value={formData.astrologyDetails?.placeOfBirth || ''} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Edit Family Details</h3>
                    <div className="mp-edit-grid">
                      <div className="mp-input-wrap">
                        <label>Father's Name</label>
                        <input name="familyDetails.fatherName" value={formData.familyDetails?.fatherName || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Father's Occupation</label>
                        <input name="familyDetails.fatherOccupation" value={formData.familyDetails?.fatherOccupation || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Mother's Name</label>
                        <input name="familyDetails.motherName" value={formData.familyDetails?.motherName || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Mother's Occupation</label>
                        <input name="familyDetails.motherOccupation" value={formData.familyDetails?.motherOccupation || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Total Brothers</label>
                        <input type="number" name="familyDetails.noOfBrothers" value={formData.familyDetails?.noOfBrothers || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Brothers Married</label>
                        <input type="number" name="familyDetails.noOfBrothersMarried" value={formData.familyDetails?.noOfBrothersMarried || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Total Sisters</label>
                        <input type="number" name="familyDetails.noOfSisters" value={formData.familyDetails?.noOfSisters || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Sisters Married</label>
                        <input type="number" name="familyDetails.noOfSistersMarried" value={formData.familyDetails?.noOfSistersMarried || ''} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Edit Professional & Location</h3>
                    <div className="mp-edit-grid">
                      <div className="mp-input-wrap">
                        <label>Qualification</label>
                        <input name="highestQualification" value={formData.highestQualification || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>College</label>
                        <input name="collegeName" value={formData.collegeName || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Job Role</label>
                        <input name="jobRole" value={formData.jobRole || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Income</label>
                        <input name="annualIncome" value={formData.annualIncome || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Residence Type</label>
                        <select name="residentsIn" value={formData.residentsIn || ''} onChange={handleChange}>
                          <option value="">Select...</option>
                          <option value="Own">Own</option>
                          <option value="Rent">Rent</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mp-sheet-actions">
                    <button type="button" onClick={() => {
                        setIsEditing(false);
                        setNewPhotos([]); 
                        setExistingPhotos(user.photos || []); 
                    }} className="mp-btn-text">Cancel</button>
                    <button type="submit" className="mp-btn-solid">Save Changes</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyProfile;
