"use client";

/**
 * BIA editor. One section on screen at a time, a highlighted instruction box
 * at the top of every section, and one framed box per process, system, role
 * and so on — the layout developed for the BIA pre-interview questionnaire.
 *
 * The whole document lives in client state and autosaves through `save`.
 */
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import type {
  BiaData,
  CriticalProcess,
  DocumentInfo,
  ProcessRecovery,
  SaveResult,
} from "@/lib/bia/types";
import {
  FREQUENCIES,
  IMPACT_DIMS,
  IMPACT_TIMES,
  MAX_DISRUPTION_OPTIONS,
  NONE_KEYS,
  ROW_FIELDS,
  SCENARIOS,
  SECTIONS,
  SEVERITY,
  composeFrequency,
  deptName,
  filled,
  firstSevere,
  hasImpactRatings,
  isNone,
  parseFrequency,
  parseHours,
  progress,
  rowsOf,
  runChecks,
  sectionStatus,
  severityLabel,
  type Check,
  type FieldDef,
  type ListKey,
  type Row,
  type SectionId,
  type Status,
} from "@/lib/bia/model";

type Update = (fn: (d: BiaData) => BiaData) => void;
type RowListKey = Exclude<ListKey, "critical_processes">;
type SaveState = "clean" | "dirty" | "saving" | "saved" | "error";

const AUTOSAVE_MS = 900;

// ---------- small building blocks ----------

function Instr({ children }: { children: ReactNode }) {
  return (
    <div className="bia-instr">
      <span className="bia-eyebrow">What to do on this page</span>
      {children}
    </div>
  );
}

