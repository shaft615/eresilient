import { z } from "zod";

export const ContactFormInput = z.object({
  name: z.string().min(2, "Enter your name.").max(120),
  email: z.string().email("Enter a valid email address."),
  organization: z.string().max(160).optional(),
  topic: z
    .enum(
      [
        "general",
        "discovery",
        "active-incident",
        "rfp",
        "partnership",
        "media",
      ],
      "Pick a topic.",
    )
    .default("general"),
  message: z.string().min(10, "Tell us a bit more (minimum 10 characters).").max(4000),
  // Honeypot field — bots fill it, humans don't see it
  website: z.string().max(0, "no").optional(),
});

export type ContactFormInput = z.infer<typeof ContactFormInput>;

export const TOPICS: Array<{ value: ContactFormInput["topic"]; label: string }> = [
  { value: "general", label: "General inquiry" },
  { value: "discovery", label: "Discovery / scoping" },
  { value: "active-incident", label: "Active incident — need support now" },
  { value: "rfp", label: "RFP / RFI / capability response" },
  { value: "partnership", label: "Partnership or referral" },
  { value: "media", label: "Press / media" },
];
