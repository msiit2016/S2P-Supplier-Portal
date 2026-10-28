import { Router, Response } from 'express';
import { db } from '../db/memoryDb.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

// GET all suppliers
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const { status, search } = req.query;
  let suppliers = db.getAllSupplierOrgs();

  if (status && status !== 'ALL') {
    suppliers = suppliers.filter(s => s.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    suppliers = suppliers.filter(s => 
      s.legalName.toLowerCase().includes(q) || 
      (s.tradeName && s.tradeName.toLowerCase().includes(q)) ||
      (s.taxId && s.taxId.includes(q)) ||
      s.businessEmail.toLowerCase().includes(q)
    );
  }

  res.json({ suppliers });
});

// GET supplier by ID
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const supplier = db.getSupplierOrg(req.params.id);
  if (!supplier) {
    res.status(404).json({ error: 'Supplier not found' });
    return;
  }
  const applications = db.getApplicationsBySupplierOrg(supplier.id);
  res.json({ supplier, applications });
});

export default router;
