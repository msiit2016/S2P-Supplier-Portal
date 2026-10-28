import { db } from '../db/memoryDb.js';
import { ApplicationState, SupplierApplication, User } from '../models/types.js';
import { AuditService } from './auditService.js';

export class WorkflowService {
  private static readonly VALID_TRANSITIONS: Record<ApplicationState, ApplicationState[]> = {
    DRAFT: ['REGISTRATION_IN_PROGRESS', 'SUBMITTED', 'CANCELLED'],
    REGISTRATION_IN_PROGRESS: ['SUBMITTED', 'WITHDRAWN', 'CANCELLED'],
    SUBMITTED: ['UNDER_REVIEW', 'CHANGES_REQUESTED', 'CANCELLED'],
    UNDER_REVIEW: ['CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED'],
    CHANGES_REQUESTED: ['RESUBMITTED', 'WITHDRAWN', 'CANCELLED'],
    RESUBMITTED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED'],
    APPROVED: [], // terminal state
    REJECTED: ['DRAFT'], // allow appeal/re-opening
    WITHDRAWN: ['DRAFT'],
    CANCELLED: []
  };

  public static canTransition(current: ApplicationState, target: ApplicationState): boolean {
    const allowed = this.VALID_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  public static transition(
    applicationId: string,
    targetState: ApplicationState,
    actor: { id: string; name: string; role: string; buyerOrgId?: string },
    reason?: string
  ): { success: boolean; application?: SupplierApplication; error?: string } {
    const app = db.getApplication(applicationId);
    if (!app) {
      return { success: false, error: `Application not found with id ${applicationId}` };
    }

    if (!this.canTransition(app.status, targetState)) {
      return { 
        success: false, 
        error: `Illegal state transition from ${app.status} to ${targetState}. Allowed: ${(this.VALID_TRANSITIONS[app.status] || []).join(', ')}` 
      };
    }

    // Role-based transition guard
    if (targetState === 'APPROVED') {
      const allowedApprovers = ['BUYER_ADMIN', 'BUYER_APPROVER'];
      if (!allowedApprovers.includes(actor.role)) {
        return { 
          success: false, 
          error: `User role '${actor.role}' is not authorized to give final approval. Required: ${allowedApprovers.join(' or ')}` 
        };
      }
    }

    const updates: Partial<SupplierApplication> = {
      status: targetState,
      updatedAt: new Date().toISOString()
    };

    if (targetState === 'SUBMITTED') {
      updates.submittedAt = new Date().toISOString();
    } else if (targetState === 'UNDER_REVIEW') {
      updates.reviewedAt = new Date().toISOString();
      if (!app.assignedReviewerId && actor.role.startsWith('BUYER')) {
        updates.assignedReviewerId = actor.id;
        updates.assignedReviewerName = actor.name;
      }
    } else if (targetState === 'APPROVED') {
      updates.approvedAt = new Date().toISOString();
      updates.approverId = actor.id;
      updates.approverName = actor.name;
      // Generate ERP Vendor Code
      const erpCode = `VEND-${Math.floor(10000 + Math.random() * 90000)}`;
      updates.erpVendorId = erpCode;
      updates.activatedAt = new Date().toISOString();

      // Update supplier organization status to ACTIVE
      db.updateSupplierOrg(app.supplierOrgId, {
        status: 'ACTIVE',
        erpVendorId: erpCode
      });
    }

    const updatedApp = db.updateApplication(applicationId, updates);

    AuditService.log(actor, `TRANSITION_${targetState}`, 'APPLICATION', applicationId, {
      fromStatus: app.status,
      toStatus: targetState,
      reason: reason || 'Workflow state transition executed',
      erpVendorId: updates.erpVendorId
    });

    return { success: true, application: updatedApp };
  }
}
