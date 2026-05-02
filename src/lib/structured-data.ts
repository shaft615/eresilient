import type { Organization, Person, ProfessionalService, WithContext } from "schema-dts";
import { SITE } from "./site";

export function organizationSchema(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.legalName,
    alternateName: SITE.name,
    url: SITE.url,
    description: SITE.description,
    telephone: SITE.contact.phone,
    email: SITE.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.contact.address.street,
      addressLocality: SITE.contact.address.city,
      addressRegion: SITE.contact.address.region,
      postalCode: SITE.contact.address.postal,
      addressCountry: SITE.contact.address.country,
    },
    founder: {
      "@type": "Person",
      name: SITE.founder.name,
      jobTitle: SITE.founder.role,
    },
  };
}

export function professionalServiceSchema(): WithContext<ProfessionalService> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE.legalName,
    url: SITE.url,
    description: SITE.description,
    telephone: SITE.contact.phone,
    email: SITE.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.contact.address.street,
      addressLocality: SITE.contact.address.city,
      addressRegion: SITE.contact.address.region,
      postalCode: SITE.contact.address.postal,
      addressCountry: SITE.contact.address.country,
    },
    areaServed: "United States",
  };
}

export function founderSchema(): WithContext<Person> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.founder.name,
    jobTitle: SITE.founder.role,
    worksFor: {
      "@type": "Organization",
      name: SITE.legalName,
      url: SITE.url,
    },
    knowsAbout: [
      "Business Continuity Management",
      "ISO 22301",
      "Business Impact Analysis",
      "Crisis Management",
      "Supply Chain Resilience",
    ],
  };
}
