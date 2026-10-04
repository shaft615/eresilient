/**
 * Editor model for the BIA tool: section list, field definitions, reference
 * lists, consistency checks and the sanitizer applied before every save.
 *
 * Pure data and functions — imported by both the client editor and the
 * server actions, so nothing here may touch the DOM or the database.
 */
import type {
  BiaData,
  CriticalProcess,
  DocumentInfo,
  ImpactOverTime,
  ProcessRecovery,
} from "./types";

// ---------- sections ----------

export type SectionId =
  | "intro"
  | "cover"
  | "proc"
  | "deps"
  | "sys"
  | "equip"
  | "people"
  | "vend"
  | "recs"
  | "scen"
  | "review";

export const SECTIONS: { id: SectionId; title: string; ref?: string }[] = [
  { id: "intro", title: "Before you start" },
  { id: "cover", title: "Cover and document details", ref: "BIA template: cover and header table" },
  { id: "proc", title: "Critical processes", ref: "BIA template: Critical Business Processes" },
  { id: "deps", title: "Other departments and outside parties", ref: "BIA template: Upstream and Downstream Dependencies" },
  { id: "sys", title: "Systems and data", ref: "BIA template: Software Requirements" },
  { id: "equip", title: "Equipment", ref: "BIA template: Infrastructure and Specialized Equipment" },
  { id: "people", title: "People and workspace", ref: "BIA template: Human Capital / Workspace Requirements" },
  { id: "vend", title: "Third parties", ref: "BIA template: Third Party Relationships" },
  { id: "recs", title: "Vital records", ref: "BIA template: Vital Records" },
  { id: "scen", title: "Recovery scenarios", ref: "BIA template: Process Recovery" },
  { id: "review", title: "Review and export" },
];

// ---------- reference lists ----------

export const DURATIONS = [
  "4 hours",
  "24 hours",
  "48 hours",
  "72 hours",
  "1 week",
  "2 weeks",
  "30 days",
];
export const MAX_DISRUPTION_OPTIONS = [...DURATIONS, "More than 30 days"];
export const RPO_OPTIONS = [
  "No data loss acceptable",
  "Up to 1 hour",
  "Up to 4 hours",
  "Up to 24 hours",
  "Up to 1 week",
];
export const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly", "Annually", "Ad hoc"];

/** Time points for the optional impact grid — same scale as maximum disruption. */
export const IMPACT_TIMES = [
  { k: "4h", label: "4 hours", h: 4 },
  { k: "24h", label: "24 hours", h: 24 },
  { k: "48h", label: "48 hours", h: 48 },
  { k: "72h", label: "72 hours", h: 72 },
  { k: "1w", label: "1 week", h: 168 },
  { k: "2w", label: "2 weeks", h: 336 },
  { k: "30d", label: "30 days", h: 720 },
] as const;

export const IMPACT_DIMS = [
  { k: "fin", label: "Financial", hint: "Lost revenue, penalties, overtime, extra expenses" },
  { k: "reg", label: "Regulatory and legal", hint: "Laws, licenses, contracts, statutory deadlines" },
  { k: "ops", label: "Operational", hint: "Knock-on effect on production, service and other departments" },
  { k: "rep", label: "Reputational", hint: "Trust of customers, employees, authorities" },
  { k: "ppl", label: "Safety and welfare", hint: "Harm to employees, customers or the community" },
] as const;

export const SEVERITY = [
  { v: "", label: "—", desc: "" },
  { v: "0", label: "None", desc: "None" },
  { v: "1", label: "Minor", desc: "Minor: absorbed within normal work" },
  { v: "2", label: "Moderate", desc: "Moderate: noticeable, needs management attention" },
  { v: "3", label: "Major", desc: "Major: significant harm, escalation to site leadership" },
  { v: "4", label: "Severe", desc: "Severe: unacceptable, regulatory or legal breach, harm to people" },
] as const;

export function severityLabel(v: string | undefined): string {
  return SEVERITY.find((s) => s.v === v)?.label ?? "";
}

// ---------- list sections ----------

export type ListKey =
  | "critical_processes"
  | "upstream_internal"
  | "upstream_external"
  | "downstream_internal"
  | "downstream_external"
  | "software"
  | "infrastructure"
  | "human_capital"
  | "third_parties"
  | "vital_records";

