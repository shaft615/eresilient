import type { ServiceContent } from "@/lib/content";

export const realTimeSupport: ServiceContent = {
  slug: "real-time-support",
  title: "Real-Time Support",
  shortTitle: "Real-Time Support",
  category: "Activation Services",
  summary:
    "Just-in-time activation support during a real incident. Plan deployment, vendor engagement, after-action reviews — pre-negotiated rates, on call.",
  metaTitle:
    "Real-Time Business Continuity Activation Support | e|Resilient",
  metaDescription:
    "On-call activation support during a live incident. Plan deployment, emergency notification facilitation, vendor engagement, and after-action review. Pre-negotiated hourly rates so you can call us at 2 a.m. without negotiating a contract.",
  hero: {
    headline:
      "When you actually need to activate, you shouldn't be redlining a contract.",
    description:
      "Real-Time Support Services give you a pre-negotiated relationship — and a phone number that gets answered — when an incident is unfolding and your team needs experienced backup running the playbook.",
  },
  problem:
    "Most consulting relationships go cold between engagements. Then a real incident hits, and the company that built your plan is suddenly a stranger again — new SOW, new rate negotiation, new onboarding, while the clock runs. Real-Time Support keeps the relationship warm with pre-negotiated terms, so when something happens, you get a partner — not a procurement cycle.",
  whatsIncluded: [
    "Just-in-time management support for plan activation",
    "Facilitation of plan deployment and emergency notification (once engaged)",
    "Crisis Management Team meeting facilitation during an active event",
    "Vendor engagement and disaster declaration support",
    "Coordination with insurance carriers, legal, and external partners as needed",
    "After-Action Review with documented lessons learned and plan updates",
    "Pre-negotiated hourly rates — no per-incident SOW required",
  ],
  deliverables: [
    "Standby retainer with named primary and backup consultant",
    "Pre-negotiated rate schedule and engagement terms",
    "During-event facilitation, documentation, and meeting management",
    "Post-event AAR with corrective action register",
    "Plan updates incorporating AAR findings",
  ],
  whoItsFor: [
    "Companies whose existing plans depend on internal staff who may also be impacted by the event",
    "Firms without a dedicated BCM function but with material continuity exposure",
    "Organizations that have invested in plans and want a partner who can run them under pressure",
    "Boards or audit committees requiring evidence of external surge capacity for incident response",
  ],
  isoRefs: [
    "ISO 22301 §8.4.4 (Business Continuity Procedures — Response)",
    "ISO 22398 (Exercise Standards — Real-Event Application)",
  ],
  process: [
    {
      step: "01",
      title: "Standby Setup",
      body: "Pre-negotiated retainer establishes terms, named consultants, escalation contacts, and engagement triggers. Set up once; available for years.",
    },
    {
      step: "02",
      title: "Activate",
      body: "Phone call gets you the named consultant within the response-time commitment — typically same-business-day for engaged clients, on-call coverage available.",
    },
    {
      step: "03",
      title: "Run the Event",
      body: "We facilitate plan execution, document decisions, manage external vendor and notification flows, and support the CMT through the response phase.",
    },
    {
      step: "04",
      title: "Close the Loop",
      body: "After-Action Review captures lessons. Plan, training, and exercise updates incorporate findings before the next incident.",
    },
  ],
  ctaLabel: "Schedule a real-time support call",
  order: 5,
};
