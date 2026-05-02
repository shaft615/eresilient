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
    <ul className="mt-4 list-disc space-y-2 pl-6 text-brand-ink-mid">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-brand-ink-mid">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-4 border-brand-orange bg-brand-taupe-light/60 px-5 py-3 italic text-brand-ink-mid">
      {children}
    </blockquote>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
