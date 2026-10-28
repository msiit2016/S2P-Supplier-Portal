import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/memoryDb.js';
import { User, SupplierOrganization } from '../models/types.js';
import { AuditService } from '../services/auditService.js';

const router = Router();

// Get list of pre-configured demo users for instant switching
router.get('/demo-users', (req: Request, res: Response) => {
  const users = db.getAllUsers();
  res.json({
    users: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      userType: u.userType,
      organizationName: u.organizationName
    }))
  });
});

// User login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or credentials' });
    return;
  }

  AuditService.log(
    { id: user.id, name: user.name, role: user.role, buyerOrgId: user.organizationId },
    'USER_LOGIN',
    'USER',
    user.id,
    { email: user.email, userType: user.userType }
  );

  res.json({
    token: `token-${user.id}-${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      userType: user.userType,
      organizationId: user.organizationId,
      organizationName: user.organizationName,
      isEmailVerified: user.isEmailVerified
    }
  });
});

// Supplier registration
router.post('/register-supplier', (req: Request, res: Response) => {
  const { legalName, businessEmail, country, contactName, password, phone, website } = req.body;
  
  if (!legalName || !businessEmail || !contactName) {
    res.status(400).json({ error: 'Legal company name, business email, and primary contact name are required.' });
    return;
  }

  const existing = db.getUserByEmail(businessEmail);
  if (existing) {
    res.status(409).json({ error: 'An account with this email address already exists.' });
    return;
  }

  const orgId = `supp-org-${uuidv4().slice(0, 6)}`;
  const userId = `user-supp-${uuidv4().slice(0, 6)}`;

  const newOrg: SupplierOrganization = {
    id: orgId,
    legalName,
    businessEmail,
    country: country || 'United States',
    phone,
    website,
    status: 'ONBOARDING',
    createdAt: new Date().toISOString()
  };

  const newUser: User = {
    id: userId,
    email: businessEmail,
    name: contactName,
    role: 'SUPPLIER_ADMIN',
    userType: 'SUPPLIER',
    organizationId: orgId,
    organizationName: legalName,
    isEmailVerified: false,
    createdAt: new Date().toISOString()
  };

  db.createSupplierOrg(newOrg);
  db.createUser(newUser);

  AuditService.log(
    { id: userId, name: contactName, role: 'SUPPLIER_ADMIN' },
    'SUPPLIER_REGISTERED',
    'SUPPLIER_ORGANIZATION',
    orgId,
    { email: businessEmail, legalName }
  );

  res.status(201).json({
    message: 'Supplier account created. Verification code sent.',
    verificationToken: 'verify-token-2026',
    user: newUser,
    organization: newOrg
  });
});

// Verify email
router.post('/verify-email', (req: Request, res: Response) => {
  const { userId, token } = req.body;
  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  user.isEmailVerified = true;
  AuditService.log(
    { id: user.id, name: user.name, role: user.role },
    'EMAIL_VERIFIED',
    'USER',
    user.id
  );

  res.json({ success: true, message: 'Email successfully verified' });
});

export default router;