/** Engine field names per list, in template order. The first is the row's name. */
export const LIST_FIELDS: Record<ListKey, readonly string[]> = {
  critical_processes: [
    "process_description",
    "frequency",
    "seasonality",
    "quantitative_impact",
    "qualitative_impact",
    "maximum_disruption",
  ],
  upstream_internal: ["item", "department_function", "comments"],
  upstream_external: ["item", "vendor_customer_other", "comments"],
  downstream_internal: ["item", "department_function", "comments"],
  downstream_external: ["item", "vendor_customer_other", "comments"],
  software: ["application", "use_description", "rto", "rpo", "manual_workaround", "comments"],
  infrastructure: [
    "component",
    "use_description",
    "rto",
    "corporate_contact",
    "vendor_contact",
    "mitigation_strategy",
  ],
  human_capital: [
    "functional_role",
    "normal_headcount",
    "day_1",
    "day_2_3",
    "day_5",
    "after_day_10",
    "recovery_location",
    "key_person_dependencies",
  ],
  third_parties: [
    "company_name",
    "service_provided",
    "contact_details",
    "recovery_period_instructions",
    "mitigation_plan",
  ],
  vital_records: [
    "description",
    "media_type",
    "electronic_backup",
    "storage_location",
    "vendor_contact",
    "restoration_procedures",
  ],
};

const LIST_KEYS = Object.keys(LIST_FIELDS) as ListKey[];

/** Lists that can be explicitly recorded as "None". */
export const NONE_KEYS: readonly ListKey[] = [
  "upstream_internal",
  "upstream_external",
  "downstream_internal",
  "downstream_external",
  "infrastructure",
  "third_parties",
];

export type Row = Record<string, string | undefined>;

export type FieldDef = {
  key: string;
  /** `{dept}` is replaced with the department name. */
  label: string;
  ph?: string;
  /** text (default), textarea, num (free text, numeric keypad) or combo (text with suggestions). */
  kind?: "text" | "textarea" | "num" | "combo";
  options?: readonly string[];
  /** Span the full row width. */
  span?: boolean;
};

const DEP_COMMENTS = "When it is needed, and what happens if it is late";

