import express from 'express';
import cors from 'cors';
import path from 'path';
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
import profileRoutes from './routes/profileRoutes.js';
import { authenticate } from './middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/applications', authenticate, applicationRoutes);
app.use('/api/v1/documents', authenticate, documentRoutes);
app.use('/api/v1/email-intake', authenticate, emailIntakeRoutes);
app.use('/api/v1/ai', authenticate, aiAgentRoutes);
app.use('/api/v1/messages', authenticate, communicationRoutes);
app.use('/api/v1/audit', authenticate, auditRoutes);
app.use('/api/v1/suppliers', authenticate, supplierDirectoryRoutes);
app.use('/api/v1/p2p', authenticate, transactionRoutes);
app.use('/api/v1/supplier-profiles', authenticate, profileRoutes);

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
