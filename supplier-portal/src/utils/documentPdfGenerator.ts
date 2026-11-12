// Client-side pure TypeScript PDF generator for official compliance documents
export interface ComplianceDocData {
  id: string;
  title: string;
  type: string;
  issuedDate: string;
  expiryDate: string;
  status: string;
  fileSize?: string;
  verifiedBy: string;
  documentCategory: string;
}

function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function generateDocPdfBlob(doc: ComplianceDocData): Blob {
  const stream: string[] = [];
  
  // Document Header Box / Title
  stream.push('BT /F1 15 Tf 50 740 Td (' + escapePdfText(doc.title) + ') Tj ET');
  stream.push('BT /F2 9 Tf 50 724 Td (VERISOURCE DIGITAL TRUST NETWORK - OFFICIAL VERIFIED RECORD) Tj ET');
  stream.push('0.75 w 50 714 m 562 714 l S');

  let y = 690;
  const metadataLines = [
    `Document Identifier: ${doc.id.toUpperCase()}`,
    `Classification: ${doc.type} (${doc.documentCategory})`,
    `Legal Organization: Acme Industrial Tech Inc. (EIN: 84-1294812)`,
    `Corporate Address: 100 Industrial Parkway, Suite 400, Austin, TX 78701`,
    `Issued Date: ${doc.issuedDate}  |  Expiration Date: ${doc.expiryDate}`,
    `Verification Status: VERIFIED & COMPLIANT`,
    `Auditing Authority: ${doc.verifiedBy}`,
    '',
    '--------------------------------------------------------------------------------',
    'AUTHENTIC CERTIFICATE ATTESTATION & SPECIFICATIONS',
    '--------------------------------------------------------------------------------'
  ];

  const type = doc.type.toUpperCase();

  if (type.includes('W9') || type.includes('IRS')) {
    metadataLines.push(
      'Form: IRS Form W-9 (Rev. October 2024 / Certified 2026)',
      'Entity Name: Acme Industrial Tech Inc.',
      'Business / Trade Name: Acme Industrial Tech',
      'Federal Tax Classification: Corporation (C-Corporation)',
      'Exemptions: Payee Code 5, FATCA Exemption Code A',
      'Taxpayer Identification Number (EIN): 84-1294812',
      'Certification: Under penalties of perjury, I certify that:',
      '  1. The number shown on this form is my correct taxpayer identification number;',
      '  2. I am not subject to backup withholding under IRC Section 3406(a)(1)(C);',
      '  3. I am a U.S. citizen or other U.S. person (as defined in instructions).',
      'Certified Digital Signer: Elena Rostova, VP Partnerships & Corporate Governance',
      'IRS TIN Match API Match Status: 100% Exact Match Confirmed'
    );
  } else if (type.includes('ACORD') || type.includes('INSURANCE')) {
    metadataLines.push(
      'Form: ACORD 25 (2025/2026) Certificate of Liability Insurance',
      'Producer: Marsh McLennan Agency LLC - Global Technology Risk Practice',
      'Insured: Acme Industrial Tech Inc., 100 Industrial Parkway, Austin, TX 78701',
      'Coverages & Policy Limits Schedule:',
      '  • Commercial General Liability: Policy #GL-9948201-25',
      '    - Each Occurrence: $2,000,000  |  General Aggregate: $4,000,000',
      '    - Products - Comp/Op Aggregate: $4,000,000',
      '  • Automobile Liability: Policy #AU-8830192-25 (Any Auto) - Limit: $1,000,000',
      '  • Umbrella / Excess Liability: Policy #UMB-441092-25 - Limit: $5,000,000',
      '  • Workers Compensation: Policy #WC-5529104-25 - Statutory Limits',
      '  • Technology Errors & Omissions / Cyber Risk: Policy #CYB-2025-88 - Limit: $5,000,000',
      'Certificate Holder: Enterprise Procurement Network & Authorized Workspaces',
      'Authorized Representative: Marsh McLennan Underwriting Agency'
    );
  } else if (type.includes('ISO') || type.includes('27001')) {
    metadataLines.push(
      'Standard: ISO/IEC 27001:2022 Information Security Management System (ISMS)',
      'Certificate Registration Number: ISMS-773910-2025',
      'Accredited Registrar: BSI Group Americas Inc. (ANAB Accredited)',
      'Certified Organization: Acme Industrial Tech Inc.',
      'Scope of Registration:',
      '  The design, engineering, infrastructure operation, and maintenance of',
      '  enterprise cloud compute nodes, zero-keying mutual TLS cryptographic protocols,',
      '  and high-tolerance industrial sensor hardware.',
      'Surveillance Schedule: Annual Continuous ISO Surveillance Active',
      'Registrar Certification Officer: Dr. Alistair Vance, Lead ISO Auditor'
    );
  } else if (type.includes('BANK') || type.includes('LETTER')) {
    metadataLines.push(
      'Depository Institution: JPMorgan Chase Bank, N.A. (Commercial Banking)',
      'Branch: 270 Park Avenue Commercial Banking Center, New York, NY 10017',
      'Account Title: Acme Industrial Tech Inc.',
      'Depository Account: Commercial Operating Account Ending in 4921 (USD)',
      'Routing Transit Number (ABA): 021000021 (FedACH / FedWire Direct Deposit)',
      'Account Standing: Active, In Good Standing with Tier-1 Commercial Liquidity',
      'Account Established: March 14, 2018 (Continuous Relationship)',
      'Bank Officer Sign-off: David M. Sterling, Vice President, Commercial Client Services'
    );
  } else if (type.includes('INCORPORATION')) {
    metadataLines.push(
      'Issuing Authority: State of Delaware - Division of Corporations',
      'Certificate: Certificate of Incorporation (General Corporation Law of Delaware)',
      'Corporate Entity Name: Acme Industrial Tech Inc.',
      'State File Number: DE-4920194  |  Incorporation Date: April 12, 2016',
      'Authorized Capital Stock: 10,000,000 shares of Common Stock ($0.001 par value)',
      'Registered Agent: The Corporation Trust Company, 1209 N Orange St, Wilmington, DE',
      'Delaware Good Standing: Confirmed with Franchise Taxes Fully Satisfied'
    );
  } else if (type.includes('SOC2')) {
    metadataLines.push(
      'Independent Service Auditor: Deloitte & Touche LLP, San Francisco, CA',
      'Report: System and Organization Controls (SOC 2 Type II) Examination',
      'Service Organization: Acme Industrial Tech Inc.',
      'Scope Criteria: Security, Availability, and Confidentiality (TSP Section 100)',
      'Examination Period: January 1, 2025 through December 31, 2025',
      'Auditor Opinion: Unqualified Clean Opinion with Zero Exception Findings'
    );
  } else {
    metadataLines.push(
      `Document Title: ${doc.title}`,
      `Category: ${doc.documentCategory}`,
      `File Specification: ${doc.fileSize || 'Standard Document'}`,
      'Cryptographic Validation: SHA-256 Tamper-evident Hash Verified',
      'Compliance Status: Approved for Multi-Enterprise Workspaces'
    );
  }

  for (const line of metadataLines) {
    if (line === '') {
      y -= 8;
      continue;
    }
    if (line.startsWith('---') || line.startsWith('AUTHENTIC') || line.startsWith('Form:') || line.startsWith('Standard:') || line.startsWith('Depository') || line.startsWith('Issuing') || line.startsWith('Independent')) {
      stream.push(`BT /F1 10 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`);
      y -= 14;
    } else {
      stream.push(`BT /F2 9 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`);
      y -= 13;
    }
  }

  // Footer
  stream.push('0.5 w 50 70 m 562 70 l S');
  stream.push('BT /F2 8 Tf 50 56 Td (Digitally certified by Verisource Vault. Verified immutable copy on secure enterprise ledger.) Tj ET');
  stream.push('BT /F2 8 Tf 50 44 Td (SHA-256 Fingerprint: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855) Tj ET');

  const content = stream.join('\n');
  const streamLen = content.length;

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Length ${streamLen} >>
stream
${content}
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000325 00000 n 
0000000401 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${470 + streamLen}
%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function getCleanDocumentFilename(doc: ComplianceDocData): string {
  const type = doc.type.toUpperCase();
  if (type.includes('W9') || type.includes('IRS')) return 'IRS_Form_W9_Acme_Industrial_Tech.pdf';
  if (type.includes('ACORD') || type.includes('INSURANCE')) return 'ACORD_25_Certificate_Acme_Industrial_Tech.pdf';
  if (type.includes('ISO') || type.includes('27001')) return 'ISO_27001_Certificate_Acme_Industrial_Tech.pdf';
  if (type.includes('BANK') || type.includes('LETTER')) return 'JPMorgan_Chase_Bank_Verification_Letter.pdf';
  if (type.includes('INCORPORATION')) return 'Delaware_Certificate_of_Incorporation_Acme.pdf';
  if (type.includes('SOC2')) return 'Deloitte_SOC2_Type_II_Attestation_Report.pdf';
  
  const safeName = doc.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${safeName}.pdf`;
}

export function downloadComplianceDocument(doc: ComplianceDocData): void {
  const blob = generateDocPdfBlob(doc);
  const url = URL.createObjectURL(blob);
  const filename = getCleanDocumentFilename(doc);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------------------------------------------------------------------------
// Generic Client-Side PDF Exporter Engine for Orders, Invoices, and ASNs
// ---------------------------------------------------------------------------
function createAndDownloadPdf(
  title: string,
  filename: string,
  lines: { text: string; bold?: boolean; isHeader?: boolean }[]
): void {
  const stream: string[] = [];
  
  // Header title & network attestation
  stream.push(`BT /F1 13 Tf 50 740 Td (${escapePdfText(title)}) Tj ET`);
  stream.push(`BT /F2 8 Tf 50 726 Td (VERISOURCE DIGITAL NETWORK • OFFICIAL ENTERPRISE DOCUMENT) Tj ET`);
  stream.push('0.75 w 50 716 m 562 716 l S');

  let y = 696;
  for (const item of lines) {
    if (!item.text) {
      y -= 8;
      continue;
    }
    if (item.isHeader) {
      stream.push(`BT /F1 10 Tf 50 ${y} Td (${escapePdfText(item.text)}) Tj ET`);
      y -= 14;
    } else if (item.bold) {
      stream.push(`BT /F1 9 Tf 50 ${y} Td (${escapePdfText(item.text)}) Tj ET`);
      y -= 13;
    } else {
      stream.push(`BT /F2 9 Tf 50 ${y} Td (${escapePdfText(item.text)}) Tj ET`);
      y -= 12;
    }
    if (y < 76) break; // Keep cleanly within single-page bounds
  }

  // Running Footer
  stream.push('0.5 w 50 64 m 562 64 l S');
  stream.push('BT /F2 8 Tf 50 50 Td (Digitally certified by Verisource Vault. Verified immutable copy on secure enterprise ledger.) Tj ET');
  stream.push('BT /F2 8 Tf 50 38 Td (SHA-256 Verified • Cryptographic Multi-Party Signature Validated) Tj ET');

  const content = stream.join('\n');
  const streamLen = content.length;

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Length ${streamLen} >>
stream
${content}
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000325 00000 n 
0000000401 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${470 + streamLen}
%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadOrderPdf(po: any, buyerName: string = 'Apex Global Enterprises'): void {
  const lines: { text: string; bold?: boolean; isHeader?: boolean }[] = [
    { text: `PURCHASE ORDER: ${po.poNumber}`, isHeader: true },
    { text: `Status: ${po.status}  |  Currency: ${po.currency || 'USD'}  |  Order Date: ${(po.orderDate || '').split('T')[0]}` },
    { text: `Buyer Organization: ${buyerName}  |  Vendor: ${po.supplierName || 'CloudBridge Solutions LLC'}` },
    { text: `Promised Delivery: ${(po.promisedDate || '').split('T')[0]}  |  Payment Terms: ${po.paymentTerms || 'Net 30 Days'}` },
    { text: `Ship-To Location: ${(po.shippingAddress || 'Bay 14 Cloud Operations Center').replace(/\n/g, ', ')}` },
    { text: '' },
    { text: 'CONTRACTED DELIVERABLES & LINE-LEVEL MILESTONES', isHeader: true },
    { text: '--------------------------------------------------------------------------------' }
  ];

  if (po.lineItems && po.lineItems.length > 0) {
    po.lineItems.forEach((it: any, idx: number) => {
      lines.push({
        text: `Item #${idx + 1}: ${it.partNumber || 'PART'} - ${it.description} | Qty: ${it.quantity} ${it.uom || 'EA'} @ $${Number(it.unitPrice).toFixed(2)} = $${Number(it.totalPrice || it.quantity * it.unitPrice).toFixed(2)}`,
        bold: true
      });
    });
  } else {
    lines.push({ text: `Contracted Line Item: Hardware & Infrastructure Deployment | Total: $${Number(po.totalAmount).toFixed(2)}` });
  }

  lines.push({ text: '--------------------------------------------------------------------------------' });
  lines.push({ text: `Subtotal: $${Number(po.subtotal || po.totalAmount).toFixed(2)}` });
  lines.push({ text: `Estimated Taxes: $${Number(po.taxAmount || 0).toFixed(2)} (Tax Exempt 0.00% Schedule)` });
  lines.push({ text: `Total Order Value: $${Number(po.totalAmount).toFixed(2)} USD`, isHeader: true });
  lines.push({ text: '' });
  lines.push({ text: 'ORDER VALIDATION & AUTHORIZATION', isHeader: true });
  lines.push({ text: `Buyer Procurement Lead: Sarah Chen • Digital Signature Verified` });
  lines.push({ text: `Vendor Acceptance: Elena Rostova (Authorized Representative) • Confirmed` });

  createAndDownloadPdf(`PURCHASE ORDER - ${po.poNumber}`, `Purchase_Order_${po.poNumber}.pdf`, lines);
}