export const ROW_FIELDS: Record<Exclude<ListKey, "critical_processes">, FieldDef[]> = {
  upstream_internal: [
    { key: "item", label: "What {dept} needs from them", ph: "e.g., Shift rosters and overtime hours" },
    { key: "department_function", label: "Which department", ph: "e.g., Operations; Finance" },
    { key: "comments", label: "Comments", ph: DEP_COMMENTS, kind: "textarea", span: true },
  ],
  upstream_external: [
    { key: "item", label: "What {dept} needs from them", ph: "e.g., Payroll results file; raw material deliveries" },
    { key: "vendor_customer_other", label: "Which company or authority", ph: "e.g., Payroll provider; insurance carrier" },
    { key: "comments", label: "Comments", ph: DEP_COMMENTS, kind: "textarea", span: true },
  ],
  downstream_internal: [
    { key: "item", label: "What they need from {dept}", ph: "e.g., Monthly headcount and absence report" },
    { key: "department_function", label: "Which department", ph: "e.g., Site Leadership Team; Finance" },
    { key: "comments", label: "What they cannot do without it", ph: "e.g., Operations cannot plan shift cover without absence data", kind: "textarea", span: true },
  ],
  downstream_external: [
    { key: "item", label: "What they need from {dept}", ph: "e.g., Statutory returns; order confirmations" },
    { key: "vendor_customer_other", label: "Which company, customer or authority", ph: "e.g., Local authorities; key customer" },
    { key: "comments", label: "Deadline or legal obligation", ph: "e.g., statutory filing date, penalty for late submission", kind: "textarea", span: true },
  ],
  software: [
    { key: "application", label: "System or application", ph: "Name the system, not the category" },
    { key: "use_description", label: "What it is used for", ph: "Modules, transactions, reports" },
    { key: "rto", label: "Recovery time objective (RTO) — back within", ph: "Select or type…", kind: "combo", options: DURATIONS },
    { key: "rpo", label: "Recovery point objective (RPO) — acceptable data loss", ph: "Select or type…", kind: "combo", options: RPO_OPTIONS },
    { key: "manual_workaround", label: "Manual workaround if it is unavailable", ph: "What would the team actually do, and how long could that keep going?", kind: "textarea", span: true },
    { key: "comments", label: "Comments", ph: "Who runs it, access issues, single administrator, recent outages", kind: "textarea", span: true },
  ],
  infrastructure: [
    { key: "component", label: "Component or equipment", ph: "e.g., Time clock terminals; label printer" },
    { key: "use_description", label: "Use / description", ph: "What it does for {dept}" },
    { key: "rto", label: "Recovery time objective (RTO)", ph: "Select or type…", kind: "combo", options: DURATIONS },
    { key: "corporate_contact", label: "Internal contact (role or team)", ph: "e.g., Site IT; Facilities" },
    { key: "vendor_contact", label: "Vendor contact", ph: "Company and support line" },
    { key: "mitigation_strategy", label: "Mitigation — what the team would do", ph: "e.g., paper sign-in sheets at each entrance", kind: "textarea", span: true },
  ],
  human_capital: [
    { key: "functional_role", label: "Functional role", ph: "Role title, not a person's name" },
    { key: "normal_headcount", label: "Normal headcount", kind: "num" },
    { key: "day_1", label: "Minimum on Day 1", kind: "num" },
    { key: "day_2_3", label: "Minimum Day 2–3", kind: "num" },
    { key: "day_5", label: "Minimum by Day 5", kind: "num" },
    { key: "after_day_10", label: "Minimum after Day 10", kind: "num" },
    { key: "recovery_location", label: "Where they could work if the site is unavailable", ph: "Select or type…", kind: "combo", options: ["Home (remote)", "Another company site", "On site only", "Mix of the above"], span: true },
    { key: "key_person_dependencies", label: "Key person dependency", ph: "Knowledge or authority held by one person only — describe by role", kind: "textarea", span: true },
  ],
  third_parties: [
    { key: "company_name", label: "Company name", ph: "Vendor or provider" },
    { key: "service_provided", label: "Service provided", ph: "What they do for {dept}" },
    { key: "contact_details", label: "Primary contact (name, phone, email)", ph: "Business contact details only", kind: "textarea" },
    { key: "recovery_period_instructions", label: "Instructions for them during recovery", ph: "e.g., switch to the emergency process using last approved inputs", kind: "textarea" },
    { key: "mitigation_plan", label: "Plan if they cannot deliver", ph: "e.g., alternate provider, in-house fallback, manual process", kind: "textarea", span: true },
  ],
  vital_records: [
    { key: "description", label: "Record", ph: "Description of the vital material" },
    { key: "media_type", label: "Media type", ph: "Select or type…", kind: "combo", options: ["Paper only", "Electronic only", "Paper and electronic"] },
    { key: "electronic_backup", label: "Electronic backup on the network?", ph: "Select or type…", kind: "combo", options: ["Yes", "Partial", "No"] },
    { key: "storage_location", label: "Storage location", ph: "e.g., locked cabinets in Building 2; SharePoint" },
    { key: "vendor_contact", label: "Vendor contact (if held externally)", ph: "e.g., archive service" },
    { key: "restoration_procedures", label: "How it would be restored or replaced if lost", ph: "e.g., re-create from the system of record; request copies from the provider", kind: "textarea", span: true },
  ],
};

export const SCENARIOS: { k: keyof ProcessRecovery; title: string; prompt: string }[] = [
  {
    k: "loss_of_site",
    title: "Loss of site",
    prompt:
      "The office, or the whole site, cannot be used. Where would the team work from, how quickly, and what would they need there? Think about home working, another company site, and anything that can only be done on site.",
  },
  {
    k: "loss_of_systems",
    title: "Loss of systems",
    prompt:
      "Core applications, email or the network are unavailable. How would the team keep its critical processes going by hand or by another route, who else could help, and how long could that continue?",
  },
  {
    k: "loss_of_people",
    title: "Loss of people",
    prompt:
      "Key staff are unavailable for two weeks or more. Who covers each critical process, is that cover documented, and what help could come from other sites or teams?",
  },
  {
    k: "loss_of_relationship",
    title: "Loss of a key supplier",
    prompt:
      "A provider the team depends on cannot deliver. What is the fallback: an alternative provider, an in-house process, a changed way of working?",
  },
];

// ---------- helpers ----------

export function filled(v: unknown): boolean {
  return typeof v === "string" && v.trim() !== "";
}

export function rowsOf(data: BiaData, key: ListKey): Row[] {
  const v = data[key];
  return Array.isArray(v) ? (v as Row[]) : [];
}

export function isNone(data: BiaData, key: ListKey): boolean {
  return !!data.editor?.none?.[key];
}

/** Department name for labels, falling back to a neutral phrase. */
export function deptName(data: BiaData): string {
  return data.info?.department?.trim() || "this department";
}

