import {
  FieldLabel,
  PrimaryButton,
  SectionShell,
  TextInput,
} from "./editor-shared";
import type { BiaData } from "@/lib/bia/types";

export function CoverInfoEditor({
  bia,
  action,
}: {
  bia: BiaData;
  action: (formData: FormData) => Promise<void>;
}) {
  const info = bia.info ?? {};

  return (
    <SectionShell
      id="cover"
      title="Cover & Document Info"
      hint="Identity block that appears at the top of the rendered Word document."
    >
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="title">Document title</FieldLabel>
          <TextInput
            name="title"
            defaultValue={bia.title ?? "Business Impact Analysis"}
          />
        </div>
        <div>
          <FieldLabel htmlFor="company">Company</FieldLabel>
          <TextInput name="company" defaultValue={bia.company} />
        </div>
        <div>
          <FieldLabel htmlFor="site_department">Site / Department</FieldLabel>
          <TextInput
            name="site_department"
            defaultValue={bia.site_department}
            placeholder="Clinton — Finance"
          />
        </div>

        <div className="sm:col-span-2 mt-2 border-t border-brand-taupe-mid pt-4" />

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="location_address">Location address</FieldLabel>
          <TextInput
            name="location_address"
            defaultValue={info.location_address}
          />
        </div>
        <div>
          <FieldLabel htmlFor="city_state">City / State</FieldLabel>
          <TextInput name="city_state" defaultValue={info.city_state} />
        </div>
        <div>
          <FieldLabel htmlFor="division">Division</FieldLabel>
          <TextInput name="division" defaultValue={info.division} />
        </div>
        <div>
          <FieldLabel htmlFor="department">Department</FieldLabel>
          <TextInput name="department" defaultValue={info.department} />
        </div>
        <div>
          <FieldLabel htmlFor="document_owner">Document owner</FieldLabel>
          <TextInput
            name="document_owner"
            defaultValue={info.document_owner}
          />
        </div>
        <div>
          <FieldLabel htmlFor="persons_completing">
            Person(s) completing
          </FieldLabel>
          <TextInput
            name="persons_completing"
            defaultValue={info.persons_completing}
          />
        </div>
        <div>
          <FieldLabel htmlFor="date_completed">Date completed</FieldLabel>
          <TextInput
            name="date_completed"
            type="date"
            defaultValue={info.date_completed ?? undefined}
          />
        </div>
        <div>
          <FieldLabel htmlFor="last_updated">Last updated</FieldLabel>
          <TextInput
            name="last_updated"
            type="date"
            defaultValue={info.last_updated ?? undefined}
          />
        </div>

        <div className="sm:col-span-2">
          <PrimaryButton>Save cover & info</PrimaryButton>
        </div>
      </form>
    </SectionShell>
  );
}
