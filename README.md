# S2P Supplier Collaboration & Buyer Onboarding Platform

Enterprise Agentic Source-to-Pay (S2P) Platform featuring an Autonomous Supplier Portal, Buyer Workspace, Document Vault, and Punch-out Catalog Item Management.

---

## 🌟 Key Highlights & Architecture

The platform provides a dual-portal ecosystem:

### 1. 🏢 Smart Supplier Portal (`/supplier-portal`)
- **Stage 5 Transaction Ready**: Authorized for Purchase Orders, ASNs, and Dynamic Invoicing.
- **Document Vault (`/documents`, `/doc-vault`)**:
  - Secure repository for all business, compliance, and legal records.
  - Supports permanent/no-expiration documents (NDAs, Bylaws, incorporation) and time-bound certifications (ACORD 25, W-9, ISO 27001).
  - Status indicators: Verified, Renewal Due alerts, and active file picker.
- **Catalog Items (`/catalog`)**:
  - Contracted product and service items synchronized with buyer procurement punch-out carts.
  - Bulk CSV Import modal with 1-click template download, file upload, row preview, and validation.
- **Multi-Enterprise Profile Hub (`/public-profile`)**: Universal vendor schema synchronized across multiple buyers.
- **Dual-Pane Guided Onboarding (`/onboarding`)**: Fast-track onboarding workflow with AI attestation.

### 2. 🏛️ Buyer Workspace Hub (`/buyer-portal`)
- Enterprise vendor directory, risk scoring, automated TIN verification, and compliance checks.
- Workflow approvals for supplier onboarding requests, catalog approvals, and contract terms.

### 3. ⚙️ Backend Services (`/server`)
- Node.js / Express REST API handling P2P transaction lifecycle, catalog management, compliance verification, and multi-buyer profile synchronization.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation
Install dependencies in root, server, buyer-portal, and supplier-portal:
```bash
npm install
cd server && npm install
cd ../buyer-portal && npm install
cd ../supplier-portal && npm install
cd ..
```

### Running Locally
To launch all services concurrently (Server, Buyer Portal, and Supplier Portal):
```bash
npm run dev
```

* **Supplier Portal**: `http://localhost:3003`
* **Buyer Portal**: `http://localhost:3002`
* **API Server**: `http://localhost:3001`

---

## 🛠️ Build & Verification
Build all portals and production bundles:
```bash
npm run build
```