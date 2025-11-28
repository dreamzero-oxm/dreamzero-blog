'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const headingElementsRef = useRef<{ [key: string]: Element | null }>({});

  // 使用useMemo缓存标题ID列表，避免每次渲染都重新计算
  const headingIds = useMemo(() => headings.map(h => h.id), [headings.length, headings[0]?.id]);

  // 使用IntersectionObserver监听标题元素
  useEffect(() => {
    // 清理之前的观察者
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 创建新的观察者
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -70% 0%',
      }
    );

    // 观察所有标题元素
    const headingElements = headingIds.map((id) => {
      const element = document.getElementById(id);
      headingElementsRef.current[id] = element;
      return element;
    });

    headingElements.forEach((element) => {
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    // 清理函数
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headingIds]); // 依赖缓存的标题ID列表

  // 处理点击事件，平滑滚动到对应标题
  const handleClick = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  // 如果没有标题，不显示目录
  if (headings.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed right-4 top-24 w-64 max-h-[calc(100vh-120px)] overflow-y-auto pb-8 hidden xl:block bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 custom-scrollbar"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#d1d5db transparent'
      }}
    >
      <div className="pl-6 pr-4 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          目录
        </h3>
        <nav>
          <ul className="space-y-1">
            {headings.map((heading) => {
              const isActive = activeId === heading.id;
              const paddingLeft = (heading.level - 1) * 16; // 根据标题级别设置缩进
              
              return (
                <li key={heading.id}>
                  <button
                    onClick={() => handleClick(heading.id)}
                    className={cn(
                      "block w-full text-left py-2 px-3 text-sm rounded-md transition-all duration-200",
                      "hover:bg-gray-50 hover:text-gray-900",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium border-l-3 border-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-blue-600"
                    )}
                    style={{ paddingLeft: `${paddingLeft + 12}px` }}
                  >
                    {heading.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

// 工具函数：从Markdown内容中提取标题
export function extractHeadings(content: string): Heading[] {
  if (!content) return [];
  
  // 使用正则表达式匹配Markdown标题
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    
    // 生成ID：移除特殊字符，用连字符替换空格，转换为小写
    const id = text
      .toLowerCase()
      .replace(/[\s\u00A0]+/g, '-')
      .replace(/[\\!@#$%^&*()\[\]{}+=<>?,./:"'|~`]/g, '')
      .replace(/^-+|-+$/g, '');
    
    headings.push({
      id,
      text,
      level,
    });
  }

  return headings;
}