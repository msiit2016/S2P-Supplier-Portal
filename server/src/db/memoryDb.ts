import { 
  User, 
  BuyerOrganization, 
  SupplierOrganization, 
  SupplierApplication, 
  ApplicationFieldValue, 
  OnboardingDocument, 
  EmailIntakeRecord, 
  ReviewTask, 
  SupplierMessage, 
  AuditEvent,
  PurchaseOrder,
  AdvanceShippingNotice,
  Invoice,
  CatalogItem,
  TransactionComment
} from '../models/types.js';

import { 
  initialBuyerOrgs, 
  initialSupplierOrgs, 
  initialUsers, 
  initialApplications, 
  initialFieldValues, 
  initialDocuments, 
  initialEmailIntake, 
  initialReviewTasks, 
  initialMessages, 
  initialAuditEvents,
  initialPurchaseOrders,
  initialInvoices,
  initialCatalogItems,
  initialTransactionComments
} from './seedData.js';

class MemoryDatabase {
  private buyerOrgs: Map<string, BuyerOrganization> = new Map();
  private supplierOrgs: Map<string, SupplierOrganization> = new Map();
  private users: Map<string, User> = new Map();
  private applications: Map<string, SupplierApplication> = new Map();
  private fieldValues: Map<string, ApplicationFieldValue> = new Map();
  private documents: Map<string, OnboardingDocument> = new Map();
  private emailIntakes: Map<string, EmailIntakeRecord> = new Map();
  private reviewTasks: Map<string, ReviewTask> = new Map();
  private messages: Map<string, SupplierMessage> = new Map();
  private purchaseOrders: Map<string, PurchaseOrder> = new Map();
  private asns: Map<string, AdvanceShippingNotice> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private catalogItems: Map<string, CatalogItem> = new Map();
  private transactionComments: Map<string, TransactionComment> = new Map();
  private auditEvents: AuditEvent[] = [];

  constructor() {
    this.seed();
  }

  public seed() {
    this.buyerOrgs.clear();
    this.supplierOrgs.clear();
    this.users.clear();
    this.applications.clear();
    this.fieldValues.clear();
    this.documents.clear();
    this.emailIntakes.clear();
    this.reviewTasks.clear();
    this.messages.clear();
    this.purchaseOrders.clear();
    this.invoices.clear();
    this.catalogItems.clear();
    this.transactionComments.clear();
    this.auditEvents = [];

    initialBuyerOrgs.forEach(b => this.buyerOrgs.set(b.id, { ...b }));
    initialSupplierOrgs.forEach(s => this.supplierOrgs.set(s.id, { ...s }));
    initialUsers.forEach(u => this.users.set(u.id, { ...u }));
    initialApplications.forEach(a => this.applications.set(a.id, { ...a }));
    initialFieldValues.forEach(f => this.fieldValues.set(f.id, { ...f }));
    initialDocuments.forEach(d => this.documents.set(d.id, { ...d }));
    initialEmailIntake.forEach(e => this.emailIntakes.set(e.id, { ...e }));
    initialReviewTasks.forEach(t => this.reviewTasks.set(t.id, { ...t }));
    initialMessages.forEach(m => this.messages.set(m.id, { ...m }));
    initialPurchaseOrders.forEach(p => this.purchaseOrders.set(p.id, { ...p }));
    
    // Seed initial ASNs
    this.asns.set('asn-101', {
      id: 'asn-101',
      asnNumber: 'ASN-US-99120',
      poId: 'po-102',
      poNumber: 'PO-2026-9042',
      buyerOrgId: 'buyer-org-1',
      supplierOrgId: 'supp-org-2',
      carrier: 'FedEx Freight Priority',
      trackingNumber: '7948-2910-4821',
      shippingDate: '2026-10-22T08:30:00Z',
      estimatedDeliveryDate: '2026-10-28T16:00:00Z',
      status: 'IN_TRANSIT',
      packageCount: 4,
      shippedItems: [
        {
          itemNumber: 1,
          partNumber: 'VAN-REEF-02',
          description: 'Refrigerated Dedicated Freight Route (Chicago -> Detroit)',
          shippedQuantity: 4,
          uom: 'RUN'
        }
      ],
      notes: 'Dock appointment pre-scheduled for Bay 14 at Joliet Hub',
      createdAt: '2026-10-22T08:30:00Z'
    });

    initialInvoices.forEach(i => this.invoices.set(i.id, { ...i }));
    initialCatalogItems.forEach(c => this.catalogItems.set(c.id, { ...c }));
    initialTransactionComments.forEach(tc => this.transactionComments.set(tc.id, { ...tc }));
    this.auditEvents = [...initialAuditEvents];
  }

