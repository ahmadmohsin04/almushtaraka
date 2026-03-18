import { useState, useEffect } from 'react';
import AgreementForm from '../components/AgreementForm';
import './Agreement.css';
import { supabase } from '../supabaseClient';

const USERS = [
  { username: 'arif.malik', password: 'Admin@2024', name: 'Arif Malik', role: 'admin' },
  { username: 'employee1', password: 'Emp1@2024', name: 'Ahmed Khan', role: 'employee' },
  { username: 'employee2', password: 'Emp2@2024', name: 'Sara Ali', role: 'employee' },
  { username: 'employee3', password: 'Emp3@2024', name: 'Umar Farooq', role: 'employee' },
];

function Agreement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [view, setView] = useState('dashboard');
  const [agreementType, setAgreementType] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [resumeDraft, setResumeDraft] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('am_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);
useEffect(() => {
  if (currentUser) {
    fetchDrafts();
    fetchActivity();

    const interval = setInterval(() => {
      fetchActivity();
    }, 30000);

    return () => clearInterval(interval);
  }
}, [currentUser]);

  const handleLogin = () => {
    const user = USERS.find(
      u => u.username === loginData.username && u.password === loginData.password
    );
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('am_user', JSON.stringify(user));
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('am_user');
    setView('dashboard');
    setAgreementType(null);
    setResumeDraft(null);
  };

  const fetchDrafts = async () => {
    setLoadingDrafts(true);
    const { data } = await supabase
      .from('agreement_drafts')
      .select('*')
      .order('updated_at', { ascending: false });
    if (data) setDrafts(data);
    setLoadingDrafts(false);
  };

  const fetchActivity = async () => {
    const { data } = await supabase
      .from('agreement_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setActivities(data);
  };

  const logActivity = async (action, ref, details) => {
    await supabase.from('agreement_activity').insert([{
      agreement_ref: ref || null,
      action,
      performed_by: currentUser.name,
      details: details || null,
    }]);
    fetchActivity();
  };

  const saveDraft = async (formData, agreementType, draftName) => {
    const name = draftName || `Draft - ${formData.buyers[0]?.buyerCompany || 'Unnamed'} - ${new Date().toLocaleDateString()}`;
    const { error } = await supabase.from('agreement_drafts').insert([{
      draft_name: name,
      form_data: formData,
      agreement_type: agreementType,
      created_by: currentUser.name,
      updated_by: currentUser.name,
    }]);
    if (!error) {
      await logActivity('Draft Saved', formData.refNumber, `"${name}" saved by ${currentUser.name}`);
      fetchDrafts();
      alert(`Draft "${name}" saved successfully!`);
    }
  };

  const updateDraft = async (draftId, formData, agreementType) => {
    await supabase.from('agreement_drafts')
      .update({
        form_data: formData,
        agreement_type: agreementType,
        updated_by: currentUser.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', draftId);
    await logActivity('Draft Updated', formData.refNumber, `Draft updated by ${currentUser.name}`);
    fetchDrafts();
  };

  const deleteDraft = async (draftId, draftName) => {
    if (!window.confirm(`Delete draft "${draftName}"?`)) return;
    await supabase.from('agreement_drafts').delete().eq('id', draftId);
    await logActivity('Draft Deleted', null, `"${draftName}" deleted by ${currentUser.name}`);
    fetchDrafts();
  };

  const resumeDraftHandler = (draft) => {
    setResumeDraft(draft);
    setAgreementType(draft.agreement_type);
    setView('draft');
    logActivity('Draft Resumed', draft.form_data?.refNumber, `"${draft.draft_name}" resumed by ${currentUser.name}`);
  };

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const actionIcon = (action) => {
    if (action.includes('Saved')) return '💾';
    if (action.includes('Updated')) return '✏️';
    if (action.includes('Deleted')) return '🗑️';
    if (action.includes('Resumed')) return '▶️';
    if (action.includes('Completed')) return '✅';
    if (action.includes('Shared')) return '🔗';
    return '📋';
  };

  // ── LOGIN ──
  if (!currentUser) {
    return (
      <div className="agreement-login">
        <div className="login-card">
          <div className="login-logo">📄</div>
          <p className="login-brand">AL MUSHTARAKA TRADING CO.</p>
          <h2>AGREEMENT MODULE</h2>
          <p>Sign in to access the agreement system</p>
          <div className="login-field">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          {loginError && <p className="login-error">⚠️ {loginError}</p>}
          <button className="btn-login" onClick={handleLogin}>Sign In →</button>
        </div>
      </div>
    );
  }

  // ── AGREEMENT TYPE SELECTION ──
  if ((view === 'new' || view === 'draft') && !agreementType) {
    return (
      <div className="agreement-page">
        <div className="agreement-topbar">
          <button className="btn-back" onClick={() => { setView('dashboard'); setResumeDraft(null); }}>
            ← Dashboard
          </button>
          <div className="topbar-user">
            <span>👤 {currentUser.name}</span>
            <span className={`role-badge ${currentUser.role}`}>{currentUser.role}</span>
            <button className="btn-topbar-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div className="type-selection">
          <h1>Create Agreement</h1>
          <p>Please select the type of agreement you want to generate</p>
          <div className="type-cards">
            <div className="type-card" onClick={() => setAgreementType('sale')}>
              <div className="type-icon">📄</div>
              <h2>Sale Agreement</h2>
              <p>Standard sales agreement for direct purchase of goods.</p>
              <button className="btn-select">Select</button>
            </div>
            <div className="type-card" onClick={() => setAgreementType('lease')}>
              <div className="type-icon">📋</div>
              <h2>Lease Cum Sale Agreement</h2>
              <p>Lease agreement with installment payment plan and guarantor.</p>
              <button className="btn-select">Select</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── AGREEMENT FORM ──
  if ((view === 'new' || view === 'draft') && agreementType) {
    return (
      <div className="agreement-page">
        <div className="agreement-topbar">
          <button className="btn-back" onClick={() => { setView('dashboard'); setAgreementType(null); setResumeDraft(null); }}>
            ← Dashboard
          </button>
          <div className="topbar-user">
            <span>👤 {currentUser.name}</span>
            <span className={`role-badge ${currentUser.role}`}>{currentUser.role}</span>
            <button className="btn-topbar-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <AgreementForm
          agreementType={agreementType}
          currentUser={currentUser}
          initialData={resumeDraft?.form_data || null}
          draftId={resumeDraft?.id || null}
          onSaveDraft={saveDraft}
          onUpdateDraft={updateDraft}
          onLogActivity={logActivity}
        />
      </div>
    );
  }

  // ── DASHBOARD ──
  return (
    <div className="agreement-page">
      <div className="dashboard-header">
        <div>
          <h1>Agreement Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, <strong>{currentUser.name}</strong>
            <span className={`role-badge ${currentUser.role}`}>{currentUser.role}</span>
          </p>
        </div>
        <div className="dashboard-header-actions">
          <button className="btn-new-agreement" onClick={() => { setResumeDraft(null); setAgreementType(null); setView('new'); }}>
            + New Agreement
          </button>
          <button className="btn-logout-agreement" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="dashboard-grid">

        {/* Drafts */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>💾 Saved Drafts</h2>
            <span className="section-count">{drafts.length}</span>
          </div>

          {loadingDrafts ? (
            <p className="loading-text">Loading...</p>
          ) : drafts.length === 0 ? (
            <div className="empty-state">
              <p>No drafts yet. Start a new agreement and save it as a draft!</p>
            </div>
          ) : (
            <div className="drafts-list">
              {drafts.map((draft) => (
                <div className="draft-card" key={draft.id}>
                  <div className="draft-card-left">
                    <div className="draft-type-icon">
                      {draft.agreement_type === 'sale' ? '📄' : '📋'}
                    </div>
                    <div>
                      <p className="draft-name">{draft.draft_name}</p>
                      <div className="draft-meta">
                        <span className={`draft-type-badge ${draft.agreement_type}`}>
                          {draft.agreement_type === 'sale' ? 'Sale' : 'Lease'}
                        </span>
                        <span>by {draft.created_by}</span>
                        <span>{formatTimeAgo(draft.updated_at || draft.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="draft-actions">
                    <button className="btn-resume" onClick={() => resumeDraftHandler(draft)}>▶ Resume</button>
                    <button className="btn-delete-draft" onClick={() => deleteDraft(draft.id, draft.draft_name)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>📋 Activity Log</h2>
            <span className="section-count">{activities.length}</span>
          </div>

          {activities.length === 0 ? (
            <div className="empty-state"><p>No activity recorded yet.</p></div>
          ) : (
            <div className="activity-list">
              {activities.map((a) => (
                <div className="activity-item" key={a.id}>
                  <div className="activity-icon">{actionIcon(a.action)}</div>
                  <div className="activity-content">
                    <p className="activity-action">{a.action}</p>
                    {a.details && <p className="activity-details">{a.details}</p>}
                    <p className="activity-meta">
                      <strong>{a.performed_by}</strong>
                      {a.agreement_ref && <span> · {a.agreement_ref}</span>}
                      <span> · {formatTimeAgo(a.created_at)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Agreement;