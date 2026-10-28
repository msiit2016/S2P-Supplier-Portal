import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/memoryDb.js';
import { AuditEvent, User } from '../models/types.js';

export class AuditService {
  public static log(
    actor: { id: string; name: string; role: string; buyerOrgId?: string },
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, any> = {}
  ): AuditEvent {
    const event: AuditEvent = {
      id: `aud-${uuidv4().slice(0, 8)}`,
      buyerOrgId: actor.buyerOrgId || 'buyer-org-1',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };

    db.addAuditEvent(event);
    return event;
  }

  public static getEventsForEntity(entityId: string): AuditEvent[] {
    return db.getAuditEvents(undefined, entityId);
  }

  public static getAllEvents(buyerOrgId?: string): AuditEvent[] {
    return db.getAuditEvents(buyerOrgId);
  }
}