  // --- Users ---
  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  public getAllUsers(orgId?: string): User[] {
    const list = Array.from(this.users.values());
    if (orgId) {
      return list.filter(u => u.organizationId === orgId);
    }
    return list;
  }

  // --- Buyer Orgs ---
  public getBuyerOrg(id: string): BuyerOrganization | undefined {
    return this.buyerOrgs.get(id);
  }

  // --- Supplier Orgs ---
  public getSupplierOrg(id: string): SupplierOrganization | undefined {
    return this.supplierOrgs.get(id);
  }

  public getAllSupplierOrgs(): SupplierOrganization[] {
    return Array.from(this.supplierOrgs.values());
  }

  public createSupplierOrg(org: SupplierOrganization): SupplierOrganization {
    this.supplierOrgs.set(org.id, org);
    return org;
  }

  public updateSupplierOrg(id: string, updates: Partial<SupplierOrganization>): SupplierOrganization | undefined {
    const org = this.supplierOrgs.get(id);
    if (!org) return undefined;
    const updated = { ...org, ...updates };
    this.supplierOrgs.set(id, updated);
    return updated;
  }

  // --- Applications ---
  public getApplication(id: string): SupplierApplication | undefined {
    return this.applications.get(id);
  }

  public getApplicationByCaseRef(caseRef: string): SupplierApplication | undefined {
    return Array.from(this.applications.values()).find(
      a => a.caseReference.toLowerCase() === caseRef.toLowerCase()
    );
  }

  public getApplicationsBySupplierOrg(supplierOrgId: string): SupplierApplication[] {
    return Array.from(this.applications.values()).filter(a => a.supplierOrgId === supplierOrgId);
  }

  public getAllApplications(buyerOrgId?: string): SupplierApplication[] {
    const all = Array.from(this.applications.values());
    if (buyerOrgId) {
      return all.filter(a => a.buyerOrgId === buyerOrgId);
    }
    return all;
  }

  public createApplication(app: SupplierApplication): SupplierApplication {
    this.applications.set(app.id, app);
    return app;
  }

  public updateApplication(id: string, updates: Partial<SupplierApplication>): SupplierApplication | undefined {
    const app = this.applications.get(id);
    if (!app) return undefined;
    const updated = { ...app, ...updates, updatedAt: new Date().toISOString() };
    this.applications.set(id, updated);
    return updated;
  }

  // --- Field Values ---
  public getFieldValuesByApplication(applicationId: string): ApplicationFieldValue[] {
    return Array.from(this.fieldValues.values()).filter(f => f.applicationId === applicationId);
  }

  public getFieldValue(id: string): ApplicationFieldValue | undefined {
    return this.fieldValues.get(id);
  }

  public upsertFieldValue(fieldValue: ApplicationFieldValue): ApplicationFieldValue {
    this.fieldValues.set(fieldValue.id, fieldValue);
    return fieldValue;
  }

  public deleteFieldValue(id: string): boolean {
    return this.fieldValues.delete(id);
  }

  // --- Documents ---
  public getDocumentsByApplication(applicationId: string): OnboardingDocument[] {
    return Array.from(this.documents.values()).filter(d => d.applicationId === applicationId);
  }

  public getDocument(id: string): OnboardingDocument | undefined {
    return this.documents.get(id);
  }

  public addDocument(doc: OnboardingDocument): OnboardingDocument {
    this.documents.set(doc.id, doc);
    return doc;
  }

  public updateDocument(id: string, updates: Partial<OnboardingDocument>): OnboardingDocument | undefined {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    const updated = { ...doc, ...updates };
    this.documents.set(id, updated);
    return updated;
  }

  // --- Email Intake ---
  public getAllEmailIntake(buyerOrgId?: string): EmailIntakeRecord[] {
    const list = Array.from(this.emailIntakes.values());
    if (buyerOrgId) {
      return list.filter(e => e.buyerOrgId === buyerOrgId);
    }
    return list;
  }

  public getEmailIntake(id: string): EmailIntakeRecord | undefined {
    return this.emailIntakes.get(id);
  }

  public createEmailIntake(record: EmailIntakeRecord): EmailIntakeRecord {
    this.emailIntakes.set(record.id, record);
    return record;
  }

  public updateEmailIntake(id: string, updates: Partial<EmailIntakeRecord>): EmailIntakeRecord | undefined {
    const record = this.emailIntakes.get(id);
    if (!record) return undefined;
    const updated = { ...record, ...updates };
    this.emailIntakes.set(id, updated);
    return updated;
  }

  // --- Review Tasks ---
  public getTasksByApplication(applicationId: string): ReviewTask[] {
    return Array.from(this.reviewTasks.values()).filter(t => t.applicationId === applicationId);
  }

  public getAllTasks(buyerOrgId?: string): ReviewTask[] {
    return Array.from(this.reviewTasks.values());
  }