/** "30 Days", "1 week", "72 hrs" → hours. Null when it cannot be read. */
export function parseHours(s: string | undefined): number | null {
  if (!s) return null;
  const t = s.trim().toLowerCase();
  if (/^(more than|over|>)/.test(t)) {
    const inner = parseHours(t.replace(/^(more than|over|>)\s*/, ""));
    return inner == null ? null : inner + 1;
  }
  const m = t.match(/^(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|d|day|days|w|wk|wks|week|weeks|month|months)\b/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = m[2];
  if (unit.startsWith("h")) return n;
  if (unit.startsWith("d")) return n * 24;
  if (unit.startsWith("w")) return n * 168;
  return n * 720;
}

/** Split a stored frequency string into known options and leftover text. */
export function parseFrequency(s: string | undefined): { picked: string[]; other: string } {
  const picked: string[] = [];
  const other: string[] = [];
  for (const raw of (s ?? "").split(/[,;/]/)) {
    const tok = raw.trim();
    if (!tok) continue;
    const hit = FREQUENCIES.find((f) => f.toLowerCase() === tok.toLowerCase());
    if (hit) {
      if (!picked.includes(hit)) picked.push(hit);
    } else {
      other.push(tok);
    }
  }
  return { picked, other: other.join(", ") };
}

export function composeFrequency(picked: string[], other: string): string {
  const ordered = FREQUENCIES.filter((f) => picked.includes(f));
  return [...ordered, other.trim()].filter(Boolean).join(", ");
}

export function hasImpactRatings(p: CriticalProcess): boolean {
  const g = p.impact_over_time;
  if (!g) return false;
  return Object.values(g).some((row) => Object.values(row ?? {}).some((v) => v !== "" && v != null));
}

/** Worst rating across all impact types at each time point. */
export function worstByTime(g: ImpactOverTime | undefined): (number | null)[] {
  return IMPACT_TIMES.map((t) => {
    let worst: number | null = null;
    for (const d of IMPACT_DIMS) {
      const v = g?.[d.k]?.[t.k];
      if (v === "" || v == null) continue;
      const n = Number(v);
      if (worst == null || n > worst) worst = n;
    }
    return worst;
  });
}

/** First time point at which any impact type is rated Severe. */
export function firstSevere(p: CriticalProcess): (typeof IMPACT_TIMES)[number] | null {
  const worst = worstByTime(p.impact_over_time);
  const i = worst.findIndex((w) => w === 4);
  return i < 0 ? null : IMPACT_TIMES[i];
}

function processLabel(p: CriticalProcess, i: number): string {
  const first = (p.process_description ?? "").split("\n")[0].trim();
  if (!first) return `Process ${i + 1}`;
  return first.length > 60 ? first.slice(0, 57) + "…" : first;
}

// ---------- checks ----------

export type Check = { sec: SectionId; sev: "warn" | "info"; text: string; row?: number };

export function runChecks(data: BiaData): Check[] {
  const out: Check[] = [];
  const add = (sec: SectionId, sev: Check["sev"], text: string, row?: number) =>
    out.push({ sec, sev, text, row });
  const info = data.info ?? {};

  if (!filled(info.division) || !filled(info.document_owner))
    add("cover", "info", "Division and document owner are blank — these are the two header fields most often missing from finished BIAs.");
  if (!filled(info.persons_completing)) add("cover", "info", "Person(s) completing is blank.");

  const procs = (data.critical_processes ?? []) as CriticalProcess[];
  if (!procs.length) add("proc", "warn", "No critical processes are listed.");
  procs.forEach((p, i) => {
    const nm = processLabel(p, i);
    if (!filled(p.frequency)) add("proc", "info", `${nm}: add how often it runs.`, i);
    if (!filled(p.maximum_disruption)) add("proc", "info", `${nm}: maximum disruption not set.`, i);
    if (!filled(p.quantitative_impact) && !filled(p.qualitative_impact))
      add("proc", "info", `${nm}: no impact described.`, i);
    const severe = firstSevere(p);
    const mh = parseHours(p.maximum_disruption);
    if (severe && mh != null && mh > severe.h)
      add("proc", "warn", `${nm}: impact is rated Severe at ${severe.label}, but the maximum disruption is ${p.maximum_disruption}.`, i);
  });

  const deps: ListKey[] = ["upstream_internal", "upstream_external", "downstream_internal", "downstream_external"];
  const depDone = (k: ListKey) => isNone(data, k) || rowsOf(data, k).length > 0;
  if (!depDone("downstream_internal") && !depDone("downstream_external"))
    add("deps", "info", "Lists 3 and 4 are empty. Who is waiting on this department's work — inside or outside the company?");
  if (rowsOf(data, "software").length && !depDone("upstream_internal") && deps.some(depDone))
    add("deps", "info", "Systems are listed but nothing is needed from other departments. Please check — master data usually comes from somewhere.");

  rowsOf(data, "software").forEach((s, i) => {
    const nm = s.application?.trim() || `System ${i + 1}`;
    if (!filled(s.rto)) add("sys", "info", `${nm}: recovery time objective not set.`, i);
    if (!filled(s.rpo)) add("sys", "info", `${nm}: recovery point objective not set.`, i);
    if (!filled(s.manual_workaround)) add("sys", "info", `${nm}: no manual workaround described.`, i);
  });

  const roles = rowsOf(data, "human_capital");
  roles.forEach((r, i) => {
    const normal = Number(r.normal_headcount);
    if (!filled(r.normal_headcount) || Number.isNaN(normal)) return;
    for (const k of ["day_1", "day_2_3", "day_5", "after_day_10"]) {
      const n = Number(r[k]);
      if (filled(r[k]) && !Number.isNaN(n) && n > normal)
        add("people", "warn", `${r.functional_role?.trim() || `Role ${i + 1}`}: minimum staffing (${r[k]}) is higher than normal headcount (${r.normal_headcount}).`, i);
    }
  });
  if (roles.length && roles.every((r) => !filled(r.day_1)))
    add("people", "info", "Minimum Day 1 staffing is blank for all roles.");

  rowsOf(data, "third_parties").forEach((v, i) => {
    if (!filled(v.mitigation_plan))
      add("vend", "info", `${v.company_name?.trim() || `Company ${i + 1}`}: no plan described if they cannot deliver.`, i);
  });

  rowsOf(data, "vital_records").forEach((r, i) => {
    const paperOnly = /paper/i.test(r.media_type ?? "") && !/electronic/i.test(r.media_type ?? "");
    if (paperOnly && !/^y/i.test((r.electronic_backup ?? "").trim()))
      add("recs", "warn", `${r.description?.trim() || `Record ${i + 1}`}: paper only without a full electronic backup — a fire or flood would lose it.`, i);
  });

  const rec = data.process_recovery ?? {};
  const blank = SCENARIOS.filter((s) => !filled(rec[s.k])).map((s) => s.title.toLowerCase());
  if (blank.length && blank.length < SCENARIOS.length)
    add("scen", "info", `Nothing recorded for: ${blank.join(", ")}.`);

  return out;
}

// ---------- section status ----------

export type Status = "done" | "part" | "";

export function sectionStatus(id: SectionId, data: BiaData): Status {
  const info = data.info ?? {};
  const named = (k: ListKey) => rowsOf(data, k).filter((r) => filled(r[LIST_FIELDS[k][0]]));
  const listStatus = (k: ListKey, complete: (r: Row) => boolean): Status => {
    if (isNone(data, k)) return "done";
    const rows = named(k);
    if (!rows.length) return rowsOf(data, k).length ? "part" : "";
    return rows.every(complete) ? "done" : "part";
  };
  switch (id) {
    case "cover": {
      const need = [data.company, data.site_department, info.department, info.division, info.document_owner, info.persons_completing];
      if (need.every(filled)) return "done";
      return [...need, info.location_address, info.city_state].some(filled) ? "part" : "";
    }
    case "proc":
      return listStatus(
        "critical_processes",
        (p) => filled(p.frequency) && filled(p.maximum_disruption) && (filled(p.quantitative_impact) || filled(p.qualitative_impact)),
      );
    case "deps": {
      const keys: ListKey[] = ["upstream_internal", "upstream_external", "downstream_internal", "downstream_external"];
      const c = keys.filter((k) => isNone(data, k) || rowsOf(data, k).length).length;
      return c === 4 ? "done" : c ? "part" : "";
    }
    case "sys":
      return listStatus("software", (s) => filled(s.rto) && filled(s.rpo) && filled(s.manual_workaround));
    case "equip":
      return listStatus("infrastructure", () => true);
    case "people":
      return listStatus("human_capital", (r) => filled(r.normal_headcount) && filled(r.day_1));
    case "vend":
      return listStatus("third_parties", (v) => filled(v.service_provided));
    case "recs":
      return listStatus("vital_records", (r) => filled(r.media_type) && filled(r.storage_location));
    case "scen": {
      const rec = data.process_recovery ?? {};
      const c = SCENARIOS.filter((s) => filled(rec[s.k])).length;
      return c === SCENARIOS.length ? "done" : c ? "part" : "";
    }
    default:
      return "";
  }
}

/** Share of the content sections started or complete, 0–100. */
export function progress(data: BiaData): number {
  const secs = SECTIONS.filter((s) => s.id !== "intro" && s.id !== "review");
  const score = secs.reduce((a, s) => {
    const st = sectionStatus(s.id, data);
    return a + (st === "done" ? 1 : st === "part" ? 0.5 : 0);
  }, 0);
  return Math.round((score / secs.length) * 100);
}

// ---------- sanitize ----------

const MAX_LEN = 20000;
const MAX_ROWS = 500;

function str(v: unknown): string | undefined {
  if (typeof v !== "string" || v === "") return undefined;
  return v.slice(0, MAX_LEN);
}

function dateOrNull(v: unknown): string | null {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

function sanitizeImpact(v: unknown): ImpactOverTime | undefined {
  if (!v || typeof v !== "object") return undefined;
  const src = v as Record<string, unknown>;
  const out: ImpactOverTime = {};
  for (const d of IMPACT_DIMS) {
    const row = src[d.k];
    if (!row || typeof row !== "object") continue;
    const clean: Record<string, string> = {};
    for (const t of IMPACT_TIMES) {
      const val = (row as Record<string, unknown>)[t.k];
      if (typeof val === "string" && /^[0-4]$/.test(val)) clean[t.k] = val;
    }
    if (Object.keys(clean).length) out[d.k] = clean;
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Reduce untrusted input to the known BIA shape. Unknown keys are dropped,
 * strings are length-capped, and empty dates become null (the engine parses
 * them as dates and rejects "").
 */
export function sanitizeBia(input: unknown): BiaData {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const infoSrc = (src.info && typeof src.info === "object" ? src.info : {}) as Record<string, unknown>;
  const info: DocumentInfo = {
    location_address: str(infoSrc.location_address),
    city_state: str(infoSrc.city_state),
    division: str(infoSrc.division),
    department: str(infoSrc.department),
    document_owner: str(infoSrc.document_owner),
    persons_completing: str(infoSrc.persons_completing),
    date_completed: dateOrNull(infoSrc.date_completed),
    last_updated: dateOrNull(infoSrc.last_updated),
  };

  const out: BiaData = {
    title: str(src.title) ?? "Business Impact Analysis",
    company: str(src.company),
    site_department: str(src.site_department),
    info,
  };

  for (const key of LIST_KEYS) {
    const rows = Array.isArray(src[key]) ? (src[key] as unknown[]).slice(0, MAX_ROWS) : [];
    const fields = LIST_FIELDS[key];
    const clean = rows.map((r) => {
      const rs = (r && typeof r === "object" ? r : {}) as Record<string, unknown>;
      const row: Record<string, unknown> = {};
      for (const f of fields) {
        const v = str(rs[f]);
        if (v !== undefined) row[f] = v;
      }
      // The engine requires the first field on every row.
      if (!(fields[0] in row)) row[fields[0]] = "";
      if (key === "critical_processes") {
        const impact = sanitizeImpact(rs.impact_over_time);
        if (impact) row.impact_over_time = impact;
      }
      return row;
    });
    (out as Record<string, unknown>)[key] = clean;
  }

  const recSrc = (src.process_recovery && typeof src.process_recovery === "object" ? src.process_recovery : {}) as Record<string, unknown>;
  out.process_recovery = {
    loss_of_site: str(recSrc.loss_of_site),
    loss_of_systems: str(recSrc.loss_of_systems),
    loss_of_people: str(recSrc.loss_of_people),
    loss_of_relationship: str(recSrc.loss_of_relationship),
  };

  const edSrc = (src.editor && typeof src.editor === "object" ? src.editor : {}) as Record<string, unknown>;
  const noneSrc = (edSrc.none && typeof edSrc.none === "object" ? edSrc.none : {}) as Record<string, unknown>;
  const none: Record<string, boolean> = {};
  for (const k of NONE_KEYS) if (noneSrc[k] === true) none[k] = true;
  if (Object.keys(none).length) out.editor = { none };

  return out;
}

/** Drop editor-only fields so the engine receives exactly its own schema. */
export function toEngineData(data: BiaData): BiaData {
  const { editor: _editor, ...rest } = data;
  void _editor;
  return {
    ...rest,
    critical_processes: (rest.critical_processes ?? []).map((p) => {
      const { impact_over_time: _impact, ...row } = p;
      void _impact;
      return row;
    }),
  };
}
