import { Request, Response, NextFunction } from 'express';
import { db } from '../db/memoryDb.js';
import { User, UserRole, UserType } from '../models/types.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
  params: any;
  body: any;
  query: any;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const simulatedUserId = req.headers['x-simulated-user-id'] as string;
  const portalType = req.headers['x-portal-type'] as string;
  const referer = req.headers.referer || '';
  const origin = req.headers.origin || '';
  const isSupplierContext = portalType === 'supplier' || referer.includes(':3003') || origin.includes(':3003') || req.path.includes('supplier');

  if (simulatedUserId) {
    const user = db.getUserById(simulatedUserId) || db.getUserByEmail(simulatedUserId);
    if (user) {
      req.user = user;
      return next();
    }

    // If simulated user indicates supplier or custom supplier email or is in supplier portal
    if (simulatedUserId.startsWith('user-supp') || simulatedUserId.includes('@') || isSupplierContext) {
      const defaultSupplier = db.getUserById('user-supp-acme') || db.getUserById('user-supp-1');
      if (defaultSupplier) {
        req.user = {
          ...defaultSupplier,
          id: simulatedUserId,
          email: simulatedUserId.includes('@') ? simulatedUserId : defaultSupplier.email
        };
        return next();
      }
    }
  }

  // Fallback to default supplier if accessed from supplier portal or supplier routes
  if (isSupplierContext) {
    const defaultSupplier = db.getUserById('user-supp-acme') || db.getUserById('user-supp-1');
    if (defaultSupplier) {
      req.user = defaultSupplier;
      return next();
    }
  }

  // Fallback to default user if testing header not provided
  const defaultBuyer = db.getUserById('user-buyer-2') || db.getUserById('user-buyer-1');
  req.user = defaultBuyer;
  next();
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden: Insufficient permissions for this action',
        requiredRoles: allowedRoles,
        userRole: req.user?.role
      });
      return;
    }
    next();
  };
};

export const requireUserType = (type: UserType) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.userType !== type) {
      res.status(403).json({
        error: `Forbidden: This resource requires a ${type} account`,
        actualUserType: req.user?.userType
      });
      return;
    }
    next();
  };
};
