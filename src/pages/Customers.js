import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Customers.css';

const ADMIN_PASSWORD = 'almushtaraka2024';

const generateCustomerId = (count) => {
  return `CUST-${String(count + 1).padStart(4, '0')}`;
};

function Customers() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list'); // list | add | edit | detail
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    representative_name: '',
    eid: '',
    license_number: '',
    mobile: '',
    id_front_url: '',
    id_back_url: '',
  });
  const [uploading, setUploading] = useState({ front: false, back: false });
  const [saving, setSaving] = useState(false);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) fetchCustomers();
  }, [authenticated]);

  const handleImageUpload = async (file, side) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [side]: true }));
    const fileExt = file.name.split('.').pop();
    const fileName = `customer-${Date.now()}-${side}.${fileExt}`;

    const { error } = await supabase.storage
      .from('customer-ids')
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert('Upload failed. Please try again.');
      setUploading(prev => ({ ...prev, [side]: false }));
      return;
    }

    const { data } = supabase.storage.from('customer-ids').getPublicUrl(fileName);
    setFormData(prev => ({
      ...prev,
      [side === 'front' ? 'id_front_url' : 'id_back_url']: data.publicUrl,
    }));
    setUploading(prev => ({ ...prev, [side]: false }));
  };

  const handleSave = async () => {
    if (!formData.company_name || !formData.representative_name) {
      alert('Company name and representative name are required.');
      return;
    }
    setSaving(true);

    if (view === 'add') {
      const customerId = generateCustomerId(customers.length);
      const { error } = await supabase.from('customers').insert([{
        ...formData,
        customer_id: customerId,
      }]);
      if (error) {
        alert('Error saving customer. Please try again.');
      } else {
        await fetchCustomers();
        setView('list');
        resetForm();
      }
    } else if (view === 'edit') {
      const { error } = await supabase.from('customers')
        .update(formData)
        .eq('id', selected.id);
      if (error) {
        alert('Error updating customer. Please try again.');
      } else {
        await fetchCustomers();
        setView('list');
        resetForm();
      }
    }
    setSaving(false);
  };

  const handleEdit = (customer) => {
    setSelected(customer);
    setFormData({
      company_name: customer.company_name || '',
      representative_name: customer.representative_name || '',
      eid: customer.eid || '',
      license_number: customer.license_number || '',
      mobile: customer.mobile || '',
      id_front_url: customer.id_front_url || '',
      id_back_url: customer.id_back_url || '',
    });
    setView('edit');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (!error) {
      await fetchCustomers();
      setView('list');
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      representative_name: '',
      eid: '',
      license_number: '',
      mobile: '',
      id_front_url: '',
      id_back_url: '',
    });
    setSelected(null);
  };

  const filtered = customers.filter(c =>
    c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.representative_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.customer_id?.toLowerCase().includes(search.toLowerCase())
  );

  // ── LOGIN ──
  if (!authenticated) {
    return (
      <div className="customers-login">
        <div className="login-card">
          <div className="login-icon">👥</div>
          <p className="login-brand">Al Mushtaraka Trading Co.</p>
          <h2>CUSTOMER MODULE</h2>
          <p>Enter your credentials to access customer records</p>
          <div className="login-input-wrapper">
            <span className="login-input-icon">🔑</span>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          {error && <p className="login-error">⚠️ {error}</p>}
          <button onClick={handleLogin}>Access Customers →</button>
        </div>
      </div>
    );
  }

  // ── ADD / EDIT FORM ──
  if (view === 'add' || view === 'edit') {
    return (
      <div className="customers-page">
        <div className="customers-header">
          <button className="btn-back-customers" onClick={() => { setView('list'); resetForm(); }}>
            ← Back to Customers
          </button>
          <h1>{view === 'add' ? 'Add New Customer' : 'Edit Customer'}</h1>
        </div>

        <div className="customer-form-card">
          <div className="customer-form-grid">
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                placeholder="e.g. PAK TOWER MECHANIC"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Representative Name *</label>
              <input
                type="text"
                placeholder="Full name"
                value={formData.representative_name}
                onChange={(e) => setFormData({ ...formData, representative_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>EID / Passport Number</label>
              <input
                type="text"
                placeholder="e.g. 784-1995-7170468-5"
                value={formData.eid}
                onChange={(e) => setFormData({ ...formData, eid: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>License Number</label>
              <input
                type="text"
                placeholder="e.g. CN-6042889"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="text"
                placeholder="e.g. +971 52 168 2976"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>
          </div>

          <div className="id-upload-section">
            <h3>ID Card Images</h3>
            <div className="id-upload-row">
              {/* Front */}
              <div className="id-upload-box">
                <label className="id-upload-label-text">ID Card — Front</label>
                <input
                  id="upload-front"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="id-file-input"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'front')}
                />
                <label htmlFor="upload-front" className="id-upload-btn">
                  {uploading.front ? '⏳ Uploading...' : formData.id_front_url ? '🔄 Change Front' : '🪪 Upload Front'}
                </label>
                {formData.id_front_url && (
                  <div className="id-preview">
                    <img src={formData.id_front_url} alt="ID Front" />
                    <span className="id-uploaded-badge">✓ Front Uploaded</span>
                  </div>
                )}
              </div>

              {/* Back */}
              <div className="id-upload-box">
                <label className="id-upload-label-text">ID Card — Back</label>
                <input
                  id="upload-back"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="id-file-input"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'back')}
                />
                <label htmlFor="upload-back" className="id-upload-btn">
                  {uploading.back ? '⏳ Uploading...' : formData.id_back_url ? '🔄 Change Back' : '🪪 Upload Back'}
                </label>
                {formData.id_back_url && (
                  <div className="id-preview">
                    <img src={formData.id_back_url} alt="ID Back" />
                    <span className="id-uploaded-badge">✓ Back Uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-cancel" onClick={() => { setView('list'); resetForm(); }}>
              Cancel
            </button>
            <button className="btn-save-customer" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : view === 'add' ? '+ Save Customer' : '✓ Update Customer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ──
  if (view === 'detail' && selected) {
    return (
      <div className="customers-page">
        <div className="customers-header">
          <button className="btn-back-customers" onClick={() => { setView('list'); setSelected(null); }}>
            ← Back to Customers
          </button>
          <div className="detail-header-actions">
            <button className="btn-edit-customer" onClick={() => handleEdit(selected)}>✏️ Edit</button>
            <button className="btn-delete-customer" onClick={() => handleDelete(selected.id)}>🗑️ Delete</button>
          </div>
        </div>

        <div className="customer-detail-card">
          <div className="customer-detail-top">
            <div className="customer-avatar">
              {selected.company_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>{selected.company_name}</h2>
              <span className="customer-id-badge">{selected.customer_id}</span>
            </div>
          </div>

          <div className="customer-detail-grid">
            <div className="detail-item">
              <label>Representative</label>
              <p>{selected.representative_name || '—'}</p>
            </div>
            <div className="detail-item">
              <label>EID / Passport</label>
              <p>{selected.eid || '—'}</p>
            </div>
            <div className="detail-item">
              <label>License Number</label>
              <p>{selected.license_number || '—'}</p>
            </div>
            <div className="detail-item">
              <label>Mobile</label>
              <p>{selected.mobile || '—'}</p>
            </div>
            <div className="detail-item">
              <label>Customer Since</label>
              <p>{new Date(selected.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          {(selected.id_front_url || selected.id_back_url) && (
            <div className="customer-id-images">
              <h3>ID Card</h3>
              <div className="id-images-row">
                {selected.id_front_url && (
                  <div className="id-image-box">
                    <span>FRONT</span>
                    <img src={selected.id_front_url} alt="ID Front" />
                  </div>
                )}
                {selected.id_back_url && (
                  <div className="id-image-box">
                    <span>BACK</span>
                    <img src={selected.id_back_url} alt="ID Back" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="customers-page">
      <div className="customers-header">
        <div>
          <h1>Customers</h1>
          <p className="customers-subtitle">{customers.length} total customers</p>
        </div>
        <button className="btn-add-customer" onClick={() => { resetForm(); setView('add'); }}>
          + Add Customer
        </button>
      </div>

      <div className="customers-search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by company, name or customer ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
      </div>

      {loading ? (
        <p className="loading-text">Loading customers...</p>
      ) : filtered.length === 0 ? (
        <div className="customers-empty">
          <div className="empty-icon">👥</div>
          <h3>{search ? 'No customers found' : 'No customers yet'}</h3>
          <p>{search ? 'Try a different search term' : 'Add your first customer to get started'}</p>
          {!search && (
            <button className="btn-add-customer" onClick={() => { resetForm(); setView('add'); }}>
              + Add First Customer
            </button>
          )}
        </div>
      ) : (
        <div className="customers-grid">
          {filtered.map((customer) => (
            <div
              className="customer-card"
              key={customer.id}
              onClick={() => { setSelected(customer); setView('detail'); }}
            >
              <div className="customer-card-top">
                <div className="customer-card-avatar">
                  {customer.company_name?.charAt(0).toUpperCase()}
                </div>
                <span className="customer-card-id">{customer.customer_id}</span>
              </div>
              <h3 className="customer-card-company">{customer.company_name}</h3>
              <p className="customer-card-rep">{customer.representative_name}</p>
              <div className="customer-card-footer">
                <span>{customer.mobile || '—'}</span>
                <span className="customer-card-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Customers;