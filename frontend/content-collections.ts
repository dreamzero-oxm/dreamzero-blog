import { defineCollection, defineConfig } from "@content-collections/core";

const blogs = defineCollection({
  // 生成的文件名规则是 all + 集合名称（首字母大写）
  name: "blogs",
  directory: "src/content/blog",
  include: "**/*.md",
  // 根据配置的 schema 验证每个文件的 frontmatter（文件头部的元数据）
  schema: (z) => ({
    title: z.string(),
    date: z.string(),
    updated: z.string().optional(),
    featured: z.boolean().optional().default(false),
    summary: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
  transform: async (document) => {
    return {
      ...document,
      slug: `${document._meta.path}`,
    };
  },
});

export default defineConfig({
  collections: [blogs],
});
