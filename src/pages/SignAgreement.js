import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from '../supabaseClient';
import './SignAgreement.css';
import logoBase64 from '../assets/logo.jpg';

function SignAgreement() {
  const { token } = useParams();
  console.log('SignAgreement mounted, token:', token);
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('review'); // review | sign | done
  const [buyerIndex, setBuyerIndex] = useState(0);
  const [signatures, setSignatures] = useState({});
  const [photos, setPhotos] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const sigRef = useRef(null);

  useEffect(() => {
    const fetchRecord = async () => {
      const { data, error } = await supabase
        .from('agreement_signatures')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) {
        setError('This link is invalid or has expired.');
      } else if (data.status === 'completed') {
        setError('This agreement has already been signed.');
      } else {
        setRecord(data);
      }
      setLoading(false);
    };
    fetchRecord();
  }, [token]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraActive(true);
      setTimeout(() => {
        const video = document.getElementById('sign-camera-video');
        if (video) video.srcObject = stream;
      }, 100);
    } catch (err) {
      alert('Could not access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    const video = document.getElementById('sign-camera-video');
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById('sign-camera-video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setPhotos(prev => ({ ...prev, [buyerIndex]: dataUrl }));
    stopCamera();
  };

  const saveSignature = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert('Please sign before continuing.');
      return;
    }
    const dataUrl = sigRef.current.toDataURL('image/png');
    setSignatures(prev => ({ ...prev, [buyerIndex]: dataUrl }));

    const buyers = record.agreement_data.buyers;
    if (buyerIndex < buyers.length - 1) {
      setBuyerIndex(buyerIndex + 1);
      setTimeout(() => sigRef.current?.clear(), 100);
    } else {
      setStep('confirm');
    }
  };

