import { createClientAction } from "../../actions";
import { Card, ErrorNotice, Field, buttonCls, inputCls } from "../../ui";

type Props = {
  searchParams: Promise<{
    error?: string;
    name?: string;
    contactName?: string;
    contactEmail?: string;
  }>;
};

export default async function NewClientPage({ searchParams }: Props) {
  const { error, name, contactName, contactEmail } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <ErrorNotice message={error} />
      <Card title="New client">
        <p className="mb-6 text-sm leading-relaxed text-brand-ink-mid">
          Creates the client record that engagements, invoices, and portal
          access hang off. Converting a lead? The fields below are prefilled
          from the lead when you arrive via a Convert link.
        </p>
        <form action={createClientAction} className="space-y-5">
          <Field label="Company name *">
            <input name="name" required defaultValue={name ?? ""} className={inputCls} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Primary contact name">
              <input name="primaryContactName" defaultValue={contactName ?? ""} className={inputCls} />
            </Field>
            <Field label="Primary contact email">
              <input
                name="primaryContactEmail"
                type="email"
                defaultValue={contactEmail ?? ""}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Website">
              <input name="website" placeholder="https://" className={inputCls} />
            </Field>
            <Field label="Phone">
              <input name="phone" className={inputCls} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea name="notes" rows={3} className={inputCls} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-brand-ink-mid">
            <input type="checkbox" name="grantPortalAccess" defaultChecked className="accent-brand-orange" />
            Grant the primary contact portal access and send them a welcome email
          </label>
          <button type="submit" className={buttonCls}>
            Create client
          </button>
        </form>
      </Card>
    </div>
  );
}
