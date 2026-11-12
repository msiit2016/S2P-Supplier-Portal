/**
 * Verisource Page Action Bridge
 * 
 * Provides an event bus and state sync mechanism between Ava Copilot and
 * active pages (SupplierOrders, SupplierAsns, SupplierInvoices, Catalog, Tasks).
 * Enables Ava to dispatch mutations directly to the active page state and
 * enables active pages to stream live context into Ava's Gemini prompts.
 */

export type PageActionType =
  | 'UPDATE_PO_FIELD'
  | 'ADD_PO_LINE'
  | 'UPDATE_PO_LINE'
  | 'DELETE_PO_LINE'
  | 'SAVE_PO'
  | 'FLIP_PO_TO_ASN'
  | 'FLIP_PO_TO_INVOICE'
  | 'CREATE_PO'
  | 'UPDATE_ASN_FIELD'
  | 'CREATE_ASN'
  | 'FLIP_ASN_TO_INVOICE'
  | 'UPDATE_INVOICE_FIELD'
  | 'CREATE_INVOICE'
  | 'ACCEPT_EARLY_PAYMENT'
  | 'ADD_CATALOG_ITEM'
  | 'COMPLETE_TASK'
  | 'SET_PAGE_FILTER'
  | 'NAVIGATE_PAGE';

export interface PageAction {
  action: PageActionType | string;
  page?: string;
  payload: Record<string, any>;
  id?: string;
  timestamp?: number;
}

const ACTION_EVENT_NAME = 'verisource-page-action';
const CONTEXT_EVENT_NAME = 'verisource-page-context';

let latestPageContext: Record<string, any> = {};

/**
 * Dispatch an action (or multiple actions) from Ava to the active page component
 */
export function dispatchPageAction(actionOrActions: PageAction | PageAction[]): void {
  if (typeof window === 'undefined') return;

  const actions = Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions];
  actions.forEach(action => {
    const detailWithMeta: PageAction = {
      ...action,
      id: action.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now()
    };
    window.dispatchEvent(new CustomEvent(ACTION_EVENT_NAME, { detail: detailWithMeta }));
  });
}

/**
 * Register a listener inside a page component to handle actions dispatched by Ava
 */
export function onPageAction(handler: (action: PageAction) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<PageAction>;
    if (customEvent.detail) {
      handler(customEvent.detail);
    }
  };

  window.addEventListener(ACTION_EVENT_NAME, listener);
  return () => window.removeEventListener(ACTION_EVENT_NAME, listener);
}

/**
 * Broadcast current page form/table state to Ava so Gemini has full real-time awareness
 */
export function broadcastPageContext(context: Record<string, any>): void {
  latestPageContext = {
    ...latestPageContext,
    ...context,
    _lastUpdated: Date.now()
  };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONTEXT_EVENT_NAME, { detail: latestPageContext }));
  }
}

/**
 * Get current snapshot of active page state
 */
export function getPageContext(): Record<string, any> {
  return latestPageContext;
}

/**
 * Listen for page context changes
 */
export function onPageContext(handler: (context: Record<string, any>) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<Record<string, any>>;
    if (customEvent.detail) {
      handler(customEvent.detail);
    }
  };

  window.addEventListener(CONTEXT_EVENT_NAME, listener);
  return () => window.removeEventListener(CONTEXT_EVENT_NAME, listener);
}

/**
 * Parse structured action blocks from Gemini markdown output
 * Extracts ```json:action ... ``` or ```json ... ``` blocks
 */
export function parseActionsFromMarkdown(markdownText: string): {
  cleanText: string;
  actions: PageAction[];
} {
  const actions: PageAction[] = [];
  
  // Regex to match ```json:action ... ``` or ```action ... ``` or ```json { "action": ... } ```
  const actionRegex = /```(?:json:action|action|json)?\s*([\s\S]*?)\s*```/g;
  
  let cleanText = markdownText;
  let match: RegExpExecArray | null;

  while ((match = actionRegex.exec(markdownText)) !== null) {
    const rawCode = match[1].trim();
    if (rawCode.startsWith('{') || rawCode.startsWith('[')) {
      try {
        const parsed = JSON.parse(rawCode);
        if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            if (item && item.action) {
              actions.push(item);
            }
          });
          // Remove the code block from the user-facing text
          cleanText = cleanText.replace(match[0], '').trim();
        } else if (parsed && parsed.action) {
          actions.push(parsed);
          cleanText = cleanText.replace(match[0], '').trim();
        }
      } catch (err) {
        // Not a JSON action block, ignore
      }
    }
  }

  return { cleanText, actions };
}

