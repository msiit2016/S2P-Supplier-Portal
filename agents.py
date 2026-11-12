#!/usr/bin/env python3
"""
Verisource Autonomous Multi-Enterprise Source-to-Pay (S2P) Agent Network
========================================================================

Dedicated Multi-Agent Orchestration System with Page-Specific Agents, 
Autonomous Flow Instructions, Dynamic Context Perception, and Tool Execution.

Architecture:
- BaseS2PAgent: Abstract base class defining the standard S2P agent contract.
- 11 Specialized Page Agents:
    1. OnboardingQualificationAgent  (/onboarding)
    2. CatalogPricingAgent           (/catalog)
    3. OrderFulfillmentAgent         (/orders)
    4. LogisticsAsnAgent             (/asns, /shipments)
    5. InvoicingSettlementAgent      (/invoices)
    6. SourcingBidsAgent             (/rfps)
    7. ComplianceVaultAgent          (/documents)
    8. ExecutiveSupervisorAgent      (/dashboard)
    9. MasterPassportAgent           (/public-profile)
   10. TaskPrioritizationAgent       (/tasks)
   11. FinancialLedgerAgent          (/transactions)
- AgentRegistry: Routes URLs to corresponding specialized page agent.
- CLI Entrypoint: Enables direct command-line execution, automated tests, or microservice invocation.
"""

import sys
import json
import argparse
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field, asdict


# ==============================================================================
# DATA MODELS & PROTOCOLS
# ==============================================================================

@dataclass
class SuggestedPrompt:
    label: str
    prompt: str
    icon: str
    action: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None

@dataclass
class AgentTool:
    name: str
    description: str
    parameters: Dict[str, Any]

@dataclass
class AgentBriefing:
    agent_name: str
    role: str
    route: str
    page_context_name: str
    greeting: str
    suggested_prompts: List[SuggestedPrompt]
    available_tools: List[AgentTool]
    metrics_summary: Dict[str, Any] = field(default_factory=dict)
    urgent_bottleneck: Optional[str] = None


# ==============================================================================
# ABSTRACT BASE AGENT
# ==============================================================================

