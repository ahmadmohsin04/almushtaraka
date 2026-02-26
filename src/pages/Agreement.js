import { useState } from 'react';
import AgreementForm from '../components/AgreementForm';
import './Agreement.css';

function Agreement() {
  const [agreementType, setAgreementType] = useState(null);

  return (
    <div className="agreement-page">
      {!agreementType ? (
        <div className="type-selection">
          <h1>Create Sales Agreement</h1>
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
      ) : (
        <div className="agreement-builder">
          <button className="btn-back" onClick={() => setAgreementType(null)}>
            ← Back to Selection
          </button>
          <AgreementForm agreementType={agreementType} />
        </div>
      )}
    </div>
  );
}

export default Agreement;