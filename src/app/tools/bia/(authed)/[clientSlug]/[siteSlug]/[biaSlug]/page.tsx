import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { loadBia } from "@/lib/bia/load";
import { CoverInfoEditor } from "@/components/bia/cover-info-editor";
import { ProcessRecoveryEditor } from "@/components/bia/process-recovery-editor";
import { ListSection, type FieldDef } from "@/components/bia/list-section";
import {
  addRowAction,
  deleteRowAction,
  saveCoverInfoAction,
  saveProcessRecoveryAction,
  updateRowAction,
} from "./actions";

type Params = Promise<{
  clientSlug: string;
  siteSlug: string;
  biaSlug: string;
}>;
type SearchParams = Promise<{ error?: string }>;

const ERRORS: Record<string, string> = {
  save: "Couldn't save. Try again.",
};

const CRITICAL_FIELDS: FieldDef[] = [
  { key: "process_description", label: "Process description", kind: "textarea" },
  { key: "frequency", label: "Frequency", placeholder: "Daily / Weekly / Monthly / Annually / Ad Hoc" },
  { key: "seasonality", label: "Seasonality" },
  { key: "quantitative_impact", label: "Quantitative impact", kind: "textarea" },
  { key: "qualitative_impact", label: "Qualitative impact", kind: "textarea" },
  { key: "maximum_disruption", label: "Maximum disruption", placeholder: "30 Days" },
];

const INTERNAL_DEP_FIELDS: FieldDef[] = [
  { key: "item", label: "Item / Information" },
  { key: "department_function", label: "Department / Function" },
  { key: "comments", label: "Comments", kind: "textarea" },
];

const EXTERNAL_DEP_FIELDS: FieldDef[] = [
  { key: "item", label: "Item / Information" },
  { key: "vendor_customer_other", label: "Vendor / Customer / Other" },
  { key: "comments", label: "Comments", kind: "textarea" },
];

const SOFTWARE_FIELDS: FieldDef[] = [
  { key: "application", label: "Application" },
  { key: "use_description", label: "Use / Description" },
  { key: "rto", label: "RTO" },
  { key: "rpo", label: "RPO" },
  { key: "manual_workaround", label: "Manual workaround", kind: "textarea" },
  { key: "comments", label: "Comments", kind: "textarea" },
];

const INFRA_FIELDS: FieldDef[] = [
  { key: "component", label: "Component" },
  { key: "use_description", label: "Use / Description" },
  { key: "rto", label: "RTO" },
  { key: "corporate_contact", label: "Corporate contact" },
  { key: "vendor_contact", label: "Vendor contact" },
  { key: "mitigation_strategy", label: "Mitigation strategy", kind: "textarea" },
];

const HUMAN_FIELDS: FieldDef[] = [
  { key: "functional_role", label: "Functional role" },
  { key: "normal_headcount", label: "Normal headcount" },
  { key: "day_1", label: "Min. Day 1" },
  { key: "day_2_3", label: "Min. Day 2-3" },
  { key: "day_5", label: "Min. Day 5" },
  { key: "after_day_10", label: "Min. After Day 10" },
  { key: "recovery_location", label: "Recovery location" },
  { key: "key_person_dependencies", label: "Key person dependencies", kind: "textarea" },
];

const THIRD_PARTY_FIELDS: FieldDef[] = [
  { key: "company_name", label: "Company name" },
  { key: "service_provided", label: "Service provided" },
  { key: "contact_details", label: "Contact details", kind: "textarea" },
  { key: "recovery_period_instructions", label: "Recovery instructions", kind: "textarea" },
  { key: "mitigation_plan", label: "Mitigation plan", kind: "textarea" },
];

const VITAL_FIELDS: FieldDef[] = [
  { key: "description", label: "Description" },
  { key: "media_type", label: "Media type" },
  { key: "electronic_backup", label: "Electronic backup?" },
  { key: "storage_location", label: "Storage location" },
  { key: "vendor_contact", label: "Vendor contact" },
  { key: "restoration_procedures", label: "Restoration procedures", kind: "textarea" },
];

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { biaSlug } = await params;
  return { title: biaSlug };
}