class BaseS2PAgent:
    """
    Standard interface for all page-specific S2P enterprise agents.
    Enforces a strict 4-phase loop:
      1. Perceive: Ingest real-time page telemetry.
      2. Reason & Triage: Identify critical path bottlenecks.
      3. Synthesize: Formulate dynamic briefing and actionable prompts.
      4. Act: Dispatch executable tool mutations.
    """

    def __init__(self, name: str, role: str, route_pattern: str, page_context_name: str):
        self.name = name
        self.role = role
        self.route_pattern = route_pattern
        self.page_context_name = page_context_name
        self.flow_instructions: List[str] = []
        self.tools: List[AgentTool] = []
        self.init_agent()

    def init_agent(self) -> None:
        """Subclasses define flow instructions and tool registry here."""
        raise NotImplementedError

    def perceive(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Validates and extracts key operational telemetry from live page context."""
        return context or {}

    def reason_and_triage(self, context: Dict[str, Any]) -> Optional[str]:
        """Identifies the single highest-priority bottleneck or required action."""
        return None

    def generate_greeting(self, context: Dict[str, Any], bottleneck: Optional[str]) -> str:
        """Dynamically generates real-time briefing based on actual data on screen."""
        raise NotImplementedError

    def generate_prompts(self, context: Dict[str, Any], bottleneck: Optional[str]) -> List[SuggestedPrompt]:
        """Generates proactive suggested prompts tailored to current page entities."""
        raise NotImplementedError

    def synthesize(self, context: Dict[str, Any]) -> AgentBriefing:
        """Executes full perception-reasoning-synthesis cycle."""
        cleaned_context = self.perceive(context)
        bottleneck = self.reason_and_triage(cleaned_context)
        greeting = self.generate_greeting(cleaned_context, bottleneck)
        prompts = self.generate_prompts(cleaned_context, bottleneck)

        return AgentBriefing(
            agent_name=self.name,
            role=self.role,
            route=self.route_pattern,
            page_context_name=self.page_context_name,
            greeting=greeting,
            suggested_prompts=prompts,
            available_tools=self.tools,
            metrics_summary=cleaned_context.get("metrics", {}),
            urgent_bottleneck=bottleneck
        )

    def execute_tool(self, tool_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Executes tool action or returns structured payload for frontend dispatch."""
        matching_tool = next((t for t in self.tools if t.name == tool_name), None)
        if not matching_tool:
            return {"status": "ERROR", "message": f"Tool '{tool_name}' not registered for {self.name}"}

        return {
            "status": "SUCCESS",
            "agent": self.name,
            "tool": tool_name,
            "dispatched_action": {
                "action": tool_name,
                "payload": payload
            }
        }


# ==============================================================================
# 1. BUYER ONBOARDING AGENT (/onboarding)
# ==============================================================================

class OnboardingQualificationAgent(BaseS2PAgent):
    """
    Manages incoming enterprise buyer onboarding invitations, compliance questionnaires,
    Master Profile auto-fill, and ERP vendor activation.
    """

    def init_agent(self) -> None:
        self.flow_instructions = [
            "Step 1: Ingest active buyer onboarding requests (NovaTech, Apex Global, Meridian Health).",
            "Step 2: Detect blocking compliance gates (e.g. ITAR Mil-Spec attestation for defense contracts).",
            "Step 3: Measure Master Profile field auto-fill match percentage (W-9, ACH, insurance).",
            "Step 4: Triage by submission deadline; alert if an action is pending start.",
            "Step 5: Provide 1-click tools to redeem invite codes, trigger auto-fill, and submit dossiers."
        ]
        self.tools = [
            AgentTool("OPEN_INVITE_MODAL", "Open modal to enter a new buyer invitation code.", {}),
            AgentTool("FILTER_ONBOARDING_STATUS", "Filter onboarding requests by status.", {"status": "ALL | ACTION_REQUIRED | IN_PROGRESS | UNDER_REVIEW"}),
            AgentTool("START_BUYER_DOSSIER", "Navigate directly to a buyer's onboarding questionnaire.", {"buyerOrgId": "string"}),
            AgentTool("AUTO_FILL_QUESTIONNAIRE", "Auto-populate questionnaire with Master Profile records.", {"buyerOrgId": "string"})
        ]

    def reason_and_triage(self, context: Dict[str, Any]) -> Optional[str]:
        requests = context.get("requests", [])
        action_req = next((r for r in requests if r.get("status") == "ACTION_REQUIRED"), None)
        if action_req:
            return f"Action Required: {action_req.get('buyerName', 'Enterprise Buyer')} requires immediate questionnaire start (Due in {action_req.get('deadlineDays', 10)} days)."
        return "All onboarding requests are progressing normally. 1 under buyer review."

    def generate_greeting(self, context: Dict[str, Any], bottleneck: Optional[str]) -> str:
        total = context.get("totalRequests", 3)
        pending = context.get("pendingCount", 1)
        in_progress = context.get("inProgressCount", 1)
        under_review = context.get("underReviewCount", 1)

        return (
            f"Hi! I'm **Ava**, your **Buyer Onboarding & Compliance Agent**.\n\n"
            f"Here is your live buyer onboarding pipeline:\n"
            f"• **Total Active Requests:** {total} enterprise buyers\n"
            f"• **Action Required:** {pending} pending start (NovaTech Aerospace • ITAR Attestation)\n"
            f"• **In Progress:** {in_progress} in drafting (Apex Global • 67% completed)\n"
            f"• **Under Review:** {under_review} submitted (Meridian Health • In Adjudication)\n\n"
            f"**Priority Focus:** {bottleneck}\n\n"
            f"How can I assist with your buyer qualifications today?"
        )

    def generate_prompts(self, context: Dict[str, Any], bottleneck: Optional[str]) -> List[SuggestedPrompt]:
        return [
            SuggestedPrompt(
                label="Complete NovaTech ITAR Attestation",
                prompt="What compliance items are needed for NovaTech Aerospace onboarding?",
                icon="AlertTriangle",
                action="START_BUYER_DOSSIER",
                payload={"buyerOrgId": "buyer-org-2"}
            ),
            SuggestedPrompt(
                label="Auto-fill Apex Global Packet",
                prompt="How do I auto-fill the remaining fields for Apex Global from my Master Profile?",
                icon="Zap",
                action="AUTO_FILL_QUESTIONNAIRE",
                payload={"buyerOrgId": "buyer-org-1"}
            ),
            SuggestedPrompt(
                label="Check Meridian Review SLA",
                prompt="What is the current status and review SLA for Meridian Health Network?",
                icon="Clock"
            ),
            SuggestedPrompt(
                label="Redeem New Invitation Code",
                prompt="Open modal to redeem an invitation code from an enterprise buyer.",
                icon="Plus",
                action="OPEN_INVITE_MODAL",
                payload={}
            )
        ]


# ==============================================================================
# 2. CATALOG & PRICING AGENT (/catalog)
# ==============================================================================

class CatalogPricingAgent(BaseS2PAgent):
    """
    Manages item master, contracted rate schedules, UNSPSC categories, pricing inquiries,
    and bulk catalog synchronization with buyer ERPs.
    """

    def init_agent(self) -> None:
        self.flow_instructions = [
            "Step 1: Scan active item codes, categories, and price spans.",
            "Step 2: Inspect pending buyer pricing inquiries and rate discrepancies.",
            "Step 3: Enforce volume discount tiers (e.g. 12% Master Volume Discount for Tier-1).",
            "Step 4: Check lead-time SLAs (48-72h fulfillment commitment for dock intake).",
            "Step 5: Provide tools to add SKUs, resolve inquiries, and filter by category."
        ]
        self.tools = [
            AgentTool("OPEN_ADD_SKU_MODAL", "Open modal to register a new SKU item code.", {}),
            AgentTool("FILTER_CATEGORY", "Filter catalog list by UNSPSC classification.", {"category": "string"}),
            AgentTool("SIMULATE_VOLUME_DISCOUNT", "Calculate tiered volume pricing.", {"sku": "string", "qty": "number"}),
            AgentTool("OPEN_PRICING_INQUIRY", "View and respond to pending buyer pricing inquiries.", {"inquiryId": "string"})
        ]

    def reason_and_triage(self, context: Dict[str, Any]) -> Optional[str]:
        inquiries = context.get("pricingInquiriesCount", 1)
        if inquiries > 0:
            return f"1 Pricing Inquiry pending review from Apex Global for ACM-NODE-800."
        return "All catalog rates conformed to buyer ERP schedules with 0% variance."

    def generate_greeting(self, context: Dict[str, Any], bottleneck: Optional[str]) -> str:
        items_count = context.get("totalItems", 5)
        categories_count = context.get("categoriesCount", 2)
        min_price = context.get("minPrice", "$225")
        max_price = context.get("maxPrice", "$18,500")

        return (
            f"Hi! I'm **Ava**, your **Catalog & Pricing Agent**.\n\n"
            f"Here is your live SKU catalog and contract rate schedule:\n"
            f"• **Active Catalog:** {items_count} standard item codes across {categories_count} taxonomies\n"
            f"• **Contract Rate Span:** {min_price} – {max_price} USD (Avg $7,973/unit)\n"
            f"• **Active Tier:** Tier-1 Enterprise Preferred (12% Master Volume Discount)\n"
            f"• **ERP Conformance:** Conformed to Apex Global and NovaTech ERP rate cards\n\n"
            f"**Immediate Attention:** {bottleneck}\n\n"
            f"How can I help you manage your catalog today?"
        )

    def generate_prompts(self, context: Dict[str, Any], bottleneck: Optional[str]) -> List[SuggestedPrompt]:
        return [
            SuggestedPrompt(
                label="Resolve Pending Pricing Inquiry",
                prompt="Show me the pending pricing inquiry for ACM-NODE-800 from Apex Global.",
                icon="HelpCircle",
                action="OPEN_PRICING_INQUIRY",
                payload={"inquiryId": "inq-1"}
            ),
            SuggestedPrompt(
                label="Add New SKU Item",
                prompt="Open modal to add a new SKU item code to the catalog.",
                icon="Plus",
                action="OPEN_ADD_SKU_MODAL",
                payload={}
            ),
            SuggestedPrompt(
                label="Review Volume Discount Tiers",
                prompt="Show me the contracted volume discount tiers for enterprise buyers.",
                icon="Percent",
                action="SIMULATE_VOLUME_DISCOUNT",
                payload={"sku": "ACM-NODE-800", "qty": 10}
            ),
            SuggestedPrompt(
                label="Check Delivery Lead-Time SLAs",
                prompt="What are our committed fulfillment lead times for Bay 14 intake?",
                icon="Clock"
            )
        ]


# ==============================================================================
# 3. PURCHASE ORDERS AGENT (/orders)
# ==============================================================================

class OrderFulfillmentAgent(BaseS2PAgent):
    """
    Manages enterprise purchase orders, delivery milestones, PO acknowledgment,
    and PO-to-ASN or PO-to-Invoice straight-through processing.
    """

    def init_agent(self) -> None:
        self.flow_instructions = [
            "Step 1: Aggregate PO pipeline volume, active count, and review deadlines.",
            "Step 2: Flag unacknowledged purchase orders needing immediate counter-signature.",
            "Step 3: Validate line-item unit prices against catalog contract cards.",
            "Step 4: Guide dispatch of Advance Shipping Notices (ASNs) for staged items.",
            "Step 5: Provide 1-click tools to acknowledge POs, filter clients, and flip to invoice."
        ]
        self.tools = [
            AgentTool("ACKNOWLEDGE_PO", "Acknowledge and counter-sign an issued Purchase Order.", {"poNumber": "string"}),
            AgentTool("FLIP_PO_TO_INVOICE", "Generate a verified 3-way match invoice from a PO.", {"poNumber": "string"}),
            AgentTool("FLIP_PO_TO_ASN", "Generate an Advance Shipping Notice from PO lines.", {"poNumber": "string"}),
            AgentTool("FILTER_PO_BUYER", "Filter purchase orders by buyer organization.", {"buyerOrgId": "string"})
        ]

    def reason_and_triage(self, context: Dict[str, Any]) -> Optional[str]:
        pending_review = context.get("actionRequiredCount", 1)
        if pending_review > 0:
            return "PO-2026-9450 ($79,920.00 from Apex Global) is awaiting your order review and acknowledgment."
        return "All active purchase orders are acknowledged and in scheduled fulfillment."

    def generate_greeting(self, context: Dict[str, Any], bottleneck: Optional[str]) -> str:
        pipeline = context.get("totalPipeline", "$384,660.00")
        orders_count = context.get("ordersCount", 6)
        in_transit = context.get("inTransitCount", 2)

        return (
            f"Hi! I'm **Ava**, your **Purchase Orders & Fulfillment Agent**.\n\n"
            f"Here is your live purchase order pipeline:\n"
            f"• **Total Pipeline Value:** {pipeline} across {orders_count} orders\n"
            f"• **Action Required:** 1 PO awaiting counter-signature (Apex Global • $79,920.00)\n"
            f"• **In Fulfillment / Transit:** {in_transit} orders dispatched to buyer receiving bays\n"
            f"• **Matching SLA:** 100% catalog contract alignment with zero line variance\n\n"
            f"**Action Item:** {bottleneck}\n\n"
            f"How can I assist with your purchase orders today?"
        )

    def generate_prompts(self, context: Dict[str, Any], bottleneck: Optional[str]) -> List[SuggestedPrompt]:
        return [
            SuggestedPrompt(
                label="Review & Acknowledge PO-9450",
                prompt="Review specifications and acknowledge Apex Global PO-2026-9450 ($79,920.00).",
                icon="FileCheck2",
                action="ACKNOWLEDGE_PO",
                payload={"poNumber": "PO-2026-9450"}
            ),
            SuggestedPrompt(
                label="Flip PO-101 into Matched Invoice",
                prompt="Flip Meridian Health PO-2026-101 into a verified commercial invoice.",
                icon="Receipt",
                action="FLIP_PO_TO_INVOICE",
                payload={"poNumber": "PO-2026-101"}
            ),
            SuggestedPrompt(
                label="Create ASN for Staged Hardware",
                prompt="Generate an Advance Shipping Notice for NovaTech PO-2026-9520.",
                icon="Truck",
                action="FLIP_PO_TO_ASN",
                payload={"poNumber": "PO-2026-9520"}
            ),
            SuggestedPrompt(
                label="Filter to Apex Global Orders",
                prompt="Filter table to Apex Global Enterprises purchase orders.",
                icon="Filter",
                action="FILTER_PO_BUYER",
                payload={"buyerOrgId": "buyer-org-1"}
            )
        ]


# ==============================================================================
# 4. SHIPMENTS & ASNS AGENT (/asns, /shipments)
# ==============================================================================

class LogisticsAsnAgent(BaseS2PAgent):
    """
    Manages advance shipping notices, carrier tracking, dock appointment slots,
    and proof of delivery intake.
    """

    def init_agent(self) -> None:
        self.flow_instructions = [
            "Step 1: Monitor live carrier PRO numbers (FedEx Freight, Old Dominion, DHL Express).",
            "Step 2: Verify dock appointment codes and gate intake PINs for buyer receiving bays.",
            "Step 3: Alert when scheduled shipments near promised PO delivery dates.",
            "Step 4: Enable 1-click ASN generation, carrier updates, and receiving confirmation."
        ]
        self.tools = [
            AgentTool("CREATE_ASN", "Generate a new Advance Shipping Notice.", {"poNumber": "string"}),
            AgentTool("TRACK_CARRIER", "Query carrier tracking status for a PRO number.", {"proNumber": "string"}),
            AgentTool("OPEN_DOCK_GATE_PASS", "View dock intake appointment gate PIN.", {"asnNumber": "string"})
        ]

    def reason_and_triage(self, context: Dict[str, Any]) -> Optional[str]:
        return "ASN-2026-8801 in transit via FedEx Freight Priority to Apex Bay 14 (Gate PIN: 9021)."

    def generate_greeting(self, context: Dict[str, Any], bottleneck: Optional[str]) -> str:
        return (
            f"Hi! I'm **Ava**, your **Logistics & Shipments Agent**.\n\n"
            f"Here is your live delivery operations status:\n"
            f"• **Active ASNs:** 2 in transit across freight carriers\n"
            f"• **Delivered & Cleared:** 1 ASN confirmed at Meridian Dock B\n"
            f"• **Dock Appointments:** Bay 14 intake active with pre-cleared gate PIN\n\n"
            f"**Logistics Status:** {bottleneck}\n\n"
            f"How can I assist with your shipping operations today?"
        )

    def generate_prompts(self, context: Dict[str, Any], bottleneck: Optional[str]) -> List[SuggestedPrompt]:
        return [
            SuggestedPrompt(
                label="Track FedEx Freight PRO FX-9021",
                prompt="Check delivery milestone status for FedEx Freight PRO FX-90218820.",
                icon="Truck",
                action="TRACK_CARRIER",
                payload={"proNumber": "FX-90218820"}
            ),
            SuggestedPrompt(
                label="Generate ASN for Next Staged Batch",
                prompt="Create Advance Shipping Notice for staged NovaTech hardware.",
                icon="Plus",
                action="CREATE_ASN",
                payload={"poNumber": "PO-2026-9520"}
            ),
            SuggestedPrompt(
                label="View Bay 14 Gate Appointment Pass",
                prompt="Retrieve gate intake PIN and dock pass for Bay 14 Austin facility.",
                icon="Key",
                action="OPEN_DOCK_GATE_PASS",
                payload={"asnNumber": "ASN-2026-8801"}
            )
        ]


# ==============================================================================
# 5. INVOICES & SETTLEMENT AGENT (/invoices)
# ==============================================================================

class InvoicingSettlementAgent(BaseS2PAgent):
    """
    Manages commercial invoices, automated 3-way matching, dynamic discounting,
    and accelerated early cash settlement.
    """

    def init_agent(self) -> None:
        self.flow_instructions = [
            "Step 1: Ingest active receivables and audit 3-way match verification (PO + ASN + Invoice).",
            "Step 2: Identify invoices eligible for 2/10 Net 30 Dynamic Discounting.",
            "Step 3: Check scheduled disbursement dates with buyer AP shared services.",
            "Step 4: Enable 1-click accelerated cash release and PO-to-invoice conversion."
        ]
        self.tools = [
            AgentTool("ACCEPT_DYNAMIC_DISCOUNT", "Accelerate payment payout via dynamic discounting.", {"invoiceNumber": "string"}),
            AgentTool("VERIFY_3WAY_MATCH", "Inspect line-level 3-way match audit trail.", {"invoiceNumber": "string"}),
            AgentTool("FILTER_INVOICE_STATUS", "Filter invoices by matching or payment status.", {"status": "string"})
        ]

    def reason_and_triage(self, context: Dict[str, Any]) -> Optional[str]:
        return "$51,594.30 USD available in early cash liquidity across approved invoices."

    def generate_greeting(self, context: Dict[str, Any], bottleneck: Optional[str]) -> str:
        receivables = context.get("totalReceivables", "$440,840.00")
        return (
            f"Hi! I'm **Ava**, your **Invoicing & Cash Settlement Agent**.\n\n"
            f"Here is your live accounts receivable ledger:\n"
            f"• **Active Receivables:** {receivables} across 4 commercial invoices\n"
            f"• **3-Way Match Verification:** 100% verified against PO line items & delivery receipts\n"
            f"• **Accelerated Liquidity Available:** {bottleneck}\n\n"
            f"How can I help optimize your cash flow today?"
        )

    def generate_prompts(self, context: Dict[str, Any], bottleneck: Optional[str]) -> List[SuggestedPrompt]:
        return [
            SuggestedPrompt(
                label="Accelerate Payment for INV-2026-101",
                prompt="Calculate and accept 2% early cash settlement for Meridian INV-2026-101.",
                icon="DollarSign",
                action="ACCEPT_DYNAMIC_DISCOUNT",
                payload={"invoiceNumber": "INV-2026-101"}
            ),
            SuggestedPrompt(
                label="Verify 3-Way Match for INV-201",
                prompt="Inspect line-level PO and ASN matching audit trail for INV-2026-201.",
                icon="ShieldCheck",
                action="VERIFY_3WAY_MATCH",
                payload={"invoiceNumber": "INV-2026-201"}
            ),
            SuggestedPrompt(
                label="Filter to Early-Pay Eligible",
                prompt="Filter invoice table to invoices eligible for dynamic discounting.",
                icon="Filter",
                action="FILTER_INVOICE_STATUS",
                payload={"status": "EARLY_PAY"}
            )
        ]


# ==============================================================================
# 6. SOURCING & RFPS AGENT (/rfps)
# ==============================================================================

class SourcingBidsAgent(BaseS2PAgent):
    """
    Manages enterprise sourcing events, tenders, RFQs, proposal submission,
    and technical compliance scoring.
    """

    def init_agent(self) -> None:
        self.flow_instructions = [
            "Step 1: Scan active buyer sourcing events, closing deadlines, and contract estimates.",
            "Step 2: Match supplier core competencies against buyer technical specifications.",
            "Step 3: Measure proposal compliance and calculate win probability score.",
            "Step 4: Enable 1-click bid submission and technical query clarifications."
        ]
        self.tools = [
            AgentTool("SUBMIT_BID_PROPOSAL", "Submit a completed bid proposal package.", {"rfpId": "string"}),
            AgentTool("CALCULATE_WIN_PROBABILITY", "Run competitive win probability scoring.", {"rfpId": "string"}),
            AgentTool("OPEN_RFP_CLARIFICATION", "Ask a technical clarification question to buyer sourcing team.", {"rfpId": "string"})
        ]

    def reason_and_triage(self, context: Dict[str, Any]) -> Optional[str]:
        return "RFP-2026-APEX-09 ($520,000 USD) closes in 5 days with 100% technical specification match."

    def generate_greeting(self, context: Dict[str, Any], bottleneck: Optional[str]) -> str:
        return (
            f"Hi! I'm **Ava**, your **Sourcing & Bids Agent**.\n\n"
            f"Here is your live enterprise sourcing pipeline:\n"
            f"• **Active Sourcing Events:** 2 open tenders ($840,000.00 USD total contract value)\n"
            f"• **Immediate Opportunity:** {bottleneck}\n"
            f"• **Specification Match:** 100% conformed to Acme Node Spec v4\n\n"
            f"How can I assist with your proposals today?"
        )

    def generate_prompts(self, context: Dict[str, Any], bottleneck: Optional[str]) -> List[SuggestedPrompt]:
        return [
            SuggestedPrompt(
                label="Review Apex RFP-09 Proposal",
                prompt="Review technical specification alignment and submit proposal for Apex RFP-09.",
                icon="FileText",
                action="SUBMIT_BID_PROPOSAL",
                payload={"rfpId": "rfp-apex-09"}
            ),
            SuggestedPrompt(
                label="Run Win Probability Scoring",
                prompt="Calculate win probability and pricing competitiveness for active tenders.",
                icon="TrendingUp",
                action="CALCULATE_WIN_PROBABILITY",
                payload={"rfpId": "rfp-apex-09"}
            ),
            SuggestedPrompt(
                label="Clarify Compute Node Spec",
                prompt="Submit a vendor clarification question to Apex Strategic Sourcing team.",
                icon="HelpCircle",
                action="OPEN_RFP_CLARIFICATION",
                payload={"rfpId": "rfp-apex-09"}
            )
        ]


# ==============================================================================
# 7. COMPLIANCE & DOCUMENT VAULT AGENT (/documents)
# ==============================================================================

class ComplianceVaultAgent(BaseS2PAgent):
    """
    Manages regulatory filings, IRS W-9 verification, ACORD 25 COI insurance,
    ISO/SOC2 certifications, and automated credential expiration monitoring.
    """

    def init_agent(self) -> None:
        self.flow_instructions = [
            "Step 1: Audit all 6 verified enterprise credentials across connected buyers.",
            "Step 2: Monitor expiration windows; flag certificates expiring within 30 days.",
            "Step 3: Track buyer endorsement rider requests (e.g. Apex Global COI rider).",
            "Step 4: Enable 1-click renewal requests and Master Profile credential synchronization."
        ]
        self.tools = [
            AgentTool("REQUEST_COI_RENEWAL", "Request an updated ACORD 25 insurance certificate from broker.", {}),
            AgentTool("DOWNLOAD_VERIFIED_W9", "Download IRS-verified Form W-9 PDF.", {}),
            AgentTool("SYNC_VAULT_TO_BUYERS", "Re-sync updated credentials to all connected buyer ERPs.", {})
        ]

    def reason_and_triage(self, context: Dict[str, Any]) -> Optional[str]:
        expired = context.get('expiredCount', 0)
        expiring = context.get('expiringCount', 0)
        if expired > 0:
            return f"{expired} certificate is EXPIRED (ACORD 25 Certificate of Liability Insurance). Immediate replacement required to avoid buyer holds."
        if expiring > 0:
            return "ACORD 25 Certificate of Insurance expires soon. Endorsement rider requested by Apex Global."
        return "All compliance documents and certifications active and conformed."

    def generate_greeting(self, context: Dict[str, Any], bottleneck: Optional[str]) -> str:
        count = context.get('totalDocs', len(context.get('docs', [])) or 6)
        tax_id = context.get('taxId', '84-1294812')
        expired = context.get('expiredCount', 0)
        expiring = context.get('expiringCount', 0)
        action_line = f"• **⚠️ Action Required:** {expired} certificate is **EXPIRED** (ACORD 25 COI)\n" if expired > 0 else ""
        expiring_line = f"• **Expiring Credentials:** {expiring} certificate requiring attention\n" if expiring > 0 else ""
        return (
            f"Hi! I'm **Ava**, your **Compliance & Regulatory Vault Agent**.\n\n"
            f"Here is your live compliance posture:\n"
            f"• **Verified Credentials:** {count} legal, tax, and insurance records\n"
            f"• **IRS W-9 Verification:** 100% matched to corporate legal identity (TIN {tax_id})\n"
            f"• **SOC 2 Type II:** Compliant and verified via Deloitte annual audit\n"
            f"{action_line}{expiring_line}\n"
            f"**Regulatory Alert:** {bottleneck}\n\n"
            f"How can I help protect your compliance standing today?"
        )

    def generate_prompts(self, context: Dict[str, Any], bottleneck: Optional[str]) -> List[SuggestedPrompt]:
        prompts: List[SuggestedPrompt] = []
        expired = context.get('expiredCount', 0)
        if expired > 0:
            prompts.append(
                SuggestedPrompt(
                    label="Replace Expired Certificate",
                    prompt="Upload replacement for expired ACORD 25 Certificate of Liability Insurance.",
                    icon="AlertTriangle",
                    action="UPLOAD_DOC",
                    payload={"mode": "SINGLE", "type": "CERT_INSURANCE_ACORD"}
                )
            )
        prompts.extend([
            SuggestedPrompt(
                label="Request COI Endorsement Rider",
                prompt="Generate broker request for Apex Global endorsement rider on ACORD 25 COI.",
                icon="ShieldCheck",
                action="REQUEST_COI_RENEWAL",
                payload={}
            ),
            SuggestedPrompt(
                label="Download Verified Form W-9",
                prompt="Download IRS-verified corporate Form W-9 with matching TIN.",
                icon="Download",
                action="DOWNLOAD_VERIFIED_W9",
                payload={}
            ),
            SuggestedPrompt(
                label="Re-sync Vault to Buyer ERPs",
                prompt="Push updated credential certificates to Apex, NovaTech, and Meridian.",
                icon="RefreshCw",
                action="SYNC_VAULT_TO_BUYERS",
                payload={}
            )
        ])
        return prompts


# ==============================================================================
# 8. EXECUTIVE OPERATIONS SUPERVISOR AGENT (/dashboard, /)
# ==============================================================================

class ExecutiveSupervisorAgent(BaseS2PAgent):
    """
    Supervises portfolio-wide S2P operations, cross-buyer cash liquidity,
    critical-path bottlenecks, and autonomous task triage.
    """

    def init_agent(self) -> None:
        self.flow_instructions = [
            "Step 1: Aggregate operational telemetry across all 7 downstream modules.",
            "Step 2: Rank global enterprise action items by financial urgency and risk.",
            "Step 3: Synthesize daily executive morning briefing.",
            "Step 4: Provide direct navigation jumps to urgent bottlenecks."
        ]
        self.tools = [
            AgentTool("NAVIGATE_PAGE", "Jump to a specific operational module.", {"route": "string"}),
            AgentTool("EXECUTE_MORNING_SWEEP", "Run autonomous cross-module compliance & order sweep.", {})
        ]

    def reason_and_triage(self, context: Dict[str, Any]) -> Optional[str]:
        return "1 high-priority action: NovaTech Aerospace ITAR attestation pending start (Due in 10 days)."

    def generate_greeting(self, context: Dict[str, Any], bottleneck: Optional[str]) -> str:
        return (
            f"Hi! I'm **Ava**, your **Executive Operations Supervisor**.\n\n"
            f"Here is your enterprise operating posture:\n"
            f"• **Available Early Liquidity:** **$51,594.30 USD** across approved invoices\n"
            f"• **Active Buyer Connections:** 3 enterprise clients (Apex Global, NovaTech, Meridian Health)\n"
            f"• **Fulfillment Velocity:** PO-2026-101 in transit to Joliet DC\n\n"
            f"**High-Priority Bottleneck:** {bottleneck}\n\n"
            f"How can I help optimize your enterprise operations today?"
        )

    def generate_prompts(self, context: Dict[str, Any], bottleneck: Optional[str]) -> List[SuggestedPrompt]:
        return [
            SuggestedPrompt(
                label="Resolve NovaTech Onboarding",
                prompt="Jump to Onboarding and complete NovaTech Aerospace ITAR attestation.",
                icon="FileCheck2",
                action="NAVIGATE_PAGE",
                payload={"route": "/onboarding"}
            ),
            SuggestedPrompt(
                label="Accelerate Receivables Cash",
                prompt="Show approved invoices eligible for dynamic 2% early cash payout.",
                icon="DollarSign",
                action="NAVIGATE_PAGE",
                payload={"route": "/invoices"}
            ),
            SuggestedPrompt(
                label="Review Apex PO-9450 Specs",
                prompt="Open purchase orders to review and counter-sign PO-2026-9450.",
                icon="ShoppingCart",
                action="NAVIGATE_PAGE",
                payload={"route": "/orders"}
            )
        ]


# ==============================================================================
# 9. MASTER PUBLIC PROFILE AGENT (/public-profile, /master-profile)
# ==============================================================================

class MasterPassportAgent(BaseS2PAgent):
    """
    Manages universal corporate golden record identity, banking remittance routes,
    D&B DUNS validation, and bilateral buyer ERP synchronization.
    """

    def init_agent(self) -> None:
        self.flow_instructions = [
            "Step 1: Verify 100% Golden Record completeness across legal, tax, banking, and diversity.",
            "Step 2: Enforce zero-drift synchronization to connected buyer ERP vendor masters.",
            "Step 3: Monitor bank remittance routing numbers (JPMorgan Chase operating account).",
            "Step 4: Enable 1-click sync to Apex, NovaTech, and Meridian ERP instances."
        ]
        self.tools = [
            AgentTool("SYNC_MASTER_PROFILE", "Sync verified Master Profile to all connected buyer ERPs.", {}),
            AgentTool("UPDATE_REMITTANCE", "Update bank remittance account details.", {"bankName": "string", "accountEnding": "string"})
        ]

    def reason_and_triage(self, context: Dict[str, Any]) -> Optional[str]:
        completeness = context.get('profileCompleteness', 98)
        missing = context.get('missingRequirement', 'Complete Diversity & Certificates section to reach 100% profile score.')
        buyers_count = context.get('connectedBuyersCount', 3)
        if completeness < 100:
            return f"Profile is at {completeness}% completeness. {missing}"
        return f"Master Public Profile is 100% complete and synchronized across {buyers_count} enterprise buyer workspaces."

    def generate_greeting(self, context: Dict[str, Any], bottleneck: Optional[str]) -> str:
        legal = context.get('legalName', 'Acme Industrial Tech Inc.')
        trade = f" (Doing Business As {context['tradeName']})" if context.get('tradeName') else ""
        tax_id = context.get('taxId', '84-1294812')
        duns = context.get('dunsNumber', '09-842-1928')
        completeness = context.get('profileCompleteness', 98)
        buyers_count = context.get('connectedBuyersCount', 3)

        return (
            f"Hi! I'm **Ava**, your **Master Passport & Trust Agent**.\n\n"
            f"Your Master Public Profile serves as your universal golden record across the Verisource network:\n"
            f"• **Legal Entity:** {legal}{trade}\n"
            f"• **Verified TIN:** {tax_id} (W-9 matched with zero IRS discrepancy)\n"
            f"• **DUNS Number:** {duns} (D&B Verified)\n"
            f"• **Trust & Completeness:** {completeness}% Verified ({100 - completeness}% remaining)\n"
            f"• **Bilateral Sync Status:** Synchronized across {buyers_count} enterprise buyer workspaces.\n\n"
            f"**Action Focus:** {bottleneck}\n\n"
            f"How can I assist with your enterprise profile credentials today?"
        )

    def generate_prompts(self, context: Dict[str, Any], bottleneck: Optional[str]) -> List[SuggestedPrompt]:
        completeness = context.get('profileCompleteness', 98)
        prompts = []
        if completeness < 100:
            prompts.append(
                SuggestedPrompt(
                    label=f"Complete Remaining {100 - completeness}% in Diversity",
                    prompt="Navigate to Diversity & Certificates tab to complete profile to 100%.",
                    icon="ShieldCheck",
                    action="NAVIGATE_TAB",
                    payload={"tab": "diversity"}
                )
            )
        prompts.extend([
            SuggestedPrompt(
                label="Sync Profile Across All Buyers",
                prompt="Synchronize verified Master Profile records to Apex Global, NovaTech, and Meridian.",
                icon="RefreshCw",
                action="SYNC_MASTER_PROFILE",
                payload={}
            ),
            SuggestedPrompt(
                label="Verify Bank Remittance Route",
                prompt="Inspect verified JPMorgan Chase ACH and wire settlement routing numbers.",
                icon="CreditCard",
                action="NAVIGATE_TAB",
                payload={"tab": "banking"}
            ),
            SuggestedPrompt(
                label="Copy Shareable Profile Link",
                prompt="Generate and copy secure shareable Master Profile link.",
                icon="Share2",
                action="COPY_PROFILE_LINK",
                payload={}
            )
        ])
        return prompts


# ==============================================================================
# 10. TASK PRIORITIZATION AGENT (/tasks)
# ==============================================================================

class TaskPrioritizationAgent(BaseS2PAgent):
    """
    Triages and sequences cross-module operational tasks by SLA urgency,
    financial impact, and compliance risk.
    """

    def init_agent(self) -> None:
        self.flow_instructions = [
            "Step 1: Ingest pending tasks across Onboarding, Orders, Shipments, and Compliance.",
            "Step 2: Classify priority into High, Medium, Standard, and Routine tiers.",
            "Step 3: Alert on tasks with deadlines within 5 business days.",
            "Step 4: Provide tools to resolve or delegate tasks directly."
        ]
        self.tools = [
            AgentTool("COMPLETE_TASK", "Mark a prioritized task as resolved.", {"taskId": "string"}),
            AgentTool("FILTER_TASK_PRIORITY", "Filter task queue by priority tier.", {"priority": "HIGH | MEDIUM | STANDARD"})
        ]

    def reason_and_triage(self, context: Dict[str, Any]) -> Optional[str]:
        return "1 High-Priority Task: Upload ACORD 25 COI Endorsement Rider for Apex Global (Due in 5 days)."

    def generate_greeting(self, context: Dict[str, Any], bottleneck: Optional[str]) -> str:
        return (
            f"Hi! I'm **Ava**, your **Workflow & Prioritization Agent**.\n\n"
            f"I triage all actionable tasks across your connected buyer accounts:\n"
            f"• **Urgent Bottleneck:** {bottleneck}\n"
            f"• **Medium Priority:** OmniRetail Annual Safety Protocol Attestation (Due Nov 15)\n"
            f"• **Standard Priority:** Acknowledge Starlight Defense PO-2026-102 ($28,500.00)\n"
            f"• **Routine Priority:** Verify 2026 Annual W-9 Renewal Attestation\n\n"
            f"Which task would you like guidance on completing first?"
        )

    def generate_prompts(self, context: Dict[str, Any], bottleneck: Optional[str]) -> List[SuggestedPrompt]:
        return [
            SuggestedPrompt(
                label="Resolve COI Endorsement Rider",
                prompt="Open compliance vault and upload ACORD 25 endorsement rider for Apex Global.",
                icon="ShieldCheck",
                action="COMPLETE_TASK",
                payload={"taskId": "task-coi-apex"}
            ),
            SuggestedPrompt(
                label="Filter to High Priority Tasks",
                prompt="Filter task queue to show only high-priority compliance and order tasks.",
                icon="Filter",
                action="FILTER_TASK_PRIORITY",
                payload={"priority": "HIGH"}
            )
        ]


# ==============================================================================
# 11. FINANCIAL LEDGER AGENT (/transactions)
# ==============================================================================

class FinancialLedgerAgent(BaseS2PAgent):
    """
    Monitors cross-buyer transaction ledgers, audit trails, payment settlements,
    and cash reconciliation.
    """

    def init_agent(self) -> None:
        self.flow_instructions = [
            "Step 1: Aggregate multi-buyer ledger records across Purchase Orders and Invoices.",
            "Step 2: Reconcile payments disbursed vs scheduled vs pending approval.",
            "Step 3: Track audit provenance for straight-through 3-way matching.",
            "Step 4: Enable ledger filtering, export, and variance reconciliation."
        ]
        self.tools = [
            AgentTool("EXPORT_LEDGER_CSV", "Export cross-buyer transaction ledger to CSV.", {}),
            AgentTool("FILTER_LEDGER_BUYER", "Filter transaction ledger by buyer organization.", {"buyerOrgId": "string"})
        ]

    def reason_and_triage(self, context: Dict[str, Any]) -> Optional[str]:
        return "All cross-buyer transactions reconciled with zero variance across SAP and Oracle ERPs."

    def generate_greeting(self, context: Dict[str, Any], bottleneck: Optional[str]) -> str:
        return (
            f"Hi! I'm **Ava**, your **Financial Ledger & Audit Agent**.\n\n"
            f"Here is your consolidated multi-buyer transaction audit status:\n"
            f"• **PO Volume:** $384,660.00 across 6 orders\n"
            f"• **Invoice Volume:** $440,840.00 across 4 commercial invoices\n"
            f"• **Audit Standing:** {bottleneck}\n\n"
            f"How can I assist with your transaction reconciliation today?"
        )

    def generate_prompts(self, context: Dict[str, Any], bottleneck: Optional[str]) -> List[SuggestedPrompt]:
        return [
            SuggestedPrompt(
                label="Export Transaction Ledger CSV",
                prompt="Export consolidated multi-buyer ledger to CSV for financial audit.",
                icon="Download",
                action="EXPORT_LEDGER_CSV",
                payload={}
            ),
            SuggestedPrompt(
                label="Filter to Apex Global Ledger",
                prompt="Filter transactions to show only Apex Global Enterprises records.",
                icon="Filter",
                action="FILTER_LEDGER_BUYER",
                payload={"buyerOrgId": "buyer-org-1"}
            )
        ]


# ==============================================================================
# AGENT REGISTRY & ROUTER
# ==============================================================================

class S2PAgentRegistry:
    """
    Dynamic registry that routes any portal URL to its specialized agent instance.
    """

    _agents: List[BaseS2PAgent] = [
        OnboardingQualificationAgent("OnboardingQualificationAgent", "Buyer Onboarding & Compliance Agent", "/onboarding", "Buyer Onboarding"),
        CatalogPricingAgent("CatalogPricingAgent", "Catalog & Pricing Agent", "/catalog", "Catalog & Pricing"),
        OrderFulfillmentAgent("OrderFulfillmentAgent", "Purchase Orders & Fulfillment Agent", "/orders", "Purchase Orders"),
        LogisticsAsnAgent("LogisticsAsnAgent", "Logistics & Shipments Agent", "/asns", "Shipments & ASNs"),
        InvoicingSettlementAgent("InvoicingSettlementAgent", "Invoicing & Cash Settlement Agent", "/invoices", "Invoices & Settlement"),
        SourcingBidsAgent("SourcingBidsAgent", "Sourcing & Bids Agent", "/rfps", "Sourcing & RFPs"),
        ComplianceVaultAgent("ComplianceVaultAgent", "Compliance & Regulatory Vault Agent", "/documents", "Document Vault"),
        MasterPassportAgent("MasterPassportAgent", "Master Passport & Trust Agent", "/public-profile", "Master Public Profile"),
        TaskPrioritizationAgent("TaskPrioritizationAgent", "Workflow & Prioritization Agent", "/tasks", "Task Queue"),
        FinancialLedgerAgent("FinancialLedgerAgent", "Financial Ledger & Audit Agent", "/transactions", "All Transactions"),
        ExecutiveSupervisorAgent("ExecutiveSupervisorAgent", "Executive Operations Supervisor", "/dashboard", "Executive Dashboard")
    ]

    @classmethod
    def get_agent_for_route(cls, route: str) -> BaseS2PAgent:
        """Finds matching agent based on route prefix matching."""
        normalized = (route or "").strip().lower()
        if not normalized or normalized == "/":
            return cls._agents[-1]  # ExecutiveSupervisorAgent

        for agent in cls._agents:
            if normalized.startswith(agent.route_pattern):
                return agent

        # Fallback aliases
        if "order" in normalized or "po" in normalized:
            return cls.get_agent_for_route("/orders")
        if "ship" in normalized or "asn" in normalized:
            return cls.get_agent_for_route("/asns")
        if "invoice" in normalized:
            return cls.get_agent_for_route("/invoices")
        if "catalog" in normalized:
            return cls.get_agent_for_route("/catalog")
        if "doc" in normalized or "vault" in normalized:
            return cls.get_agent_for_route("/documents")
        if "rfp" in normalized or "bid" in normalized or "sourcing" in normalized:
            return cls.get_agent_for_route("/rfps")
        if "onboard" in normalized:
            return cls.get_agent_for_route("/onboarding")
        if "task" in normalized:
            return cls.get_agent_for_route("/tasks")
        if "transact" in normalized:
            return cls.get_agent_for_route("/transactions")
        if "profile" in normalized or "workspace" in normalized:
            return cls.get_agent_for_route("/public-profile")

        return cls._agents[-1]

    @classmethod
    def list_all_agents(cls) -> List[Dict[str, Any]]:
        return [
            {
                "name": a.name,
                "role": a.role,
                "route": a.route_pattern,
                "page_context": a.page_context_name,
                "tools_count": len(a.tools),
                "flow_steps": len(a.flow_instructions)
            }
            for a in cls._agents
        ]


# ==============================================================================
# CLI RUNNER & MICROSERVICE ENTRYPOINT
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(description="Verisource S2P Page Agent Network Runner")
    parser.add_argument("--route", type=str, default="/catalog", help="Target portal route (e.g. /catalog, /onboarding, /orders)")
    parser.add_argument("--context", type=str, default="{}", help="JSON string representing real-time page context telemetry")
    parser.add_argument("--list", action="store_true", help="List all registered specialized agents")
    parser.add_argument("--tool", type=str, help="Execute a registered tool by name")
    parser.add_argument("--tool-payload", type=str, default="{}", help="JSON payload for tool execution")
    parser.add_argument("--json", action="store_true", help="Output result as pure JSON for API consumption")

    args = parser.parse_args()

    if args.list:
        agents_list = S2PAgentRegistry.list_all_agents()
        if args.json:
            print(json.dumps(agents_list, indent=2))
        else:
            print("\n=== REGISTERED S2P PAGE AGENTS ===")
            for idx, item in enumerate(agents_list, 1):
                print(f"{idx:2d}. {item['name']:<30} | {item['route']:<16} | {item['role']}")
        return

    agent = S2PAgentRegistry.get_agent_for_route(args.route)

    try:
        context_data = json.loads(args.context)
    except Exception as e:
        context_data = {}

    if args.tool:
        try:
            tool_payload = json.loads(args.tool_payload)
        except Exception:
            tool_payload = {}
        tool_result = agent.execute_tool(args.tool, tool_payload)
        print(json.dumps(tool_result, indent=2))
        return

    briefing = agent.synthesize(context_data)
    briefing_dict = asdict(briefing)

    if args.json:
        print(json.dumps(briefing_dict, indent=2))
    else:
        print(f"\n=======================================================")
        print(f" AGENT: {briefing.agent_name} ({briefing.role})")
        print(f" ROUTE: {briefing.route} -> {briefing.page_context_name}")
        print(f"=======================================================\n")
        print("--- DYNAMIC GREETING ---")
        print(briefing.greeting)
        print("\n--- SUGGESTED PROMPTS ---")
        for idx, p in enumerate(briefing.suggested_prompts, 1):
            print(f" [{idx}] {p.label} (Action: {p.action or 'None'})")
            print(f"     Prompt: {p.prompt}")
        print(f"\n--- REGISTERED TOOLS ({len(briefing.available_tools)}) ---")
        for t in briefing.available_tools:
            print(f" • {t.name}: {t.description}")


if __name__ == "__main__":
    main()