  public createTask(task: ReviewTask): ReviewTask {
    this.reviewTasks.set(task.id, task);
    return task;
  }

  public updateTask(id: string, updates: Partial<ReviewTask>): ReviewTask | undefined {
    const task = this.reviewTasks.get(id);
    if (!task) return undefined;
    const updated = { ...task, ...updates };
    this.reviewTasks.set(id, updated);
    return updated;
  }

  // --- Messages ---
  public getMessagesByApplication(applicationId: string, includeInternal = true): SupplierMessage[] {
    return Array.from(this.messages.values())
      .filter(m => m.applicationId === applicationId && (includeInternal || !m.isInternalNote))
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  }

  public createMessage(msg: SupplierMessage): SupplierMessage {
    this.messages.set(msg.id, msg);
    return msg;
  }

  // --- Audit Events ---
  public getAuditEvents(buyerOrgId?: string, entityId?: string): AuditEvent[] {
    let list = this.auditEvents;
    if (buyerOrgId) {
      list = list.filter(a => a.buyerOrgId === buyerOrgId);
    }
    if (entityId) {
      list = list.filter(a => a.entityId === entityId || (a.details && a.details.applicationId === entityId));
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addAuditEvent(event: AuditEvent): void {
    this.auditEvents.push(event);
  }

  // --- Purchase Orders (P2P) ---
  public getPurchaseOrder(id: string): PurchaseOrder | undefined {
    return this.purchaseOrders.get(id);
  }

  public getAllPurchaseOrders(buyerOrgId?: string, supplierOrgId?: string): PurchaseOrder[] {
    let list = Array.from(this.purchaseOrders.values());
    if (buyerOrgId) list = list.filter(p => p.buyerOrgId === buyerOrgId);
    if (supplierOrgId) list = list.filter(p => p.supplierOrgId === supplierOrgId);
    return list.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  public createPurchaseOrder(po: PurchaseOrder): PurchaseOrder {
    this.purchaseOrders.set(po.id, po);
    return po;
  }

  public updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): PurchaseOrder | undefined {
    const po = this.purchaseOrders.get(id);
    if (!po) return undefined;
    const updated = { ...po, ...updates };
    this.purchaseOrders.set(id, updated);
    return updated;
  }

  // --- Invoices & PO Flip ---
  public getInvoice(id: string): Invoice | undefined {
    return this.invoices.get(id);
  }

  public getAllInvoices(buyerOrgId?: string, supplierOrgId?: string): Invoice[] {
    let list = Array.from(this.invoices.values());
    if (buyerOrgId) list = list.filter(i => i.buyerOrgId === buyerOrgId);
    if (supplierOrgId) list = list.filter(i => i.supplierOrgId === supplierOrgId);
    return list.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  }

  public createInvoice(invoice: Invoice): Invoice {
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  public updateInvoice(id: string, updates: Partial<Invoice>): Invoice | undefined {
    const inv = this.invoices.get(id);
    if (!inv) return undefined;
    const updated = { ...inv, ...updates, updatedAt: new Date().toISOString() };
    this.invoices.set(id, updated);
    return updated;
  }

  // --- Catalog Management ---
  public getAllCatalogItems(supplierOrgId?: string): CatalogItem[] {
    let list = Array.from(this.catalogItems.values());
    if (supplierOrgId) list = list.filter(c => c.supplierOrgId === supplierOrgId);
    return list;
  }

  public upsertCatalogItem(item: CatalogItem): CatalogItem {
    this.catalogItems.set(item.id, item);
    return item;
  }

  // --- Advance Shipping Notices (ASN) ---
  public getAllASNs(buyerOrgId?: string, supplierOrgId?: string): AdvanceShippingNotice[] {
    let list = Array.from(this.asns.values());
    if (buyerOrgId) list = list.filter(a => a.buyerOrgId === buyerOrgId);
    if (supplierOrgId) list = list.filter(a => a.supplierOrgId === supplierOrgId);
    return list.sort((a, b) => new Date(b.shippingDate).getTime() - new Date(a.shippingDate).getTime());
  }

  public getASN(id: string): AdvanceShippingNotice | undefined {
    return this.asns.get(id);
  }

  public createASN(asn: AdvanceShippingNotice): AdvanceShippingNotice {
    this.asns.set(asn.id, asn);
    return asn;
  }

  // --- Contextual Transaction Collaboration ---
  public getTransactionComments(entityType: string, entityId: string): TransactionComment[] {
    return Array.from(this.transactionComments.values())
      .filter(c => c.entityType === entityType && c.entityId === entityId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public addTransactionComment(comment: TransactionComment): TransactionComment {
    this.transactionComments.set(comment.id, comment);
    return comment;
  }
}

export const db = new MemoryDatabase();
