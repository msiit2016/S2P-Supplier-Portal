const BASE_URL = '/api/v1';

export class ApiClient {
  private static getHeaders(): HeadersInit {
    const savedUser = localStorage.getItem('active_user');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.id) {
          headers['x-simulated-user-id'] = u.id;
        }
      } catch (e) {
        // ignore
      }
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
}
