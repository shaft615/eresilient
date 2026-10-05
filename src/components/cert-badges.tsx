import Image from "next/image";

const BADGES = [
  { abbr: "MBCP", src: "/badges/dri-mbcp.png" },
  { abbr: "CBCLA", src: "/badges/dri-cbcla.png" },
  { abbr: "CSCRP", src: "/badges/dri-cscrp.png" },
] as const;

export function CertBadges({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-4 ${className}`}>
      {BADGES.map((b) => (
        <li key={b.abbr}>
          <Image
            src={b.src}
            alt={`DRI International ${b.abbr} Certified badge`}
            width={352}
            height={352}
            className="h-20 w-20"
          />
        </li>
      ))}
    </ul>
  );
}
