import * as z from "zod";

export const teamFormSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  areal: z.string().optional().transform(val => val ? parseFloat(val) : null),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;