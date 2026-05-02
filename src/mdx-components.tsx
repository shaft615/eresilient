import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="font-display text-4xl text-brand-maroon">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-12 font-display text-3xl text-brand-maroon">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 font-display text-2xl text-brand-maroon">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-base leading-relaxed text-brand-ink-mid">
      {children}
    </p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-brand-orange underline-offset-4 hover:underline"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-brand-ink-mid marker:text-brand-orange">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-brand-ink-mid marker:text-brand-orange">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-4 border-brand-orange bg-brand-taupe-light/60 px-5 py-3 italic text-brand-ink-mid">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-brand-taupe-mid" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-brand-ink">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="rounded bg-brand-taupe-light px-1.5 py-0.5 font-mono text-[0.9em] text-brand-maroon">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mt-6 overflow-x-auto rounded-lg bg-brand-maroon p-4 text-sm text-brand-paper">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b-2 border-brand-taupe-mid bg-brand-taupe-light/60 text-left text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink-light">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-brand-taupe-mid">{children}</tbody>
  ),
  th: ({ children }) => <th className="px-3 py-2.5">{children}</th>,
  td: ({ children }) => (
    <td className="px-3 py-2.5 align-top text-brand-ink-mid">{children}</td>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