export default async function BiaEditorPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { clientSlug, siteSlug, biaSlug } = await params;
  const sp = await searchParams;
  const errorMessage = sp.error ? ERRORS[sp.error] : null;

  const bia = await loadBia(clientSlug, siteSlug, biaSlug);
  const data = bia.data ?? {};

  // Bind action params upfront so the per-section components stay generic.
  const saveCover = saveCoverInfoAction.bind(null, clientSlug, siteSlug, biaSlug);
  const saveRecovery = saveProcessRecoveryAction.bind(null, clientSlug, siteSlug, biaSlug);

  function listProps(section: Parameters<typeof addRowAction>[3]) {
    return {
      addRow: addRowAction.bind(null, clientSlug, siteSlug, biaSlug, section),
      // Factories called during server rendering. Each returns a real .bind()'d
      // server action so Next.js can wire it up as a <form action>.
      bindUpdate: (idx: number) =>
        updateRowAction.bind(null, clientSlug, siteSlug, biaSlug, section, idx),
      bindDelete: (idx: number) =>
        deleteRowAction.bind(null, clientSlug, siteSlug, biaSlug, section, idx),
    };
  }

  const exportHref = `/tools/bia/${clientSlug}/${siteSlug}/${biaSlug}/export`;

  return (
    <section className="py-10 sm:py-12">
      <Container width="wide">
        {/* Breadcrumb + actions header */}
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
          <Link href="/tools/bia" className="hover:text-brand-maroon">
            Clients
          </Link>{" "}
          /{" "}
          <Link
            href={`/tools/bia/${clientSlug}`}
            className="hover:text-brand-maroon"
          >
            {bia.client_name}
          </Link>{" "}
          /{" "}
          <Link
            href={`/tools/bia/${clientSlug}/${siteSlug}`}
            className="hover:text-brand-maroon"
          >
            {bia.site_name}
          </Link>{" "}
          / {bia.title}
        </p>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-brand-maroon">
              {bia.title}
            </h1>
            <p className="mt-1 text-xs text-brand-ink-mid">
              status: {bia.status} · last updated{" "}
              {new Date(bia.updated_at).toLocaleString()}
            </p>
          </div>
          <a
            href={exportHref}
            className="inline-flex items-center justify-center rounded-lg bg-brand-orange px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-paper transition hover:bg-brand-maroon"
          >
            Export .docx
          </a>
        </div>

        {/* Section nav */}
        <nav className="mt-6 flex flex-wrap gap-2 text-xs">
          {[
            ["cover", "Cover"],
            ["critical_processes", "Critical Processes"],
            ["upstream_internal", "Upstream Internal"],
            ["upstream_external", "Upstream External"],
            ["downstream_internal", "Downstream Internal"],
            ["downstream_external", "Downstream External"],
            ["software", "Software"],
            ["infrastructure", "Infrastructure"],
            ["human_capital", "Human Capital"],
            ["third_parties", "Third Parties"],
            ["vital_records", "Vital Records"],
            ["recovery", "Recovery"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-full border border-brand-taupe-mid bg-brand-paper px-3 py-1 text-brand-ink-mid hover:border-brand-orange hover:text-brand-maroon"
            >
              {label}
            </a>
          ))}
        </nav>

        {errorMessage ? (
          <p className="mt-4 text-sm text-brand-maroon" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {/* Sections */}
        <div className="mt-8 space-y-6">
          <CoverInfoEditor bia={data} action={saveCover} />

          <ListSection
            id="critical_processes"
            title="Critical Business Processes"
            hint="Time-sensitive activities that drive your customer / regulatory commitments."
            fields={CRITICAL_FIELDS}
            rows={(data.critical_processes ?? []) as Record<string, string>[]}
            {...listProps("critical_processes")}
          />

          <ListSection
            id="upstream_internal"
            title="Upstream Dependencies — Internal"
            hint="Inputs you receive from other internal teams to operate."
            fields={INTERNAL_DEP_FIELDS}
            rows={(data.upstream_internal ?? []) as Record<string, string>[]}
            {...listProps("upstream_internal")}
          />

          <ListSection
            id="upstream_external"
            title="Upstream Dependencies — External"
            hint="Inputs you receive from outside vendors / customers."
            fields={EXTERNAL_DEP_FIELDS}
            rows={(data.upstream_external ?? []) as Record<string, string>[]}
            {...listProps("upstream_external")}
          />

          <ListSection
            id="downstream_internal"
            title="Downstream Dependencies — Internal"
            hint="Outputs you provide to other internal teams."
            fields={INTERNAL_DEP_FIELDS}
            rows={(data.downstream_internal ?? []) as Record<string, string>[]}
            {...listProps("downstream_internal")}
          />

          <ListSection
            id="downstream_external"
            title="Downstream Dependencies — External"
            hint="Outputs you provide to outside vendors / customers."
            fields={EXTERNAL_DEP_FIELDS}
            rows={(data.downstream_external ?? []) as Record<string, string>[]}
            {...listProps("downstream_external")}
          />

          <ListSection
            id="software"
            title="Software Requirements"
            hint="Applications and SaaS systems needed to operate."
            fields={SOFTWARE_FIELDS}
            rows={(data.software ?? []) as Record<string, string>[]}
            {...listProps("software")}
          />

          <ListSection
            id="infrastructure"
            title="Infrastructure & Specialized Equipment"
            hint="Hardware, machinery, and long-lead-time equipment."
            fields={INFRA_FIELDS}
            rows={(data.infrastructure ?? []) as Record<string, string>[]}
            {...listProps("infrastructure")}
          />

          <ListSection
            id="human_capital"
            title="Human Capital / Workspace"
            hint="Roles, headcount, ramp-up requirements over a recovery window."
            fields={HUMAN_FIELDS}
            rows={(data.human_capital ?? []) as Record<string, string>[]}
            {...listProps("human_capital")}
          />

          <ListSection
            id="third_parties"
            title="Third Party Relationships"
            hint="Service providers and the contingency for losing them."
            fields={THIRD_PARTY_FIELDS}
            rows={(data.third_parties ?? []) as Record<string, string>[]}
            {...listProps("third_parties")}
          />

          <ListSection
            id="vital_records"
            title="Vital Records"
            hint="Critical paper / electronic records, where they live, how to restore."
            fields={VITAL_FIELDS}
            rows={(data.vital_records ?? []) as Record<string, string>[]}
            {...listProps("vital_records")}
          />

          <ProcessRecoveryEditor
            recovery={data.process_recovery}
            action={saveRecovery}
          />
        </div>
      </Container>
    </section>
  );
}
