import { z } from "zod";

export const campaignSchema = z
  .object({
    name: z.string().trim().min(3, "Le nom de campagne est requis."),
    startsAt: z.string().min(1, "Date de début requise."),
    endsAt: z.string().min(1, "Date de fin requise."),
  })
  .refine((data) => new Date(data.startsAt) <= new Date(data.endsAt), {
    message: "La date de fin doit être supérieure ou égale à la date de début.",
    path: ["endsAt"],
  });

export const campaignUserSchema = z.object({
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  title: z.enum(["Dr", "Professeur", "M.", "Mme"]),
  role: z.enum(["MEDECIN", "INFIRMIER_TECH"]),
  email: z.string().email(),
  campaignId: z.string().min(1),
});

export type CampaignInput = z.infer<typeof campaignSchema>;
export type CampaignUserInput = z.infer<typeof campaignUserSchema>;
