const API_ORIGIN = (import.meta as any).env?.VITE_API_URL
  ? ((import.meta as any).env.VITE_API_URL.startsWith('http')
      ? (import.meta as any).env.VITE_API_URL
      : `https://${(import.meta as any).env.VITE_API_URL}`)
  : '';

export const BASE_URL = `${API_ORIGIN}/api/v1`;

export class ApiClient {
  private static getHeaders(): HeadersInit {
    const savedUser = localStorage.getItem('active_supplier_user') || localStorage.getItem('active_user');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-portal-type': 'supplier'
    };
    if (savedUser && savedUser !== 'LOGGED_OUT') {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.id) {
          headers['x-simulated-user-id'] = u.id;
        }
      } catch (e) {
        // ignore
      }
    }
    if (!headers['x-simulated-user-id'] && savedUser !== 'LOGGED_OUT') {
      headers['x-simulated-user-id'] = 'user-supp-acme';
    }
    return headers;
  }

  // Demo users
  public static async getDemoUsers() {
    const res = await fetch(`${BASE_URL}/auth/demo-users`);
    return res.json();
  }

  // Auth
  public static async login(email: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  }

  public static async registerSupplier(data: any) {
    const res = await fetch(`${BASE_URL}/auth/register-supplier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }

  // Applications
  public static async getApplications(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/applications?${query}`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async getApplication(id: string) {
    const res = await fetch(`${BASE_URL}/applications/${id}`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async createApplication(data: any) {
    const res = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async transitionApplication(id: string, targetState: string, reason?: string) {
    const res = await fetch(`${BASE_URL}/applications/${id}/transition`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ targetState, reason })
    });
    return res.json();
  }

  public static async upsertField(applicationId: string, fieldData: any) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/fields`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(fieldData)
    });
    return res.json();
  }

  public static async verifyField(applicationId: string, fieldId: string, status: string, correctedValue?: any) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/fields/${fieldId}/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, correctedValue })
    });
    return res.json();
  }

  public static async unmaskField(applicationId: string, fieldId: string) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/fields/unmask`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ fieldId })
    });
    return res.json();
  }

  // Documents
  public static async getDocuments(applicationId: string) {
    const res = await fetch(`${BASE_URL}/documents/${applicationId}`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async uploadDocument(applicationId: string, data: any) {
    const res = await fetch(`${BASE_URL}/documents/${applicationId}/upload`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async verifyDocument(docId: string, status: string, note?: string) {
    const res = await fetch(`${BASE_URL}/documents/${docId}/verify`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, note })
    });
    return res.json();
  }

  // Email intake
  public static async getEmailIntake() {
    const res = await fetch(`${BASE_URL}/email-intake`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async simulateIncomingEmail(data: any) {
    const res = await fetch(`${BASE_URL}/email-intake/simulate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async associateEmail(intakeId: string, applicationId: string) {
    const res = await fetch(`${BASE_URL}/email-intake/${intakeId}/associate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ applicationId })
    });
    return res.json();
  }

  // AI Agent endpoints
  public static async checkDuplicate(data: any) {
    const res = await fetch(`${BASE_URL}/ai/duplicate-check`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async checkCompleteness(applicationId: string) {
    const res = await fetch(`${BASE_URL}/ai/completeness-check`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ applicationId })
    });
    return res.json();
  }

  public static async getExecutiveSummary(applicationId: string) {
    const res = await fetch(`${BASE_URL}/ai/executive-summary`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ applicationId })
    });
    return res.json();
  }

  public static async draftClarification(applicationId: string) {
    const res = await fetch(`${BASE_URL}/ai/draft-clarification`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ applicationId })
    });
    return res.json();
  }

  public static async chatCopilot(data: { applicationId?: string; message: string }) {
    const res = await fetch(`${BASE_URL}/ai/copilot-chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async verifyExternal(type: string, payload: any) {
    const res = await fetch(`${BASE_URL}/ai/verify-external`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ type, ...payload })
    });
    return res.json();
  }

  // Messages
  public static async getMessages(applicationId: string) {
    const res = await fetch(`${BASE_URL}/messages/${applicationId}`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async sendMessage(applicationId: string, messageData: any) {
    const res = await fetch(`${BASE_URL}/messages/${applicationId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(messageData)
    });
    return res.json();
  }

  // Audit
  public static async getAuditLogs(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/audit?${query}`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  // Suppliers Directory
  public static async getSuppliers(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/suppliers?${query}`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  // ========================
  // P2P / S2P Transaction Methods
  // ========================

  public static async getOrders(buyerOrgId?: string) {
    const url = buyerOrgId ? `${BASE_URL}/p2p/orders?buyerOrgId=${encodeURIComponent(buyerOrgId)}` : `${BASE_URL}/p2p/orders`;
    const res = await fetch(url, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async getOrder(id: string) {
    const res = await fetch(`${BASE_URL}/p2p/orders/${id}`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async acknowledgeOrder(id: string) {
    const res = await fetch(`${BASE_URL}/p2p/orders/${id}/acknowledge`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async dispatchASN(id: string, data: { carrier: string; trackingNumber: string; estimatedDelivery?: string }) {
    const res = await fetch(`${BASE_URL}/p2p/orders/${id}/asn`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async getASNs(buyerOrgId?: string) {
    const url = buyerOrgId ? `${BASE_URL}/p2p/asns?buyerOrgId=${encodeURIComponent(buyerOrgId)}` : `${BASE_URL}/p2p/asns`;
    const res = await fetch(url, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async flipPOToInvoice(id: string, data?: { invoiceNumber?: string; taxRate?: number }) {
    const res = await fetch(`${BASE_URL}/p2p/orders/${id}/flip-invoice`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data || {})
    });
    return res.json();
  }

  public static async getInvoices(buyerOrgId?: string) {
    const url = buyerOrgId ? `${BASE_URL}/p2p/invoices?buyerOrgId=${encodeURIComponent(buyerOrgId)}` : `${BASE_URL}/p2p/invoices`;
    const res = await fetch(url, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async getInvoice(id: string) {
    const res = await fetch(`${BASE_URL}/p2p/invoices/${id}`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async acceptEarlyPayment(id: string, data: { discountPercent: number; daysEarly: number }) {
    const res = await fetch(`${BASE_URL}/p2p/invoices/${id}/early-payment`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async getCatalogItems() {
    const res = await fetch(`${BASE_URL}/p2p/catalog`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async upsertCatalogItem(item: any) {
    const res = await fetch(`${BASE_URL}/p2p/catalog`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(item)
    });
    return res.json();
  }

  public static async deleteCatalogItem(idOrSku: string) {
    const res = await fetch(`${BASE_URL}/p2p/catalog/${encodeURIComponent(idOrSku)}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async getTransactionComments(entityType: string, entityId: string) {
    const res = await fetch(`${BASE_URL}/p2p/comments/${entityType}/${entityId}`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async addTransactionComment(entityType: string, entityId: string, text: string) {
    const res = await fetch(`${BASE_URL}/p2p/comments/${entityType}/${entityId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text })
    });
    return res.json();
  }

  // ==========================================
  // Verisource Multi-Enterprise Profile APIs
  // ==========================================

  public static async getPublicSupplierProfile(slug: string = 'acme-industrial-tech') {
    try {
      const res = await fetch(`${BASE_URL}/public/supplier-profile/${slug}`);
      if (!res.ok) throw new Error('Public profile not found');
      return await res.json();
    } catch (err) {
      // Fallback
      return this.getGlobalProfile();
    }
  }

  public static async getGlobalProfile() {
    const res = await fetch(`${BASE_URL}/supplier-profiles/global`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async updateGlobalProfile(data: any) {
    const res = await fetch(`${BASE_URL}/supplier-profiles/global`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async getBuyerProfiles() {
    const res = await fetch(`${BASE_URL}/supplier-profiles/buyers`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async getBuyerProfile(buyerOrgId: string) {
    const res = await fetch(`${BASE_URL}/supplier-profiles/buyers/${buyerOrgId}`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async updateBuyerProfile(buyerOrgId: string, data: any) {
    const res = await fetch(`${BASE_URL}/supplier-profiles/buyers/${buyerOrgId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async syncBuyerProfileAi(buyerOrgId: string) {
    const res = await fetch(`${BASE_URL}/supplier-profiles/buyers/${buyerOrgId}/sync-ai`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async connectNewBuyer(data: { 
    buyerName: string; 
    buyerEmail?: string; 
    buyerContactName?: string; 
    invitationCode?: string; 
    connectionMethod?: 'EMAIL_INVITE' | 'ENTER_CODE'; 
    customMessage?: string;
  }) {
    const res = await fetch(`${BASE_URL}/supplier-profiles/buyers/connect`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async syncToMaster(updates: any, sourceBuyerName?: string) {
    const res = await fetch(`${BASE_URL}/supplier-profiles/sync-to-master`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ updates, sourceBuyerName })
    });
    return res.json();
  }
}