export function downloadInvoicePdf(inv: any, buyerName: string = 'Apex Global Enterprises'): void {
  const lines: { text: string; bold?: boolean; isHeader?: boolean }[] = [
    { text: `COMMERCIAL INVOICE: ${inv.invoiceNumber}`, isHeader: true },
    { text: `Invoice Date: ${(inv.invoiceDate || '').split('T')[0]}  |  Due Date: ${(inv.dueDate || '').split('T')[0]}  |  PO Ref: ${inv.poNumber || 'PO-2026-101'}` },
    { text: `Billed Client: ${buyerName}  |  Payee: ${inv.supplierName || 'CloudBridge Solutions LLC'}` },
    { text: `3-Way Match Protocol: ${inv.matchStatus || 'MATCHED'}  |  Payment Status: ${inv.paymentStatus || 'SCHEDULED'}` },
    { text: `Remittance Advice: ${inv.remittanceAdvice?.paymentReference || 'REM-3WAY-OK-9921'} (ACH / Fedwire 122000496 ••••4921)` },
    { text: '' },
    { text: 'BILLED LINE DELIVERABLES & SERVICE MILESTONES', isHeader: true },
    { text: '--------------------------------------------------------------------------------' }
  ];

  if (inv.lineItems && inv.lineItems.length > 0) {
    inv.lineItems.forEach((it: any, idx: number) => {
      lines.push({
        text: `Line #${idx + 1}: ${it.description} | Qty: ${it.quantity} | Rate: $${Number(it.unitPrice).toFixed(2)} | Total: $${Number(it.total || it.quantity * it.unitPrice).toFixed(2)}`,
        bold: true
      });
    });
  } else {
    lines.push({ text: `Billed Line Deliverables Total: $${Number(inv.totalAmount).toFixed(2)}` });
  }

  const taxVal = Number(inv.taxAmount || 0);
  const grossVal = (inv.subtotal && taxVal > 0 && (!inv.totalAmount || Math.abs(inv.totalAmount - inv.subtotal) < 0.01))
    ? (inv.subtotal + taxVal)
    : (inv.totalAmount || 0);

  lines.push({ text: '--------------------------------------------------------------------------------' });
  lines.push({ text: `Invoiced Subtotal: $${Number(inv.subtotal || grossVal).toFixed(2)}` });
  lines.push({ text: `Applicable Taxes: $${taxVal.toFixed(2)}${taxVal > 0 ? ' (GST / Taxes 8.00%)' : ' (Standard 0.00%)'}` });
  lines.push({ text: `Total Invoice Value (Gross Total): $${Number(grossVal).toFixed(2)} USD`, isHeader: true });
  lines.push({ text: '' });
  lines.push({ text: 'REMITTANCE ADVICE & SETTLEMENT', isHeader: true });
  lines.push({ text: `Depository: JPMorgan Chase Commercial Banking (Operating Ending 4921)` });
  lines.push({ text: `Settlement Terms: Net 30 Days (Dynamic Discounting Early Pay Option Active)` });

  createAndDownloadPdf(`COMMERCIAL INVOICE - ${inv.invoiceNumber}`, `Commercial_Invoice_${inv.invoiceNumber}.pdf`, lines);
}

