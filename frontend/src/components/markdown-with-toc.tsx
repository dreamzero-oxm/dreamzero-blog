'use client'

import ReactMarkdown from 'react-markdown';
import { useEffect, Children, useMemo, useCallback } from 'react';
import { components } from '@/components/mdx-components';
import { extractHeadings, Heading } from './table-of-contents';

interface MarkdownWithTOCProps {
  content: string;
  onHeadingsExtracted?: (headings: Heading[]) => void;
}

export default function MarkdownWithTOC({ content, onHeadingsExtracted }: MarkdownWithTOCProps) {
  // 提取标题，使用 useMemo 缓存结果
  const headings = useMemo(() => extractHeadings(content), [content]);
  
  // 通知父组件标题已提取
  useEffect(() => {
    if (onHeadingsExtracted) {
      onHeadingsExtracted(headings);
    }
  }, [headings, onHeadingsExtracted]);

  // 创建一个函数来生成ID，避免重复代码
  const generateId = useCallback((text: string) => {
    return Children.toArray(text)
      .join('')
      .toLowerCase()
      .replace(/[\s\u00A0]+/g, '-')
      .replace(/[\\!@#$%^&*()\[\]{}+=<>?,./:"'|~`]/g, '')
      .replace(/^-+|-+$/g, '');
  }, []);

  // 自定义组件，为标题添加ID，使用 useMemo 缓存
  const customComponents = useMemo(() => ({
    ...components,
    h1: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = Children.toArray(children).join('');
      const id = generateId(text);
      
      return (
        <h1
          id={id}
          className={className}
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = Children.toArray(children).join('');
      const id = generateId(text);
      
      return (
        <h2
          id={id}
          className={className}
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = Children.toArray(children).join('');
      const id = generateId(text);
      
      return (
        <h3
          id={id}
          className={className}
          {...props}
        >
          {children}
        </h3>
      );
    },
    h4: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = Children.toArray(children).join('');
      const id = generateId(text);
      
      return (
        <h4
          id={id}
          className={className}
          {...props}
        >
          {children}
        </h4>
      );
    },
    h5: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = Children.toArray(children).join('');
      const id = generateId(text);
      
      return (
        <h5
          id={id}
          className={className}
          {...props}
        >
          {children}
        </h5>
      );
    },
    h6: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = Children.toArray(children).join('');
      const id = generateId(text);
      
      return (
        <h6
          id={id}
          className={className}
          {...props}
        >
          {children}
        </h6>
      );
    },
  }), [generateId]);

  return (
    <ReactMarkdown components={customComponents}>
      {content || '暂无内容'}
    </ReactMarkdown>
  );
}