const handleSubmit = async () => {
  setSubmitting(true);

  const { error } = await supabase
    .from('agreement_signatures')
    .update({
      signatures,
      photos,
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('token', token);

  if (error) {
    alert('Submission failed. Please try again.');
    setSubmitting(false);
    return;
  }

  // Log activity so staff gets notified
  const refNumber = record.agreement_data?.refNumber;
  await supabase.from('agreement_activity').insert([{
    agreement_ref: refNumber || null,
    action: 'Agreement Signed Remotely',
    performed_by: buyers.map(b => b.representativeName).join(', '),
    details: `All buyers have signed remotely. Please download the PDF for ref: ${refNumber}`,
  }]);

  setStep('done');
  setSubmitting(false);
};

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric'
    }).toUpperCase();
  };

  if (loading) {
    return (
      <div className="sign-loading">
        <div className="sign-spinner"></div>
        <p>Loading agreement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sign-error-page">
        <div className="sign-error-card">
          <div className="sign-error-icon">⚠️</div>
          <h2>Link Unavailable</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const { agreement_data: data, agreement_type } = record;
  const buyers = data.buyers || [];
  const cur = data.currency || 'AED';

  // ── DONE ──
  if (step === 'done') {
    return (
      <div className="sign-done-page">
        <div className="sign-done-card">
          <div className="sign-done-icon">✅</div>
          <h2>Agreement Signed!</h2>
          <p>Thank you. Your signatures have been submitted successfully.</p>
          <p className="sign-done-ref">Ref: <strong>{data.refNumber}</strong></p>
        </div>
      </div>
    );
  }

  // ── CONFIRM ──
  if (step === 'confirm') {
    return (
      <div className="sign-page">
        <div className="sign-header">
          <img src={logoBase64} alt="Logo" className="sign-logo" />
          <div>
            <h1>AL MUSHTARAKA TRADING CO.</h1>
            <p>Review & Submit</p>
          </div>
        </div>

        <div className="sign-confirm-card">
          <h2>Ready to Submit</h2>
          <p>All signatures have been collected. Please review before submitting.</p>

          <div className="sign-confirm-sigs">
            {buyers.map((buyer, i) => (
              <div className="sign-confirm-item" key={i}>
                <p className="sign-confirm-name">{buyer.representativeName || `Buyer ${i + 1}`}</p>
                <div className="sign-confirm-row">
                  {signatures[i] && (
                    <div className="sign-confirm-box">
                      <span>Signature</span>
                      <img src={signatures[i]} alt="Signature" />
                    </div>
                  )}
                  {photos[i] && (
                    <div className="sign-confirm-box">
                      <span>Photo</span>
                      <img src={photos[i]} alt={`Captured verification`} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="sign-confirm-actions">
            <button className="btn-sign-back" onClick={() => { setBuyerIndex(buyers.length - 1); setStep('sign'); }}>
              ← Go Back
            </button>
            <button className="btn-sign-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : '✓ Submit Signatures'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SIGN ──
  if (step === 'sign') {
    const buyer = buyers[buyerIndex];
    return (
      <div className="sign-page">
        <div className="sign-header">
          <img src={logoBase64} alt="Logo" className="sign-logo" />
          <div>
            <h1>AL MUSHTARAKA TRADING CO.</h1>
            <p>{agreement_type === 'sale' ? 'Sale Agreement' : 'Lease Cum Sale Agreement'}</p>
          </div>
        </div>

        <div className="sign-progress">
          {buyers.map((_, i) => (
            <div key={i} className={`sign-progress-step ${i === buyerIndex ? 'active' : ''} ${i < buyerIndex ? 'done' : ''}`}>
              {i < buyerIndex ? '✓' : i + 1}
            </div>
          ))}
        </div>

        <div className="sign-card">
          <div className="sign-buyer-info">
            <h2>{buyers.length > 1 ? `Buyer ${buyerIndex + 1}` : 'Buyer'}</h2>
            <p className="sign-buyer-name">{buyer.representativeName}</p>
            <p className="sign-buyer-company">{buyer.buyerCompany}</p>
          </div>

          {/* Photo */}
          <div className="sign-section">
            <h3>📷 Live Photo</h3>
            <p className="sign-section-hint">Take a live photo for verification</p>
            {!photos[buyerIndex] && !cameraActive && (
              <button className="btn-sign-camera" onClick={startCamera}>
                📷 Open Camera
              </button>
            )}
            {cameraActive && (
              <div className="sign-camera-wrap">
                <video id="sign-camera-video" autoPlay playsInline className="sign-camera-video" />
                <div className="sign-camera-btns">
                  <button className="btn-sign-capture" onClick={capturePhoto}>⚪ Capture</button>
                  <button className="btn-sign-cancel" onClick={stopCamera}>✕ Cancel</button>
                </div>
              </div>
            )}
            {photos[buyerIndex] && (
              <div className="sign-photo-preview">
                <img src={photos[buyerIndex]} alt="Captured" />
                <button className="btn-sign-retake" onClick={() => {
                  setPhotos(prev => { const u = { ...prev }; delete u[buyerIndex]; return u; });
                  startCamera();
                }}>🔄 Retake</button>
              </div>
            )}
          </div>

          {/* Signature */}
          <div className="sign-section">
            <h3>✍️ Signature</h3>
            <p className="sign-section-hint">Sign in the box below</p>
            <div className="sign-canvas-wrap">
              <SignatureCanvas
                ref={sigRef}
                penColor="#1C2B1A"
                canvasProps={{ className: 'sign-canvas' }}
              />
            </div>
            <button className="btn-sign-clear" onClick={() => sigRef.current?.clear()}>
              Clear Signature
            </button>
          </div>

          <button className="btn-sign-next" onClick={saveSignature}>
            {buyerIndex < buyers.length - 1 ? `Next: Buyer ${buyerIndex + 2} →` : 'Review & Submit →'}
          </button>
        </div>
      </div>
    );
  }

  // ── REVIEW ──
  return (
    <div className="sign-page">
      <div className="sign-header">
        <img src={logoBase64} alt="Logo" className="sign-logo" />
        <div>
          <h1>AL MUSHTARAKA TRADING CO.</h1>
          <p>{agreement_type === 'sale' ? 'Sale Agreement' : 'Lease Cum Sale Agreement'}</p>
        </div>
      </div>

      <div className="sign-review-banner">
        <span>📋</span>
        <div>
          <p>Please review the agreement below, then proceed to sign.</p>
          <p className="sign-review-ref">Ref: <strong>{data.refNumber}</strong> · Date: {formatDate(data.date)}</p>
        </div>
      </div>

      <div className="sign-document">

        {/* Parties */}
        <div className="sign-doc-section">
          <h3>PARTIES</h3>
          <div className="sign-parties-grid">
            <div className="sign-party">
              <p className="sign-party-label">SELLER</p>
              <p><strong>ALMUSHTARAKA TRADING COMPANY</strong></p>
              <p>DIBBA INDUSTRIAL AREA</p>
              <p>Representative: ARIF MUKHTAR MALIK</p>
            </div>
            {buyers.map((buyer, i) => (
              <div className="sign-party" key={i}>
                <p className="sign-party-label">{buyers.length > 1 ? `BUYER ${i + 1}` : 'BUYER'}</p>
                <p><strong>{buyer.buyerCompany}</strong></p>
                {i === 0 && buyer.licenseNumber && <p>License: {buyer.licenseNumber}</p>}
                <p>Rep: {buyer.representativeName}</p>
                <p>EID: {buyer.eid}</p>
                <p>Mobile: {buyer.mobile}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="sign-doc-section">
          <h3>PRODUCTS</h3>
          <table className="sign-table">
            <thead>
              <tr>
                <th>SR</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.products?.map((p, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.qty}</td>
                  <td>{p.unit}</td>
                  <td>{parseFloat(p.rate).toFixed(2)}</td>
                  <td>{(parseFloat(p.qty) * parseFloat(p.rate) || 0).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="sign-total-row">
                <td colSpan="5">TOTAL INCLUDING VAT</td>
                <td><strong>{cur} {parseFloat(record.agreement_data.total || 0).toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Terms */}
        <div className="sign-doc-section">
          <h3>PAYMENT TERMS</h3>
          <p>I- Token: {cur} {data.tokenAmount}</p>
          <p>II- At delivery: {cur} {parseFloat(data.deliveryAmount || 0).toFixed(2)}</p>
          <p>III- Remaining {cur} {parseFloat(record.agreement_data.remainingBalance || 0).toFixed(2)} in {data.installmentMonths} installments</p>
        </div>

        {/* Terms */}
        <div className="sign-doc-section">
          <h3>STANDARD TERMS & CONDITIONS</h3>
          {[
            "The buyer is bound to examine the goods on arrival. Claims must be made within TWO (2) working days.",
            "In case of delay or failure of payment, warranty shall be cancelled until payments are cleared.",
            "Payment shall be made within the agreed credit period.",
            "Goods remain the property of Almushtaraka Trading Company until full payment is made.",
            "If buyer fails to pay in agreed period, seller reserves the right to take back the goods.",
            "In case of sale or transfer of business, buyer must inform seller and settle outstanding dues.",
          ].map((term, i) => (
            <p key={i} className="sign-term">{String(i + 1).padStart(2, '0')}. {term}</p>
          ))}
        </div>

      </div>

      <div className="sign-proceed-bar">
        <p>By proceeding, you confirm that you have read and understood this agreement.</p>
        <button className="btn-sign-proceed" onClick={() => setStep('sign')}>
          Proceed to Sign →
        </button>
      </div>
    </div>
  );
}

export default SignAgreement;