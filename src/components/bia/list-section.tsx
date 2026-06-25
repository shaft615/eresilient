import {
  DangerButton,
  FieldLabel,
  PrimaryButton,
  SecondaryButton,
  SectionShell,
  TextArea,
  TextInput,
} from "./editor-shared";

export type FieldDef = {
  /** Key on the row object. */
  key: string;
  /** Human label shown above the input. */
  label: string;
  /** "input" (default) or "textarea". */
  kind?: "input" | "textarea";
  /** Optional placeholder. */
  placeholder?: string;
};

type AnyRow = Record<string, string | undefined>;

/** A server action whose remaining param is FormData. */
type FormAction = (formData: FormData) => Promise<void>;
/** A server action that takes no args (Next.js requires (formData) but it can ignore it). */
type NoArgAction = () => Promise<void>;

/**
 * Generic editor for a list-of-rows BIA section. Renders one form per row
 * (Save + Delete) and a separate "Add row" form at the bottom.
 *
 * The two `bind*` factories are called during server rendering and must
 * return real `.bind()`'d server actions so Next.js can use them as
 * `<form action>` props.
 */
export function ListSection({
  id,
  title,
  hint,
  fields,
  rows,
  bindUpdate,
  bindDelete,
  addRow,
}: {
  id: string;
  title: string;
  hint?: string;
  fields: FieldDef[];
  rows: AnyRow[];
  /** Returns a server action bound to the given row index. */
  bindUpdate: (rowIndex: number) => FormAction;
  /** Returns a server action bound to the given row index. */
  bindDelete: (rowIndex: number) => NoArgAction;
  /** Bound to (formData). */
  addRow: FormAction;
}) {
  return (
    <SectionShell id={id} title={title} hint={hint}>
      {/* Existing rows */}
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-taupe-mid bg-brand-taupe-light/40 p-4 text-xs text-brand-ink-mid">
          No rows yet. Use the form below to add one.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, idx) => (
            <li
              key={idx}
              className="rounded-xl border border-brand-taupe-mid bg-brand-taupe-light/30 p-4"
            >
              <RowForm
                fields={fields}
                row={row}
                save={bindUpdate(idx)}
                remove={bindDelete(idx)}
                indexLabel={`Row ${idx + 1}`}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Add new row */}
      <div className="mt-6 rounded-xl border border-brand-taupe-mid border-dashed bg-brand-paper p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
          Add row
        </p>
        <RowForm
          fields={fields}
          row={{}}
          save={addRow}
          isAdd
        />
      </div>
    </SectionShell>
  );
}

function RowForm({
  fields,
  row,
  save,
  remove,
  indexLabel,
  isAdd,
}: {
  fields: FieldDef[];
  row: AnyRow;
  save: FormAction;
  remove?: NoArgAction;
  indexLabel?: string;
  isAdd?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <form action={save} className="contents">
        {indexLabel ? (
          <p className="sm:col-span-2 text-xs uppercase tracking-[0.1em] text-brand-ink-mid">
            {indexLabel}
          </p>
        ) : null}
        {fields.map((f) => {
          const isWide = f.kind === "textarea";
          return (
            <div key={f.key} className={isWide ? "sm:col-span-2" : ""}>
              <FieldLabel htmlFor={f.key}>{f.label}</FieldLabel>
              {f.kind === "textarea" ? (
                <TextArea
                  name={f.key}
                  defaultValue={row[f.key]}
                  placeholder={f.placeholder}
                  rows={2}
                />
              ) : (
                <TextInput
                  name={f.key}
                  defaultValue={row[f.key]}
                  placeholder={f.placeholder}
                  required={!isAdd && f === fields[0] ? false : false}
                />
              )}
            </div>
          );
        })}
        <div className="sm:col-span-2 flex gap-2">
          {isAdd ? (
            <PrimaryButton>Add</PrimaryButton>
          ) : (
            <SecondaryButton>Save row</SecondaryButton>
          )}
        </div>
      </form>
      {remove ? (
        <form action={remove} className="sm:col-span-2 -mt-1 flex justify-end">
          <DangerButton ariaLabel="Delete row">Delete</DangerButton>
        </form>
      ) : null}
    </div>
  );
}
