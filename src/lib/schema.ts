import { z } from "zod";

export const lessonFrontmatterSchema = z.object({
  schemaVersion: z.literal(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z
    .string()
    .regex(/^[a-z0-9-]+$/, "category must be a lowercase, hyphenated slug"),
  tags: z.array(z.string().min(1)),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  order: z.number().int().positive(),
  related: z.array(z.string().min(1)),
  updatedAt: z.coerce.date(),
  status: z.enum(["draft", "review", "published"]),
});

export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;
