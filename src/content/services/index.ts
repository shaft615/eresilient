import { businessContinuityPlanning } from "./business-continuity-planning";
import { crisisManagement } from "./crisis-management";
import { emergencyResponse } from "./emergency-response";
import { supplyChainRisk } from "./supply-chain-risk";
import { realTimeSupport } from "./real-time-support";
import { trainingAndEducation } from "./training-and-education";
import type { ServiceContent } from "@/lib/content";

export const services: ServiceContent[] = [
  businessContinuityPlanning,
  crisisManagement,
  emergencyResponse,
  supplyChainRisk,
  realTimeSupport,
  trainingAndEducation,
].sort((a, b) => a.order - b.order);

export const serviceBySlug = new Map(services.map((s) => [s.slug, s]));

export function getService(slug: string): ServiceContent | undefined {
  return serviceBySlug.get(slug);
}

export function getRelatedServices(
  currentSlug: string,
  limit = 4,
): ServiceContent[] {
  return services.filter((s) => s.slug !== currentSlug).slice(0, limit);
}