function Frame({
  tag,
  name,
  note,
  action,
  children,
}: {
  tag: string;
  name?: string;
  note?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bia-frame">
      <div className="bia-ftag">
        <span className="bia-ftag-id">
          <span>{tag}</span>
          {name ? <span className="bia-nm">{name}</span> : null}
        </span>
        {note ? <span className="bia-ftag-note">{note}</span> : null}
        {action}
      </div>
      <div className="bia-fbody">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  ph,
  hint,
  span,
  type = "text",
  numeric,
  options,
}: {
  label: string;
  value: string | undefined | null;
  onChange: (v: string) => void;
  ph?: string;
  hint?: string;
  span?: boolean;
  type?: "text" | "date";
  numeric?: boolean;
  options?: readonly string[];
}) {
  const id = useId();
  return (
    <div className={`bia-field${span ? " bia-span2" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {hint ? <span className="bia-hint">{hint}</span> : null}
      <input
        id={id}
        type={type}
        value={value ?? ""}
        placeholder={ph}
        inputMode={numeric ? "numeric" : undefined}
        list={options ? `${id}-list` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {options ? (
        <datalist id={`${id}-list`}>
          {options.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      ) : null}
    </div>
  );
}

function AreaField({
  label,
  value,
  onChange,
  ph,
  hint,
  span,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  ph?: string;
  hint?: string;
  span?: boolean;
}) {
  const id = useId();
  return (
    <div className={`bia-field${span ? " bia-span2" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {hint ? <span className="bia-hint">{hint}</span> : null}
      <textarea id={id} value={value ?? ""} placeholder={ph} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function NoneToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="bia-chk">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>None</span>
    </label>
  );
}

/** Plain-text area with a bullets helper: one action per line. */
function BulletArea({
  label,
  value,
  onChange,
  ph,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  ph?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (caret.current != null && ref.current) {
      ref.current.selectionStart = ref.current.selectionEnd = caret.current;
      caret.current = null;
    }
  });

  function toggleBullets() {
    const lines = value.split("\n");
    const content = lines.filter((l) => l.trim());
    const all = content.length > 0 && content.every((l) => l.trimStart().startsWith("• "));
    const next = all
      ? lines.map((l) => l.replace(/^\s*•\s?/, ""))
      : lines.map((l) => (l.trim() && !l.trimStart().startsWith("• ") ? "• " + l.trimStart() : l));
    onChange(content.length ? next.join("\n") : "• ");
    ref.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    const el = e.currentTarget;
    const pos = el.selectionStart;
    if (pos !== el.selectionEnd) return;
    const lineStart = value.lastIndexOf("\n", pos - 1) + 1;
    const line = value.slice(lineStart, pos);
    if (!line.startsWith("• ")) return;
    e.preventDefault();
    if (line.trim() === "•") {
      // Enter on an empty bullet ends the list.
      onChange(value.slice(0, lineStart) + value.slice(pos));
      caret.current = lineStart;
      return;
    }
    onChange(value.slice(0, pos) + "\n• " + value.slice(pos));
    caret.current = pos + 3;
  }

  return (
    <div className="bia-field">
      <div className="bia-btn-row">
        <button type="button" className="bia-btn" onClick={toggleBullets}>
          • Bullets
        </button>
        <span className="bia-hint">One bullet per action, workaround or resource.</span>
      </div>
      <textarea
        ref={ref}
        className="bia-tall"
        aria-label={label}
        value={value}
        placeholder={ph}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}

// ---------- repeating rows ----------

function RowsBlock({
  data,
  update,
  list,
  title,
  item,
  desc,
  addLabel,
}: {
  data: BiaData;
  update: Update;
  list: RowListKey;
  title: string;
  item: string;
  desc: ReactNode;
  addLabel: string;
}) {
  const rows = rowsOf(data, list);
  const fields = ROW_FIELDS[list];
  const dept = deptName(data);
  const canBeNone = NONE_KEYS.includes(list);
  const none = isNone(data, list);
  const sub = (s: string | undefined) => s?.replace("{dept}", dept);

  const setRows = (fn: (rows: Row[]) => Row[]) =>
    update((d) => ({ ...d, [list]: fn(rowsOf(d, list)) }));
  const setNone = (v: boolean) =>
    update((d) => ({ ...d, editor: { ...d.editor, none: { ...d.editor?.none, [list]: v } } }));

  return (
    <section className="bia-block">
      <div className="bia-block-head">
        <h3>{title}</h3>
        {canBeNone ? <NoneToggle checked={none} onChange={setNone} /> : null}
      </div>
      <p className="bia-block-instr">{desc}</p>
      {none ? (
        <div className="bia-empty">Recorded as none. Untick if something applies.</div>
      ) : (
        <>
          {rows.length === 0 ? <div className="bia-empty">Nothing added yet.</div> : null}
          {rows.map((row, i) => (
            <Frame
              key={i}
              tag={`${item} ${i + 1} of ${rows.length}`}
              name={row[fields[0].key]?.trim()}
              action={
                <button
                  type="button"
                  className="bia-btn ghost"
                  aria-label={`Remove ${item.toLowerCase()} ${i + 1}`}
                  onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              }
            >
              <div className="bia-grid2">
                {fields.map((f) => (
                  <RowField
                    key={f.key}
                    def={f}
                    label={sub(f.label) ?? ""}
                    ph={sub(f.ph)}
                    value={row[f.key]}
                    onChange={(v) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [f.key]: v } : r)))}
                  />
                ))}
              </div>
            </Frame>
          ))}
          <div className="bia-btn-row">
            <button
              type="button"
              className="bia-btn add"
              onClick={() => setRows((rs) => [...rs, { [fields[0].key]: "" }])}
            >
              + {addLabel}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function RowField({
  def,
  label,
  ph,
  value,
  onChange,
}: {
  def: FieldDef;
  label: string;
  ph?: string;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  if (def.kind === "textarea")
    return <AreaField label={label} value={value} onChange={onChange} ph={ph} span={def.span} />;
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      ph={ph}
      span={def.span}
      numeric={def.kind === "num"}
      options={def.kind === "combo" ? def.options : undefined}
    />
  );
}

// ---------- critical processes ----------

function ImpactGrid({
  p,
  onChange,
  onUseMax,
}: {
  p: CriticalProcess;
  onChange: (grid: CriticalProcess["impact_over_time"]) => void;
  onUseMax: (label: string) => void;
}) {
  const rated = hasImpactRatings(p);
  const [open, setOpen] = useState(rated);
  const grid = p.impact_over_time ?? {};
  const count = IMPACT_DIMS.reduce(
    (a, d) => a + IMPACT_TIMES.filter((t) => filled(grid[d.k]?.[t.k])).length,
    0,
  );
  const severe = firstSevere(p);
  const total = IMPACT_DIMS.length * IMPACT_TIMES.length;

  const setCell = (dim: string, time: string, v: string) =>
    onChange({ ...grid, [dim]: { ...grid[dim], [time]: v } });

  return (
    <details className="bia-optional" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <span className="bia-opt-head">
          <span>How bad would it be after 4 hours, 24 hours, 48 hours…?</span>
          <span className={`bia-opt-tag${rated ? " on" : ""}`}>
          {rated ? `${count} of ${total} rated` : "Optional"}
        </span>
        </span>
      </summary>
      <div className="bia-optional-body">
        <p className="bia-hint">
          Rate each type of impact at each point in time, as if the process had stopped completely and stayed
          stopped. Leave cells blank where you are unsure, or skip the grid entirely — the two boxes above are
          enough on their own.
        </p>
        <div className="bia-impact-wrap">
          <table className="bia-impact">
            <thead>
              <tr>
                <th className="dim" scope="col">
                  Impact type
                </th>
                {IMPACT_TIMES.map((t) => (
                  <th key={t.k} scope="col">
                    {t.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {IMPACT_DIMS.map((d) => (
                <tr key={d.k}>
                  <th className="dim" scope="row">
                    {d.label}
                    <small>{d.hint}</small>
                  </th>
                  {IMPACT_TIMES.map((t) => {
                    const v = grid[d.k]?.[t.k] ?? "";
                    return (
                      <td key={t.k}>
                        <select
                          className="bia-sev"
                          data-v={v}
                          value={v}
                          aria-label={`${d.label} impact after ${t.label}`}
                          onChange={(e) => setCell(d.k, t.k, e.target.value)}
                        >
                          {SEVERITY.map((s) => (
                            <option key={s.v} value={s.v}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bia-legend">
          {SEVERITY.filter((s) => s.v !== "").map((s) => (
            <span key={s.v}>
              <i style={{ background: `var(--s${s.v})` }} />
              {s.desc}
            </span>
          ))}
        </div>
        {rated ? (
          <div className="bia-btn-row">
            {severe ? (
              <>
                <span className="bia-chip">Impact first reaches Severe at {severe.label}</span>
                {parseHours(p.maximum_disruption) !== severe.h ? (
                  <button type="button" className="bia-pill" onClick={() => onUseMax(severe.label)}>
                    Set maximum disruption to {severe.label}
                  </button>
                ) : null}
              </>
            ) : null}
            <button type="button" className="bia-btn ghost" onClick={() => onChange(undefined)}>
              Clear ratings
            </button>
          </div>
        ) : null}
      </div>
    </details>
  );
}

function ProcessCard({
  p,
  index,
  total,
  checks,
  onChange,
  onRemove,
}: {
  p: CriticalProcess;
  index: number;
  total: number;
  checks: Check[];
  onChange: (patch: Partial<CriticalProcess>) => void;
  onRemove: () => void;
}) {
  const groupId = useId();
  const name = (p.process_description ?? "").split("\n")[0].trim();
  const short = name.length > 70 ? name.slice(0, 67) + "…" : name;
  const freq = parseFrequency(p.frequency);
  const warns = checks.filter((c) => c.sec === "proc" && c.row === index && c.sev === "warn");

  const toggleFreq = (f: string, on: boolean) =>
    onChange({
      frequency: composeFrequency(on ? [...freq.picked, f] : freq.picked.filter((x) => x !== f), freq.other),
    });

  return (
    <Frame
      tag={`Process ${index + 1} of ${total}`}
      name={short}
      note="One box, one process"
      action={
        <button type="button" className="bia-btn ghost" aria-label={`Remove process ${index + 1}`} onClick={onRemove}>
          Remove
        </button>
      }
    >
      <div className="bia-proc-instr">
        Everything inside this box is about <b>{short || "this process"}</b> only. Answer each question for this
        one process. The next process has its own box below.
      </div>
      <AreaField
        label="Process name and what it involves"
        hint="Put the name on the first line — it becomes the title of this box."
        value={p.process_description}
        onChange={(v) => onChange({ process_description: v })}
        ph="e.g., Payroll input and processing — variable inputs, cut-off, validation, payment release"
      />
      <div className="bia-grid2">
        <div className="bia-field">
          <span className="bia-lbl" id={`${groupId}-freq`}>
            How often it runs
          </span>
          <div className="bia-checks" role="group" aria-labelledby={`${groupId}-freq`}>
            {FREQUENCIES.map((f) => (
              <label key={f} className="bia-chk">
                <input
                  type="checkbox"
                  checked={freq.picked.includes(f)}
                  onChange={(e) => toggleFreq(f, e.target.checked)}
                />
                <span>{f}</span>
              </label>
            ))}
          </div>
          {freq.other ? (
            <input
              type="text"
              aria-label="Other frequency"
              value={freq.other}
              onChange={(e) => onChange({ frequency: composeFrequency(freq.picked, e.target.value) })}
            />
          ) : null}
        </div>
        <TextField
          label="Seasonality — peak months and dates that cannot move"
          value={p.seasonality}
          onChange={(v) => onChange({ seasonality: v })}
          ph="e.g., month-end close; pay date on the last working day; peak in March"
        />
      </div>

      <div className="bia-field">
        <span className="bia-lbl">If this process stopped</span>
        <div className="bia-grid2">
          <AreaField
            label="Quantitative impact — money"
            hint="What would it cost? Lost revenue, extra expenses, penalties or fines. Give the figure and where it comes from, or write none known."
            value={p.quantitative_impact}
            onChange={(v) => onChange({ quantitative_impact: v })}
            ph="e.g., statutory penalty per late filing; agency cost per day of cover"
          />
          <AreaField
            label="Qualitative impact — everything else"
            hint="Who is affected and how: customers, employees, other departments, regulatory or legal, reputation, welfare."
            value={p.qualitative_impact}
            onChange={(v) => onChange({ qualitative_impact: v })}
            ph="e.g., operators cannot be assigned to a line without current training records"
          />
        </div>
        <ImpactGrid
          p={p}
          onChange={(grid) => onChange({ impact_over_time: grid })}
          onUseMax={(label) => onChange({ maximum_disruption: label })}
        />
      </div>

      <div className="bia-grid2">
        <TextField
          label="Maximum disruption (provisional)"
          hint="Longest this process could stop before the impact above becomes unacceptable."
          value={p.maximum_disruption}
          onChange={(v) => onChange({ maximum_disruption: v })}
          ph="Select or type…"
          options={MAX_DISRUPTION_OPTIONS}
        />
      </div>
      <div className="bia-chips">
        {warns.map((c, k) => (
          <span key={k} className="bia-chip warn">
            {c.text.slice(c.text.indexOf(":") + 1).trim()}
          </span>
        ))}
      </div>
    </Frame>
  );
}

// ---------- sections ----------

type SectionProps = { data: BiaData; update: Update; checks: Check[]; go: (id: SectionId) => void };

function IntroSection() {
  return (
    <div className="bia-stack">
      <section className="bia-block">
        <h3>What this is</h3>
        <p>
          The Business Impact Analysis (BIA) records which processes must keep running during a disruption, how
          quickly they must come back, and what they need to do so. This editor follows the BIA Word template
          section by section, and Export .docx produces the finished document.
        </p>
      </section>
      <section className="bia-block">
        <h3>How to complete it</h3>
        <ul className="bia-tight">
          <li>
            <b>Each page starts with a highlighted box that says exactly what to do.</b> Read that box first;
            everything below it is answered the same way.
          </li>
          <li>
            <b>One box, one thing.</b> Every process, system, role, company and record has its own dark-framed
            box, named at the top.
          </li>
          <li>
            <b>Best estimates are fine.</b> Blank is better than a guess — gaps are listed on the last page.
          </li>
          <li>
            <b>Time-based answers are provisional.</b> Maximum disruption, recovery time and data-loss values
            are starting points until they are validated in the interview.
          </li>
          <li>
            <b>No personal employee data.</b> Use role titles, not names, except for vendor contacts.
          </li>
          <li>
            <b>Changes save automatically.</b> The save status is shown in the header.
          </li>
        </ul>
      </section>
      <section className="bia-block">
        <h3>Terms used in this editor</h3>
        <dl className="bia-terms">
          <dt>Maximum disruption</dt>
          <dd>
            The longest a process can stop completely before the impact becomes unacceptable. (In ISO 22301 this
            is the Maximum Tolerable Period of Disruption, MTPD.)
          </dd>
          <dt>Recovery Time Objective (RTO)</dt>
          <dd>
            The target time to have a process or system working again. It is always shorter than the maximum
            disruption, so there is margin before the impact becomes unacceptable.
          </dd>
          <dt>Recovery Point Objective (RPO)</dt>
          <dd>How much recent data could be lost and re-entered — for example, one day of transactions.</dd>
          <dt>Manual workaround</dt>
          <dd>
            What the team would do by hand, or by another route, while a system is down — and how long that
            could continue before it breaks down.
          </dd>
          <dt>Key person dependency</dt>
          <dd>Knowledge, access or legal authority held by only one person, with no trained backup.</dd>
        </dl>
      </section>
    </div>
  );
}

function CoverSection({ data, update }: SectionProps) {
  const info = data.info ?? {};
  const setInfo = (patch: Partial<DocumentInfo>) => update((d) => ({ ...d, info: { ...d.info, ...patch } }));
  return (
    <div className="bia-stack">
      <Instr>
        <span>
          <b>Fill in the cover, the site details and who completed the BIA.</b> Division and Document owner are
          the two fields most often left blank in finished BIAs — please complete them.
        </span>
      </Instr>
      <Frame tag="Cover · 1 of 3">
        <h3>Cover page</h3>
        <div className="bia-grid2">
          <TextField
            label="Document title"
            span
            value={data.title}
            onChange={(v) => update((d) => ({ ...d, title: v }))}
            ph="Business Impact Analysis"
          />
          <TextField
            label="Company"
            value={data.company}
            onChange={(v) => update((d) => ({ ...d, company: v }))}
          />
          <TextField
            label="Site / department"
            value={data.site_department}
            onChange={(v) => update((d) => ({ ...d, site_department: v }))}
            ph="e.g., Clinton — Finance"
          />
        </div>
      </Frame>
      <Frame tag="Header table · 2 of 3">
        <h3>Site and department</h3>
        <div className="bia-grid2">
          <TextField
            label="Location address"
            span
            value={info.location_address}
            onChange={(v) => setInfo({ location_address: v })}
            ph="Street address of the site"
          />
          <TextField label="City / state or region" value={info.city_state} onChange={(v) => setInfo({ city_state: v })} />
          <TextField
            label="Division"
            hint="Often left blank — please complete."
            value={info.division}
            onChange={(v) => setInfo({ division: v })}
          />
          <TextField
            label="Department"
            hint="Used in the questions on the following pages."
            value={info.department}
            onChange={(v) => setInfo({ department: v })}
            ph="e.g., Human Resources"
          />
          <TextField
            label="Document owner"
            hint="Often left blank — please complete."
            value={info.document_owner}
            onChange={(v) => setInfo({ document_owner: v })}
            ph="Role accountable for this BIA"
          />
        </div>
      </Frame>
      <Frame tag="Header table · 3 of 3">
        <h3>Who completed it, and when</h3>
        <div className="bia-grid2">
          <TextField
            label="Person(s) completing"
            span
            value={info.persons_completing}
            onChange={(v) => setInfo({ persons_completing: v })}
          />
          <TextField
            label="Date completed"
            type="date"
            value={info.date_completed}
            onChange={(v) => setInfo({ date_completed: v || null })}
          />
          <TextField
            label="Last updated"
            type="date"
            value={info.last_updated}
            onChange={(v) => setInfo({ last_updated: v || null })}
          />
        </div>
      </Frame>
    </div>
  );
}

function ProcSection({ data, update, checks }: SectionProps) {
  const procs = (data.critical_processes ?? []) as CriticalProcess[];
  const setProcs = (fn: (ps: CriticalProcess[]) => CriticalProcess[]) =>
    update((d) => ({ ...d, critical_processes: fn((d.critical_processes ?? []) as CriticalProcess[]) }));
  return (
    <div className="bia-stack">
      <Instr>
        <span>
          <b>Complete one box for each critical process.</b> Each box is framed in dark blue and named at the
          top; every question inside it is about that process only.
        </span>
        <span>
          The time-by-time impact ratings inside each box are <b>optional</b>. Open them when a process needs
          the detail to justify its maximum disruption; otherwise leave them closed.
        </span>
      </Instr>
      {procs.length === 0 ? <div className="bia-empty">No processes yet. Add the first one below.</div> : null}
      {procs.map((p, i) => (
        <ProcessCard
          key={i}
          p={p}
          index={i}
          total={procs.length}
          checks={checks}
          onChange={(patch) => setProcs((ps) => ps.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
          onRemove={() => setProcs((ps) => ps.filter((_, j) => j !== i))}
        />
      ))}
      <section className="bia-block">
        <h3>Add a process</h3>
        <div className="bia-btn-row">
          <button
            type="button"
            className="bia-btn add"
            onClick={() => setProcs((ps) => [...ps, { process_description: "" }])}
          >
            + Add a process
          </button>
        </div>
      </section>
    </div>
  );
}

function DepsSection({ data, update }: SectionProps) {
  const dept = deptName(data);
  return (
    <div className="bia-stack">
      <Instr>
        <span>
          <b>Four lists. Add one entry per item in each list, or tick None.</b>
        </span>
        <span>
          Lists 1 and 2 are what {dept} needs from others to keep its processes running. Lists 3 and 4 are what
          others need from {dept}. People usually remember the first two and forget the last two, so please do
          all four.
        </span>
      </Instr>
      <RowsBlock
        data={data}
        update={update}
        list="upstream_internal"
        title={`1. What ${dept} needs from other departments`}
        item="Entry"
        desc={
          <>
            <b>List each thing another department gives {dept}</b> that it needs to do its critical processes.
            One entry per item.
          </>
        }
        addLabel="Add an entry"
      />
      <RowsBlock
        data={data}
        update={update}
        list="upstream_external"
        title={`2. What ${dept} needs from outside companies or authorities`}
        item="Entry"
        desc={
          <>
            <b>List each thing an outside company or authority gives {dept}</b> that it needs to do its critical
            processes. One entry per item.
          </>
        }
        addLabel="Add an entry"
      />
      <RowsBlock
        data={data}
        update={update}
        list="downstream_internal"
        title={`3. What other departments need from ${dept}`}
        item="Entry"
        desc={
          <>
            <b>List each thing {dept} gives another department</b> that they need for their own critical work.
            One entry per item.
          </>
        }
        addLabel="Add an entry"
      />
      <RowsBlock
        data={data}
        update={update}
        list="downstream_external"
        title={`4. What outside companies or authorities need from ${dept}`}
        item="Entry"
        desc={
          <>
            <b>List each thing {dept} sends to an outside company, customer or authority</b>, including anything
            with a legal deadline. One entry per item.
          </>
        }
        addLabel="Add an entry"
      />
    </div>
  );
}

function SysSection({ data, update }: SectionProps) {
  return (
    <div className="bia-stack">
      <Instr>
        <span>
          <b>One box per system used for the critical processes.</b> Name each system (for example
          &ldquo;Workday&rdquo;), not a category (for example &ldquo;HR system&rdquo;).
        </span>
        <span>
          The most useful answer in each box is the manual workaround: what the team would do by hand if the
          system were down, and how long that could go on. Include spreadsheets and files on local or personal
          drives — they rarely appear in IT inventories.
        </span>
      </Instr>
      <RowsBlock
        data={data}
        update={update}
        list="software"
        title="Systems and applications"
        item="System"
        desc={
          <>
            <b>One box per system.</b> Recovery time and data-loss values are provisional.
          </>
        }
        addLabel="Add a system"
      />
    </div>
  );
}

function EquipSection({ data, update }: SectionProps) {
  return (
    <div className="bia-stack">
      <Instr>
        <span>
          <b>List any physical equipment the team could not work without</b> that would be hard to replace
          quickly, or tick None. Office-based teams often have little or none here.
        </span>
      </Instr>
      <RowsBlock
        data={data}
        update={update}
        list="infrastructure"
        title="Equipment"
        item="Equipment"
        desc={
          <>
            <b>One box per item of equipment</b>, or tick None.
          </>
        }
        addLabel="Add equipment"
      />
    </div>
  );
}

function PeopleSection({ data, update }: SectionProps) {
  return (
    <div className="bia-stack">
      <Instr>
        <span>
          <b>One box per role.</b> For each role, give the normal headcount and the fewest people the team could
          run with on Day 1, Days 2–3, Day 5 and after Day 10 of a disruption.
        </span>
        <span>Count people based at this site only. Use role titles, not names.</span>
      </Instr>
      <RowsBlock
        data={data}
        update={update}
        list="human_capital"
        title="Roles at this site"
        item="Role"
        desc={
          <>
            <b>One box per role.</b> Note any knowledge or authority held by one person only.
          </>
        }
        addLabel="Add a role"
      />
    </div>
  );
}

function VendSection({ data, update }: SectionProps) {
  return (
    <div className="bia-stack">
      <Instr>
        <span>
          <b>One box per outside company the team depends on</b> to keep its critical processes running, or tick
          None. For each one, say what the plan is if they cannot deliver.
        </span>
      </Instr>
      <RowsBlock
        data={data}
        update={update}
        list="third_parties"
        title="Outside companies the team depends on"
        item="Company"
        desc={
          <>
            <b>One box per company.</b> Business contact details only.
          </>
        }
        addLabel="Add a company"
      />
    </div>
  );
}

function RecsSection({ data, update }: SectionProps) {
  return (
    <div className="bia-stack">
      <Instr>
        <span>
          <b>One box per record that must not be lost</b> — documents or data needed for legal reasons, to keep
          operating, or to prove compliance.
        </span>
      </Instr>
      <RowsBlock
        data={data}
        update={update}
        list="vital_records"
        title="Records that must not be lost"
        item="Record"
        desc={
          <>
            <b>One box per record.</b> For each one, say where it is kept and how it would be replaced if lost.
          </>
        }
        addLabel="Add a record"
      />
    </div>
  );
}

function ScenSection({ data, update }: SectionProps) {
  const rec = data.process_recovery ?? {};
  const setRec = (k: keyof ProcessRecovery, v: string) =>
    update((d) => ({ ...d, process_recovery: { ...d.process_recovery, [k]: v } }));
  return (
    <div className="bia-stack">
      <Instr>
        <span>
          <b>Four scenario boxes. In each one, describe what the team would do.</b> Use bullet points — one
          bullet per action, workaround or resource. Formal plans and informal arrangements both count. If
          nothing is in place, say so.
        </span>
      </Instr>
      {SCENARIOS.map((sc, i) => (
        <Frame key={sc.k} tag={`Scenario ${i + 1} of ${SCENARIOS.length} · ${sc.title}`} note="One box, one scenario">
          <div className="bia-lead">{sc.title}</div>
          <p className="bia-prompt">{sc.prompt}</p>
          <BulletArea
            label={sc.title}
            value={rec[sc.k] ?? ""}
            onChange={(v) => setRec(sc.k, v)}
            ph="Start typing, or click • Bullets and list each action on its own line."
          />
        </Frame>
      ))}
    </div>
  );
}

// ---------- review ----------

function Cell({ v }: { v: string | undefined | null }) {
  return <td>{filled(v) ? v : <span className="bia-nil">—</span>}</td>;
}

function ListTable({
  data,
  list,
  heads,
  keys,
}: {
  data: BiaData;
  list: RowListKey;
  heads: string[];
  keys: string[];
}) {
  const rows = rowsOf(data, list);
  return (
    <div className="bia-sum-wrap">
      <table>
        <thead>
          <tr>
            {heads.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isNone(data, list) ? (
            <tr>
              <td colSpan={heads.length}>None</td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={heads.length} className="bia-nil">
                Not provided
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i}>
                {keys.map((k) => (
                  <Cell key={k} v={r[k]} />
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Summary({ data }: { data: BiaData }) {
  const info = data.info ?? {};
  const procs = (data.critical_processes ?? []) as CriticalProcess[];
  const rated = procs.map((p, i) => ({ p, i })).filter(({ p }) => hasImpactRatings(p));
  const rec = data.process_recovery ?? {};
  const dept = deptName(data);
  return (
    <div className="bia-summary">
      <h3>Header</h3>
      <div className="bia-sum-wrap">
        <table>
          <tbody>
            {(
              [
                ["Company", data.company],
                ["Site / department", data.site_department],
                ["Location address", info.location_address],
                ["City / state", info.city_state],
                ["Division", info.division],
                ["Department", info.department],
                ["Document owner", info.document_owner],
                ["Person(s) completing", info.persons_completing],
                ["Date completed", info.date_completed],
                ["Last updated", info.last_updated],
              ] as const
            ).map(([h, v]) => (
              <tr key={h}>
                <th>{h}</th>
                <Cell v={v} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>
        Critical business processes <span className="bia-hint">(time-based values are provisional)</span>
      </h3>
      <div className="bia-sum-wrap">
        <table>
          <thead>
            <tr>
              <th>Process</th>
              <th>Frequency</th>
              <th>Seasonality</th>
              <th>Quantitative impact</th>
              <th>Qualitative impact</th>
              <th>Maximum disruption</th>
            </tr>
          </thead>
          <tbody>
            {procs.length === 0 ? (
              <tr>
                <td colSpan={6} className="bia-nil">
                  Not provided
                </td>
              </tr>
            ) : (
              procs.map((p, i) => (
                <tr key={i}>
                  <Cell v={p.process_description} />
                  <Cell v={p.frequency} />
                  <Cell v={p.seasonality} />
                  <Cell v={p.quantitative_impact} />
                  <Cell v={p.qualitative_impact} />
                  <Cell v={p.maximum_disruption} />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rated.length ? (
        <>
          <h3>
            Impact over time <span className="bia-hint">(optional ratings — not part of the Word template)</span>
          </h3>
          <div className="bia-sum-wrap">
            <table>
              <thead>
                <tr>
                  <th>Process</th>
                  <th>Impact type</th>
                  {IMPACT_TIMES.map((t) => (
                    <th key={t.k}>{t.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rated.flatMap(({ p, i }) =>
                  IMPACT_DIMS.filter((d) => Object.values(p.impact_over_time?.[d.k] ?? {}).some(filled)).map(
                    (d, k, shown) => (
                      <tr key={`${i}-${d.k}`}>
                        {k === 0 ? (
                          <td rowSpan={shown.length}>
                            {(p.process_description ?? "").split("\n")[0] || `Process ${i + 1}`}
                          </td>
                        ) : null}
                        <td>{d.label}</td>
                        {IMPACT_TIMES.map((t) => {
                          const v = p.impact_over_time?.[d.k]?.[t.k];
                          return (
                            <td key={t.k}>
                              {filled(v) ? (
                                <span className="bia-sev-cell" style={{ background: `var(--s${v})` }}>
                                  {severityLabel(v)}
                                </span>
                              ) : (
                                <span className="bia-nil">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ),
                  ),
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      <h3>
        What {dept} needs from other departments <span className="bia-hint">(template: Upstream — internal)</span>
      </h3>
      <ListTable data={data} list="upstream_internal" heads={["Item", "Department", "Comments"]} keys={["item", "department_function", "comments"]} />
      <h3>
        What {dept} needs from outside companies or authorities{" "}
        <span className="bia-hint">(template: Upstream — external)</span>
      </h3>
      <ListTable data={data} list="upstream_external" heads={["Item", "Company / authority", "Comments"]} keys={["item", "vendor_customer_other", "comments"]} />
      <h3>
        What other departments need from {dept} <span className="bia-hint">(template: Downstream — internal)</span>
      </h3>
      <ListTable data={data} list="downstream_internal" heads={["Item", "Department", "Comments"]} keys={["item", "department_function", "comments"]} />
      <h3>
        What outside companies or authorities need from {dept}{" "}
        <span className="bia-hint">(template: Downstream — external)</span>
      </h3>
      <ListTable data={data} list="downstream_external" heads={["Item", "Company / authority", "Comments"]} keys={["item", "vendor_customer_other", "comments"]} />

      <h3>
        Software requirements <span className="bia-hint">(provisional)</span>
      </h3>
      <ListTable
        data={data}
        list="software"
        heads={["Application", "Use", "RTO", "RPO", "Manual workaround", "Comments"]}
        keys={["application", "use_description", "rto", "rpo", "manual_workaround", "comments"]}
      />
      <h3>Infrastructure and specialized equipment</h3>
      <ListTable
        data={data}
        list="infrastructure"
        heads={["Component", "Use", "RTO", "Internal contact", "Vendor contact", "Mitigation"]}
        keys={["component", "use_description", "rto", "corporate_contact", "vendor_contact", "mitigation_strategy"]}
      />
      <h3>Human capital / workspace</h3>
      <ListTable
        data={data}
        list="human_capital"
        heads={["Role", "Normal", "Day 1", "Day 2–3", "Day 5", "After Day 10", "Recovery location", "Key person dependency"]}
        keys={["functional_role", "normal_headcount", "day_1", "day_2_3", "day_5", "after_day_10", "recovery_location", "key_person_dependencies"]}
      />
      <h3>Third party relationships</h3>
      <ListTable
        data={data}
        list="third_parties"
        heads={["Company", "Service", "Contact", "Recovery instructions", "Mitigation plan"]}
        keys={["company_name", "service_provided", "contact_details", "recovery_period_instructions", "mitigation_plan"]}
      />
      <h3>Vital records</h3>
      <ListTable
        data={data}
        list="vital_records"
        heads={["Description", "Media", "Electronic backup", "Storage location", "Vendor contact", "Restoration"]}
        keys={["description", "media_type", "electronic_backup", "storage_location", "vendor_contact", "restoration_procedures"]}
      />

      <h3>Process recovery</h3>
      <div className="bia-sum-wrap">
        <table>
          <tbody>
            {SCENARIOS.map((s) => (
              <tr key={s.k}>
                <th>{s.title}</th>
                <Cell v={rec[s.k]} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const STATUS_TEXT: Record<Status, string> = { done: "Complete", part: "In progress", "": "Not started" };

function ReviewSection({
  data,
  checks,
  go,
  onExport,
}: SectionProps & { onExport: () => void }) {
  const warns = checks.filter((c) => c.sev === "warn");
  const gaps = checks.filter((c) => c.sev !== "warn");
  const secTitle = (id: SectionId) => SECTIONS.find((s) => s.id === id)?.title ?? "";
  const item = (c: Check, k: number) => (
    <div key={`${c.sev}-${k}`} className={`bia-check-item${c.sev === "warn" ? " warn" : ""}`}>
      <span className="bia-tag">{c.sev === "warn" ? "Check" : "Gap"}</span>
      <span>{c.text}</span>
      <button type="button" onClick={() => go(c.sec)}>
        {secTitle(c.sec)} →
      </button>
    </div>
  );
  return (
    <div className="bia-stack">
      <section className="bia-block">
        <h3>Section status</h3>
        <div className="bia-status-grid">
          {SECTIONS.slice(1, -1).map((s) => {
            const st = sectionStatus(s.id, data);
            return (
              <button key={s.id} type="button" className="bia-status-cell" onClick={() => go(s.id)}>
                <span className={`bia-dot ${st}`} />
                <span>
                  {s.title}
                  <br />
                  <span className="bia-hint">{STATUS_TEXT[st]}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="bia-block">
        <div className="bia-block-head">
          <h3>Consistency checks</h3>
          <span className="bia-hint">
            {warns.length} to check · {gaps.length} gaps
          </span>
        </div>
        <p className="bia-hint">
          None of these stop the export. Checks flag answers that disagree with each other; gaps are items to
          cover in the interview if left blank.
        </p>
        {checks.length ? (
          <div className="bia-checklist">
            {warns.map(item)}
            {gaps.map(item)}
          </div>
        ) : (
          <div className="bia-callout">No issues found.</div>
        )}
      </section>
      <section className="bia-block">
        <h3>Export</h3>
        <p className="bia-hint">
          Produces the BIA as a Word document in template order. The optional impact-over-time ratings stay in
          this editor; the Word template has no table for them.
        </p>
        <div className="bia-btn-row">
          <button type="button" className="bia-btn primary" onClick={onExport}>
            Export .docx
          </button>
        </div>
      </section>
      <section className="bia-block">
        <h3>Summary in BIA template order</h3>
        <Summary data={data} />
      </section>
    </div>
  );
}

// ---------- editor shell ----------

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

export function BiaEditor({
  initial,
  title,
  status,
  clientName,
  clientSlug,
  siteName,
  siteSlug,
  exportHref,
  save,
}: {
  initial: BiaData;
  title: string;
  status: string;
  clientName: string;
  clientSlug: string;
  siteName: string;
  siteSlug: string;
  exportHref: string;
  save: (data: BiaData) => Promise<SaveResult>;
}) {
  const [data, setData] = useState<BiaData>(initial);
  const [saveState, setSaveState] = useState<SaveState>("clean");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);

  // Autosave bookkeeping lives in refs so a save in flight always sends the
  // latest document and never races with typing.
  const dataRef = useRef(initial);
  const dirty = useRef(false);
  const saving = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async (): Promise<boolean> => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (saving.current || !dirty.current) return !dirty.current;
    saving.current = true;
    let ok = true;
    while (dirty.current && ok) {
      dirty.current = false;
      setSaveState("saving");
      try {
        const res = await save(dataRef.current);
        ok = res.ok;
      } catch {
        ok = false;
      }
      if (!ok) dirty.current = true;
    }
    saving.current = false;
    if (ok) {
      setSavedAt(new Date());
      setSaveState("saved");
    } else {
      setSaveState("error");
    }
    return ok;
  }, [save]);

  const update = useCallback<Update>(
    (fn) => {
      const next = fn(dataRef.current);
      dataRef.current = next;
      dirty.current = true;
      setData(next);
      setSaveState((s) => (s === "saving" ? s : "dirty"));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), AUTOSAVE_MS);
    },
    [flush],
  );

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      // Leaving through an in-app link: push out anything still pending.
      void flush();
    };
  }, [flush]);

  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => "",
  );
  const cur = Math.max(
    0,
    SECTIONS.findIndex((s) => `#${s.id}` === hash),
  );
  const section = SECTIONS[cur];

  useEffect(() => {
    const ol = stepsRef.current;
    const active = ol?.querySelector<HTMLElement>('[aria-current="step"]');
    if (ol && active) ol.scrollLeft = active.offsetLeft - (ol.clientWidth - active.offsetWidth) / 2;
  }, [cur]);

  const go = useCallback(
    (id: SectionId) => {
      void flush();
      if (window.location.hash !== `#${id}`) window.location.hash = id;
      window.scrollTo({ top: 0 });
      mainRef.current?.focus({ preventScroll: true });
    },
    [flush],
  );

  const onExport = useCallback(async () => {
    if (await flush()) window.location.assign(exportHref);
  }, [flush, exportHref]);

  const checks = runChecks(data);
  const pct = progress(data);
  const props: SectionProps = { data, update, checks, go };

  const saveText =
    saveState === "saving"
      ? "Saving…"
      : saveState === "dirty"
        ? "Unsaved changes"
        : saveState === "error"
          ? "Not saved — check your connection"
          : savedAt
            ? `Saved · ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "All changes saved";

  return (
    <>
      <header className="bia-band">
        <div className="bia-band-inner">
          <div>
            <div className="bia-eyebrow">
              <Link href="/tools/bia">Clients</Link> · <Link href={`/tools/bia/${clientSlug}`}>{clientName}</Link> ·{" "}
              <Link href={`/tools/bia/${clientSlug}/${siteSlug}`}>{siteName}</Link>
            </div>
            <h1>{title}</h1>
            <div className="bia-eyebrow bia-band-sub">Business Impact Analysis (BIA)</div>
          </div>
          <div className="bia-band-meta">
            <span>
              Status: <b>{status}</b>
            </span>
            <span aria-live="polite">{saveText}</span>
            {saveState === "error" ? (
              <button type="button" className="bia-btn" onClick={() => void flush()}>
                Retry save
              </button>
            ) : null}
            <span className="bia-progress" title="Share of sections started or complete">
              <span className="bia-progress-bar">
                <span style={{ width: `${pct}%` }} />
              </span>
              <span className="bia-mono">{pct}%</span>
            </span>
            <button type="button" className="bia-btn" onClick={() => void onExport()}>
              Export .docx
            </button>
          </div>
        </div>
      </header>

      <div className="bia-shell">
        <nav className="bia-steps" aria-label="BIA sections">
          <ol ref={stepsRef}>
            {SECTIONS.map((s, i) => {
              const st = sectionStatus(s.id, data);
              const flag = checks.some((c) => c.sec === s.id && c.sev === "warn");
              return (
                <li key={s.id}>
                  <button type="button" aria-current={i === cur ? "step" : undefined} onClick={() => go(s.id)}>
                    <span className="bia-num">{String(i).padStart(2, "0")}</span>
                    <span>{s.title}</span>
                    <span
                      className={`bia-dot ${flag ? "flag" : st}`}
                      title={flag ? "Has answers to check" : STATUS_TEXT[st]}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="bia-nav-foot">
            <span>Follows the BIA template section by section.</span>
            <span>{saveText}</span>
          </div>
        </nav>

        <main className="bia-main" ref={mainRef} tabIndex={-1}>
          <div className="bia-sec-head">
            <span className="bia-eyebrow">
              {cur === 0 ? "Introduction" : `Section ${cur} of ${SECTIONS.length - 1}`}
            </span>
            <h2>{section.title}</h2>
            {section.ref ? <span className="bia-template-ref">{section.ref}</span> : null}
          </div>

          {section.id === "intro" ? <IntroSection /> : null}
          {section.id === "cover" ? <CoverSection {...props} /> : null}
          {section.id === "proc" ? <ProcSection {...props} /> : null}
          {section.id === "deps" ? <DepsSection {...props} /> : null}
          {section.id === "sys" ? <SysSection {...props} /> : null}
          {section.id === "equip" ? <EquipSection {...props} /> : null}
          {section.id === "people" ? <PeopleSection {...props} /> : null}
          {section.id === "vend" ? <VendSection {...props} /> : null}
          {section.id === "recs" ? <RecsSection {...props} /> : null}
          {section.id === "scen" ? <ScenSection {...props} /> : null}
          {section.id === "review" ? <ReviewSection {...props} onExport={() => void onExport()} /> : null}

          <div className="bia-pager">
            {cur > 0 ? (
              <button type="button" className="bia-btn" onClick={() => go(SECTIONS[cur - 1].id)}>
                ← {SECTIONS[cur - 1].title}
              </button>
            ) : (
              <span />
            )}
            {cur < SECTIONS.length - 1 ? (
              <button type="button" className="bia-btn primary" onClick={() => go(SECTIONS[cur + 1].id)}>
                {cur === 0 ? "Start" : SECTIONS[cur + 1].title} →
              </button>
            ) : (
              <span />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
