import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './AgreementPreview.css';
import sellerSignature from '../assets/seller-signature.jpg';
import { supabase } from '../supabaseClient';

function AgreementPreview({ formData, agreementType, subtotal, vat, total, remainingBalance, monthlyInstallment, paymentSchedule, onBack }) {

  const buyerSigRef = useRef(null);

  const clearSignature = (ref) => ref.current.clear();

const saveToDatabase = async () => {
  try {
    const { error } = await supabase.from('agreements').insert([
      {
        ref_number: formData.refNumber,
        agreement_type: agreementType,
        date: formData.date,
        buyer_company: formData.buyerCompany,
        license_number: formData.licenseNumber,
        representative_name: formData.representativeName,
        eid: formData.eid,
        mobile: formData.mobile,
        guarantor_name: formData.guarantorName || null,
        guarantor_eid: formData.guarantorEid || null,
        guarantor_mobile: formData.guarantorMobile || null,
        products: formData.products,
        token_amount: parseFloat(formData.tokenAmount) || 0,
        delivery_amount: remainingBalance,
        installment_months: parseInt(formData.installmentMonths) || 0,
        monthly_installment: monthlyInstallment,
        subtotal: subtotal,
        vat: vat,
        total: total,
        remaining_balance: remainingBalance,
        payment_schedule: paymentSchedule,
      }
    ]);

    if (error) {
      console.error('Error saving agreement:', error);
    } else {
      console.log('Agreement saved successfully!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
};


const generatePDF = async () => {
  const clearBtn = document.getElementById('buyer-clear-btn');
  if (clearBtn) clearBtn.style.display = 'none';

  const element = document.getElementById('agreement-preview-content');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: 794
  });

  if (clearBtn) clearBtn.style.display = 'block';

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const ratio = contentWidth / imgWidth;
  const scaledHeight = imgHeight * ratio;

  let yOffset = 0;

  while (yOffset < scaledHeight) {
    if (yOffset > 0) pdf.addPage();

    pdf.addImage(
      imgData,
      'PNG',
      margin,
      margin - yOffset,
      contentWidth,
      scaledHeight
    );

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, pageHeight - margin, pageWidth, margin + 2, 'F');
    pdf.rect(0, 0, pageWidth, margin, 'F');

    yOffset += contentHeight;
  }

  pdf.save(`Agreement-${formData.refNumber}.pdf`);

  // Save to Supabase
  await saveToDatabase();
};

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
  };

  const terms = [
    "The buyer is bound to examine the goods on arrival and in case of any discrepancy / claim regarding quality / grade of products / machinery, should be informed in writing to seller within TWO (2) working days. The failure of the buyer to comply with this rule, should be considered acceptance of product / machinery in good condition / without any fault or claim.",
    "In case of delay or failure of payment, warranty of products should be deemed as cancelled until / unless pending payments should be cleared in favour of seller.",
    "Payment of the agreement shall be made within Credit period agreed between us as per credit facility terms.",
    "The goods sold under this agreement will remain the property of M/S Almushtaraka Trading Company only. Unless and until the full payment of such goods has been settled to Almushtaraka Trading Company.",
    "If buyer fails to pay the full amount in agreed period, seller has reserve the right to take back his goods, mentioned in this sales agreement.",
    "In case of sale or transfer of business entity / ownership of goods or machinery supplied under this agreement, the BUYER is bound to inform the SELLER and settle his outstanding dues with seller."
  ];

  return (
    <div className="preview-wrapper">
      <div className="preview-actions-top">
        <button className="btn-back-preview" onClick={onBack}>← Edit Form</button>
        <button className="btn-generate-pdf" onClick={generatePDF}>⬇ Download PDF</button>
      </div>

      <div id="agreement-preview-content" className="preview-document">

        {/* Header */}
        <div className="preview-header">
          <div className="preview-header-left">
            <h1>ALMUSHTARAKA TRADING COMPANY</h1>
            <p>DIBBA INDUSTRIAL AREA</p>
          </div>
          <div className="preview-header-right">
            <div className="preview-copy-badge">
              {agreementType === 'sale' ? 'CUSTOMER COPY' : 'ORIGINAL'}
            </div>
          </div>
        </div>

        <div className="preview-title">
          <h2>{agreementType === 'sale' ? 'SALE AGREEMENT' : 'LEASE CUM SALE AGREEMENT'}</h2>
        </div>

        {/* Ref and Date */}
        <div className="preview-ref-row">
          <span><strong>REF:</strong> {formData.refNumber}</span>
          <span><strong>DATE:</strong> {formatDate(formData.date)}</span>
        </div>

        {/* Seller and Buyer */}
        <div className="preview-parties">
          <div className="preview-party">
            <p className="party-label">SELLER:-</p>
            <p><strong>ALMUSHTARAKA TRADING COMPANY</strong></p>
            <p>DIBBA INDUSTRIAL AREA</p>
            <p>Representative: ARIF MUKHTAR MALIK</p>
            <p>Partner & Manager</p>
          </div>
          <div className="preview-party">
            <p className="party-label">BUYER:-</p>
            <p><strong>{formData.buyerCompany || '___________________'}</strong></p>
            <p>License Number: {formData.licenseNumber || '___________________'}</p>
            <p>Representative: {formData.representativeName || '___________________'}</p>
            <p>ID#: {formData.eid || '___________________'}</p>
            <p>Mobile: {formData.mobile || '___________________'}</p>
          </div>
        </div>

        {/* Products Table */}
        <table className="preview-table">
          <thead>
            <tr>
              <th>SR.</th>
              <th>PRODUCTS</th>
              <th>QTY</th>
              <th>UNIT</th>
              <th>RATE / UNIT</th>
              <th>CRNCY</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {formData.products.map((p, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{p.name}</td>
                <td>{p.qty}</td>
                <td>{p.unit}</td>
                <td>{parseFloat(p.rate).toFixed(2)}</td>
                <td>AED</td>
                <td>{((parseFloat(p.qty) * parseFloat(p.rate)) || 0).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="total-row-preview">
              <td colSpan="6">VALUE FOR VAT</td>
              <td>{subtotal.toFixed(2)}</td>
            </tr>
            <tr className="total-row-preview">
              <td colSpan="5"></td>
              <td>VAT 5%</td>
              <td>{vat.toFixed(2)}</td>
            </tr>
            <tr className="total-row-final">
              <td colSpan="4"><strong>TOTAL AMOUNT INCLUDING VAT</strong></td>
              <td colSpan="12"><strong>AED {total.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>

        {/* Payment Terms */}
        <div className="preview-section">
          <p className="section-title">Payment Terms:-</p>
          <p>I- At the time of booking / Token Money, CASH AED = {formData.tokenAmount}/-</p>
          <p>II- At the time of delivery of goods, AED: {remainingBalance.toFixed(2)}/-</p>
          <p>III- Remaining balance AED {remainingBalance.toFixed(2)} to be paid in {formData.installmentMonths} monthly installments of AED {monthlyInstallment.toFixed(2)} per month.</p>
          <p>IV- Installments start from {paymentSchedule.length > 0 ? paymentSchedule[0].dueDate : ''}. Due date is 5th of each month.</p>
        </div>

        {/* Payment Schedule */}
        {paymentSchedule.length > 0 && (
          <div className="preview-section">
            <p className="section-title">Payment Schedule:-</p>
            <table className="preview-table">
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
                    <td>{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="preview-section">
          <p className="section-title">Standard Terms & Conditions:-</p>
          {terms.map((term, i) => (
            <p key={i} className="term-item">
              <strong>{String(i + 1).padStart(2, '0')}-</strong> {term}
            </p>
          ))}
        </div>

        {/* Guarantor - Lease Only */}
        {agreementType === 'lease' && (
          <div className="preview-section">
            <p className="section-title">Guarantor:-</p>
            <p>Name: {formData.guarantorName || '___________________'}</p>
            <p>EID / Passport: {formData.guarantorEid || '___________________'}</p>
            <p>Mobile: {formData.guarantorMobile || '___________________'}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="preview-signatures">
            <div className="sig-box">
            <p className="sig-label">SELLER:</p>
            <p>ARIF MUKHTAR MALIK</p>
            <p>Partner & Manager</p>
            <p className="sig-label" style={{marginTop: '10px'}}>Signature:</p>
            <img 
                src={sellerSignature} 
                alt="Seller Signature" 
                className="seller-sig-img"
            />
            </div>

          <div className="sig-box">
            <p className="sig-label">BUYER:</p>
            <p>{formData.representativeName || '___________________'}</p>
            <p>EID: {formData.eid || '___________________'}</p>
            <p className="sig-label" style={{marginTop: '10px'}}>Signature:</p>
            <SignatureCanvas
              ref={buyerSigRef}
              penColor="black"
              canvasProps={{ width: 250, height: 100, className: 'sig-canvas' }}
            />
            <button id="buyer-clear-btn" className="btn-clear-sig" onClick={() => clearSignature(buyerSigRef)}>Clear</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AgreementPreview;