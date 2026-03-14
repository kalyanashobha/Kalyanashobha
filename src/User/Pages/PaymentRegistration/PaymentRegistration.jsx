import React, { useState, useEffect } from 'react';
import Navbar from "../../Components/Navbar.jsx";
import { useNavigate } from 'react-router-dom';
import QRCode from "react-qr-code"; 
import toast, { Toaster } from 'react-hot-toast'; 
import { CheckCircle, ShieldCheck, AlertTriangle, Clock, BadgeCheck, ArrowRight } from 'lucide-react'; // Professional icons
import './Payment.css'; 

const PaymentRegistration = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false); 

  const [amount, setAmount] = useState(0); 
  const [isFetchingFee, setIsFetchingFee] = useState(true);
  
  // NEW STATE: Tracks if they already have a pending or successful payment
  const [existingStatus, setExistingStatus] = useState(null);

  const [utrNumber, setUtrNumber] = useState('');
  const [screenshot, setScreenshot] = useState(null);

  // DETECT DEVICE ON MOUNT
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    checkMobile();
  }, []);

  // FETCH DYNAMIC REGISTRATION FEE & EXISTING PAYMENT STATUS ON MOUNT
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // 1. Fetch Fee
        const feeRes = await fetch("https://kalyanashobha-back.vercel.app/api/user/registration-fee", {
          headers: { 'Authorization': token }
        });
        const feeData = await feeRes.json();
        
        if (feeData.success) {
          setAmount(feeData.fee);
        }

        // 2. Fetch Payment Status (to prevent duplicate submissions)
        const statusRes = await fetch("https://kalyanashobha-back.vercel.app/api/payment/registration/status", {
          headers: { 'Authorization': token }
        });
        const statusData = await statusRes.json();
        
        if (statusData.success && statusData.paymentFound) {
          // If Pending or Success, lock the UI. (Allow if 'Rejected')
          if (statusData.data.status === 'PendingVerification' || statusData.data.status === 'Success') {
             setExistingStatus(statusData.data.status);
          }
        }

      } catch (err) {
        toast.error("Server connection failed.");
      } finally {
        setIsFetchingFee(false);
      }
    };

    fetchData();
  }, [navigate]);

  const upiLink = `upi://pay?pa=8897714968@axl&pn=Kalyana%20Shobha&am=${amount}&cu=INR`; 

  const handlePayClick = () => {
    window.location.href = upiLink;
    setTimeout(() => { setStep(2); }, 3000);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!utrNumber || !screenshot) {
      toast.error("Please provide both UTR Number and Payment Screenshot.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Verifying payment..."); 

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.dismiss(loadingToast);
        toast.error("Please login to continue.");
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('amount', amount); 
      formData.append('utrNumber', utrNumber);
      formData.append('screenshot', screenshot);

      const response = await fetch("https://kalyanashobha-back.vercel.app/api/payment/registration/submit", {
        method: 'POST',
        headers: { 'Authorization': token },
        body: formData
      });
      
      const data = await response.json();
      
      toast.dismiss(loadingToast); 

      if (data.success) {
        toast.success("Payment submitted successfully!");
        setExistingStatus("PendingVerification"); // Instantly flip UI to pending state
      } else {
        toast.error(data.message || "Submission failed.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isFetchingFee) {
    return (
      <>
        <Navbar />
        <div className="checkout-wrapper">
          <div className="checkout-grid">
            {/* Left Column Skeleton */}
            <div className="product-summary">
              <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '8px' }}></div>
              <div className="skeleton skeleton-title" style={{ width: '70%', marginBottom: '16px' }}></div>
              <div className="skeleton skeleton-price" style={{ width: '30%', marginBottom: '32px' }}></div>
              
              <div className="features-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="feature-item" style={{ alignItems: 'center' }}>
                    <div className="skeleton skeleton-icon"></div>
                    <div style={{ flex: 1 }}>
                      <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '6px' }}></div>
                      <div className="skeleton skeleton-text" style={{ width: '90%', height: '10px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Column Skeleton */}
            <div className="payment-action-area">
              <div className="action-content">
                <div className="skeleton skeleton-title" style={{ width: '50%', marginBottom: '12px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: '32px' }}></div>
                <div className="skeleton skeleton-box" style={{ height: '160px', width: '160px', margin: '0 auto 20px', borderRadius: '8px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '40%', margin: '0 auto 40px' }}></div>
                <div className="skeleton skeleton-button"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />

      <div className="checkout-wrapper">
        <div className="checkout-grid">
          
          {/* LEFT COLUMN: PRODUCT SUMMARY */}
          <div className="product-summary">
            <div className="summary-header">
              <span className="brand-label">Kalyana Shobha</span>
              <h2>Profile Registration</h2> 
              <div className="price-tag">
                <span className="amount">{amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="features-list">
              <div className="feature-item">
                <div className="check-icon" style={{ color: '#2e7d32', display: 'flex' }}><CheckCircle size={20} /></div>
                <div className="feature-text">
                  <strong>Profile Verification</strong>
                  <p>Standard manual review of your details.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="check-icon" style={{ color: '#2e7d32', display: 'flex' }}><CheckCircle size={20} /></div>
                <div className="feature-text">
                  <strong>Platform Access</strong>
                  <p>Get access to basic dashboard features.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="check-icon" style={{ color: '#2e7d32', display: 'flex' }}><CheckCircle size={20} /></div>
                <div className="feature-text">
                  <strong>Profile Activation</strong>
                  <p>Make your profile active on our network.</p>
                </div>
              </div>
            </div>
            
            <div className="secure-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ShieldCheck size={18} /> SSL Encrypted & Secure Payment
            </div>
          </div>

          {/* RIGHT COLUMN: ACTION AREA */}
          <div className="payment-action-area">
            
            {existingStatus ? (
              // NEW VIEW: Shows if user already submitted or is already approved
              <div className="action-content fade-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                   {existingStatus === 'Success' ? <BadgeCheck size={64} color="#2e7d32" /> : <Clock size={64} color="#f57c00" />}
                </div>
                <h3 style={{ color: existingStatus === 'Success' ? '#2e7d32' : '#f57c00' }}>
                   {existingStatus === 'Success' ? 'Payment Approved' : 'Verification Pending'}
                </h3>
                <p style={{ marginTop: '15px', lineHeight: '1.6', color: '#555' }}>
                  {existingStatus === 'Success' 
                    ? 'Your membership is active. You do not need to submit another payment.' 
                    : 'You have already submitted your payment details. Our administration team is currently verifying your transaction.'}
                </p>
                <button className="stripe-btn" style={{ marginTop: '30px' }} onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </button>
              </div>
            ) : (
              // EXISTING VIEW: Shows if they haven't submitted yet (or if they were rejected)
              <>
                {step === 1 && (
                  <div className="action-content fade-in">
                    <h3>Select Payment Method</h3>
                    <p className="step-desc">
                      {isMobile ? "Pay securely via any UPI App" : "Scan QR code with your phone"}
                    </p>

                    {/* Professional Alert Box */}
                    <div style={{
                      backgroundColor: '#fff8e1', 
                      color: '#b28900', 
                      padding: '16px', 
                      borderRadius: '8px', 
                      marginBottom: '20px', 
                      fontSize: '14px', 
                      border: '1px solid #ffe57f', 
                      textAlign: 'left',
                      lineHeight: '1.5'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <AlertTriangle size={18} />
                        <strong>Important Step</strong>
                      </div>
                      After completing the payment on your app, you <b>must</b> return to this screen and click "Enter Transaction Details" to submit your UTR number and screenshot.
                    </div>
                    
                    {isMobile ? (
                      <>
                        <div className="method-box selected">
                          <div className="radio-circle"></div>
                          <span className="method-name">UPI App (GPay/PhonePe)</span>
                          <img src="https://cdn-icons-png.flaticon.com/512/2704/2704332.png" className="upi-icon" alt="UPI"/>
                        </div>
                        <button className="stripe-btn" onClick={handlePayClick}>
                          Pay {amount.toLocaleString('en-IN')} Now
                        </button>
                      </>
                    ) : (
                      <div className="qr-container">
                        <div className="qr-box">
                           <QRCode value={upiLink} size={160} />
                        </div>
                        <p className="qr-text">Scan with GPay, PhonePe, or Paytm</p>
                        <div className="divider"><span>OR</span></div>
                        <p className="manual-upi">UPI ID: <strong>8897714968@axl</strong></p>
                      </div>
                    )}

                    <div className="manual-link-area">
                      <p>Payment Completed?</p>
                      <button className="text-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }} onClick={() => setStep(2)}>
                        Enter Transaction Details <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <form onSubmit={handleSubmit} className="action-content fade-in">
                    <h3>Verify Transaction</h3>
                    <p className="step-desc">Provide proof to activate your account.</p>

                    <div className="corp-input-group">
                      <label>UTR / Reference ID</label>
                      <input 
                        type="text" 
                        value={utrNumber} 
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. 123456789012"
                      />
                    </div>

                    <div className="corp-input-group">
                      <label>Screenshot Proof</label>
                      <div className="file-drop-area">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        <span className="file-msg">
                          {screenshot ? screenshot.name : "Click to Upload Image"}
                        </span>
                      </div>
                    </div>

                    <div className="btn-group">
                      <button type="button" className="back-btn" onClick={() => setStep(1)}>Back</button>
                      <button type="submit" className="stripe-btn" disabled={loading}>
                        {loading ? "Verifying..." : "Submit Verification"}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentRegistration;
