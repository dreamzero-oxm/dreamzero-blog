import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { promises as fsPromises } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import matter from 'gray-matter';
import { Feed } from 'feed';
import { marked } from 'marked';

// import.meta.url是ES模块的特性，返回当前模块的完整URL（包括 file:// 协议）
// 例如：file:///Users/mac/code/frontend/nextjs-blog-template/scripts/generate-rss.js
// fileURLToPath() ：将 file:// URL转换为文件系统路径
// 例如：/Users/mac/code/frontend/nextjs-blog-template/scripts/generate-rss.js
const __filename = fileURLToPath(import.meta.url);
// dirname() ：返回路径的目录名
// 例如：/Users/mac/code/frontend/nextjs-blog-template/scripts
const __dirname = dirname(__filename);

// 网站域名
const BASE_URL = 'https://moity-soeoe.com';
// 作者信息
const AUTHOR = {
  name: "moity-soeoe",
  email: "ouxiangming_moi@foxmail.com",
  link: BASE_URL
};

// 扫描markdown文件
async function scanMarkdownFiles(dir) {
  // 读取目录下的所有文件和子目录，详细信息可以查看generate-sitemap.js对应的代码，里面有entries的详细说明
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    // 获取文件或子目录的完整路径
    const fullPath = join(dir, entry.name);
    // 如果是子目录，则递归扫描
    if (entry.isDirectory()) {
      files.push(...await scanMarkdownFiles(fullPath));
      // 如果是markdown文件，则读取内容
    } else if (entry.name.endsWith('.md')) {
      // 读取文件内容
      const content = await readFile(fullPath, 'utf-8');
      // 读取文件的元数据和内容
      // 元数据就是文件开头的一些元数据，例如：title, date, updated, summary, tags, categories, author, layout, draft, etc.
      // content就是文件的内容
      const { data, content: markdown } = matter(content);
      
      // Get relative path and convert to URL path
      // 生成相对于src/content的路径，然后将路径转换为URL路径
      const relativePath = relative(join(process.cwd(), 'src/content'), dir);
      const urlPath = join(relativePath, entry.name.replace('.md', '')).replace(/\\/g, '/');
      
      // 将元数据和内容添加到数组中
      files.push({
        ...data,
        content: markdown,
        url: `${BASE_URL}/${urlPath}`,
        date: new Date(data.date),
        updated: new Date(data.updated)
      });
    }
  }

  return files;
}

// 生成RSS
async function generateRSSFeed() {
  // 博客内容目录
  const contentDir = join(process.cwd(), 'src/content/blog');
  
  try {
    // 扫描其中的markdown文件，生成对应的数据
    const posts = await scanMarkdownFiles(contentDir);

    // 按照日期排序
    posts.sort((a, b) => b.date - a.date);

    // 生成Feed
    // 创建一个符合RSS 2.0、Atom和JSON Feed规范的订阅源
    const feed = new Feed({
      title: "Your Blog",
      description: "Your Blog Description",
      id: BASE_URL,
      link: BASE_URL,
      language: "en",
      image: `${BASE_URL}/favicon.png`,
      favicon: `${BASE_URL}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, Your Name`,
      updated: new Date(),
      generator: "Feed for Node.js",
      feedLinks: {
        rss2: `${BASE_URL}/rss.xml`,
        json: `${BASE_URL}/feed.json`,
        atom: `${BASE_URL}/atom.xml`,
      },
      author: AUTHOR
    });

    // Add posts to feed
    for (const post of posts) {
      // 这里将Markdown格式的博客内容转换为HTML格式
      const htmlContent = marked(post.content);
      
      // Add post to feed
      feed.addItem({
        title: post.title,
        id: post.url,
        link: post.url,
        description: post.summary,
        content: htmlContent,
        author: [AUTHOR],
        date: post.date,
        updated: post.updated,
      });
    }

    // Write feed files
    // 将生成的RSS订阅源内容写入到不同的文件中
    // rss.xml : RSS 2.0格式，最传统的订阅格式
    // index.xml : 备用RSS文件，通常用于兼容性
    // atom.xml : Atom格式，较新的订阅格式
    // feed.json : JSON Feed格式，现代轻量级格式
    await fsPromises.writeFile('./public/rss.xml', feed.rss2());
    await fsPromises.writeFile('./public/index.xml', feed.rss2());
    await fsPromises.writeFile('./public/atom.xml', feed.atom1());
    await fsPromises.writeFile('./public/feed.json', feed.json1());

    console.log(`Generated RSS feeds with ${posts.length} items`);
  } catch (error) {
    console.error('Error generating RSS feeds:', error);
  }
}

generateRSSFeed().catch(console.error); 