"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/bia/auth";
import { createClient as createSupabase } from "@/lib/supabase/server";
import { loadBia } from "@/lib/bia/load";
import type {
  BiaData,
  CriticalProcess,
  DocumentInfo,
  ExternalDependency,
  HumanCapitalRow,
  InfrastructureRequirement,
  InternalDependency,
  ProcessRecovery,
  SoftwareRequirement,
  ThirdPartyRelationship,
  VitalRecord,
} from "@/lib/bia/types";

// ---------- core write ----------

async function persist(
  clientSlug: string,
  siteSlug: string,
  biaSlug: string,
  data: BiaData,
): Promise<void> {
  const supabase = await createSupabase();
  const { error } = await supabase.rpc("update_bia_data_for_caller", {
    p_client_slug: clientSlug,
    p_site_slug: siteSlug,
    p_bia_slug: biaSlug,
    p_data: data,
  });
  if (error) {
    console.error("[bia/update] rpc failed:", error);
    redirect(
      `/tools/bia/${clientSlug}/${siteSlug}/${biaSlug}?error=save`,
    );
  }
  revalidatePath(`/tools/bia/${clientSlug}/${siteSlug}/${biaSlug}`);
}

function fld(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

// ---------- cover + info ----------

export async function saveCoverInfoAction(
  clientSlug: string,
  siteSlug: string,
  biaSlug: string,
  formData: FormData,
): Promise<void> {
  await requireUser();
  const bia = await loadBia(clientSlug, siteSlug, biaSlug);
  const info: DocumentInfo = {
    location_address: fld(formData, "location_address") || undefined,
    city_state: fld(formData, "city_state") || undefined,
    division: fld(formData, "division") || undefined,
    department: fld(formData, "department") || undefined,
    document_owner: fld(formData, "document_owner") || undefined,
    persons_completing: fld(formData, "persons_completing") || undefined,
    date_completed: fld(formData, "date_completed") || null,
    last_updated: fld(formData, "last_updated") || null,
  };
  const next: BiaData = {
    ...bia.data,
    title: fld(formData, "title") || "Business Impact Analysis",
    company: fld(formData, "company") || undefined,
    site_department: fld(formData, "site_department") || undefined,
    info,
  };
  await persist(clientSlug, siteSlug, biaSlug, next);
  redirect(`/tools/bia/${clientSlug}/${siteSlug}/${biaSlug}#cover`);
}

// ---------- process recovery ----------

export async function saveProcessRecoveryAction(
  clientSlug: string,
  siteSlug: string,
  biaSlug: string,
  formData: FormData,
): Promise<void> {
  await requireUser();
  const bia = await loadBia(clientSlug, siteSlug, biaSlug);
  const recovery: ProcessRecovery = {
    loss_of_site: fld(formData, "loss_of_site") || undefined,
    loss_of_systems: fld(formData, "loss_of_systems") || undefined,
    loss_of_people: fld(formData, "loss_of_people") || undefined,
    loss_of_relationship: fld(formData, "loss_of_relationship") || undefined,
  };
  await persist(clientSlug, siteSlug, biaSlug, {
    ...bia.data,
    process_recovery: recovery,
  });
  redirect(`/tools/bia/${clientSlug}/${siteSlug}/${biaSlug}#recovery`);
}

// ---------- list-section helpers ----------

type ListKey =
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

const LIST_FIELDS: Record<ListKey, readonly string[]> = {
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

type ListRow =
  | CriticalProcess
  | InternalDependency
  | ExternalDependency
  | SoftwareRequirement
  | InfrastructureRequirement
  | HumanCapitalRow
  | ThirdPartyRelationship
  | VitalRecord;

function rowFromForm(section: ListKey, form: FormData): ListRow {
  const fields = LIST_FIELDS[section];
  const out: Record<string, string> = {};
  for (const f of fields) {
    const v = fld(form, f);
    if (v) out[f] = v;
  }
  // Ensure the required first field exists (even if empty) so type is satisfied.
  if (!(fields[0] in out)) out[fields[0]] = "";
  return out as ListRow;
}

function readList(data: BiaData, section: ListKey): ListRow[] {
  const v = data[section];
  return Array.isArray(v) ? (v as ListRow[]) : [];
}

function writeList(
  data: BiaData,
  section: ListKey,
  rows: ListRow[],
): BiaData {
  return { ...data, [section]: rows };
}

export async function addRowAction(
  clientSlug: string,
  siteSlug: string,
  biaSlug: string,
  section: ListKey,
  formData: FormData,
): Promise<void> {
  await requireUser();
  const bia = await loadBia(clientSlug, siteSlug, biaSlug);
  const rows = readList(bia.data, section);
  const newRow = rowFromForm(section, formData);
  // Skip empty submissions (the first/required field is blank).
  const fields = LIST_FIELDS[section];
  if (!String((newRow as Record<string, string>)[fields[0]] ?? "").trim()) {
    redirect(`/tools/bia/${clientSlug}/${siteSlug}/${biaSlug}#${section}`);
  }
  const next = writeList(bia.data, section, [...rows, newRow]);
  await persist(clientSlug, siteSlug, biaSlug, next);
  redirect(`/tools/bia/${clientSlug}/${siteSlug}/${biaSlug}#${section}`);
}

export async function updateRowAction(
  clientSlug: string,
  siteSlug: string,
  biaSlug: string,
  section: ListKey,
  index: number,
  formData: FormData,
): Promise<void> {
  await requireUser();
  const bia = await loadBia(clientSlug, siteSlug, biaSlug);
  const rows = readList(bia.data, section).slice();
  if (index < 0 || index >= rows.length) {
    redirect(`/tools/bia/${clientSlug}/${siteSlug}/${biaSlug}#${section}`);
  }
  rows[index] = rowFromForm(section, formData);
  const next = writeList(bia.data, section, rows);
  await persist(clientSlug, siteSlug, biaSlug, next);
  redirect(`/tools/bia/${clientSlug}/${siteSlug}/${biaSlug}#${section}`);
}

export async function deleteRowAction(
  clientSlug: string,
  siteSlug: string,
  biaSlug: string,
  section: ListKey,
  index: number,
): Promise<void> {
  await requireUser();
  const bia = await loadBia(clientSlug, siteSlug, biaSlug);
  const rows = readList(bia.data, section).slice();
  if (index < 0 || index >= rows.length) {
    redirect(`/tools/bia/${clientSlug}/${siteSlug}/${biaSlug}#${section}`);
  }
  rows.splice(index, 1);
  const next = writeList(bia.data, section, rows);
  await persist(clientSlug, siteSlug, biaSlug, next);
  redirect(`/tools/bia/${clientSlug}/${siteSlug}/${biaSlug}#${section}`);
}
