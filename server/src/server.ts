import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import emailIntakeRoutes from './routes/emailIntakeRoutes.js';
import aiAgentRoutes from './routes/aiAgentRoutes.js';
import communicationRoutes from './routes/communicationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import supplierDirectoryRoutes from './routes/supplierDirectoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import profileRoutes, { getPublicProfileBySlug } from './routes/profileRoutes.js';
import { authenticate } from './middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multi-path robust .env loading (supports running from root or /server)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Agentic Supplier Onboarding & P2P API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Public Unauthenticated Routes
app.use('/api/v1/auth', authRoutes);

// Public View-Only Supplier Profile endpoint (Unauthenticated access for shareable URL)
app.get('/api/v1/public/supplier-profile/:slug', (req, res) => {
  const { slug } = req.params;
  const profile = getPublicProfileBySlug(slug);
  if (!profile) {
    res.status(404).json({ error: 'Public profile not found' });
    return;
  }
  res.json({ profile, isPublicView: true });
});

app.use('/api/v1/applications', authenticate, applicationRoutes);
app.use('/api/v1/documents', authenticate, documentRoutes);
app.use('/api/v1/email-intake', authenticate, emailIntakeRoutes);
app.use('/api/v1/ai', authenticate, aiAgentRoutes);
app.use('/api/v1/messages', authenticate, communicationRoutes);
app.use('/api/v1/audit', authenticate, auditRoutes);
app.use('/api/v1/suppliers', authenticate, supplierDirectoryRoutes);
app.use('/api/v1/p2p', authenticate, transactionRoutes);
app.use('/api/v1/supplier-profiles', authenticate, profileRoutes);

// -----------------------------------------------------------------------------
// Production Static Frontend Serving (All-in-One Deployment Mode)
// -----------------------------------------------------------------------------
const supplierDist = path.resolve(__dirname, '../../supplier-portal/dist');
const buyerDist = path.resolve(__dirname, '../../buyer-portal/dist');

// Serve buyer portal at /buyer if built
if (fs.existsSync(buyerDist)) {
  app.use('/buyer', express.static(buyerDist));
  app.get('/buyer*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(buyerDist, 'index.html'));
  });
}

// Serve supplier portal at / if built
if (fs.existsSync(supplierDist)) {
  app.use(express.static(supplierDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(supplierDist, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Supplier Onboarding Backend API running on port ${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   Buyer API:    http://localhost:${PORT}/api/v1/applications`);
  console.log(`=======================================================`);
});

export default app;
