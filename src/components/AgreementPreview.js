import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import './AgreementPreview.css';
import sellerSignature from '../assets/seller-signature.jpg';
import { supabase } from '../supabaseClient';
import logoBase64 from '../assets/logo.jpg';

function AgreementPreview({ formData, agreementType, subtotal, vat, total, deliveryAmount, remainingBalance, monthlyInstallment, paymentSchedule,extraPaymentTerms, extraStandardTerms, onBack }) {

  const buyerSigRef = useRef([]);
  const isGenerating = useRef(false);

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

  const saveToDatabase = async () => {
    try {
      const { error } = await supabase.from('agreements').insert([
        {
          ref_number: formData.refNumber,
          agreement_type: agreementType,
          date: formData.date,
          buyer_company: formData.buyers[0]?.buyerCompany || '',
          license_number: formData.buyers[0]?.licenseNumber || '',
          representative_name: formData.buyers[0]?.representativeName || '',
          eid: formData.buyers[0]?.eid || '',
          mobile: formData.buyers[0]?.mobile || '',
          buyers: formData.buyers,
          guarantor_name: formData.guarantorName || null,
          guarantor_eid: formData.guarantorEid || null,
          guarantor_mobile: formData.guarantorMobile || null,
          products: formData.products,
          token_amount: parseFloat(formData.tokenAmount) || 0,
          delivery_amount: deliveryAmount,
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
    if (isGenerating.current) return;  // ADD THIS
      isGenerating.current = true;       // ADD THIS
    const clearBtns = document.querySelectorAll('.hide-on-pdf');
    clearBtns.forEach(btn => btn.style.display = 'none');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

let currentPage = 1;
let signaturesStarted = false;

const checkPageBreak = (neededSpace = 10) => {
  const bottomLimit = signaturesStarted 
    ? pageHeight - margin
    : pageHeight - 38;  // matches footerY - a little buffer

  if (y + neededSpace > bottomLimit) {
    if (!signaturesStarted) {
      drawFooterSignatures(currentPage);
    }
    pdf.addPage();
    currentPage++;
    y = margin;
  }
};

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

const drawFooterSignatures = (pageNum) => {
  const footerY = pageHeight - 35;  // absolute from bottom, not relative to margin
  const buyers = formData.buyers;
  const slotWidth = contentWidth / buyers.length;
  // Gold divider line
  pdf.setDrawColor(200, 169, 110);
  pdf.setLineWidth(0.4);
  pdf.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
  pdf.setLineWidth(0.2);

  // "BUYER INITIALS" label on left
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(200, 169, 110);
  pdf.text('BUYER INITIALS', margin, footerY - 1);

  // Page number on right
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(180, 180, 180);
  pdf.text(`Page ${pageNum}`, pageWidth - margin, footerY - 1, { align: 'right' });

  buyers.forEach((buyer, index) => {
    const slotCenterX = margin + (index * slotWidth) + slotWidth / 2;
    const sigX = margin + (index * slotWidth) + 4;

// Buyer label - left aligned
pdf.setFontSize(7);
pdf.setFont('helvetica', 'bold');
pdf.setTextColor(28, 43, 26);
pdf.text(buyers.length > 1 ? `BUYER ${index + 1}:` : 'BUYER:', sigX, footerY + 4);

// Buyer name - left aligned
pdf.setFont('helvetica', 'normal');
pdf.setTextColor(100, 100, 100);
pdf.text(buyer.representativeName || '_______________', sigX, footerY + 8);

    // Signature image - centered
    const ref = buyerSigRef.current[index];
    if (ref && !ref.isEmpty()) {
      const sigImgWidth = 28;
      pdf.addImage(ref.toDataURL('image/png'), 'PNG', slotCenterX - sigImgWidth / 2, footerY + 10, sigImgWidth, 10);
    }

    // Signature line - centered
    pdf.setDrawColor(200, 169, 110);
    const lineHalf = (slotWidth - 10) / 2;
    pdf.line(slotCenterX - lineHalf, footerY + 21, slotCenterX + lineHalf, footerY + 21);

    // Vertical divider between buyers
    if (index < buyers.length - 1) {
      pdf.setDrawColor(220, 216, 207);
      pdf.line(margin + (index + 1) * slotWidth, footerY - 4, margin + (index + 1) * slotWidth, footerY + 22);
    }
  });
};

    // ── LOGO + HEADER ──
    try {
      pdf.addImage(logoBase64, 'JPEG', margin, y, 18, 18);
    } catch (e) {}

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(28, 43, 26);
    pdf.text('AL MUSHTARAKA TRADING COMPANY', margin + 22, y + 6);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('DIBBA INDUSTRIAL AREA, UAE', margin + 22, y + 12);

    const badgeText = 'CUSTOMER COPY';
    const badgeWidth = 40;
    const badgeX = pageWidth - margin - badgeWidth;
    pdf.setFillColor(200, 169, 110);
    pdf.roundedRect(badgeX, y, badgeWidth, 10, 2, 2, 'F');
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(28, 43, 26);
    pdf.text(badgeText, badgeX + badgeWidth / 2, y + 6.5, { align: 'center' });

    y += 22;

    pdf.setFillColor(28, 43, 26);
    pdf.rect(margin, y, contentWidth, 10, 'F');
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(245, 236, 215);
    const title = agreementType === 'sale' ? 'SALE AGREEMENT' : 'LEASE CUM SALE AGREEMENT';
    pdf.text(title, pageWidth / 2, y + 7, { align: 'center' });
    y += 14;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(30, 43, 26);
    pdf.text(`REF: ${formData.refNumber}`, margin, y);
    pdf.text(`DATE: ${formatDate(formData.date)}`, pageWidth - margin, y, { align: 'right' });
    y += 8;

    addLine();

    // ── SELLER & BUYERS ──
    addSectionTitle('PARTIES');
    y += 2;

    const col1 = margin;
    const col2 = pageWidth - margin; // right-aligned anchor

    // Seller (left) + Buyer 1 (right) in same row
    const sellerStartY = y;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(200, 169, 110);
    // Border around seller block
// Border around seller block
pdf.setDrawColor(28, 43, 26);
pdf.setLineWidth(0.25);
pdf.roundedRect(col1 - 2, sellerStartY - 3, (pageWidth / 2) - 40, 28, 2, 2, 'S');
pdf.setLineWidth(0.2);
    y +=1;
    pdf.text('SELLER:-', col1, y);
    y += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 43, 26);
    pdf.text('ALMUSHTARAKA TRADING COMPANY', col1, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text('DIBBA INDUSTRIAL AREA', col1, y);
    y += 5;
    pdf.text('Representative: ARIF MUKHTAR MALIK', col1, y);
    y += 5;
    pdf.text('Partner & Manager', col1, y);

    const firstBuyer = formData.buyers[0];
    let buyerRowY = sellerStartY;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(200, 169, 110);
    pdf.text(formData.buyers.length > 1 ? 'BUYER 1:-' : 'BUYER:-', col2, buyerRowY, { align: 'right' });
    buyerRowY += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 43, 26);
    pdf.text(firstBuyer.buyerCompany || '___________________', col2, buyerRowY, { align: 'right' });
    buyerRowY += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(`License: ${firstBuyer.licenseNumber || '___________________'}`, col2, buyerRowY, { align: 'right' });
    buyerRowY += 5;
    pdf.text(`Rep: ${firstBuyer.representativeName || '___________________'}`, col2, buyerRowY, { align: 'right' });
    buyerRowY += 5;
    pdf.text(`EID: ${firstBuyer.eid || '___________________'}`, col2, buyerRowY, { align: 'right' });
    buyerRowY += 5;
    pdf.text(`Mobile: ${firstBuyer.mobile || '___________________'}`, col2, buyerRowY, { align: 'right' });

    y = Math.max(y, buyerRowY) + 8;

    // Remaining buyers in pairs: left col1, right col2
    const remainingBuyers = formData.buyers.slice(1);
    for (let i = 0; i < remainingBuyers.length; i += 2) {
      checkPageBreak(35);
      const leftBuyer = remainingBuyers[i];
      const rightBuyer = remainingBuyers[i + 1];
      const pairStartY = y;
      let leftY = pairStartY;
      let rightY = pairStartY;

      // Left buyer
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(200, 169, 110);
      pdf.text(`BUYER ${i + 2}:-`, col1, leftY);
      leftY += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 43, 26);
      pdf.text(leftBuyer.buyerCompany || '___________________', col1, leftY);
      leftY += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Rep: ${leftBuyer.representativeName || '___________________'}`, col1, leftY);
      leftY += 5;
      pdf.text(`EID: ${leftBuyer.eid || '___________________'}`, col1, leftY);
      leftY += 5;
      pdf.text(`Mobile: ${leftBuyer.mobile || '___________________'}`, col1, leftY);

      // Right buyer
      if (rightBuyer) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(200, 169, 110);
        pdf.text(`BUYER ${i + 3}:-`, col2, rightY, { align: 'right' });
        rightY += 5;
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 43, 26);
        pdf.text(rightBuyer.buyerCompany || '___________________', col2, rightY, { align: 'right' });
        rightY += 5;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text(`Rep: ${rightBuyer.representativeName || '___________________'}`, col2, rightY, { align: 'right' });
        rightY += 5;
        pdf.text(`EID: ${rightBuyer.eid || '___________________'}`, col2, rightY, { align: 'right' });
        rightY += 5;
        pdf.text(`Mobile: ${rightBuyer.mobile || '___________________'}`, col2, rightY, { align: 'right' });
      }

      y = Math.max(leftY, rightY) + 8;
    }

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

    pdf.setFillColor(45, 74, 42);
    pdf.rect(margin, y - 4, contentWidth, 8, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(245, 236, 215);
    ['SR', 'PRODUCT', 'QTY', 'UNIT', 'RATE', 'CRNCY', 'AMOUNT'].forEach((h, i) => pdf.text(h, colX[i] + 1, y + 1));
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
      [String(i + 1), p.name, String(p.qty), p.unit, parseFloat(p.rate).toFixed(2), 'AED', amount]
        .forEach((d, j) => pdf.text(String(d), colX[j] + 1, y));
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

    [
      `I-   At the time of booking / Token Money, CASH AED = ${formData.tokenAmount}/-`,
      `II-  At the time of delivery of goods, AED: ${deliveryAmount.toFixed(2)}/-`,
      `III- Remaining balance AED ${remainingBalance.toFixed(2)} to be paid in ${formData.installmentMonths} monthly installments of AED ${monthlyInstallment.toFixed(2)} per month.`,
      `IV-  Installments start from ${paymentSchedule.length > 0 ? paymentSchedule[0].dueDate : ''}. Due date is 5th of each month.`,
    ].forEach(line => {
      pdf.splitTextToSize(line, contentWidth).forEach(l => {
        checkPageBreak(6);
        pdf.text(l, margin, y);
        y += 5;
      });
    });

    // Extra payment terms
if (extraPaymentTerms && extraPaymentTerms.length > 0) {
  const romans = ['V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  extraPaymentTerms.filter(t => t.trim()).forEach((term, index) => {
    pdf.splitTextToSize(`${romans[index]}- ${term}`, contentWidth).forEach(l => {
      checkPageBreak(6);
      pdf.text(l, margin, y);
      y += 5;
    });
  });
}

// ── PAYMENT SCHEDULE ──
if (paymentSchedule.length > 0) {
  addSectionTitle('PAYMENT SCHEDULE');
  y += 2;

  const schedColX = [margin, margin + 20, margin + 70, margin + 120];
  
  // Draw table header
  checkPageBreak(15);
  pdf.setFillColor(45, 74, 42);
  pdf.rect(margin, y - 4, contentWidth, 8, 'F');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(245, 236, 215);
  ['MONTH', 'PERIOD', 'DUE DATE', 'AMOUNT (AED)'].forEach((h, i) => pdf.text(h, schedColX[i] + 1, y + 1));
  y += 7;

  paymentSchedule.forEach((row, i) => {
    checkPageBreak(10);
    if (i % 2 === 0) {
      pdf.setFillColor(247, 244, 239);
      pdf.rect(margin, y - 4, contentWidth, 7, 'F');
    }
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(30, 43, 26);
    [String(row.month), row.label, row.dueDate, `AED ${row.amount}`]
      .forEach((d, j) => pdf.text(d, schedColX[j] + 1, y));
    y += 7;
  });
  y += 5;
}
    // ── TERMS & CONDITIONS ──
    addSectionTitle('STANDARD TERMS & CONDITIONS');
    y += 3;

    [
      "01- The buyer is bound to examine the goods on arrival and in case of any discrepancy / claim regarding quality / grade of products / machinery, should be informed in writing to seller within TWO (2) working days. The failure of the buyer to comply with this rule, should be considered acceptance of product / machinery in good condition / without any fault or claim.",
      "02- In case of delay or failure of payment, warranty of products should be deemed as cancelled until / unless pending payments should be cleared in favour of seller.",
      "03- Payment of the agreement shall be made within Credit period agreed between us as per credit facility terms.",
      "04- The goods sold under this agreement will remain the property of M/S Almushtaraka Trading Company only. Unless and until the full payment of such goods has been settled to Almushtaraka Trading Company.",
      "05- If buyer fails to pay the full amount in agreed period, seller has the right to take back his goods, mentioned in this sales agreement.",
      "06- In case of sale or transfer of business entity / ownership of goods or machinery supplied under this agreement, the BUYER is bound to inform the SELLER and settle his outstanding dues with seller.",
    ].forEach(term => {
      pdf.splitTextToSize(term, contentWidth).forEach(l => {
        checkPageBreak(6);
        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.text(l, margin, y);
        y += 5;
      });
    });

    // Extra standard terms
if (extraStandardTerms && extraStandardTerms.length > 0) {
  extraStandardTerms.filter(t => t.trim()).forEach((term, index) => {
    pdf.splitTextToSize(`${String(index + 7).padStart(2, '0')}- ${term}`, contentWidth).forEach(l => {
      checkPageBreak(6);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(l, margin, y);
      y += 5;
    });
  });
}

    // ── SIGNATURES ──
    signaturesStarted = true;
    checkPageBreak(70);
    y += 5;
    addLine([200, 169, 110]);
    addSectionTitle('SIGNATURES');
    y += 5;

    const allSignatories = [
      { label: 'SELLER', name: 'ARIF MUKHTAR MALIK', sub: 'Partner & Manager', eid: null, isSeller: true },
      ...formData.buyers.map((buyer, index) => ({
        label: formData.buyers.length > 1 ? `BUYER ${index + 1}` : 'BUYER',
        name: buyer.representativeName || '___________________',
        sub: null,
        eid: buyer.eid || '___________________',
        isSeller: false,
        buyerIndex: index,
      })),
    ];

    for (let i = 0; i < allSignatories.length; i += 2) {
      checkPageBreak(55);
      const left = allSignatories[i];
      const right = allSignatories[i + 1];
      const rowStartY = y;

      // ── Left signatory (left-aligned at col1) ──
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(200, 169, 110);
      pdf.text(`${left.label}:`, col1, rowStartY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 43, 26);
      pdf.text(left.name, col1, rowStartY + 5);
      pdf.setTextColor(100, 100, 100);
      if (left.sub) pdf.text(left.sub, col1, rowStartY + 10);
      if (left.eid) pdf.text(`EID: ${left.eid}`, col1, rowStartY + 10);

      if (left.isSeller) {
        try {
          const s = require('../assets/seller-signature.jpg');
          pdf.addImage(s, 'JPEG', col1, rowStartY + 14, 50, 20);
        } catch (e) {}
      } else {
        const ref = buyerSigRef.current[left.buyerIndex];
        if (ref && !ref.isEmpty()) {
          pdf.addImage(ref.toDataURL('image/png'), 'PNG', col1, rowStartY + 14, 50, 20);
        }
      }

      pdf.setDrawColor(200, 169, 110);
      pdf.line(col1, rowStartY + 38, col1 + 55, rowStartY + 38);
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`${left.label} Signature`, col1, rowStartY + 42);

      // ── Right signatory (right-aligned at col2) ──
      if (right) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(200, 169, 110);
        pdf.text(`${right.label}:`, col2, rowStartY, { align: 'right' });
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30, 43, 26);
        pdf.text(right.name, col2, rowStartY + 5, { align: 'right' });
        pdf.setTextColor(100, 100, 100);
        if (right.sub) pdf.text(right.sub, col2, rowStartY + 10, { align: 'right' });
        if (right.eid) pdf.text(`EID: ${right.eid}`, col2, rowStartY + 10, { align: 'right' });

        // addImage: x = col2 - 50 so image ends at right edge
        if (right.isSeller) {
          try {
            const s = require('../assets/seller-signature.jpg');
            pdf.addImage(s, 'JPEG', col2 - 50, rowStartY + 14, 50, 20);
          } catch (e) {}
        } else {
          const ref = buyerSigRef.current[right.buyerIndex];
          if (ref && !ref.isEmpty()) {
            pdf.addImage(ref.toDataURL('image/png'), 'PNG', col2 - 50, rowStartY + 14, 50, 20);
          }
        }

        pdf.setDrawColor(200, 169, 110);
        pdf.line(col2 - 55, rowStartY + 38, col2, rowStartY + 38);
        pdf.setFontSize(7);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`${right.label} Signature`, col2, rowStartY + 42, { align: 'right' });
      }

      y = rowStartY + 52;
    }
    // DO NOT draw footer on last page — it has the full signatures section
// Footer was already drawn by checkPageBreak on all previous pages

    pdf.save(`Agreement-${formData.refNumber}.pdf`);
    clearBtns.forEach(btn => btn.style.display = 'block');  
    await saveToDatabase();
    isGenerating.current = false;  // ADD THIS

  };

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
            <img src={logoBase64} alt="Al Mushtaraka Logo" className="agreement-logo" />
            <div>
              <h1>ALMUSHTARAKA TRADING COMPANY</h1>
              <p>DIBBA INDUSTRIAL AREA</p>
            </div>
          </div>
          <div className="preview-header-right">
            <div className="preview-copy-badge">ORIGINAL</div>
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

        {/* Seller and Buyers */}
{/* Parties - GRID: seller + each buyer = own cell, 2 per row */}
<div className="preview-parties-grid">
  <div className="preview-party">
    <p className="party-label">SELLER:-</p>
    <p><strong>ALMUSHTARAKA TRADING COMPANY</strong></p>
    <p>DIBBA INDUSTRIAL AREA</p>
    <p>Representative: ARIF MUKHTAR MALIK</p>
    <p>Partner & Manager</p>
  </div>
  {formData.buyers.map((buyer, index) => (
    <div className="preview-party" key={index}>
      <p className="party-label">{formData.buyers.length > 1 ? `BUYER ${index + 1}:-` : 'BUYER:-'}</p>
      <p><strong>{buyer.buyerCompany || '___________________'}</strong></p>
      {index === 0 && <p>License Number: {buyer.licenseNumber || '___________________'}</p>}
      <p>Representative: {buyer.representativeName || '___________________'}</p>
      <p>ID#: {buyer.eid || '___________________'}</p>
      <p>Mobile: {buyer.mobile || '___________________'}</p>
    </div>
  ))}
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
              <td colSpan="3"><strong>AED {total.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>

        {/* Payment Terms */}
<div className="preview-section">
  <p className="section-title">Payment Terms:-</p>
  <p>I- At the time of booking / Token Money, CASH AED = {formData.tokenAmount}/-</p>
  <p>II- At the time of delivery of goods, AED: {deliveryAmount.toFixed(2)}/-</p>
  <p>III- Remaining balance AED {remainingBalance.toFixed(2)} to be paid in {formData.installmentMonths} monthly installments of AED {monthlyInstallment.toFixed(2)} per month.</p>
  <p>IV- Installments start from {paymentSchedule.length > 0 ? paymentSchedule[0].dueDate : ''}. Due date is 5th of each month.</p>
  {extraPaymentTerms && extraPaymentTerms.filter(t => t.trim()).map((term, index) => (
    <p key={index}>{['V','VI','VII','VIII','IX','X'][index]}- {term}</p>
  ))}
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
  {extraStandardTerms && extraStandardTerms.filter(t => t.trim()).map((term, index) => (
    <p key={index} className="term-item">
      <strong>{String(index + 7).padStart(2, '0')}-</strong> {term}
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
{/* Signatures */}
<div className="preview-signatures-grid">
  {/* Seller always first */}
  <div className="sig-box">
    <p className="sig-label">SELLER:</p>
    <p>ARIF MUKHTAR MALIK</p>
    <p>Partner & Manager</p>
    <p className="sig-label" style={{ marginTop: '10px' }}>Signature:</p>
    <img src={sellerSignature} alt="Seller Signature" className="seller-sig-img" />
  </div>

  {formData.buyers.map((buyer, index) => (
    <div className="sig-box" key={index}>
      <p className="sig-label">BUYER {formData.buyers.length > 1 ? index + 1 : ''}:</p>
      <p>{buyer.representativeName || '___________________'}</p>
      <p>EID: {buyer.eid || '___________________'}</p>
      <p className="sig-label" style={{ marginTop: '10px' }}>Signature:</p>
      <SignatureCanvas
        ref={el => buyerSigRef.current[index] = el}
        penColor="black"
        canvasProps={{ width: 220, height: 100, className: 'sig-canvas' }}
      />
      <button
        id={`buyer-clear-btn-${index}`}
        className="btn-clear-sig hide-on-pdf"
        onClick={() => buyerSigRef.current[index].clear()}>
        Clear
      </button>
    </div>
  ))}
</div>

      </div>
    </div>
  );
}

export default AgreementPreview;