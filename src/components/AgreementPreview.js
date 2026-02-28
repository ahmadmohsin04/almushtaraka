import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import './AgreementPreview.css';
import sellerSignature from '../assets/seller-signature.jpg';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.jpg';
import logoBase64 from '../assets/logo.jpg';

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
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededSpace = 10) => {
    if (y + neededSpace > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // const addText = (text, x, fontSize = 10, style = 'normal', color = [30, 43, 26]) => {
  //   pdf.setFontSize(fontSize);
  //   pdf.setFont('helvetica', style);
  //   pdf.setTextColor(...color);
  //   pdf.text(String(text), x, y);
  // };

  // const addWrappedText = (text, x, maxWidth, fontSize = 9, style = 'normal') => {
  //   pdf.setFontSize(fontSize);
  //   pdf.setFont('helvetica', style);
  //   pdf.setTextColor(30, 43, 26);
  //   const lines = pdf.splitTextToSize(String(text), maxWidth);
  //   lines.forEach(line => {
  //     checkPageBreak(6);
  //     pdf.text(line, x, y);
  //     y += 5;
  //   });
  // };

  const addLine = (color = [220, 216, 207]) => {
    checkPageBreak(5);
    pdf.setDrawColor(...color);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 4;
  };

  const addSectionTitle = (title) => {
    checkPageBreak(12);
    y += 3;
    pdf.setFillColor(28, 43, 26);
    pdf.rect(margin, y - 4, contentWidth, 8, 'F');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(245, 236, 215);
    pdf.text(title, margin + 3, y + 1);
    y += 8;
  };

  // ── LOGO + HEADER ──
try {
  pdf.addImage(logoBase64, 'JPEG', margin, y, 18, 18);
} catch (e) {
  console.log('Logo error:', e);
}

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(28, 43, 26);
  pdf.text('AL MUSHTARAKA TRADING COMPANY', margin + 22, y + 6);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('DIBBA INDUSTRIAL AREA, UAE', margin + 22, y + 12);

  // Badge
const badgeText = agreementType === 'sale' ? 'CUSTOMER COPY' : 'CUSTOMER COPY';
const badgeWidth = 40;
const badgeX = pageWidth - margin - badgeWidth;
pdf.setFillColor(200, 169, 110);
pdf.roundedRect(badgeX, y, badgeWidth, 10, 2, 2, 'F');
pdf.setFontSize(11);
pdf.setFont('helvetica', 'bold');
pdf.setTextColor(28, 43, 26);
pdf.text(badgeText, badgeX + badgeWidth / 2, y + 6.5, { align: 'center' });

  y += 22;

  // Title
  pdf.setFillColor(28, 43, 26);
  pdf.rect(margin, y, contentWidth, 10, 'F');
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(245, 236, 215);
  const title = agreementType === 'sale' ? 'SALE AGREEMENT' : 'LEASE CUM SALE AGREEMENT';
  pdf.text(title, pageWidth / 2, y + 7, { align: 'center' });
  y += 14;

  // Ref + Date
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(30, 43, 26);
  pdf.text(`REF: ${formData.refNumber}`, margin, y);
  pdf.text(`DATE: ${formatDate(formData.date)}`, pageWidth - margin, y, { align: 'right' });
  y += 8;

  addLine();

  // ── SELLER & BUYER ──
  addSectionTitle('PARTIES');
  y += 2;

  const col1 = margin;
  const col2 = pageWidth / 2 + 5;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(200, 169, 110);
  pdf.text('SELLER:-', col1, y);
  pdf.text('BUYER:-', col2, y);
  y += 5;

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 43, 26);
  pdf.text('ALMUSHTARAKA TRADING COMPANY', col1, y);
  pdf.text(formData.buyerCompany || '___________________', col2, y);
  y += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);
  pdf.text('DIBBA INDUSTRIAL AREA', col1, y);
  pdf.text(`License: ${formData.licenseNumber || '___________________'}`, col2, y);
  y += 5;
  pdf.text('Representative: ARIF MUKHTAR MALIK', col1, y);
  pdf.text(`Rep: ${formData.representativeName || '___________________'}`, col2, y);
  y += 5;
  pdf.text('Partner & Manager', col1, y);
  pdf.text(`EID: ${formData.eid || '___________________'}`, col2, y);
  y += 5;
  pdf.text('', col1, y);
  pdf.text(`Mobile: ${formData.mobile || '___________________'}`, col2, y);
  y += 8;

  // ── GUARANTOR (lease only) ──
  if (agreementType === 'lease') {
    addSectionTitle('GUARANTOR');
    y += 2;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Name: ${formData.guarantorName || '___________________'}`, margin, y);
    y += 5;
    pdf.text(`EID / Passport: ${formData.guarantorEid || '___________________'}`, margin, y);
    y += 5;
    pdf.text(`Mobile: ${formData.guarantorMobile || '___________________'}`, margin, y);
    y += 8;
  }

  // ── PRODUCTS TABLE ──
  addSectionTitle('PRODUCTS');
  y += 2;

  const colWidths = [10, 65, 15, 15, 25, 15, 25];
  const colX = colWidths.reduce((acc, w, i) => {
    acc.push(i === 0 ? margin : acc[i - 1] + colWidths[i - 1]);
    return acc;
  }, []);
  const headers = ['SR', 'PRODUCT', 'QTY', 'UNIT', 'RATE', 'CRNCY', 'AMOUNT'];

  pdf.setFillColor(45, 74, 42);
  pdf.rect(margin, y - 4, contentWidth, 8, 'F');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(245, 236, 215);
  headers.forEach((h, i) => pdf.text(h, colX[i] + 1, y + 1));
  y += 7;

  formData.products.forEach((p, i) => {
    checkPageBreak(8);
    if (i % 2 === 0) {
      pdf.setFillColor(247, 244, 239);
      pdf.rect(margin, y - 4, contentWidth, 7, 'F');
    }
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(30, 43, 26);
    const amount = (parseFloat(p.qty) * parseFloat(p.rate) || 0).toFixed(2);
    const rowData = [String(i + 1), p.name, String(p.qty), p.unit, parseFloat(p.rate).toFixed(2), 'AED', amount];
    rowData.forEach((d, j) => pdf.text(String(d), colX[j] + 1, y));
    y += 7;
  });

  checkPageBreak(8);
  pdf.setFillColor(245, 236, 215);
  pdf.rect(margin, y - 4, contentWidth, 7, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 43, 26);
  pdf.text('VALUE FOR VAT', colX[1] + 1, y);
  pdf.text(subtotal.toFixed(2), colX[6] + 1, y);
  y += 7;

  checkPageBreak(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('VAT 5%', colX[5] + 1, y);
  pdf.text(vat.toFixed(2), colX[6] + 1, y);
  y += 7;

checkPageBreak(8);
pdf.setFillColor(28, 43, 26);
pdf.rect(margin, y - 4, contentWidth, 8, 'F');
pdf.setFont('helvetica', 'bold');
pdf.setTextColor(245, 236, 215);
pdf.text('TOTAL AMOUNT INCLUDING VAT', margin + 3, y + 1);
pdf.text(`AED ${total.toFixed(2)}`, colX[6] + 1, y + 1);
y += 12;

  // ── PAYMENT TERMS ──
  addSectionTitle('PAYMENT TERMS');
  y += 2;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);

  const paymentLines = [
    `I-   At the time of booking / Token Money, CASH AED = ${formData.tokenAmount}/-`,
    `II-  At the time of delivery of goods, AED: ${remainingBalance.toFixed(2)}/-`,
    `III- Remaining balance AED ${remainingBalance.toFixed(2)} to be paid in ${formData.installmentMonths} monthly installments of AED ${monthlyInstallment.toFixed(2)} per month.`,
    `IV-  Installments start from ${paymentSchedule.length > 0 ? paymentSchedule[0].dueDate : ''}. Due date is 5th of each month.`,
  ];

  paymentLines.forEach(line => {
    const lines = pdf.splitTextToSize(line, contentWidth);
    lines.forEach(l => {
      checkPageBreak(6);
      pdf.text(l, margin, y);
      y += 5;
    });
    y += 1;
  });

  y += 3;

  // ── PAYMENT SCHEDULE ──
  if (paymentSchedule.length > 0) {
    addSectionTitle('PAYMENT SCHEDULE');
    y += 2;

    const schedColX = [margin, margin + 20, margin + 70, margin + 120];
    pdf.setFillColor(45, 74, 42);
    pdf.rect(margin, y - 4, contentWidth, 8, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(245, 236, 215);
    ['MONTH', 'PERIOD', 'DUE DATE', 'AMOUNT (AED)'].forEach((h, i) => pdf.text(h, schedColX[i] + 1, y + 1));
    y += 7;

    paymentSchedule.forEach((row, i) => {
      checkPageBreak(8);
      if (i % 2 === 0) {
        pdf.setFillColor(247, 244, 239);
        pdf.rect(margin, y - 4, contentWidth, 7, 'F');
      }
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 43, 26);
      [String(row.month), row.label, row.dueDate, `AED ${row.amount}`].forEach((d, j) => {
        pdf.text(d, schedColX[j] + 1, y);
      });
      y += 7;
    });
    y += 5;
  }

  // ── TERMS & CONDITIONS ──
  addSectionTitle('STANDARD TERMS & CONDITIONS');
  y += 3;

  const terms = [
    "01- The buyer is bound to examine the goods on arrival and in case of any discrepancy / claim regarding quality / grade of products / machinery, should be informed in writing to seller within TWO (2) working days. The failure of the buyer to comply with this rule, should be considered acceptance of product / machinery in good condition / without any fault or claim.",
    "02- In case of delay or failure of payment, warranty of products should be deemed as cancelled until / unless pending payments should be cleared in favour of seller.",
    "03- Payment of the agreement shall be made within Credit period agreed between us as per credit facility terms.",
    "04- The goods sold under this agreement will remain the property of M/S Almushtaraka Trading Company only. Unless and until the full payment of such goods has been settled to Almushtaraka Trading Company.",
    "05- If buyer fails to pay the full amount in agreed period, seller has the right to take back his goods, mentioned in this sales agreement.",
    "06- In case of sale or transfer of business entity / ownership of goods or machinery supplied under this agreement, the BUYER is bound to inform the SELLER and settle his outstanding dues with seller.",
  ];

  terms.forEach(term => {
    const lines = pdf.splitTextToSize(term, contentWidth);
    lines.forEach(l => {
      checkPageBreak(6);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(l, margin, y);
      y += 5;
    });
    y += 2;
  });

  // ── SIGNATURES ──
  checkPageBreak(60);
  y += 5;
  addLine([200, 169, 110]);
  addSectionTitle('SIGNATURES');
  y += 5;

const sig1X = margin;
const sig2X = pageWidth - margin - 60;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(200, 169, 110);
  pdf.text('SELLER:', sig1X, y);
  pdf.text('BUYER:', sig2X, y);
  y += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(30, 43, 26);
  pdf.text('ARIF MUKHTAR MALIK', sig1X, y);
  pdf.text(formData.representativeName || '___________________', sig2X, y);
  y += 5;
  pdf.setTextColor(100, 100, 100);
  pdf.text('Partner & Manager', sig1X, y);
  pdf.text(`EID: ${formData.eid || '___________________'}`, sig2X, y);
  y += 10;

  // Seller signature image
  try {
    const sellerSigData = require('../assets/seller-signature.jpg');
    pdf.addImage(sellerSigData, 'JPEG', sig1X, y, 50, 20);
  } catch (e) {}

  // Buyer signature
  if (buyerSigRef.current && !buyerSigRef.current.isEmpty()) {
    const buyerSigData = buyerSigRef.current.toDataURL('image/png');
    pdf.addImage(buyerSigData, 'PNG', sig2X, y, 55, 20);  
}

  y += 25;
  pdf.setDrawColor(200, 169, 110);
  pdf.line(sig1X, y, sig1X + 55, y);
  pdf.line(sig2X, y, sig2X + 55, y);
  y += 4;
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Authorized Signature', sig1X, y);
  pdf.text('Buyer Signature', sig2X, y);

  pdf.save(`Agreement-${formData.refNumber}.pdf`);

  // Save to database
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
            <img src={logo} alt="Al Mushtaraka Logo" className="agreement-logo" />
            <div>
              <h1>ALMUSHTARAKA TRADING COMPANY</h1>
              <p>DIBBA INDUSTRIAL AREA</p>
            </div>
          </div>
          <div className="preview-header-right">
          <div className="preview-copy-badge">
            ORIGINAL
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