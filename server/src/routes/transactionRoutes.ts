import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/memoryDb.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { P2PTransactionService } from '../services/p2pTransactionService.js';
import { CatalogItem, TransactionComment } from '../models/types.js';

const router = Router();

// ========================
// Purchase Orders (PO)
// ========================

// GET all POs
router.get('/orders', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const buyerId = (req.query.buyerOrgId as string) || (user?.userType === 'BUYER' ? user.organizationId : undefined);
  const supplierId = user?.userType === 'SUPPLIER' ? user.organizationId : undefined;

  const orders = db.getAllPurchaseOrders(buyerId, supplierId);
  res.json({ orders });
});

// GET PO by ID
router.get('/orders/:id', (req: AuthenticatedRequest, res: Response) => {
  const po = db.getPurchaseOrder(req.params.id);
  if (!po) {
    res.status(404).json({ error: 'Purchase Order not found' });
    return;
  }
  const comments = db.getTransactionComments('PO', po.id);
  res.json({ order: po, comments });
});

// POST Acknowledge PO (Supplier action)
router.post('/orders/:id/acknowledge', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  try {
    const updated = P2PTransactionService.acknowledgeOrder(req.params.id, {
      id: user?.id || 'sys',
      name: user?.name || 'Supplier Contact',
      role: user?.role || 'SUPPLIER_ADMIN'
    });
    res.json({ message: 'Order acknowledged', order: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST Dispatch ASN
router.post('/orders/:id/asn', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { carrier, trackingNumber, estimatedDelivery } = req.body;

  if (!trackingNumber) {
    res.status(400).json({ error: 'trackingNumber is required' });
    return;
  }

  try {
    const updated = P2PTransactionService.dispatchASN({
      poId: req.params.id,
      carrier: carrier || 'FedEx Freight',
      trackingNumber,
      estimatedDelivery: estimatedDelivery || '2026-11-01',
      actor: { id: user?.id || 'sys', name: user?.name || 'Supplier Ops', role: user?.role || 'SUPPLIER_ADMIN' }
    });
    res.json({ message: 'Advance Shipping Notice (ASN) dispatched', order: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET all Advance Shipping Notices (ASNs)
router.get('/asns', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const buyerId = (req.query.buyerOrgId as string) || (user?.userType === 'BUYER' ? user.organizationId : undefined);
  const supplierId = user?.userType === 'SUPPLIER' ? user.organizationId : undefined;

  const asns = db.getAllASNs(buyerId, supplierId);
  res.json({ asns });
});

// POST 1-Click PO-to-Invoice Flip
router.post('/orders/:id/flip-invoice', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { invoiceNumber, taxRate } = req.body;

  try {
    const result = P2PTransactionService.flipPOToInvoice({
      poId: req.params.id,
      invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      taxRate: taxRate !== undefined ? Number(taxRate) : undefined,
      actor: { id: user?.id || 'sys', name: user?.name || 'Supplier Finance', role: user?.role || 'SUPPLIER_ADMIN', buyerOrgId: user?.organizationId }
    });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ========================
// Invoices & E-Invoicing
// ========================

// GET all Invoices
router.get('/invoices', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const buyerId = (req.query.buyerOrgId as string) || (user?.userType === 'BUYER' ? user.organizationId : undefined);
  const supplierId = user?.userType === 'SUPPLIER' ? user.organizationId : undefined;

  const invoices = db.getAllInvoices(buyerId, supplierId);
  res.json({ invoices });
});

// GET Invoice by ID
router.get('/invoices/:id', (req: AuthenticatedRequest, res: Response) => {
  const inv = db.getInvoice(req.params.id);
  if (!inv) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }
  const comments = db.getTransactionComments('INVOICE', inv.id);
  res.json({ invoice: inv, comments });
});

// POST Dynamic Discounting: Accept Early Payment
router.post('/invoices/:id/early-payment', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { discountPercent, daysEarly } = req.body;

  try {
    const result = P2PTransactionService.acceptEarlyPayment({
      invoiceId: req.params.id,
      discountPercent: Number(discountPercent) || 1.5,
      daysEarly: Number(daysEarly) || 20,
      actor: { id: user?.id || 'sys', name: user?.name || 'Supplier Finance', role: user?.role || 'SUPPLIER_ADMIN' }
    });
    res.json({
      message: 'Early payment requested. Settlement scheduled within 48 business hours.',
      ...result
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ========================
// Catalog Management
// ========================

// GET Catalog items
router.get('/catalog', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierId = user?.userType === 'SUPPLIER' ? user.organizationId : req.query.supplierOrgId as string;
  const items = db.getAllCatalogItems(supplierId);
  res.json({ catalogItems: items });
});

// POST Upsert Catalog item
router.post('/catalog', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { sku, name, description, category, unitPrice, currency, uom, leadTimeDays, minOrderQty, status, attachmentFileName, attachmentSize } = req.body;

  if (!sku || !name || unitPrice === undefined) {
    res.status(400).json({ error: 'sku, name, and unitPrice are required' });
    return;
  }

  const existing = Array.from((db as any).catalogItems.values() as any[]).find((c: any) => c.sku === sku || c.id === req.body.id);

  const item: CatalogItem = {
    id: req.body.id || existing?.id || `cat-${uuidv4().slice(0, 6)}`,
    supplierOrgId: user?.organizationId || existing?.supplierOrgId || 'supp-org-1',
    sku,
    name,
    description: description !== undefined ? description : (existing?.description || ''),
    category: category || existing?.category || 'IT_HARDWARE_SERVICES',
    unitPrice: Number(unitPrice),
    currency: currency || existing?.currency || 'USD',
    uom: uom || existing?.uom || 'EA',
    leadTimeDays: Number(leadTimeDays) || existing?.leadTimeDays || 7,
    minOrderQty: Number(minOrderQty) || existing?.minOrderQty || 1,
    status: status || existing?.status || 'PUBLISHED',
    lastUpdated: new Date().toISOString(),
    ...(attachmentFileName ? { attachmentFileName, attachmentSize } : (existing?.attachmentFileName ? { attachmentFileName: existing.attachmentFileName, attachmentSize: existing.attachmentSize } : {}))
  } as any;

  db.upsertCatalogItem(item);
  res.json({ catalogItem: item, message: 'Catalog item updated and published to buyer network.' });
});

// DELETE Catalog item
router.delete('/catalog/:idOrSku', (req: AuthenticatedRequest, res: Response) => {
  const { idOrSku } = req.params;
  const deleted = db.deleteCatalogItem(idOrSku);
  res.json({ success: true, deleted, message: `Catalog item ${idOrSku} removed.` });
});

// ========================
// Contextual Comments
// ========================

// GET comments
router.get('/comments/:entityType/:entityId', (req: AuthenticatedRequest, res: Response) => {
  const { entityType, entityId } = req.params;
  const comments = db.getTransactionComments(entityType, entityId);
  res.json({ comments });
});

// POST comment
router.post('/comments/:entityType/:entityId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { entityType, entityId } = req.params;
  const { text } = req.body;

  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  const comment: TransactionComment = {
    id: `comm-${uuidv4().slice(0, 6)}`,
    entityType: entityType as any,
    entityId,
    authorId: user?.id || 'sys',
    authorName: user?.name || 'User',
    authorRole: user?.userType === 'BUYER' ? 'BUYER' : 'SUPPLIER',
    text,
    createdAt: new Date().toISOString()
  };

  db.addTransactionComment(comment);
  res.status(201).json({ comment });
});

export default router;
