import Image from "next/image";

const BADGES = [
  { abbr: "MBCP", src: "/badges/dri-mbcp.png", alt: "DRI International MBCP Certified badge" },
  { abbr: "MBCI", src: "/badges/bci-member.png", alt: "BCI Member badge" },
  { abbr: "CBCLA", src: "/badges/dri-cbcla.png", alt: "DRI International CBCLA Certified badge" },
  { abbr: "CBCV", src: "/badges/dri-cbcv.png", alt: "DRI International CBCV Certified badge" },
  { abbr: "CSCRP", src: "/badges/dri-cscrp.png", alt: "DRI International CSCRP Certified badge" },
  { abbr: "PMP", src: "/badges/pmi-pmp.png", alt: "PMI Project Management Professional (PMP) certification badge" },
] as const;

export function CertBadges({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-4 ${className}`}>
      {BADGES.map((b) => (
        <li key={b.abbr}>
          <Image
            src={b.src}
            alt={b.alt}
            width={352}
            height={352}
            className="h-20 w-20"
          />
        </li>
      ))}
    </ul>
  );
}
