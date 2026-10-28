import { Request, Response, NextFunction } from 'express';
import { db } from '../db/memoryDb.js';
import { User, UserRole, UserType } from '../models/types.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const simulatedUserId = req.headers['x-simulated-user-id'] as string;

  if (simulatedUserId) {
    const user = db.getUserById(simulatedUserId);
    if (user) {
      req.user = user;
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
