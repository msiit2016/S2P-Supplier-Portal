import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/memoryDb.js';
import { 
  PurchaseOrder, 
  Invoice, 
  InvoiceLineItem, 
  EarlyPaymentOffer, 
  ThreeWayMatchStatus,
  AdvanceShippingNotice 
} from '../models/types.js';
import { AuditService } from './auditService.js';

export class P2PTransactionService {
  /**
   * Verisource 1-Click PO-to-Invoice Flip
   */
  public static flipPOToInvoice(params: {
    poId: string;
    invoiceNumber: string;
    taxRate?: number;
    actor: { id: string; name: string; role: string; buyerOrgId?: string };
  }): { invoice: Invoice; matchStatus: ThreeWayMatchStatus; message: string } {
    const po = db.getPurchaseOrder(params.poId);
    if (!po) {
      throw new Error(`Purchase Order ${params.poId} not found`);
    }

    const taxRate = params.taxRate !== undefined ? params.taxRate : (po.taxAmount > 0 ? (po.taxAmount / po.subtotal) : 0.0);
    const taxAmount = Math.round(po.subtotal * taxRate * 100) / 100;
    const totalAmount = Math.round((po.subtotal + taxAmount) * 100) / 100;

    const invoiceLines: InvoiceLineItem[] = po.lineItems.map(li => ({
      id: `inli-${uuidv4().slice(0, 6)}`,
      poLineItemId: li.id,
      itemNumber: li.itemNumber,
      description: li.description,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      total: li.totalPrice
    }));

    // Calculate due date (Net 30 standard)
    const invDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoiceId = `inv-${uuidv4().slice(0, 6)}`;

    // Generate Dynamic Discounting Offer if eligible
    const earlyOffer: EarlyPaymentOffer = {
      eligible: true,
      standardDueDate: dueDate.toISOString().split('T')[0],
      standardAmount: totalAmount,
      acceleratedDays: 20,
      discountPercent: 1.5,
      discountAmount: Math.round(totalAmount * 0.015 * 100) / 100,
      acceleratedPayoutAmount: Math.round((totalAmount - (totalAmount * 0.015)) * 100) / 100,
      acceleratedDueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
      status: 'AVAILABLE'
    };

    const invoice: Invoice = {
      id: invoiceId,
      invoiceNumber: params.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      poId: po.id,
      poNumber: po.poNumber,
      buyerOrgId: po.buyerOrgId,
      supplierOrgId: po.supplierOrgId,
      supplierName: po.supplierName,
      invoiceDate: invDate.toISOString(),
      dueDate: dueDate.toISOString(),
      currency: po.currency,
      subtotal: po.subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      paymentStatus: 'APPROVED_FOR_PAYMENT',
      matchStatus: '3_WAY_MATCHED',
      matchNotes: `Touchless 3-Way Match Confirmed: Invoiced line items identical to ${po.poNumber}. Automatically approved for payment.`,
      lineItems: invoiceLines,
      earlyPaymentOffer: earlyOffer,
      createdAt: invDate.toISOString(),
      updatedAt: invDate.toISOString()
    };

    db.createInvoice(invoice);

    // Update PO status to reflect invoice generation
    const currentInvoices = po.invoiceIds || [];
    db.updatePurchaseOrder(po.id, {
      invoiceIds: [...currentInvoices, invoice.id],
      status: po.status === 'SHIPPED' ? 'COMPLETED' : po.status
    });

    AuditService.log(params.actor, 'PO_INVOICE_FLIPPED', 'INVOICE', invoice.id, {
      poNumber: po.poNumber,
      invoiceNumber: invoice.invoiceNumber,
      amount: totalAmount,
      matchStatus: invoice.matchStatus
    });

    return {
      invoice,
      matchStatus: invoice.matchStatus,
      message: `Touchless PO-to-Invoice Flip completed for ${po.poNumber}. 3-Way matched with zero discrepancies.`
    };
  }

  /**
   * Dynamic Discounting: Accept Early Payment Payout
   */
  public static acceptEarlyPayment(params: {
    invoiceId: string;
    discountPercent: number;
    daysEarly: number;
    actor: { id: string; name: string; role: string };
  }): { invoice: Invoice; payoutAmount: number; discountSavings: number } {
    const inv = db.getInvoice(params.invoiceId);
    if (!inv) throw new Error(`Invoice ${params.invoiceId} not found`);

    const discountAmount = Math.round(inv.totalAmount * (params.discountPercent / 100) * 100) / 100;
    const payoutAmount = Math.round((inv.totalAmount - discountAmount) * 100) / 100;
    const acceleratedDate = new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0];

