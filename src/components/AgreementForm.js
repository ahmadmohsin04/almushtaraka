import { useState } from 'react';
import AgreementPreview from './AgreementPreview';
import './AgreementForm.css';

const generateRefNumber = (type) => {
  const prefix = type === 'sale' ? 'SA' : 'LCS';
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}/${random}/${month}/${year}`;
};

const getMonthName = (date) => {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

function AgreementForm({ agreementType }) {
  const [formData, setFormData] = useState({
    refNumber: generateRefNumber(agreementType),
    date: new Date().toISOString().split('T')[0],
    buyerCompany: '',
    licenseNumber: '',
    representativeName: '',
    eid: '',
    mobile: '',
    guarantorName: '',
    guarantorEid: '',
    guarantorMobile: '',
    products: [{ name: '', qty: 1, unit: 'NOS', rate: '' }],
    tokenAmount: '',
    installmentMonths: '',
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...formData.products];
    updated[index][field] = value;
    setFormData({ ...formData, products: updated });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', qty: 1, unit: 'NOS', rate: '' }],
    });
  };

  const removeProduct = (index) => {
    const updated = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: updated });
  };

  // --- All calculations here, before any return ---
  const subtotal = formData.products.reduce((sum, p) => {
    return sum + (parseFloat(p.qty) * parseFloat(p.rate) || 0);
  }, 0);

  const vat = subtotal * 0.05;
  const total = subtotal + vat;
  const tokenAmount = parseFloat(formData.tokenAmount) || 0;

  // Issue #1 Fix: delivery amount is auto-calculated
  const deliveryAmount = total > 0 && tokenAmount > 0
    ? total - tokenAmount
    : 0;

  // Issue #2 Fix: remaining balance and installment calculated correctly
  const remainingBalance = total - tokenAmount;

  const monthlyInstallment =
    formData.installmentMonths > 0 && remainingBalance > 0
      ? remainingBalance / parseFloat(formData.installmentMonths)
      : 0;

const generatePaymentSchedule = () => {
  if (!formData.installmentMonths || monthlyInstallment <= 0) return [];

  const schedule = [];
  const today = new Date();

  // Automatically start from 1st of next month
  const startDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  for (let i = 0; i < parseInt(formData.installmentMonths); i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);

    const monthLabel = getMonthName(date);

    schedule.push({
      month: i + 1,
      label: monthLabel,
      amount: monthlyInstallment.toFixed(2),
      dueDate: `5th ${monthLabel}`,
    });
  }

  return schedule;
};

  const paymentSchedule = generatePaymentSchedule();

  // Issue #3 Fix: showPreview return is AFTER all calculations
  if (showPreview) {
    return (
      <AgreementPreview
        formData={formData}
        agreementType={agreementType}
        subtotal={subtotal}
        vat={vat}
        total={total}
        deliveryAmount={deliveryAmount}
        remainingBalance={remainingBalance}
        monthlyInstallment={monthlyInstallment}
        paymentSchedule={paymentSchedule}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="agreement-form">
      <div className="form-header">
        <h2>{agreementType === 'sale' ? '📄 Sale Agreement' : '📋 Lease Cum Sale Agreement'}</h2>
        <div className="ref-box">
          <span>Ref: {formData.refNumber}</span>
        </div>
      </div>

      {/* Date */}
      <div className="form-section">
        <h3>Agreement Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* Buyer Info */}
      <div className="form-section">
        <h3>Buyer Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Company Name</label>
            <input type="text" name="buyerCompany" placeholder="e.g. PAK TOWER MECHANIC" value={formData.buyerCompany} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>License Number</label>
            <input type="text" name="licenseNumber" placeholder="e.g. CN-6042889" value={formData.licenseNumber} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Representative Name</label>
            <input type="text" name="representativeName" placeholder="Full name" value={formData.representativeName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>EID / Passport Number</label>
            <input type="text" name="eid" placeholder="e.g. 784-1995-7170468-5" value={formData.eid} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input type="text" name="mobile" placeholder="e.g. +971 52 168 2976" value={formData.mobile} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* Guarantor - Lease Only */}
      {agreementType === 'lease' && (
        <div className="form-section">
          <h3>Guarantor Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Guarantor Name</label>
              <input type="text" name="guarantorName" placeholder="Full name" value={formData.guarantorName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>EID / Passport Number</label>
              <input type="text" name="guarantorEid" placeholder="EID or Passport" value={formData.guarantorEid} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="text" name="guarantorMobile" placeholder="+971 xx xxx xxxx" value={formData.guarantorMobile} onChange={handleChange} />
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div className="form-section">
        <h3>Products</h3>
        <table className="products-table">
          <thead>
            <tr>
              <th>SR</th>
              <th>Product Name</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Rate (AED)</th>
              <th>Amount (AED)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {formData.products.map((product, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <input type="text" placeholder="Product name" value={product.name}
                    onChange={(e) => handleProductChange(index, 'name', e.target.value)} />
                </td>
                <td>
                  <input type="number" min="1" value={product.qty}
                    onChange={(e) => handleProductChange(index, 'qty', e.target.value)} />
                </td>
                <td>
                  <select value={product.unit}
                    onChange={(e) => handleProductChange(index, 'unit', e.target.value)}>
                    <option>NOS</option>
                    <option>KG</option>
                    <option>MTR</option>
                    <option>SET</option>
                    <option>PCS</option>
                  </select>
                </td>
                <td>
                  <input type="number" placeholder="0.00" value={product.rate}
                    onChange={(e) => handleProductChange(index, 'rate', e.target.value)} />
                </td>
                <td className="amount-cell">
                  AED {((parseFloat(product.qty) * parseFloat(product.rate)) || 0).toFixed(2)}
                </td>
                <td>
                  {formData.products.length > 1 && (
                    <button className="btn-remove" onClick={() => removeProduct(index)}>✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn-add-product" onClick={addProduct}>+ Add Product</button>

        <div className="totals-box">
          <div className="total-row">
            <span>Subtotal (Value for VAT)</span>
            <span>AED {subtotal.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>VAT (5%)</span>
            <span>AED {vat.toFixed(2)}</span>
          </div>
          <div className="total-row total-final">
            <span>Total Amount Including VAT</span>
            <span>AED {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Terms */}
      <div className="form-section">
        <h3>Payment Terms</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Token / Booking Amount (AED)</label>
            <input type="number" name="tokenAmount" placeholder="0.00" value={formData.tokenAmount} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Amount at Delivery (AED)</label>
            <input type="text" readOnly value={total > 0 ? `AED ${deliveryAmount.toFixed(2)}` : ''} className="input-readonly" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Number of Monthly Installments</label>
            <input type="number" name="installmentMonths" placeholder="e.g. 9" value={formData.installmentMonths} onChange={handleChange} />
          </div>

        </div>

        {remainingBalance > 0 && formData.installmentMonths > 0 && (
          <div className="payment-summary">
            <div className="total-row">
              <span>Remaining Balance</span>
              <span>AED {remainingBalance.toFixed(2)}</span>
            </div>
            <div className="total-row total-final">
              <span>Monthly Installment</span>
              <span>AED {monthlyInstallment.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Payment Schedule */}
        {paymentSchedule.length > 0 && (
          <div className="payment-schedule">
            <h4>Payment Schedule</h4>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Period</th>
                  <th>Due Date</th>
                  <th>Amount (AED)</th>
                </tr>
              </thead>
              <tbody>
                {paymentSchedule.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{row.label}</td>
                    <td>{row.dueDate}</td>
                    <td>AED {row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button className="btn-preview" onClick={() => setShowPreview(true)}>
          Preview & Sign Agreement →
        </button>
      </div>
    </div>
  );
}

export default AgreementForm;