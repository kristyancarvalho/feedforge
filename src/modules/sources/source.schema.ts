import { z } from "zod";

export const sourceLanguageSchema = z.enum(["pt-BR", "en"]);
export type SourceLanguage = z.infer<typeof sourceLanguageSchema>;

export const sourceTypeSchema = z.enum(["rss", "html"]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

const baseSourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  language: sourceLanguageSchema,
  tags: z.array(z.string().min(1)).min(1),
  weight: z.number().finite(),
  enabled: z.boolean()
});

export const rssSourceSchema = baseSourceSchema.extend({
  type: z.literal("rss")
});

export const htmlSelectorsSchema = z.object({
  item: z.string().min(1),
  title: z.string().min(1),
  link: z.string().min(1),
  summary: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  author: z.string().min(1).optional()
});

export const htmlSourceSchema = baseSourceSchema.extend({
  type: z.literal("html"),
  selectors: htmlSelectorsSchema
});

export const sourceSchema = z.discriminatedUnion("type", [
  rssSourceSchema,
  htmlSourceSchema
]);

export const editorialProfileSchema = z.object({
  name: z.string().min(1),
  language: z.array(sourceLanguageSchema).min(1),
  topics: z.array(z.string().min(1)).min(1),
  negativeTopics: z.array(z.string().min(1)).default([])
});

export const sourcesConfigSchema = z
  .object({
    editorialProfile: editorialProfileSchema,
    sources: z.array(sourceSchema).min(1)
  })
  .superRefine((config, ctx) => {
    const seen = new Set<string>();
    config.sources.forEach((source, index) => {
      if (seen.has(source.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate source id "${source.id}"`,
          path: ["sources", index, "id"]
        });
      }
      seen.add(source.id);
    });
  });

export type HtmlSelectors = z.infer<typeof htmlSelectorsSchema>;
export type RssSource = z.infer<typeof rssSourceSchema>;
export type HtmlSource = z.infer<typeof htmlSourceSchema>;
export type SourceDefinition = z.infer<typeof sourceSchema>;
export type EditorialProfile = z.infer<typeof editorialProfileSchema>;
export type SourcesConfig = z.infer<typeof sourcesConfigSchema>;
