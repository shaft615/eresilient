import { z } from "zod";

export const LeadCaptureInput = z.object({
  email: z.string().email("Enter a valid email address."),
  name: z.string().min(2, "Enter your name.").max(120),
  organization: z.string().min(2, "Enter your organization.").max(160),
  role: z.string().max(160).optional(),
  source: z.string().max(80).default("bcp-readiness-scorecard"),
  // Honeypot field — bots fill it, humans don't see it
  website: z.string().max(0, "no").optional(),
});

export type LeadCaptureInput = z.infer<typeof LeadCaptureInput>;
