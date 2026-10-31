import {z} from "zod";

export const createTitleSchema = z.object({
  title: z
  .string()
  .trim()
  .min(1, "Введите название")
  .max(200, "Максимум 200 символов"),

  author: z.string()
  .trim()
  .max(200,"Максимум 200"),
  
  currentChapter: z.string().trim()
  .regex(/^\d+$/, "Введите целое неотрицательное число")
  .transform(Number)
  .pipe(
    z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  ),
});

export type CreateTitleInput = z.infer<typeof createTitleSchema>;
