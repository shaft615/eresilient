import {
  FieldLabel,
  PrimaryButton,
  SectionShell,
  TextArea,
} from "./editor-shared";
import type { ProcessRecovery } from "@/lib/bia/types";

const FIELDS: Array<[keyof ProcessRecovery, string, string]> = [
  [
    "loss_of_site",
    "Loss of Site",
    "Workspace solutions — alternate locations, 3rd-party sites, work-from-home.",
  ],
  [
    "loss_of_systems",
    "Loss of Systems",
    "Workaround capabilities, manual processes, alternate vendors.",
  ],
  [
    "loss_of_people",
    "Loss of People",
    "Cross-training, staff backups, external assistance, virtual support.",
  ],
  [
    "loss_of_relationship",
    "Loss of Relationship",
    "Alternate suppliers, sole-source dependencies, contingencies.",
  ],
];

export function ProcessRecoveryEditor({
  recovery,
  action,
}: {
  recovery: ProcessRecovery | undefined;
  action: (formData: FormData) => Promise<void>;
}) {
  const r = recovery ?? {};
  return (
    <SectionShell
      id="recovery"
      title="Process Recovery"
      hint="Mitigation strategies for the four major loss scenarios."
    >
      <form action={action} className="grid gap-4">
        {FIELDS.map(([key, label, hint]) => (
          <div key={key}>
            <FieldLabel htmlFor={key}>{label}</FieldLabel>
            <p className="mt-1 text-xs text-brand-ink-mid">{hint}</p>
            <TextArea
              name={key}
              defaultValue={r[key] ?? ""}
              rows={3}
            />
          </div>
        ))}
        <div>
          <PrimaryButton>Save process recovery</PrimaryButton>
        </div>
      </form>
    </SectionShell>
  );
}
