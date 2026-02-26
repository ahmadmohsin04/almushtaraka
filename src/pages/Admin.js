import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Admin.css';

const ADMIN_PASSWORD = 'almushtaraka2024';

function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const fetchAgreements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('agreements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setAgreements(data);
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) fetchAgreements();
  }, [authenticated]);

  const filtered = filter === 'all'
    ? agreements
    : agreements.filter(a => a.agreement_type === filter);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  if (!authenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <div className="login-icon">🔐</div>
          <h2>Admin Access</h2>
          <p>Enter your password to continue</p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {error && <p className="login-error">{error}</p>}
          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="page">
        <div className="admin-detail-header">
          <button className="btn-back-admin" onClick={() => setSelected(null)}>← Back to All Agreements</button>
          <span className={`badge ${selected.agreement_type}`}>
            {selected.agreement_type === 'sale' ? 'Sale Agreement' : 'Lease Cum Sale'}
          </span>
        </div>

        <div className="detail-card">
          <div className="detail-section">
            <h3>Agreement Info</h3>
            <div className="detail-grid">
              <div><label>Ref Number</label><p>{selected.ref_number}</p></div>
              <div><label>Date</label><p>{selected.date}</p></div>
              <div><label>Type</label><p>{selected.agreement_type === 'sale' ? 'Sale Agreement' : 'Lease Cum Sale Agreement'}</p></div>
              <div><label>Created At</label><p>{formatDate(selected.created_at)}</p></div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Buyer Information</h3>
            <div className="detail-grid">
              <div><label>Company</label><p>{selected.buyer_company}</p></div>
              <div><label>License Number</label><p>{selected.license_number}</p></div>
              <div><label>Representative</label><p>{selected.representative_name}</p></div>
              <div><label>EID / Passport</label><p>{selected.eid}</p></div>
              <div><label>Mobile</label><p>{selected.mobile}</p></div>
            </div>
          </div>

          {selected.agreement_type === 'lease' && (
            <div className="detail-section">
              <h3>Guarantor Information</h3>
              <div className="detail-grid">
                <div><label>Name</label><p>{selected.guarantor_name}</p></div>
                <div><label>EID / Passport</label><p>{selected.guarantor_eid}</p></div>
                <div><label>Mobile</label><p>{selected.guarantor_mobile}</p></div>
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>Products</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>SR</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate (AED)</th>
                  <th>Amount (AED)</th>
                </tr>
              </thead>
              <tbody>
                {selected.products.map((p, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{p.name}</td>
                    <td>{p.qty}</td>
                    <td>{p.unit}</td>
                    <td>{parseFloat(p.rate).toFixed(2)}</td>
                    <td>{(parseFloat(p.qty) * parseFloat(p.rate)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="detail-section">
            <h3>Payment Summary</h3>
            <div className="detail-grid">
              <div><label>Subtotal</label><p>AED {parseFloat(selected.subtotal).toFixed(2)}</p></div>
              <div><label>VAT (5%)</label><p>AED {parseFloat(selected.vat).toFixed(2)}</p></div>
              <div><label>Total</label><p>AED {parseFloat(selected.total).toFixed(2)}</p></div>
              <div><label>Token Amount</label><p>AED {parseFloat(selected.token_amount).toFixed(2)}</p></div>
              <div><label>Delivery Amount</label><p>AED {parseFloat(selected.delivery_amount).toFixed(2)}</p></div>
              <div><label>Remaining Balance</label><p>AED {parseFloat(selected.remaining_balance).toFixed(2)}</p></div>
              <div><label>Installments</label><p>{selected.installment_months} months</p></div>
              <div><label>Monthly Installment</label><p>AED {parseFloat(selected.monthly_installment).toFixed(2)}</p></div>
            </div>
          </div>

          {selected.payment_schedule && selected.payment_schedule.length > 0 && (
            <div className="detail-section">
              <h3>Payment Schedule</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Period</th>
                    <th>Due Date</th>
                    <th>Amount (AED)</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.payment_schedule.map((row) => (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td>{row.label}</td>
                      <td>{row.dueDate}</td>
                      <td>{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button className="btn-logout" onClick={() => setAuthenticated(false)}>Logout</button>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>{agreements.length}</h3>
          <p>Total Agreements</p>
        </div>
        <div className="stat-card">
          <h3>{agreements.filter(a => a.agreement_type === 'sale').length}</h3>
          <p>Sale Agreements</p>
        </div>
        <div className="stat-card">
          <h3>{agreements.filter(a => a.agreement_type === 'lease').length}</h3>
          <p>Lease Agreements</p>
        </div>
        <div className="stat-card">
          <h3>AED {agreements.reduce((sum, a) => sum + parseFloat(a.total || 0), 0).toLocaleString('en', {minimumFractionDigits: 2})}</h3>
          <p>Total Value</p>
        </div>
      </div>

      <div className="admin-filters">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
        <button className={filter === 'sale' ? 'active' : ''} onClick={() => setFilter('sale')}>Sale</button>
        <button className={filter === 'lease' ? 'active' : ''} onClick={() => setFilter('lease')}>Lease</button>
      </div>

      {loading ? (
        <p className="loading-text">Loading agreements...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ref Number</th>
              <th>Type</th>
              <th>Buyer</th>
              <th>Date</th>
              <th>Total (AED)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td>{a.ref_number}</td>
                <td>
                  <span className={`badge ${a.agreement_type}`}>
                    {a.agreement_type === 'sale' ? 'Sale' : 'Lease'}
                  </span>
                </td>
                <td>{a.buyer_company}</td>
                <td>{a.date}</td>
                <td>{parseFloat(a.total).toFixed(2)}</td>
                <td>
                  <button className="btn-view" onClick={() => setSelected(a)}>View</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" style={{textAlign:'center', color:'#999'}}>No agreements found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Admin;