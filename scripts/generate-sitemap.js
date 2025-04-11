// scripts/generate-sitemap.js
import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { existsSync, promises as fsPromises } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'https://xxx.com';

// 获取优先级
function getPriority(path) {
  if (path === '/') return 1.0;
  if (path === '/blog') return 0.9;
  return 0.8;
}

// 获取更新频率
function getChangeFrequency(path) {
  if (path === '/' || path === '/blog') {
    return 'daily';
  }
  return 'weekly';
}

// 扫描 Markdown 文件
async function scanMarkdownFiles(dir) {
  // 读取dir，获取每一个文件的Dirent对象，每个对象都包含name(文件名),isFile(),isDirectory()等属性
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  // 遍历entries
  for (const entry of entries) {
    // 获取文件的完整路径
    const fullPath = join(dir, entry.name);
    // 如果是目录，递归调用scanMarkdownFiles
    if (entry.isDirectory()) {
      files.push(...await scanMarkdownFiles(fullPath));
    // 如果是文件，并且是.md结尾
    } else if (entry.name.endsWith('.md')) {
      // 读取文件内容
      const content = await readFile(fullPath, 'utf-8');
      // 使用gray-matter解析文件内容
      // data 是从 Markdown 文件头部 YAML front matter 解析出来的 JavaScript 对象
      // content 是 Markdown 文件的内容，不包括 YAML front matter
      const { data } = matter(content);
      
      // relativePath 是文件相对于 src/content 目录的相对路径
      // 比如：src/content/blog/2023/08/01/hello-world.md 的 relativePath 就是 blog/2023/08/01/hello-world
      const relativePath = relative(join(process.cwd(), 'src/content'), dir);
      // urlPath 是文件的 URL 路径
      const urlPath = join(relativePath, entry.name.replace('.md', '')).replace(/\\/g, '/');
      
      // Add file to list
      files.push({
        url: urlPath,
        // 如果有 updated 属性，使用 updated 作为 lastModified，否则使用当前时间
        lastModified: data.updated || new Date().toISOString(),
        // 使用 getChangeFrequency 和 getPriority 函数获取 changeFrequency 和 priority
        // changeFrequency 是文件的更新频率，daily 表示每天更新，weekly 表示每周更新
        changeFrequency: getChangeFrequency(urlPath),
        // priority 是文件的优先级，1.0 表示最高优先级，0.8 表示最低优先级
        priority: getPriority(urlPath)
      });
    }
  }

  return files;
}

// 生成 sitemap.ts 文件
async function generateSitemap() {
  // 检查 src/content 目录是否存在
  const contentDir = join(process.cwd(), 'src/content');
  
  try {
    // 扫描 Markdown 文件，获取文件的各种信息{url, lastModified, changeFrequency, priority}
    const sitemapItems = await scanMarkdownFiles(contentDir);

    // unshift() 方法：在数组开头添加新元素, 确保首页和博客列表页出现在sitemap的最前面
    sitemapItems.unshift(
      {
        url: '/',
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0
      },
      {
        url: '/blog',
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.9
      }
    );

    // Generate TypeScript code
    // 生成 TypeScript 代码
    const tsContent = `import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return ${JSON.stringify(sitemapItems, null, 2)
    .replace(/"lastModified": "([^"]+)"/g, 'lastModified: new Date("$1")')}
}
`;

    // Write the sitemap.ts file
    // 写入 sitemap.ts 文件
    const outputPath = join(process.cwd(), 'src/app/sitemap.ts');
    await fsPromises.writeFile(outputPath, tsContent);

    console.log(`Generated sitemap with ${sitemapItems.length} items`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

generateSitemap().catch(console.error);