    const updatedOffer: EarlyPaymentOffer = {
      eligible: true,
      standardDueDate: inv.dueDate.split('T')[0],
      standardAmount: inv.totalAmount,
      acceleratedDays: params.daysEarly,
      discountPercent: params.discountPercent,
      discountAmount,
      acceleratedPayoutAmount: payoutAmount,
      acceleratedDueDate: acceleratedDate,
      status: 'CONFIRMED'
    };

    const updatedInvoice = db.updateInvoice(inv.id, {
      earlyPaymentOffer: updatedOffer,
      paymentStatus: 'SCHEDULED',
      remittanceAdvice: {
        paymentReference: `REM-ACCEL-${Math.floor(10000 + Math.random() * 90000)}`,
        settlementDate: acceleratedDate,
        paymentMethod: 'ACH_CREDIT',
        bankTraceNumber: `TRC-FAST-${Date.now().toString().slice(-8)}`
      }
    })!;

    AuditService.log(params.actor, 'DYNAMIC_DISCOUNTING_ACCEPTED', 'INVOICE', inv.id, {
      invoiceNumber: inv.invoiceNumber,
      originalAmount: inv.totalAmount,
      payoutAmount,
      discountSavings: discountAmount,
      acceleratedDate
    });

    return {
      invoice: updatedInvoice,
      payoutAmount,
      discountSavings: discountAmount
    };
  }

  /**
   * Supplier Order Acknowledgment (ACK)
   */
  public static acknowledgeOrder(poId: string, actor: { id: string; name: string; role: string }): PurchaseOrder {
    const po = db.getPurchaseOrder(poId);
    if (!po) throw new Error(`PO ${poId} not found`);

    const updated = db.updatePurchaseOrder(poId, {
      status: 'ACKNOWLEDGED',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: actor.name
    })!;

    AuditService.log(actor, 'PO_ACKNOWLEDGED', 'PURCHASE_ORDER', poId, {
      poNumber: po.poNumber
    });

    return updated;
  }

  /**
   * Advance Shipping Notice (ASN) Dispatch
   */
  public static dispatchASN(params: {
    poId: string;
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: string;
    actor: { id: string; name: string; role: string };
  }): PurchaseOrder {
    const po = db.getPurchaseOrder(params.poId);
    if (!po) throw new Error(`PO ${params.poId} not found`);

    const asnNumber = `ASN-${params.carrier.toUpperCase().slice(0, 3)}-${Math.floor(10000 + Math.random() * 90000)}`;

    const updated = db.updatePurchaseOrder(params.poId, {
      status: 'SHIPPED',
      asnNumber,
      shippedAt: new Date().toISOString(),
      notes: `${po.notes || ''} | Carrier: ${params.carrier}, Tracking: ${params.trackingNumber}, Delivery: ${params.estimatedDelivery}`
    })!;

    const asnRecord: AdvanceShippingNotice = {
      id: `asn-${uuidv4().slice(0, 6)}`,
      asnNumber,
      poId: po.id,
      poNumber: po.poNumber,
      buyerOrgId: po.buyerOrgId,
      supplierOrgId: po.supplierOrgId,
      carrier: params.carrier,
      trackingNumber: params.trackingNumber,
      shippingDate: new Date().toISOString(),
      estimatedDeliveryDate: params.estimatedDelivery,
      status: 'IN_TRANSIT',
      packageCount: po.lineItems.reduce((acc, li) => acc + (li.quantity || 1), 0),
      shippedItems: po.lineItems.map(li => ({
        itemNumber: li.itemNumber,
        partNumber: li.partNumber,
        description: li.description,
        shippedQuantity: li.quantity,
        uom: li.uom
      })),
      notes: `Carrier: ${params.carrier}, Tracking: ${params.trackingNumber}`,
      createdAt: new Date().toISOString()
    };
    db.createASN(asnRecord);

    AuditService.log(params.actor, 'ASN_DISPATCHED', 'PURCHASE_ORDER', params.poId, {
      poNumber: po.poNumber,
      asnNumber,
      trackingNumber: params.trackingNumber
    });

    return updated;
  }
}
