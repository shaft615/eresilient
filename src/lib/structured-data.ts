import type {
  Article,
  Organization,
  ProfessionalService,
  Service,
  WithContext,
} from "schema-dts";
import { SITE } from "./site";
import type { ArticleFrontmatter, ServiceContent } from "./content";

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

export function serviceSchema(s: ServiceContent): WithContext<Service> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.summary,
    url: `${SITE.url}/services/${s.slug}`,
    serviceType: s.title,
    areaServed: "United States",
    provider: {
      "@type": "Organization",
      name: SITE.legalName,
      url: SITE.url,
    },
  };
}

export function articleSchema(a: ArticleFrontmatter): WithContext<Article> {
  const url = `${SITE.url}/insights/${a.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    url,
    datePublished: a.publishedAt,
    dateModified: a.updatedAt ?? a.publishedAt,
    author: {
      "@type": "Organization",
      name: SITE.legalName,
      url: SITE.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.legalName,
      url: SITE.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: a.keywords.join(", "),
  };
}