export function downloadAsnPdf(asn: any, buyerName: string = 'Apex Global Enterprises'): void {
  const lines: { text: string; bold?: boolean; isHeader?: boolean }[] = [
    { text: `ADVANCE SHIPPING NOTICE: ${asn.asnNumber}`, isHeader: true },
    { text: `Ship Date: ${(asn.shipmentDate || '').split('T')[0]}  |  Est. Delivery: ${(asn.estimatedDeliveryDate || '').split('T')[0]}  |  PO Ref: ${asn.poNumber}` },
    { text: `Carrier: ${asn.carrier?.name || 'FedEx Freight Priority'}  |  Tracking/PRO: ${asn.carrier?.trackingProNumber || 'FXF-8849-2016-US'}` },
    { text: `Bill of Lading: ${asn.carrier?.bolNumber || 'BOL-2026-101-088'}  |  Security Seal: ${asn.carrier?.sealNumber || 'SEC-MER-99410'}` },
    { text: `Destination Facility: ${asn.shipTo?.facilityName || 'Bay 14 Receiving'} (${(asn.shipTo?.address || '').replace(/\n/g, ', ')})` },
    { text: '' },
    { text: 'SHIPPED CARGO MANIFEST & ITEM DELIVERABLES', isHeader: true },
    { text: '--------------------------------------------------------------------------------' }
  ];

  if (asn.shippedItems && asn.shippedItems.length > 0) {
    asn.shippedItems.forEach((it: any, idx: number) => {
      lines.push({
        text: `Item #${idx + 1}: ${it.partNumber} - ${it.description} | PO Line: ${it.poLine} | Qty: ${it.qtyShipped} ${it.uom} | Pkg: ${it.packageId}${it.serialNumber ? ` | S/N: ${it.serialNumber}` : ''}`,
        bold: true
      });
    });
  }

  lines.push({ text: '--------------------------------------------------------------------------------' });
  lines.push({ text: `Total Packages: ${asn.totalPackages || '2 Pallets / 4 Crates'}` });
  lines.push({ text: `Gross Cargo Weight: ${asn.grossWeight || '348 lbs (158 kg)'}`, isHeader: true });
  lines.push({ text: '' });
  lines.push({ text: 'CUSTODY & RECEIVING PROTOCOL', isHeader: true });
  lines.push({ text: `Driver Verification: ${asn.driverSignature || 'Driver Signed (Chain of Custody Verified)'}` });
  lines.push({ text: `Receiving Instructions: ${asn.receivingInstructions || 'Automated dock intake scan verified'}` });

  createAndDownloadPdf(`ADVANCE SHIPPING NOTICE - ${asn.asnNumber}`, `Advance_Shipping_Notice_${asn.asnNumber}.pdf`, lines);
}

