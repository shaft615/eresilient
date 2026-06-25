type BrandNameProps = {
  /** Append the legal " LLC" suffix (e.g. for disclaimers and copyright lines). */
  legal?: boolean;
  /**
   * Match a hand-set ALL-CAPS run (e.g. a legal disclaimer): renders the
   * remainder as "RESILIENT" while still keeping the signature lowercase "e".
   */
  caps?: boolean;
  /** Extra classes applied to the wrapper. */
  className?: string;
};

/**
 * The company name with its signature lowercase "e" preserved in every context,
 * matching the eResilient lockup. The `normal-case` utility makes it immune to
 * an ancestor `text-transform: uppercase` (footer slogan, section kickers), so
 * the brand never renders as "E|Resilient". Use the `caps` variant for runs of
 * copy that are intentionally uppercased in source (legal text) where only the
 * brand's "e" should stay lowercase.
 */
export function BrandName({ legal = false, caps = false, className }: BrandNameProps) {
  return (
    <span className={`normal-case ${className ?? ""}`}>
      e|{caps ? "RESILIENT" : "Resilient"}
      {legal ? " LLC" : ""}
    </span>
  );
}
